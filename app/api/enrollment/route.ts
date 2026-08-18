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

console.log('SCHOOL_ID:', schoolId);
    if (!schoolId) {
      return NextResponse.json({ error: "SCHOOL_ID n'est pas configuré" }, { status: 500 });
    }
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'École introuvable' }, { status: 500 });
    }

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