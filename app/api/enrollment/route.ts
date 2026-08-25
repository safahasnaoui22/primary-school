import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Vous devez être connecté en tant que parent' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { parentPhone, children, medical, consent } = body;

    if (!parentPhone || !parentPhone.trim()) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 });
    }
    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins un enfant' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Le consentement est requis' }, { status: 400 });
    }

    const schoolId = process.env.SCHOOL_ID;
    if (!schoolId) {
      return NextResponse.json({ error: "SCHOOL_ID n'est pas configuré" }, { status: 500 });
    }
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'École introuvable' }, { status: 500 });
    }

    // Validate that every referenced class actually exists in this school
    // BEFORE creating the request, so parents get a clear error instead of
    // a silently-skipped child later at approval time.
    for (const child of children) {
      const classRecord = await prisma.class.findFirst({
        where: { id: child.classId, schoolId },
      });
      if (!classRecord) {
        return NextResponse.json(
          { error: `Classe invalide pour ${child.firstName || 'un enfant'}` },
          { status: 400 }
        );
      }
    }

    // IMPORTANT: this route only records the *request*. Actual Student,
    // ParentStudent, and Invoice rows must be created exactly once, in the
    // approve route (api/school-owner/enrollments/[id]/approve/route.ts),
    // when a school owner reviews and accepts the request. Creating them
    // here as well was the cause of children being registered twice.
    const enrollment = await prisma.enrollmentRequest.create({
      data: {
        schoolId,
        parentId: session.user.id,
        parentPhone,
        childrenJson: children,
        medical: medical || null,
        consent,
      },
    });

    return NextResponse.json({ id: enrollment.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}