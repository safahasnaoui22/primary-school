import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!session.user.schoolId) {
    return NextResponse.json({ error: 'You are not linked to a school' }, { status: 400 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const requests = await prisma.enrollmentRequest.findMany({
    where: {
      schoolId: session.user.schoolId,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      parent: { select: { username: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(
    requests.map((r: any) => ({
      id: r.id,
      parentName: r.parent.username,
      parentEmail: r.parent.email,
      parentPhone: r.parentPhone,
      childrenJson: r.childrenJson,
      medical: r.medical,
      documents: Array.isArray(r.documents) ? r.documents : [],
      status: r.status,
      createdAt: r.createdAt,
    }))
  );
}