import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, dueDate } = await req.json();
  if (!title) {
    return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: { teacherId: session.user.id, title, dueDate: dueDate ? new Date(dueDate) : null },
  });

  return NextResponse.json(task);
}