// File: app/dashboard/parent/timetable/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ParentTimetableClient from './ParentTimetableClient';

export default async function ParentTimetablePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Vous devez être connecté pour voir cet emploi du temps.
      </div>
    );
  }

  // Student.parents is the ParentStudent join table, not a direct User[] —
  // so the filter matches on ParentStudent.parentId, not ParentStudent.id.
  const children = await prisma.student.findMany({
    where: { parents: { some: { parentId: session.user.id } } },
    select: { id: true, firstName: true, lastName: true, classId: true, class: { select: { name: true } } },
  });

  const childrenWithEntries = await Promise.all(
    children.map(async (c: any) => {
      if (!c.classId) return { id: c.id, name: `${c.firstName} ${c.lastName}`, className: null, entries: [] };
      const entriesRaw = await prisma.timetableEntry.findMany({
        where: { classId: c.classId },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        select: {
          id: true,
          classId: true,
          teacherId: true,
          subject: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          room: true,
          teacher: { select: { username: true } },
        },
      });
      return {
        id: c.id,
        name: `${c.firstName} ${c.lastName}`,
        className: c.class?.name ?? null,
        entries: entriesRaw.map((e: any) => ({
          id: e.id,
          classId: e.classId,
          className: c.class?.name ?? '',
          teacherId: e.teacherId,
          teacherName: e.teacher.username,
          subject: e.subject,
          dayOfWeek: e.dayOfWeek,
          startTime: e.startTime,
          endTime: e.endTime,
          room: e.room,
        })),
      };
    })
  );

  return (
    <div style={{ padding: '24px 28px 64px', maxWidth: 1180, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>

      <div
        style={{
          borderRadius: 24,
          padding: '30px 34px',
          marginBottom: 22,
          color: '#fff',
          background:
            'radial-gradient(circle at 94% -30%, rgba(255,180,0,.5), rgba(255,180,0,0) 46%), linear-gradient(135deg, #071B4A 0%, #0A2A6B 62%, #12378A 100%)',
          boxShadow: '0 18px 40px rgba(7,27,74,.2)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#FFB400', marginBottom: 10 }}>
          <span style={{ width: 26, height: 2, background: '#FFB400', borderRadius: 2 }} />
          Espace parent
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 34, lineHeight: 1.1, margin: 0, color: '#fff' }}>
          Emploi du temps
        </h1>
        <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,.75)', fontSize: 14.5, maxWidth: 560, lineHeight: 1.55 }}>
          Les horaires de la classe de vos enfants, mis à jour par l’école.
        </p>

      </div>

      <ParentTimetableClient children={childrenWithEntries} />
    </div>
  );
}