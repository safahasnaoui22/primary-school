import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { parentName, parentEmail, parentPhone, city, street, children, medical, consent } = body;

    if (!parentName || !parentEmail || !parentPhone || !city || !street) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }
    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins un enfant' }, { status: 400 });
    }
    if (!consent) {
      return NextResponse.json({ error: 'Le consentement est requis' }, { status: 400 });
    }

    // Single-school deployment assumption — if you later support multiple
    // schools on one instance, pass schoolId explicitly instead of findFirst().
    const school = await prisma.school.findFirst();
    if (!school) {
      return NextResponse.json({ error: 'Aucune école configurée' }, { status: 500 });
    }

    const enrollment = await prisma.enrollmentRequest.create({
      data: {
        schoolId: school.id,
        parentName,
        parentEmail,
        parentPhone,
        city,
        street,
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