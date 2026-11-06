// File: app/dashboard/teacher/timetable/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import WeeklyTimetable from '@/app/components/WeeklyTimetable';
import { entryHours } from '@/lib/timetable-constants';

export default async function TeacherTimetablePage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Vous devez être connecté pour voir votre emploi du temps.
      </div>
    );
  }

  const entriesRaw = await prisma.timetableEntry.findMany({
    where: { teacherId: session.user.id },
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
      class: { select: { name: true } },
    },
  });

  const entries = entriesRaw.map((e: any) => ({
    id: e.id,
    classId: e.classId,
    className: e.class.name,
    teacherId: e.teacherId,
    teacherName: session.user.name ?? '',
    subject: e.subject,
    dayOfWeek: e.dayOfWeek,
    startTime: e.startTime,
    endTime: e.endTime,
    room: e.room,
  }));

  const classCount = new Set(entries.map((e) => e.classId)).size;
  const hours = entryHours(entries);

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
          Espace enseignant
        </div>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 34, lineHeight: 1.1, margin: 0, color: '#fff' }}>
          Mon emploi du temps
        </h1>
        <p style={{ margin: '10px 0 0', color: 'rgba(255,255,255,.75)', fontSize: 14.5, maxWidth: 560, lineHeight: 1.55 }}>
          Vos cours de la semaine, tels que publiés par la direction de l’école.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
          {[`${entries.length} cours / semaine`, `${hours} h`, `${classCount} classe${classCount !== 1 ? 's' : ''}`].map((t) => (
            <span key={t} style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600 }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 6px 24px rgba(7,27,74,0.06)', border: '1px solid #E8ECF3' }}>
        <WeeklyTimetable entries={entries} variant="teacher" />
      </div>
    </div>
  );
}