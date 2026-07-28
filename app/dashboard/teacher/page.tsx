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

  const teacher = await prisma.user.findUnique({ where: { id: session.user.id } });
  const classesTaught: string[] = teacher?.classesTaught ?? [];

  const students = classesTaught.length
    ? await prisma.student.findMany({
        where: { schoolId: session.user.schoolId, className: { in: classesTaught } },
        orderBy: [{ className: 'asc' }, { lastName: 'asc' }],
        include: {
          parents: {
            include: { parent: { select: { id: true, username: true, email: true } } },
          },
        },
      })
    : [];

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
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
      conversation: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
      senderId: { not: session.user.id },
      readAt: null,
    },
  });

  const classGroups = classesTaught.map((className) => ({
    className,
    count: students.filter((s: any) => s.className === className).length,
  }));

  return (
    <TeacherDashboardClient
      teacherName={session.user.name ?? ''}
      classesTaught={classesTaught}
      classGroups={classGroups}
      students={students.map((s: any) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        className: s.className,
        age: s.age,
        parentNames: s.parents.map((p: any) => p.parent.username),
      }))}
      recentConversations={conversations.map((c: any) => {
        const other = c.userAId === session.user.id ? c.userB : c.userA;
        return {
          id: c.id,
          otherName: other.username,
          otherRole: other.role,
          lastMessage: c.messages[0]?.content ?? null,
        };
      })}
      unreadCount={unreadCount}
    />
  );
}