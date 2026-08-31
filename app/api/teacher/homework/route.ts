import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const homeworks = await prisma.homework.findMany({
    where: { teacherId: session.user.id },
    orderBy: { deadline: 'desc' },
    include: {
      class: {
        select: {
          id: true,
          name: true,
          students: { orderBy: { lastName: 'asc' }, select: { id: true, firstName: true, lastName: true } },
        },
      },
      statuses: true,
    },
  });

  return NextResponse.json(
    homeworks.map((h: any) => ({
      id: h.id,
      title: h.title,
      instructions: h.instructions,
      fileUrl: h.fileUrl,
      deadline: h.deadline,
      className: h.class.name,
      students: h.class.students.map((s: any) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        completed: h.statuses.find((st: any) => st.studentId === s.id)?.completed ?? false,
      })),
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, title, instructions, fileUrl, deadline } = await req.json();
  if (!classId || !title || !deadline) {
    return NextResponse.json({ error: 'Classe, titre et échéance requis' }, { status: 400 });
  }

  const link = await prisma.classTeacher.findFirst({ where: { classId, teacherId: session.user.id } });
  if (!link) {
    return NextResponse.json({ error: "Vous n'enseignez pas cette classe" }, { status: 403 });
  }

  const homework = await prisma.homework.create({
    data: { classId, teacherId: session.user.id, title, instructions, fileUrl, deadline: new Date(deadline) },
  });

  return NextResponse.json(homework);
}