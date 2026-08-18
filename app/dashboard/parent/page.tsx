import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ParentDashboardClient from './DashboardClient';

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user) return null;

  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: {
      student: {
        include: {
          class: { include: { teacher: { select: { id: true, username: true } } } },
        },
      },
    },
  });

  const children = await Promise.all(
    links.map(async (link: any) => {
      const student = link.student;
      const classId = student.classId;

      const [attendanceRecords, allAttendance, grades, resources] = await Promise.all([
        classId
          ? prisma.attendance.findMany({
              where: { studentId: student.id },
              orderBy: { date: 'desc' },
              take: 10,
            })
          : Promise.resolve([]),
        prisma.attendance.findMany({ where: { studentId: student.id } }),
        prisma.grade.findMany({
          where: { studentId: student.id },
          orderBy: { createdAt: 'desc' },
        }),
        classId
          ? prisma.resource.findMany({
              where: { classId },
              orderBy: { createdAt: 'desc' },
              take: 5,
              include: { teacher: { select: { username: true } } },
            })
          : Promise.resolve([]),
      ]);

      const presentCount = allAttendance.filter((a: any) => a.status === 'PRESENT').length;
      const attendancePct = allAttendance.length > 0 ? Math.round((presentCount / allAttendance.length) * 100) : null;

      const subjectMap = new Map<string, any[]>();
      grades.forEach((g: any) => {
        if (!subjectMap.has(g.subject)) subjectMap.set(g.subject, []);
        subjectMap.get(g.subject)!.push(g);
      });
      const subjects = Array.from(subjectMap.entries()).map(([subject, entries]) => {
        const latest = entries[0];
        const previous = entries[1];
        let trend: 'up' | 'down' | 'flat' = 'flat';
        if (previous && latest.gradeValue !== previous.gradeValue) {
          trend = latest.gradeValue > previous.gradeValue ? 'up' : 'down';
        }
        return { name: subject, grade: latest.gradeValue, trend };
      });

      return {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        className: student.class?.name ?? 'Aucune classe assignée',
        teacherName: student.class?.teacher?.username ?? null,
        teacherId: student.class?.teacher?.id ?? null,
        attendancePct,
        attendanceLast10: attendanceRecords.reverse().map((a: any) => a.status.toLowerCase()),
        subjects,
        resources: resources.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          fileUrl: r.fileUrl,
          teacherName: r.teacher.username,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    })
  );

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
    include: {
      userA: { select: { id: true, username: true, role: true } },
      userB: { select: { id: true, username: true, role: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  const unreadCount = await prisma.message.count({
    where: {
      conversation: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
      senderId: { not: session.user.id },
      readAt: null,
    },
  });

  const announcements = session.user.schoolId
    ? await prisma.announcement.findMany({
        where: { schoolId: session.user.schoolId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      })
    : [];

  const nextInvoice = await prisma.invoice.findFirst({
    where: { parentId: session.user.id, status: { in: ['PENDING', 'OVERDUE'] } },
    orderBy: { dueDate: 'asc' },
  });

  const pendingEnrollment = await prisma.enrollmentRequest.findFirst({
    where: { parentId: session.user.id, status: 'PENDING' },
  });

  return (
    <ParentDashboardClient
      parentName={session.user.name ?? ''}
      children={children}
      pendingEnrollment={!!pendingEnrollment}
      conversations={conversations.map((c: any) => {
        const other = c.userAId === session.user.id ? c.userB : c.userA;
        return {
          id: c.id,
          otherName: other.username,
          otherRole: other.role,
          lastMessage: c.messages[0]?.content ?? null,
          unread: false,
        };
      })}
      unreadCount={unreadCount}
      announcements={announcements.map((a: any) => ({
        id: a.id,
        title: a.title,
        category: a.category,
        createdAt: a.createdAt.toISOString(),
      }))}
      invoice={
        nextInvoice
          ? {
              amount: nextInvoice.amount,
              dueDate: nextInvoice.dueDate.toISOString(),
              status: nextInvoice.status,
            }
          : null
      }
    />
  );
}