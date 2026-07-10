import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  const enrollment = await prisma.enrollmentRequest.findUnique({ where: { id } });
  if (!enrollment || enrollment.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Enrollment request not found' }, { status: 404 });
  }
  if (enrollment.status !== 'PENDING') {
    return NextResponse.json({ error: 'This request has already been reviewed' }, { status: 409 });
  }

  await prisma.enrollmentRequest.update({
    where: { id },
    data: { status: 'REJECTED', reviewedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}