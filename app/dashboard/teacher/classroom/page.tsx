import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import ClassroomClient from './ClassroomClient';

export default async function TeacherClassroomPage() {
  const session = await auth();
  if (!session?.user) return null;

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    orderBy: { name: 'asc' },
    include: { students: { orderBy: { lastName: 'asc' } } },
  });

  return (
    <ClassroomClient
      classes={classes.map((c: any) => ({
        id: c.id,
        name: c.name,
        students: c.students.map((s: any) => ({ id: s.id, firstName: s.firstName, lastName: s.lastName })),
      }))}
    />
  );
}