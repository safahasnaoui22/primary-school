import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId, classId, status } = await req.json();
  if (!studentId || !classId || !status) {
    return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
  }

  const link = await prisma.classTeacher.findFirst({ where: { classId, teacherId: session.user.id } });
  if (!link) {
    return NextResponse.json({ error: "Vous n'enseignez pas cette classe" }, { status: 403 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.attendance.upsert({
    where: { studentId_date: { studentId, date: today } },
    update: { status },
    create: { studentId, classId, date: today, status, recordedById: session.user.id },
  });

  return NextResponse.json(attendance);
}