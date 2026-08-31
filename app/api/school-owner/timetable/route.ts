// File: app/api/school-owner/timetable/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function requireSchoolOwner() {
  const session = await auth();
  if (!session?.user?.schoolId || session.user.role !== 'SCHOOL_OWNER') {
    return null;
  }
  return session;
}

interface Body {
  id?: string;
  classId: string;
  teacherId: string;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room?: string | null;
}

export async function POST(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const body: Body = await req.json();
  const { classId, teacherId, subject, dayOfWeek, startTime, endTime, room } = body;
  if (!classId || !teacherId || !subject || dayOfWeek === undefined || dayOfWeek === null || !startTime || !endTime) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  const classConflict = await prisma.timetableEntry.findFirst({ where: { classId, dayOfWeek, startTime } });
  if (classConflict) {
    return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
  }
  const teacherConflict = await prisma.timetableEntry.findFirst({ where: { teacherId, dayOfWeek, startTime } });
  if (teacherConflict) {
    return NextResponse.json({ error: 'Cet enseignant est déjà occupé à ce créneau.' }, { status: 409 });
  }

  const entry = await prisma.timetableEntry.create({
    data: { schoolId: session.user.schoolId, classId, teacherId, subject, dayOfWeek, startTime, endTime, room: room ?? null },
  });
  return NextResponse.json(entry);
}

export async function PUT(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const body: Body = await req.json();
  const { id, classId, teacherId, subject, dayOfWeek, startTime, endTime, room } = body;
  if (!id || !classId || !teacherId || !subject || dayOfWeek === undefined || dayOfWeek === null || !startTime || !endTime) {
    return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  }

  const classConflict = await prisma.timetableEntry.findFirst({ where: { classId, dayOfWeek, startTime, NOT: { id } } });
  if (classConflict) {
    return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
  }
  const teacherConflict = await prisma.timetableEntry.findFirst({ where: { teacherId, dayOfWeek, startTime, NOT: { id } } });
  if (teacherConflict) {
    return NextResponse.json({ error: 'Cet enseignant est déjà occupé à ce créneau.' }, { status: 409 });
  }

  const entry = await prisma.timetableEntry.update({
    where: { id },
    data: { classId, teacherId, subject, dayOfWeek, startTime, endTime, room: room ?? null },
  });
  return NextResponse.json(entry);
}

export async function DELETE(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 });

  await prisma.timetableEntry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}