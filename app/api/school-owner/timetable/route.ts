// File: app/api/school-owner/timetable/route.ts

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { DAYS } from '@/lib/timetable-constants';

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

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Returns a French error message, or null when the payload is valid. */
function validate(b: Body): string | null {
  if (!b.classId || !b.teacherId || !b.subject || b.dayOfWeek === undefined || b.dayOfWeek === null || !b.startTime || !b.endTime) {
    return 'Champs manquants.';
  }
  if (!Number.isInteger(b.dayOfWeek) || b.dayOfWeek < 0 || b.dayOfWeek >= DAYS.length) return 'Jour invalide.';
  if (!TIME_RE.test(b.startTime) || !TIME_RE.test(b.endTime) || b.endTime <= b.startTime) return 'Horaire invalide.';
  if (b.subject.trim().length === 0 || b.subject.trim().length > 80) return 'La matière doit faire entre 1 et 80 caractères.';
  if (b.room && b.room.trim().length > 40) return 'Le nom de la salle est trop long.';
  return null;
}

/** Class and teacher must both belong to the owner's school. */
async function checkOwnership(schoolId: string, classId: string, teacherId: string): Promise<string | null> {
  const [cls, teacher] = await Promise.all([
    prisma.class.findFirst({ where: { id: classId, schoolId }, select: { id: true } }),
    prisma.user.findFirst({ where: { id: teacherId, schoolId, role: 'TEACHER' }, select: { id: true } }),
  ]);
  if (!cls) return 'Classe introuvable.';
  if (!teacher) return 'Enseignant introuvable.';
  return null;
}

export async function POST(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const schoolId = session.user.schoolId;
  if (!schoolId) return NextResponse.json({ error: 'Aucune école liée à ce compte.' }, { status: 400 });

  const body: Body = await req.json();
  const invalid = validate(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { classId, teacherId, dayOfWeek, startTime, endTime } = body;
  const subject = body.subject.trim();
  const room = body.room?.trim() || null;

  const notOwned = await checkOwnership(schoolId, classId, teacherId);
  if (notOwned) return NextResponse.json({ error: notOwned }, { status: 404 });

  const classConflict = await prisma.timetableEntry.findFirst({ where: { schoolId, classId, dayOfWeek, startTime } });
  if (classConflict) {
    return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
  }
  const teacherConflict = await prisma.timetableEntry.findFirst({ where: { schoolId, teacherId, dayOfWeek, startTime } });
  if (teacherConflict) {
    return NextResponse.json({ error: 'Cet enseignant est déjà occupé à ce créneau.' }, { status: 409 });
  }

  try {
    const entry = await prisma.timetableEntry.create({
      data: { schoolId, classId, teacherId, subject, dayOfWeek, startTime, endTime, room },
    });
    return NextResponse.json(entry);
  } catch (e: any) {
    // Unique (classId, dayOfWeek, startTime) hit by a concurrent request
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Impossible d’enregistrer le cours.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const schoolId = session.user.schoolId;
  if (!schoolId) return NextResponse.json({ error: 'Aucune école liée à ce compte.' }, { status: 400 });

  const body: Body = await req.json();
  if (!body.id) return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
  const invalid = validate(body);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  const { id, classId, teacherId, dayOfWeek, startTime, endTime } = body;
  const subject = body.subject.trim();
  const room = body.room?.trim() || null;

  const existing = await prisma.timetableEntry.findFirst({ where: { id, schoolId }, select: { id: true } });
  if (!existing) return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });

  const notOwned = await checkOwnership(schoolId, classId, teacherId);
  if (notOwned) return NextResponse.json({ error: notOwned }, { status: 404 });

  const classConflict = await prisma.timetableEntry.findFirst({ where: { schoolId, classId, dayOfWeek, startTime, NOT: { id } } });
  if (classConflict) {
    return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
  }
  const teacherConflict = await prisma.timetableEntry.findFirst({ where: { schoolId, teacherId, dayOfWeek, startTime, NOT: { id } } });
  if (teacherConflict) {
    return NextResponse.json({ error: 'Cet enseignant est déjà occupé à ce créneau.' }, { status: 409 });
  }

  try {
    const entry = await prisma.timetableEntry.update({
      where: { id },
      data: { classId, teacherId, subject, dayOfWeek, startTime, endTime, room },
    });
    return NextResponse.json(entry);
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Cette classe a déjà un cours à ce créneau.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Impossible de modifier le cours.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await requireSchoolOwner();
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const schoolId = session.user.schoolId;
  if (!schoolId) return NextResponse.json({ error: 'Aucune école liée à ce compte.' }, { status: 400 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Identifiant manquant.' }, { status: 400 });

  // Scoped to the owner's school so one school can never delete another's cours
  const { count } = await prisma.timetableEntry.deleteMany({ where: { id, schoolId } });
  if (count === 0) return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}