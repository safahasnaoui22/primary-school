import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const schoolId = process.env.SCHOOL_ID;
  if (!schoolId) {
    return NextResponse.json({ error: "SCHOOL_ID n'est pas configuré" }, { status: 500 });
  }

  const classes = await prisma.class.findMany({
    where: { schoolId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return NextResponse.json(classes);
}