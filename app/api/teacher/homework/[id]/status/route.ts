import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { studentId, completed } = await req.json();

  const homework = await prisma.homework.findUnique({ where: { id } });
  if (!homework || homework.teacherId !== session.user.id) {
    return NextResponse.json({ error: 'Devoir introuvable' }, { status: 404 });
  }

  const status = await prisma.homeworkStatus.upsert({
    where: { homeworkId_studentId: { homeworkId: id, studentId } },
    update: { completed },
    create: { homeworkId: id, studentId, completed },
  });

  return NextResponse.json(status);
}