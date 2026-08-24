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

  // Classes existantes avec élèves et parents
  const classes = await prisma.class.findMany({
    where: { teacherId },
    orderBy: { name: 'asc' },
    include: {
      students: {
        orderBy: { lastName: 'asc' },
        include: {
          parents: {
            include: { parent: { select: { id: true, username: true, email: true } } },
          },
        },
      },
    },
  });

  const allStudents = classes.flatMap((c: any) =>
    c.students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: c.name,
      parentNames: s.parents.map((p: any) => p.parent.username),
      birthDate: s.birthDate,
    }))
  );

  const classGroups = classes.map((c: any) => ({
    className: c.name,
    count: c.students.length,
  }));

  // --- Présences du jour ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      class: { teacherId },
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
    include: {
      student: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  const attendanceSummaryByClass = classes.map((c) => {
    const classStudents = c.students;
    const records = attendanceRecords.filter((a) => a.classId === c.id);
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;
    const unmarked = classStudents.length - records.length;
    return {
      classId: c.id,
      className: c.name,
      totalStudents: classStudents.length,
      present,
      absent,
      late,
      excused,
      unmarked,
    };
  });

  // --- Événements à venir (7 prochains jours) ---
  const upcomingEvents = await prisma.calendarEvent.findMany({
    where: {
      authorId: teacherId,
      date: { gte: new Date() },
    },
    orderBy: { date: 'asc' },
    take: 5,
  });

  // --- Tâches non terminées ---
  const todos = await prisma.task.findMany({
    where: {
      teacherId,
      completed: false,
    },
    orderBy: { dueDate: 'asc' },
    take: 5,
  });

  // --- Ressources récentes ---
  const recentResources = await prisma.resource.findMany({
    where: { teacherId },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // --- Anniversaires à venir (30 jours) ---
  const now = new Date();
  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);
  const birthdays = await prisma.student.findMany({
    where: {
      class: { teacherId },   // ensures class exists
      birthDate: {
        not: null,
        gte: now,
        lte: in30Days,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      birthDate: true,
      class: { select: { name: true } },
    },
  });

  // --- Aperçu performance (moyenne des notes par élève) ---
  const grades = await prisma.grade.findMany({
    where: {
      class: { teacherId },
    },
    select: {
      studentId: true,
      value: true,
      subject: true,
    },
  });

  const performanceMap = new Map<string, { total: number; count: number; subjects: Set<string> }>();
  for (const g of grades) {
    if (!performanceMap.has(g.studentId)) {
      performanceMap.set(g.studentId, { total: 0, count: 0, subjects: new Set() });
    }
    const entry = performanceMap.get(g.studentId)!;
    entry.total += g.value;
    entry.count += 1;
    if (g.subject) entry.subjects.add(g.subject);
  }

  const studentPerformance = allStudents.map((s) => {
    const perf = performanceMap.get(s.id);
    const average = perf && perf.count > 0 ? perf.total / perf.count : null;
    return {
      studentId: s.id,
      studentName: `${s.firstName} ${s.lastName}`,
      className: s.className,
      average,
      subjectCount: perf ? perf.subjects.size : 0,
    };
  });

  // Conversations
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
      recentConversations={conversations.map((c: any) => {
        const other = c.userAId === teacherId ? c.userB : c.userA;
        return {
          id: c.id,
          otherName: other.username,
          otherRole: other.role,
          lastMessage: c.messages[0]?.content ?? null,
        };
      })}
      unreadCount={unreadCount}
      attendanceSummary={attendanceSummaryByClass}
      upcomingEvents={upcomingEvents.map((e) => ({
        id: e.id,
        title: e.title,
        start: e.date.toISOString(),
        end: undefined,
        description: e.description,
      }))}
      todos={todos.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate?.toISOString(),
        completed: t.completed,
      }))}
      recentResources={recentResources.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        fileUrl: r.fileUrl,
      }))}
      birthdays={birthdays.map((b) => ({
        id: b.id,
        firstName: b.firstName,
        lastName: b.lastName,
        birthDate: b.birthDate!.toISOString(), // non-null assert because filtered
        className: b.class!.name,              // non-null assert because class filter exists
      }))}
      studentPerformance={studentPerformance}
    />
  );
}