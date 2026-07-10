import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();

  if (!session?.user || !session.user.schoolId) {
    return NextResponse.json({ error: 'Not authenticated or not linked to a school' }, { status: 401 });
  }

  const contacts = await prisma.user.findMany({
    where: {
      schoolId: session.user.schoolId,
      id: { not: session.user.id },
    },
    select: { id: true, username: true, email: true, role: true },
    orderBy: { username: 'asc' },
  });

  return NextResponse.json(contacts);
}