import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const classes = await prisma.class.findMany({
    where: { schoolId: session.user.schoolId },
    orderBy: { name: 'asc' },
    include: {
      teacherLinks: { include: { teacher: { select: { id: true, username: true, email: true } } } },
      students: {
        select: { id: true, firstName: true, lastName: true, parents: { select: { id: true } } },
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      },
    },
  });

  return NextResponse.json(
    classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      teachers: c.teacherLinks.map((tl: any) => ({ id: tl.teacher.id, username: tl.teacher.username, email: tl.teacher.email })),
      studentCount: c.students.length,
      noParentCount: c.students.filter((st: any) => st.parents.length === 0).length,
      students: c.students.map((st: any) => ({ id: st.id, firstName: st.firstName, lastName: st.lastName })),
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, teacherIds } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Le nom de la classe est requis' }, { status: 400 });
  }

  const ids: string[] = Array.isArray(teacherIds) ? teacherIds : [];

  if (ids.length > 0) {
    const validTeachers = await prisma.user.findMany({
      where: { id: { in: ids }, schoolId: session.user.schoolId, role: 'TEACHER' },
    });
    if (validTeachers.length !== ids.length) {
      return NextResponse.json({ error: 'Un ou plusieurs enseignants sont invalides' }, { status: 400 });
    }
  }

  const cls = await prisma.class.create({
    data: {
      name: name.trim(),
      schoolId: session.user.schoolId,
      teacherLinks: {
        create: ids.map((teacherId: string) => ({ teacherId })),
      },
    },
  });

  return NextResponse.json(cls);
}