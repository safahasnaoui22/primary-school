import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TeacherDashboardClient from './DashboardClient';

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n'est liée à votre compte. Contactez votre chef d'établissement.
      </div>
    );
  }

  const teacherId = session.user.id;
  const schoolId = session.user.schoolId;

  const classLinks = await prisma.classTeacher.findMany({
    where: { teacherId },
    include: {
      class: {
        include: {
          students: {
            orderBy: { lastName: 'asc' },
            include: {
              parents: { include: { parent: { select: { id: true, username: true, email: true } } } },
            },
          },
        },
      },
    },
  });

  const classes = classLinks.map((cl: any) => cl.class);
  const classIds = classes.map((c: any) => c.id);

  const allStudents = classes.flatMap((c: any) =>
    c.students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: c.name,
      classId: c.id,
      parentNames: s.parents.map((p: any) => p.parent.username),
      parents: s.parents.map((p: any) => ({ id: p.parent.id, username: p.parent.username })),
      birthDate: s.birthDate ? s.birthDate.toISOString() : null,
    }))
  );

  const classGroups = classes.map((c: any) => ({
    classId: c.id,
    className: c.name,
    students: c.students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      parents: s.parents.map((p: any) => ({ id: p.parent.id, username: p.parent.username })),
    })),
    count: c.students.length,
  }));

  // --- Date ranges ---
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);
  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  // --- This week's schedule ---
  const weekSchedule = await prisma.calendarEvent.findMany({
    where: {
      schoolId,
      date: { gte: startOfToday, lt: endOfWeek },
      OR: [{ authorId: teacherId }, { classId: { in: classIds } }, { classId: null }],
    },
    orderBy: { date: 'asc' },
  });

  // --- Today's attendance, per class ---
  const attendanceRecords = await prisma.attendance.findMany({
    where: { classId: { in: classIds }, date: { gte: startOfToday, lt: endOfToday } },
  });

  const attendanceSummaryByClass = classes.map((c: any) => {
    const records = attendanceRecords.filter((a: any) => a.classId === c.id);
    const present = records.filter((r: any) => r.status === 'PRESENT').length;
    const absent = records.filter((r: any) => r.status === 'ABSENT').length;
    const late = records.filter((r: any) => r.status === 'LATE').length;
    return {
      classId: c.id,
      className: c.name,
      totalStudents: c.students.length,
      present,
      absent,
      late,
      unmarked: c.students.length - records.length,
      students: c.students.map((s: any) => {
        const rec = records.find((r: any) => r.studentId === s.id);
        return { id: s.id, firstName: s.firstName, lastName: s.lastName, status: rec?.status ?? null };
      }),
    };
  });

  // --- Upcoming homework ---
  const homeworks = await prisma.homework.findMany({
    where: { teacherId, deadline: { gte: startOfToday } },
    orderBy: { deadline: 'asc' },
    take: 5,
    include: {
      class: { select: { name: true, students: { select: { id: true } } } },
      statuses: true,
    },
  });

  // --- Recent resources posted by this teacher ---
  const recentResources = await prisma.resource.findMany({
    where: { teacherId },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { class: { select: { name: true } } },
  });

  // --- Recent progress updates sent by this teacher ---
  const recentProgress = await prisma.progressUpdate.findMany({
    where: { teacherId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { student: { select: { firstName: true, lastName: true } } },
  });

  // --- To-do list ---
  const tasks = await prisma.task.findMany({
    where: { teacherId },
    orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
  });

  // --- Student performance: most recent grade per subject ---
  const grades = await prisma.grade.findMany({
    where: { classId: { in: classIds } },
    orderBy: { createdAt: 'desc' },
    select: { studentId: true, subject: true, gradeValue: true },
  });

  const gradesByStudent = new Map<string, { subject: string; gradeValue: string }[]>();
  for (const g of grades) {
    if (!gradesByStudent.has(g.studentId)) gradesByStudent.set(g.studentId, []);
    const entries = gradesByStudent.get(g.studentId)!;
    if (!entries.some((e) => e.subject === g.subject)) {
      entries.push({ subject: g.subject, gradeValue: g.gradeValue });
    }
  }

  const studentPerformance = allStudents.map((s: any) => ({
    studentId: s.id,
    studentName: `${s.firstName} ${s.lastName}`,
    className: s.className,
    grades: gradesByStudent.get(s.id) ?? [],
  }));

  // --- Upcoming birthdays (next 30 days) ---
  const now = new Date();
  const birthdays = allStudents
    .filter((s: any) => s.birthDate)
    .map((s: any) => {
      const bd = new Date(s.birthDate);
      const nextOccurrence = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      if (nextOccurrence < now) nextOccurrence.setFullYear(now.getFullYear() + 1);
      return { ...s, nextOccurrence };
    })
    .filter((s: any) => (s.nextOccurrence.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 30)
    .sort((a: any, b: any) => a.nextOccurrence.getTime() - b.nextOccurrence.getTime());

  // --- Messages ---
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: teacherId }, { userBId: teacherId }] },
    include: {
      userA: { select: { id: true, username: true, role: true } },
      userB: { select: { id: true, username: true, role: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const unreadCount = await prisma.message.count({
    where: {
      conversation: { OR: [{ userAId: teacherId }, { userBId: teacherId }] },
      senderId: { not: teacherId },
      readAt: null,
    },
  });

  return (
    <TeacherDashboardClient
      teacherName={session.user.name ?? ''}
      classGroups={classGroups}
      students={allStudents}
      weekSchedule={weekSchedule.map((e: any) => ({
        id: e.id,
        title: e.title,
        date: e.date.toISOString(),
        type: e.type,
        description: e.description,
      }))}
      attendanceSummary={attendanceSummaryByClass}
      homeworks={homeworks.map((h: any) => ({
        id: h.id,
        title: h.title,
        deadline: h.deadline.toISOString(),
        className: h.class.name,
        completedCount: h.statuses.filter((s: any) => s.completed).length,
        totalCount: h.class.students.length,
      }))}
      recentResources={recentResources.map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        className: r.class.name,
        createdAt: r.createdAt.toISOString(),
      }))}
      recentProgress={recentProgress.map((p: any) => ({
        id: p.id,
        studentName: `${p.student.firstName} ${p.student.lastName}`,
        category: p.category,
        level: p.level,
        note: p.note,
        createdAt: p.createdAt.toISOString(),
      }))}
      tasks={tasks.map((t: any) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        completed: t.completed,
      }))}
      studentPerformance={studentPerformance}
      birthdays={birthdays.map((b: any) => ({
        id: b.id,
        firstName: b.firstName,
        lastName: b.lastName,
        className: b.className,
        nextOccurrence: b.nextOccurrence.toISOString(),
      }))}
      recentConversations={conversations.map((c: any) => {
        const other = c.userAId === teacherId ? c.userB : c.userA;
        return { id: c.id, otherName: other.username, otherRole: other.role, lastMessage: c.messages[0]?.content ?? null };
      })}
      unreadCount={unreadCount}
    />
  );
}