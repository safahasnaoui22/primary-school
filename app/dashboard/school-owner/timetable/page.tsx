// File: app/dashboard/school-owner/timetable/page.tsx

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TimetableClient from './TimetableClient';

export default async function SchoolOwnerTimetablePage() {
  const session = await auth();
  if (!session?.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n&apos;est encore liée à votre compte.
      </div>
    );
  }
  const schoolId = session.user.schoolId;

  const [classes, teachers, entriesRaw, linksRaw] = await Promise.all([
    prisma.class.findMany({ where: { schoolId }, orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { schoolId, role: 'TEACHER' }, orderBy: { username: 'asc' }, select: { id: true, username: true } }),
    prisma.timetableEntry.findMany({
      where: { schoolId },
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
        teacher: { select: { username: true } },
      },
    }),
    // Which teachers are officially assigned to which class (used for a gentle hint in the editor)
    prisma.classTeacher.findMany({
      where: { class: { schoolId } },
      select: { classId: true, teacherId: true },
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

  const links = linksRaw.map((l: any) => ({ classId: l.classId, teacherId: l.teacherId }));

  return <TimetableClient classes={classes} teachers={teachers} entries={entries} links={links} />;
}