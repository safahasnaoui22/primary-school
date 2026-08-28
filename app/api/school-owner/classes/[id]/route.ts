import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { name, teacherIds } = await req.json();

  const cls = await prisma.class.findUnique({ where: { id } });
  if (!cls || cls.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Classe introuvable' }, { status: 404 });
  }

  if (Array.isArray(teacherIds)) {
    const validTeachers = await prisma.user.findMany({
      where: { id: { in: teacherIds }, schoolId: session.user.schoolId, role: 'TEACHER' },
    });
    if (validTeachers.length !== teacherIds.length) {
      return NextResponse.json({ error: 'Un ou plusieurs enseignants sont invalides' }, { status: 400 });
    }

    // Replace the full set of assigned teachers with the new selection
    await prisma.classTeacher.deleteMany({ where: { classId: id } });
    if (teacherIds.length > 0) {
      await prisma.classTeacher.createMany({
        data: teacherIds.map((teacherId: string) => ({ classId: id, teacherId })),
      });
    }
  }

  const updated = await prisma.class.update({
    where: { id },
    data: { ...(name ? { name: name.trim() } : {}) },
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

  await prisma.classTeacher.deleteMany({ where: { classId: id } });
  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ success: true });
}