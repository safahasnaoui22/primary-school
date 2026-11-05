import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TeacherShell from './TeacherShell';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  let unreadCount = 0;
  let schoolName = '';

  if (session?.user) {
    const teacherId = session.user.id;
    const [unread, school] = await Promise.all([
      prisma.message.count({
        where: {
          conversation: { OR: [{ userAId: teacherId }, { userBId: teacherId }] },
          senderId: { not: teacherId },
          readAt: null,
        },
      }),
      session.user.schoolId
        ? prisma.school.findUnique({ where: { id: session.user.schoolId }, select: { name: true } })
        : Promise.resolve(null),
    ]);
    unreadCount = unread;
    schoolName = school?.name ?? '';
  }

  return (
    <TeacherShell teacherName={session?.user?.name ?? ''} schoolName={schoolName} unreadCount={unreadCount}>
      {children}
    </TeacherShell>
  );
}