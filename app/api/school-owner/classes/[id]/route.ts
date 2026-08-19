import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { name, teacherId } = await req.json();

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls || cls.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Classe introuvable' }, { status: 404 });
  }

  if (teacherId) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher || teacher.schoolId !== session.user.schoolId || teacher.role !== 'TEACHER') {
      return NextResponse.json({ error: 'Enseignant invalide' }, { status: 400 });
    }
  }

  const updated = await prisma.class.update({
    where: { id },
    data: {
      ...(name ? { name: name.trim() } : {}),
      teacherId: teacherId === '' ? null : teacherId ?? cls.teacherId,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const cls = await prisma.class.findUnique({
    where: { id },
    include: { students: { select: { id: true } } },
  });
  if (!cls || cls.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Classe introuvable' }, { status: 404 });
  }
  if (cls.students.length > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${cls.students.length} élève(s) sont encore dans cette classe` },
      { status: 409 }
    );
  }

  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}