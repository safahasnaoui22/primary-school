import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, semester, dueDate } = await req.json();
  if (!classId || !semester || !dueDate) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
  }

  const fee = await prisma.feeStructure.findUnique({ where: { classId_semester: { classId, semester } } });
  if (!fee) {
    return NextResponse.json({ error: "Aucun tarif défini pour cette classe/semestre" }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: { classId },
    include: { parents: { take: 1, include: { parent: true } } },
  });

  let created = 0;
  let skippedNoParent = 0;
  let skippedExisting = 0;

  for (const student of students) {
    const parentLink = student.parents[0];
    if (!parentLink) {
      skippedNoParent++;
      continue;
    }

    const existing = await prisma.invoice.findFirst({ where: { studentId: student.id, classId, semester } });
    if (existing) {
      skippedExisting++;
      continue;
    }

    await prisma.invoice.create({
      data: {
        schoolId: session.user.schoolId,
        studentId: student.id,
        parentId: parentLink.parentId,
        classId,
        semester,
        amount: fee.amount,
        dueDate: new Date(dueDate),
      },
    });
    created++;
  }

  return NextResponse.json({ created, skippedNoParent, skippedExisting });
}