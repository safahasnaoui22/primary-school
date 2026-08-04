import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const MAX_GUARDIANS_PER_STUDENT = 2;

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ error: 'You are not linked to a school' }, { status: 400 });
  }

  const { parentEmail, studentId } = await req.json();

  if (!parentEmail || !studentId) {
    return NextResponse.json({ error: 'parentEmail and studentId are required' }, { status: 400 });
  }

  // Confirm the student belongs to this school owner's school
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Student not found in your school' }, { status: 404 });
  }

  // Confirm the parent account exists and is actually a PARENT
  const parent = await prisma.user.findUnique({ where: { email: parentEmail } });
  if (!parent) {
    return NextResponse.json({ error: 'No account found with that email' }, { status: 404 });
  }
  if (parent.role !== 'PARENT') {
    return NextResponse.json({ error: 'That account is not a parent account' }, { status: 400 });
  }

  // Enforce max guardians per student
  const existingLinksForStudent = await prisma.parentStudent.count({ where: { studentId } });
  if (existingLinksForStudent >= MAX_GUARDIANS_PER_STUDENT) {
    return NextResponse.json(
      { error: `This student already has ${MAX_GUARDIANS_PER_STUDENT} linked guardians` },
      { status: 409 }
    );
  }

  // Prevent duplicate link
  const existing = await prisma.parentStudent.findUnique({
    where: { parentId_studentId: { parentId: parent.id, studentId } },
  });
  if (existing) {
    return NextResponse.json({ error: 'This parent is already linked to this student' }, { status: 409 });
  }

  try {
    const link = await prisma.parentStudent.create({
      data: { parentId: parent.id, studentId },
      include: {
        parent: { select: { id: true, username: true, email: true } },
        student: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(link);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to link parent' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { parentId, studentId } = await req.json();

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Student not found in your school' }, { status: 404 });
  }

  await prisma.parentStudent.deleteMany({ where: { parentId, studentId } });

  return NextResponse.json({ success: true });
}