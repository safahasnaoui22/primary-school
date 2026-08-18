import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  console.log('========== ENROLLMENT DEBUG ==========');
  console.log('Session user:', session?.user);
  console.log('User ID:', session?.user?.id);
  console.log('User role:', session?.user?.role);
  console.log('======================================');

  // Check authentication
  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json(
      {
        error: 'Vous devez être connecté en tant que parent',
      },
      { status: 401 }
    );
  }

  try {
    // Read request body
    const body = await req.json();

    const {
      parentPhone,
      children,
      medical,
      consent,
    } = body;

    // Validate phone
    if (!parentPhone || !parentPhone.trim()) {
      return NextResponse.json(
        {
          error: 'Numéro de téléphone requis',
        },
        { status: 400 }
      );
    }

    // Validate children
    if (!Array.isArray(children) || children.length === 0) {
      return NextResponse.json(
        {
          error: 'Ajoutez au moins un enfant',
        },
        { status: 400 }
      );
    }

    // Validate consent
    if (!consent) {
      return NextResponse.json(
        {
          error: 'Le consentement est requis',
        },
        { status: 400 }
      );
    }

    // Get school ID from environment
    const schoolId = process.env.SCHOOL_ID;

    console.log('SCHOOL_ID:', schoolId);

    if (!schoolId) {
      return NextResponse.json(
        {
          error: "SCHOOL_ID n'est pas configuré",
        },
        { status: 500 }
      );
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: {
        id: schoolId,
      },
    });

    console.log('SCHOOL FOUND:', school);

    if (!school) {
      return NextResponse.json(
        {
          error: 'École introuvable',
        },
        { status: 500 }
      );
    }

    // Verify parent exists
    const parentId = session.user.id;

    console.log('PARENT ID:', parentId);

    if (!parentId) {
      return NextResponse.json(
        {
          error: "L'identifiant du parent est manquant dans la session",
        },
        { status: 500 }
      );
    }

    const parent = await prisma.user.findUnique({
      where: {
        id: parentId,
      },
    });

    console.log('PARENT FOUND:', parent);

    if (!parent) {
      return NextResponse.json(
        {
          error: 'Parent introuvable dans la base de données',
        },
        { status: 500 }
      );
    }

    // Create enrollment request
    const enrollment = await prisma.enrollmentRequest.create({
      data: {
        schoolId: schoolId,
        parentId: parentId,
        parentPhone: parentPhone.trim(),
        childrenJson: children,
        medical: medical?.trim() || null,
        consent: Boolean(consent),
      },
    });

    console.log('✅ ENROLLMENT CREATED:', enrollment.id);

    return NextResponse.json(
      {
        success: true,
        id: enrollment.id,
        message: 'Inscription envoyée avec succès',
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