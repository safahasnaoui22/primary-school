import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { classId } = await req.json();

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  }

  if (classId) {
    const cls = await prisma.class.findUnique({ where: { id: classId } });
    if (!cls || cls.schoolId !== session.user.schoolId) {
      return NextResponse.json({ error: 'Classe invalide' }, { status: 400 });
    }
  }

  const updated = await prisma.student.update({
    where: { id },
    data: { classId: classId || null },
  });

  return NextResponse.json(updated);
}
