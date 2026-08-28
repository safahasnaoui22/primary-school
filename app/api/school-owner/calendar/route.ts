import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { title, description, date, type, classId } = await req.json();
  if (!title || !date) {
    return NextResponse.json({ error: 'Titre et date requis' }, { status: 400 });
  }

  const parsedDate = new Date(date);
  const currentYear = new Date().getFullYear();

  if (
    isNaN(parsedDate.getTime()) ||
    parsedDate.getFullYear() < currentYear - 1 ||
    parsedDate.getFullYear() > currentYear + 5
  ) {
    return NextResponse.json({ error: 'Date invalide' }, { status: 400 });
  }

  if (classId) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
    }
  }

  const event = await prisma.calendarEvent.create({
    data: {
      schoolId: session.user.schoolId,
      classId: classId || null,
      authorId: session.user.id,
      title,
      description,
      date: parsedDate,
      type: type || 'EVENT',
    },
  });

  return NextResponse.json(event);
}