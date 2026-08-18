import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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

  const children = enrollment.childrenJson as { firstName: string; age: string; class: string }[];

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      // Find or create the parent's User account
      let parent = await tx.user.findUnique({ where: { email: enrollment.parentEmail } });
      let tempPassword: string | null = null;

      if (!parent) {
        tempPassword = Math.random().toString(36).slice(-10);
        const hashed = await bcrypt.hash(tempPassword, 10);
        parent = await tx.user.create({
          data: {
            username: enrollment.parentName,
            email: enrollment.parentEmail,
            password: hashed,
            role: 'PARENT',
            schoolId: session.user.schoolId,
          },
        });
      } else if (!parent.schoolId) {
        parent = await tx.user.update({
          where: { id: parent.id },
          data: { schoolId: session.user.schoolId },
        });
      }

      // Create a Student record per child, and link to the parent
      const students = [];
      for (const child of children) {
        const student = await tx.student.create({
          data: {
            firstName: child.firstName,
            lastName: enrollment.parentName.split(' ').slice(-1)[0] || '',
            age: parseInt(child.age) || 0,
            className: child.class,
            schoolId: session.user.schoolId,
          },
        });
        await tx.parentStudent.create({
          data: { parentId: parent.id, studentId: student.id },
        });
        students.push(student);
      }

      const updated = await tx.enrollmentRequest.update({
        where: { id },
        data: { status: 'APPROVED', reviewedAt: new Date() },
      });

      return { parent, students, tempPassword, enrollment: updated };
    });

    return NextResponse.json({
      success: true,
      studentsCreated: result.students.length,
      parentEmail: result.parent.email,
      // Only present when a brand-new parent account was created —
      // you'll need to communicate this to the parent some other way (email/SMS)
      // since no email service is wired up yet.
      tempPassword: result.tempPassword,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to approve enrollment' }, { status: 500 });
  }
}