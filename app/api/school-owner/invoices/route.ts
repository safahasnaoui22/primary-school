import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');
  const semester = searchParams.get('semester');

  const invoices = await prisma.invoice.findMany({
    where: { schoolId: session.user.schoolId, ...(classId ? { classId } : {}), ...(semester ? { semester } : {}) },
    include: {
      student: { select: { firstName: true, lastName: true } },
      parent: { select: { username: true, email: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(invoices);
}