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
    const balance = printing.amount - paid;
    const invoiceNumber = `INV-${printing.id.slice(0, 8).toUpperCase()}`;

    return (
      <div style={{
        maxWidth: 700,
        margin: '30px auto',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: 30,
        border: '1px solid #ddd',
        background: '#fff',
        color: '#333',
      }}>
        <style>{`
          @page {
            size: A4;
            margin: 20mm;
          }
          @media print {
            .no-print { display: none !important; }
            body { background: #fff; }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #071B4A', paddingBottom: 15, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 24, color: '#071B4A', margin: 0, fontWeight: 700 }}>École Primaire EduSmart</h1>
            <p style={{ fontSize: 12, color: '#5A6A7A', margin: '4px 0 0' }}>12 Rue des Écoles, Tunis · Tél: +216 71 234 567 · contact@edusmart.tn</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>REÇU DE PAIEMENT</div>
            <div style={{ fontSize: 12, color: '#5A6A7A', marginTop: 4 }}>N° {invoiceNumber}</div>
          </div>
        </div>

        {/* Meta information */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 14, color: '#071B4A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Élève</h2>
            <p style={{ fontSize: 14, margin: '2px 0' }}>
              <strong>{printing.student.firstName} {printing.student.lastName}</strong>
            </p>
            <p style={{ fontSize: 13, color: '#5A6A7A', margin: '2px 0' }}>Classe : {printing.class.name}</p>
            <p style={{ fontSize: 13, color: '#5A6A7A', margin: '2px 0' }}>Semestre : {printing.semester}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <table style={{ fontSize: 13, marginLeft: 'auto' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Date d'émission :</td>
                  <td style={{ padding: '3px 0 3px 15px', fontWeight: 600 }}>{new Date().toLocaleDateString('fr-FR')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Date d'échéance :</td>
                  <td style={{ padding: '3px 0 3px 15px', fontWeight: 600 }}>{new Date(printing.dueDate).toLocaleDateString('fr-FR')}</td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Statut :</td>
                  <td style={{ padding: '3px 0 3px 15px' }}>
                    <span style={{
                      background: statusColor[printing.status]?.bg || '#F0F2F5',
                      color: statusColor[printing.status]?.text || '#5A6A7A',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: 10,
                      display: 'inline-block',
                    }}>
                      {statusColor[printing.status]?.label || 'Non payé'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ background: '#F8F9FA', borderBottom: '2px solid #E5E9F0' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#5A6A7A', fontWeight: 600 }}>Date</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#5A6A7A', fontWeight: 600 }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, color: '#5A6A7A', fontWeight: 600 }}>Montant</th>
            </tr>
          </thead>
          <tbody>
            {printing.payments.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '15px 12px', textAlign: 'center', fontSize: 13, color: '#5A6A7A' }}>
                  Aucun paiement enregistré pour le moment.
                </td>
              </tr>
            ) : (
              printing.payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F0F2F5' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>
                    {p.note || 'Paiement de frais scolaires'}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: 13, textAlign: 'right', fontWeight: 500 }}>
                    {p.amount.toLocaleString('fr-FR')} DT
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 25 }}>
          <table style={{ fontSize: 14, width: '280px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 0', color: '#5A6A7A' }}>Montant total dû :</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{printing.amount.toLocaleString('fr-FR')} DT</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#5A6A7A' }}>Total payé :</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>{paid.toLocaleString('fr-FR')} DT</td>
              </tr>
              <tr style={{ borderTop: '2px solid #071B4A' }}>
                <td style={{ padding: '6px 0', fontWeight: 700, color: balance > 0 ? '#C0392B' : '#27500A' }}>Solde restant :</td>
                <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, color: balance > 0 ? '#C0392B' : '#27500A' }}>
                  {balance.toLocaleString('fr-FR')} DT
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #E5E9F0', paddingTop: 15, fontSize: 12, color: '#5A6A7A', textAlign: 'center' }}>
          Merci de votre confiance. Ce reçu fait office de justificatif de paiement.<br />
          Pour toute question, contactez l'administration : contact@edusmart.tn · +216 71 234 567
        </div>

        {/* Back button – hidden on print */}
        <button
          className="no-print"
          onClick={() => setPrinting(null)}
          style={{
            marginTop: 25,
            background: '#F0F2F5',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: '#071B4A',
          }}
        >
          ← Retour
        </button>
      </div>
    );
  }

  // ... (non‑printing view remains unchanged)
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>Ce que vous devez payer pour chacun de vos enfants.</p>

      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Élève</th>
              <th style={thStyle}>Classe / Semestre</th>
              <th style={thStyle}>Dû</th>
              <th style={thStyle}>Payé</th>
              <th style={thStyle}>Reste</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Reçu</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td style={tdStyle} colSpan={7}>Aucune facture pour le moment.</td></tr>
            )}
            {invoices.map((inv) => {
              const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
              const remaining = inv.amount - paid;
              const sc = statusColor[inv.status] ?? statusColor.PENDING;
              return (
                <tr key={inv.id}>
                  <td style={tdStyle}>{inv.student.firstName} {inv.student.lastName}</td>
                  <td style={tdStyle}>{inv.class.name} — {inv.semester}</td>
                  <td style={tdStyle}>{inv.amount.toLocaleString('fr-FR')} DT</td>
                  <td style={tdStyle}>{paid.toLocaleString('fr-FR')} DT</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: remaining > 0 ? '#C0392B' : '#27500A' }}>
                    {remaining.toLocaleString('fr-FR')} DT
                  </td>
                  <td style={tdStyle}>
                    <span style={{ background: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setPrinting(inv)}
                      style={{ background: '#071B4A', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Imprimer
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 12, color: '#5A6A7A', fontWeight: 600, borderBottom: '1px solid #E5E9F0', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #F5F5F5' };