// File: app/dashboard/teacher/timetable/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import WeeklyTimetable from '@/app/components/WeeklyTimetable';

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

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1100, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
        Mon emploi du temps
      </span>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#071B4A', fontSize: 28, margin: '6px 0 20px' }}>
        Emploi du temps hebdomadaire
      </h1>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 18px rgba(7,27,74,0.06)', border: '1px solid #EEF1F6' }}>
        <WeeklyTimetable entries={entries} variant="teacher" />
      </div>
    </div>
  );
}