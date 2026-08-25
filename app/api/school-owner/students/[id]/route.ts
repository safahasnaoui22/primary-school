import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { firstName, lastName, classId } = await req.json();

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
    data: {
      ...(firstName ? { firstName: firstName.trim() } : {}),
      ...(lastName ? { lastName: lastName.trim() } : {}),
      classId: classId === undefined ? undefined : classId || null,
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

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      _count: {
        select: { invoices: true },
      },
    },
  });

  if (!student || student.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  }

  // Financial records are never silently deleted — protects the school's
  // payment history even if a student needs to be removed from the roster.
  if (student._count.invoices > 0) {
    return NextResponse.json(
      { error: `Impossible de supprimer : ${student._count.invoices} facture(s) sont liées à cet élève. Contactez le support pour un archivage.` },
      { status: 409 }
    );
  }

  try {
    await prisma.$transaction([
      prisma.homeworkStatus.deleteMany({ where: { studentId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.grade.deleteMany({ where: { studentId: id } }),
      prisma.progressUpdate.deleteMany({ where: { studentId: id } }),
      prisma.parentStudent.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Échec de la suppression' }, { status: 500 });
  }
}