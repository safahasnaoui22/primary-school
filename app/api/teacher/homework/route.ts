import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, title, instructions, fileUrl, deadline } = await req.json();
  if (!classId || !title || !deadline) {
    return NextResponse.json({ error: 'Classe, titre et échéance requis' }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls || cls.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Vous n'enseignez pas cette classe" }, { status: 403 });
  }

  const homework = await prisma.homework.create({
    data: { classId, teacherId: session.user.id, title, instructions, fileUrl, deadline: new Date(deadline) },
  });

  return NextResponse.json(homework);
}