import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const teachers = await prisma.user.findMany({
    where: { schoolId: session.user.schoolId, role: 'TEACHER' },
    orderBy: { username: 'asc' },
    select: { id: true, username: true, email: true },
  });

  return NextResponse.json(teachers);
}