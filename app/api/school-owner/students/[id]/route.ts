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

  const student = await prisma.student.findUnique({ where: { id } });
  if (!student || student.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
  }

  // Get this student's invoice ids up front so we can clear their
  // payments before deleting the invoices themselves (Payment -> Invoice
  // is a required foreign key, so payments must go first).
  const invoices = await prisma.invoice.findMany({
    where: { studentId: id },
    select: { id: true },
  });
  const invoiceIds = invoices.map((inv) => inv.id);

  try {
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } }),
      prisma.invoice.deleteMany({ where: { studentId: id } }),
      prisma.homeworkStatus.deleteMany({ where: { studentId: id } }),
      prisma.attendance.deleteMany({ where: { studentId: id } }),
      prisma.grade.deleteMany({ where: { studentId: id } }),
      prisma.progressUpdate.deleteMany({ where: { studentId: id } }),
      prisma.parentStudent.deleteMany({ where: { studentId: id } }),
      prisma.student.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    if (err.code === 'P2003') {
      return NextResponse.json(
        { error: `Suppression bloquée par une donnée liée (${err.meta?.field_name ?? 'inconnue'}). Contactez le support.` },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Échec de la suppression' }, { status: 500 });
  }
}