import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId, category, level, note } = await req.json();
  if (!studentId || !category || !level) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId }, include: { class: true } });
  if (!student || student.class?.teacherId !== session.user.id) {
    return NextResponse.json({ error: "Cet élève n'est pas dans une de vos classes" }, { status: 403 });
  }

  const update = await prisma.progressUpdate.create({
    data: { studentId, teacherId: session.user.id, category, level, note },
  });

  return NextResponse.json(update);
}