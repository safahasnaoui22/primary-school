import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'PARENT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { parentId: session.user.id },
    include: {
      student: { select: { firstName: true, lastName: true } },
      class: { select: { name: true } },
      payments: { where: { voided: false }, orderBy: { createdAt: 'desc' } },
    },
    orderBy: { dueDate: 'desc' },
  });

  return NextResponse.json(invoices);
}