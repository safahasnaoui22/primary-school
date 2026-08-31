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

  const children = await prisma.student.findMany({
    where: { parents: { some: { id: session.user.id } } },
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
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
        Emploi du temps
      </span>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#071B4A', fontSize: 28, margin: '6px 0 20px' }}>
        Emploi du temps de vos enfants
      </h1>
      <ParentTimetableClient children={childrenWithEntries} />
    </div>
  );
}