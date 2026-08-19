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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SCHOOL_OWNER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id, paymentId } = await params;
  const { amount, voided, voidedReason } = await req.json();

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.invoiceId !== id) {
    return NextResponse.json({ error: 'Paiement introuvable' }, { status: 404 });
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      ...(amount != null ? { amount: parseFloat(amount) } : {}),
      ...(voided != null ? { voided, voidedReason: voided ? voidedReason || 'Corrigé par le chef d\'établissement' : null } : {}),
    },
  });

  await recalcStatus(id);

  return NextResponse.json(updated);
}