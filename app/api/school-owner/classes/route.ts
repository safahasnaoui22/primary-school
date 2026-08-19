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
      teacher: { select: { id: true, username: true, email: true } },
      students: { select: { id: true } },
    },
  });

  return NextResponse.json(
    classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      teacher: c.teacher ? { id: c.teacher.id, username: c.teacher.username } : null,
      studentCount: c.students.length,
      createdAt: c.createdAt,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { name, teacherId } = await req.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'Le nom de la classe est requis' }, { status: 400 });
  }

  if (teacherId) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.schoolId !== session.user.schoolId || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Enseignant invalide' }, { status: 400 });
    }
  }

  const cls = await prisma.class.create({
    data: {
      name: name.trim(),
      schoolId: session.user.schoolId,
      teacherId: teacherId || null,
    },
  });

  return NextResponse.json(cls);
}