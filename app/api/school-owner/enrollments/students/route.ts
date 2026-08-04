import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: 'You are not linked to a school' }, { status: 400 });
  }

  const { firstName, lastName, classId } = await req.json();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: 'First and last name are required' }, { status: 400 });
  }

  // If a classId was passed, make sure that class actually belongs to this school
  if (classId) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Invalid class for this school' }, { status: 400 });
    }
  }

  try {
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        schoolId: session.user.schoolId,
        classId: classId ?? null,
      },
    });

    return NextResponse.json(student);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: 'You are not linked to a school' }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: { schoolId: session.user.schoolId },
    include: {
      class: true,
      parents: { include: { parent: { select: { id: true, username: true, email: true } } } },
    },
    orderBy: { lastName: 'asc' },
  });

  return NextResponse.json(students);
}