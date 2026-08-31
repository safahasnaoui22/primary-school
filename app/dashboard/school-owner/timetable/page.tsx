// File: app/dashboard/school-owner/timetable/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TimetableClient from './TimetableClient';

export default async function SchoolOwnerTimetablePage() {
  const session = await auth();
  if (!session?.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n'est encore liée à votre compte.
      </div>
    );
  }
  const schoolId = session.user.schoolId;

  const [classes, teachers, entriesRaw] = await Promise.all([
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { schoolId, role: 'TEACHER' }, orderBy: { username: 'asc' }, select: { id: true, username: true } }),
    prisma.timetableEntry.findMany({
      where: { schoolId },
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
        teacher: { select: { username: true } },
      },
    }),
  ]);

  const entries = entriesRaw.map((e: any) => ({
    id: e.id,
    classId: e.classId,
    className: e.class.name,
    teacherId: e.teacherId,
    teacherName: e.teacher.username,
    subject: e.subject,
    dayOfWeek: e.dayOfWeek,
    startTime: e.startTime,
    endTime: e.endTime,
    room: e.room,
  }));

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1200, margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
        Emploi du temps
      </span>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#071B4A', fontSize: 28, margin: '6px 0 4px' }}>
        Construire l'emploi du temps
      </h1>
      <p style={{ color: '#5A6A7A', fontSize: 14, margin: '0 0 24px' }}>
        Choisissez une classe ou un enseignant, puis cliquez sur un créneau pour y affecter un cours.
      </p>
      <TimetableClient classes={classes} teachers={teachers} entries={entries} />
    </div>
  );
}