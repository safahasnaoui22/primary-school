import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!session.user.schoolId) {
    return NextResponse.json({ error: 'You are not linked to a school' }, { status: 400 });
  }

  const { id } = await params;

  const enrollment = await prisma.enrollmentRequest.findUnique({ where: { id } });
  if (!enrollment || enrollment.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
  }
  if (enrollment.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been reviewed' }, { status: 409 });
  }

  const children = enrollment.childrenJson as {
    firstName: string;
    lastName: string;
    age: string;
    gender?: string;
    class: string;
    previousSchool?: string;
  }[];

  try {
    const students = await prisma.$transaction(
      children.map((child: any) =>
        prisma.student.create({
          data: {
            firstName: child.firstName,
            lastName: child.lastName,
            schoolId: session.user.schoolId!,
          },
        })
      )
    );

    await prisma.$transaction(
      students.map((student: any) =>
        prisma.parentStudent.create({
          data: { parentId: enrollment.parentId, studentId: student.id },
        })
      )
    );

    await prisma.enrollmentRequest.update({
      where: { id },
      data: { status: 'APPROVED', reviewedAt: new Date() },
    });

    return NextResponse.json({ success: true, studentsCreated: students.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to approve enrollment' }, { status: 500 });
  }
}