import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import AttendanceClient from './AttendanceClient';

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ classId?: string; date?: string }>;
}) {
  const session = await auth();
  if (!session?.user.schoolId) {
    return <div style={{ padding: 40 }}>Non autorisé</div>;
  }

  const params = await searchParams;
  const teacherId = session.user.id;
  const classId = params?.classId;
  const dateStr = params?.date || new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  // Classes de l'enseignant
  const classes = await prisma.class.findMany({
    where: { teacherId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  // Classe sélectionnée
  let selectedClass = null;
  let students: { id: string; firstName: string; lastName: string }[] = [];
  if (classId) {
    selectedClass = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true },
    });
    if (selectedClass) {
      students = await prisma.student.findMany({
        where: { classId },
        orderBy: { lastName: 'asc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      });
    }
  }

  // Présences existantes pour cette date et classe
  let existingAttendance: { studentId: string; status: string }[] = [];
  if (classId) {
    existingAttendance = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: date,
          lt: nextDay,
        },
      },
      select: {
        studentId: true,
        status: true,
      },
    });
  }

  return (
    <AttendanceClient
      classes={classes}
      selectedClass={selectedClass}
      students={students}
      existingAttendance={existingAttendance}
      date={dateStr}
    />
  );
}