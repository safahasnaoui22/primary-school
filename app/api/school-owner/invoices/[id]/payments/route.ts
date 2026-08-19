import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

async function recalcStatus(invoiceId: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }, include: { payments: true } });
  if (!invoice) return;

  const paid = invoice.payments.filter((p: any) => !p.voided).reduce((sum: number, p: any) => sum + p.amount, 0);

  let status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = 'PENDING';
  if (paid >= invoice.amount) status = 'PAID';
  else if (paid > 0) status = 'PARTIAL';
  else if (invoice.dueDate < new Date()) status = 'OVERDUE';

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { amount, note } = await req.json();

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!invoice || invoice.schoolId !== session.user.schoolId) {
    return NextResponse.json({ error: 'Facture introuvable' }, { status: 404 });
  }

  const alreadyPaid = invoice.payments.filter((p: any) => !p.voided).reduce((s: number, p: any) => s + p.amount, 0);
  const remaining = invoice.amount - alreadyPaid;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Montant invalide' }, { status: 400 });
  }
  if (amount > remaining + 0.01) {
    return NextResponse.json({ error: `Le montant dépasse le solde restant (${remaining.toFixed(2)})` }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: { invoiceId: id, amount: parseFloat(amount), note: note || null, recordedById: session.user.id },
  });

  await recalcStatus(id);

  return NextResponse.json(payment);
}