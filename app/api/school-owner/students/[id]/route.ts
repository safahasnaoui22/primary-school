import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function authorize() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return null;
  }
  return session.user;
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await req.json();

  // Make sure the student actually belongs to this owner's school before touching it
  const existing = await prisma.student.findFirst({
    where: { id, schoolId: user.schoolId! },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const data: Record<string, any> = {};
  if ('classId' in body) data.classId = body.classId || null;
  if ('firstName' in body) data.firstName = body.firstName;
  if ('lastName' in body) data.lastName = body.lastName;

  const updated = await prisma.student.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const existing = await prisma.student.findFirst({
    where: { id, schoolId: user.schoolId! },
  });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.student.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}