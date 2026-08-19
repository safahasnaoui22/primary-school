import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const classes = await prisma.class.findMany({
    where: { schoolId: session.user.schoolId },
    orderBy: { name: 'asc' },
    include: { feeStructures: true, students: { select: { id: true } } },
  });

  return NextResponse.json(
    classes.map((c: any) => ({
      id: c.id,
      name: c.name,
      studentCount: c.students.length,
      feeStructures: c.feeStructures.map((f: any) => ({ id: f.id, semester: f.semester, amount: f.amount })),
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER' || !session.user.schoolId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { classId, semester, amount, dueDate } = await req.json();
  if (!classId || !semester || amount == null || !dueDate) {
    return NextResponse.json({ error: 'Classe, semestre, prix et date limite sont requis' }, { status: 400 });
  }

  const cls = await prisma.class.findUnique({ where: { id: classId } });
  if (!cls || cls.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Classe introuvable' }, { status: 404 });
  }

  const fee = await prisma.feeStructure.upsert({
    where: { classId_semester: { classId, semester } },
    update: { amount: parseFloat(amount) },
    create: { schoolId: session.user.schoolId, classId, semester, amount: parseFloat(amount) },
  });

  // Auto-generate/sync invoices for every student in this class for this semester
  const students = await prisma.student.findMany({
    where: { classId },
    include: { parents: { take: 1 } },
  });

  let created = 0;
  let updatedExisting = 0;
  let skippedNoParent = 0;

  for (const student of students) {
    const parentLink = student.parents[0];
    if (!parentLink) {
      skippedNoParent++;
      continue;
    }

    const existing = await prisma.invoice.findFirst({ where: { studentId: student.id, classId, semester } });
    if (existing) {
      // Keep existing invoice's amount in sync if the price was corrected
      // (only when nothing's been paid yet — don't silently change amount due after payments started)
      const paidCount = await prisma.payment.count({ where: { invoiceId: existing.id, voided: false } });
      if (paidCount === 0 && existing.amount !== fee.amount) {
        await prisma.invoice.update({ where: { id: existing.id }, data: { amount: fee.amount } });
        updatedExisting++;
      }
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

  return NextResponse.json({ fee, created, updatedExisting, skippedNoParent });
}