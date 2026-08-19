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
    classId: string;
    previousSchool?: string;
  }[];

  try {
    const students = [];
    for (const child of children) {
      const cls = await prisma.class.findUnique({ where: { id: child.classId } });
      if (!cls || cls.schoolId !== session.user.schoolId) {
        return NextResponse.json({ error: `Classe invalide pour ${child.firstName}` }, { status: 400 });
      }

      const student = await prisma.student.create({
        data: {
          firstName: child.firstName,
          lastName: child.lastName,
          schoolId: session.user.schoolId,
          classId: child.classId,
        },
      });

      await prisma.parentStudent.create({
        data: { parentId: enrollment.parentId, studentId: student.id },
      });

      // If this class already has fee structures set (e.g. Semester 1 price
      // already entered by the school owner), generate the matching invoice
      // immediately so it shows up on the payments page without a manual step.
      const feeStructures = await prisma.feeStructure.findMany({ where: { classId: child.classId } });
      for (const fee of feeStructures) {
        await prisma.invoice.create({
          data: {
            schoolId: session.user.schoolId,
            studentId: student.id,
            parentId: enrollment.parentId,
            classId: child.classId,
            semester: fee.semester,
            amount: fee.amount,
            dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // default: 1 month from approval
          },
        });
      }

      students.push(student);
    }

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