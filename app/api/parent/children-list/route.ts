import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const links = await prisma.parentStudent.findMany({
    where: { parentId: session.user.id },
    include: { student: { select: { id: true, firstName: true, lastName: true } } },
  });

  return NextResponse.json(links.map((l: any) => l.student));
}