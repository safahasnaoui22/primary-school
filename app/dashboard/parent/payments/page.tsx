'use client';

import { useEffect, useState } from 'react';

interface Payment { id: string; amount: number; createdAt: string; note: string | null; }
interface Invoice {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  semester: string;
  student: { firstName: string; lastName: string };
  class: { name: string };
  payments: Payment[];
}

const statusColor: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#F0F2F5', text: '#5A6A7A', label: 'Non payé' },
  PARTIAL: { bg: '#FAEEDA', text: '#633806', label: 'Partiel' },
  PAID: { bg: '#EAF3DE', text: '#27500A', label: 'Payé' },
  OVERDUE: { bg: '#FAECE7', text: '#712B13', label: 'En retard' },
};

export default function ParentPaymentsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [printing, setPrinting] = useState<Invoice | null>(null);

  useEffect(() => {
    fetch('/api/parent/invoices').then((r) => r.json()).then(setInvoices);
  }, []);

  useEffect(() => {
    if (printing) {
      const t = setTimeout(() => window.print(), 150);
      return () => clearTimeout(t);
    }
  }, [printing]);

  if (printing) {
    const paid = printing.payments.reduce((s, p) => s + p.amount, 0);
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', fontFamily: 'Inter, sans-serif', padding: 32, border: '1px solid #ddd' }}>
        <style>{`@media print { .no-print { display: none; } }`}</style>
        <button className="no-print" onClick={() => setPrinting(null)} style={{ marginBottom: 20, background: '#F0F2F5', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}>
          ← Retour
        </button>
        <h1 style={{ color: '#071B4A', fontSize: 22 }}>Reçu de paiement</h1>
        <p style={{ color: '#5A6A7A', fontSize: 13 }}>École Primaire EduSmart</p>
        <hr style={{ margin: '20px 0' }} />
        <p><strong>Élève :</strong> {printing.student.firstName} {printing.student.lastName}</p>
        <p><strong>Classe :</strong> {printing.class.name}</p>
        <p><strong>Semestre :</strong> {printing.semester}</p>
        <p><strong>Montant dû :</strong> {printing.amount.toLocaleString('fr-FR')} DT</p>
        <p><strong>Montant payé :</strong> {paid.toLocaleString('fr-FR')} DT</p>
        <p><strong>Solde restant :</strong> {(printing.amount - paid).toLocaleString('fr-FR')} DT</p>
        <hr style={{ margin: '20px 0' }} />
        <h3 style={{ fontSize: 14 }}>Détail des paiements</h3>
        {printing.payments.map((p) => (
          <div key={p.id} style={{ fontSize: 13, padding: '4px 0' }}>
            {new Date(p.createdAt).toLocaleDateString('fr-FR')} — {p.amount.toLocaleString('fr-FR')} DT {p.note ? `(${p.note})` : ''}
          </div>
        ))}
        <p className="no-print" style={{ fontSize: 12, color: '#5A6A7A', marginTop: 20 }}>
          Astuce : dans la boîte de dialogue d'impression, choisissez "Enregistrer en PDF" pour télécharger ce reçu.
        </p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>Historique et factures de scolarité.</p>

      {invoices.length === 0 ? (
        <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune facture pour le moment.</p>
      ) : (
        invoices.map((inv) => {
          const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
          const remaining = inv.amount - paid;
          const sc = statusColor[inv.status] ?? statusColor.PENDING;
          return (
            <div key={inv.id} style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: '#071B4A' }}>{inv.student.firstName} {inv.student.lastName} — {inv.semester}</strong>
                <span style={{ background: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
                  {sc.label}
                </span>
              </div>
              <div style={{ fontSize: 13, color: '#5A6A7A', marginBottom: 10 }}>
                Dû : {inv.amount.toLocaleString('fr-FR')} DT · Payé : {paid.toLocaleString('fr-FR')} DT · Restant : {remaining.toLocaleString('fr-FR')} DT · Échéance : {new Date(inv.dueDate).toLocaleDateString('fr-FR')}
              </div>
              <button
                onClick={() => setPrinting(inv)}
                style={{ background: '#071B4A', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Imprimer / Télécharger le reçu
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}