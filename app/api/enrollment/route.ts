import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json(
      { error: 'Vous devez être connecté en tant que parent' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const {
      parentPhone,
      children,
      medical,
      consent,
    } = body;

    // -----------------------------
    // Validation
    // -----------------------------

    if (!parentPhone || !parentPhone.trim()) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      );
    }

    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json(
        { error: 'Ajoutez au moins un enfant' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Le consentement est requis' },
        { status: 400 }
      );
    }

    // Validate every child
    for (const child of children) {
      if (!child.firstName?.trim() || !child.lastName?.trim()) {
        return NextResponse.json(
          { error: 'Le prénom et le nom de chaque enfant sont requis' },
          { status: 400 }
        );
      }

      const age = Number(child.age);

      if (!Number.isInteger(age) || age < 1 || age > 18) {
        return NextResponse.json(
          {
            error: `Âge invalide pour ${child.firstName} ${child.lastName}`,
          },
          { status: 400 }
        );
      }

      if (!child.class?.trim()) {
        return NextResponse.json(
          {
            error: `La classe est requise pour ${child.firstName} ${child.lastName}`,
          },
          { status: 400 }
        );
      }
    }

    // -----------------------------
    // School
    // -----------------------------

    const schoolId = process.env.SCHOOL_ID;

    console.log('SCHOOL_ID:', schoolId);

    if (!schoolId) {
      return NextResponse.json(
        { error: "SCHOOL_ID n'est pas configuré" },
        { status: 500 }
      );
    }

    const school = await prisma.school.findUnique({
      where: {
        id: schoolId,
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: 'École introuvable' },
        { status: 500 }
      );
    }

    // -----------------------------
    // Parent
    // -----------------------------

    const parentId = session.user.id;

    if (!parentId) {
      return NextResponse.json(
        { error: "Identifiant du parent manquant" },
        { status: 500 }
      );
    }

    const parent = await prisma.user.findUnique({
      where: {
        id: parentId,
      },
    });

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent introuvable dans la base de données' },
        { status: 500 }
      );
    }

    // -----------------------------
    // Create enrollment + children
    // -----------------------------

    const enrollment = await prisma.enrollmentRequest.create({
      data: {
        schoolId,
        parentId,
        parentPhone: parentPhone.trim(),
        medical: medical?.trim() || null,
        consent: Boolean(consent),

        children: {
          create: children.map((child: any) => ({
            firstName: child.firstName.trim(),
            lastName: child.lastName.trim(),
            age: Number(child.age),
            gender: child.gender || null,
            className: child.class,
            previousSchool: child.previousSchool?.trim() || null,
          })),
        },
      },

      include: {
        children: true,
      },
    });

    console.log('✅ ENROLLMENT CREATED:', enrollment.id);
    console.log(
      '✅ CHILDREN CREATED:',
      enrollment.children.length
    );

    return NextResponse.json(
      {
        success: true,
        id: enrollment.id,
        childrenCreated: enrollment.children.length,
      },
      { status: 201 }
    );

  } catch (err: any) {
    console.error('========== ENROLLMENT ERROR ==========');
    console.error('Error:', err);
    console.error('Message:', err?.message);
    console.error('Code:', err?.code);
    console.error('Meta:', err?.meta);
    console.error('======================================');

    return NextResponse.json(
      {
        error: err?.message || 'Erreur serveur',
        code: err?.code || null,
        meta: err?.meta || null,
      },
      { status: 500 }
    );
  }
}