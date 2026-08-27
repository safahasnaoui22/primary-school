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
  parentName?: string;
}

const statusColor: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  PENDING: { bg: '#F0F2F5', text: '#5A6A7A', label: 'Non payé', icon: '⏳' },
  PARTIAL: { bg: '#FAEEDA', text: '#633806', label: 'Partiel', icon: '⚠️' },
  PAID: { bg: '#EAF3DE', text: '#27500A', label: 'Payé', icon: '✅' },
  OVERDUE: { bg: '#FAECE7', text: '#712B13', label: 'En retard', icon: '🔴' },
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
      <div
        className="receipt-print-area"
        style={{
          maxWidth: 700,
          margin: '30px auto',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: 30,
          border: '1px solid #ddd',
          background: '#fff',
          color: '#333',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
        }}
      >
        {/* Print styles – hide everything except receipt */}
        <style>{`
          @page {
            size: A4;
            margin: 15mm;
          }
          @media print {
            body * {
              visibility: hidden;
            }
            .receipt-print-area, .receipt-print-area * {
              visibility: visible;
            }
            .receipt-print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              box-shadow: none;
              border: none;
              background: #fff;
            }
            .no-print, .top-bar, .parent-info, .sign-out-btn, header, nav, .navbar, .sidebar {
              display: none !important;
            }
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>

        {/* Header with logo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '3px solid #1e3a8a',
            paddingBottom: 15,
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <img
              src="/logosch.png"
              alt="Logo école"
              style={{ height: 60, width: 'auto' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <h1 style={{ fontSize: 24, color: '#1e3a8a', margin: 0, fontWeight: 700 }}>
                École Primaire EduSmart
              </h1>
              <p style={{ fontSize: 12, color: '#5A6A7A', margin: '4px 0 0' }}>
                12 Rue des Écoles, Tunis · Tél: +216 71 234 567 · contact@edusmart.tn
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#1e3a8a',
                letterSpacing: 1,
              }}
            >
              REÇU DE PAIEMENT
            </div>
            <div style={{ fontSize: 12, color: '#5A6A7A', marginTop: 4 }}>
              N° {invoiceNumber}
            </div>
          </div>
        </div>

        {/* Student & invoice meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 25 }}>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: 13,
                color: '#1e3a8a',
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontWeight: 700,
              }}
            >
              Informations
            </h2>
            <p style={{ fontSize: 14, margin: '2px 0' }}>
              <strong style={{ color: '#5A6A7A' }}>
                {printing.student.firstName} {printing.student.lastName}
              </strong>
            </p>
            {printing.parentName && (
              <p style={{ fontSize: 13, color: '#5A6A7A', margin: '2px 0' }}>
                Parent / Tuteur : {printing.parentName}
              </p>
            )}
            <p style={{ fontSize: 13, color: '#5A6A7A', margin: '2px 0' }}>
              Classe : {printing.class.name}
            </p>
            <p style={{ fontSize: 13, color: '#5A6A7A', margin: '2px 0' }}>
              Semestre : {printing.semester}
            </p>
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            <table style={{ fontSize: 13, marginLeft: 'auto' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Date d'émission :</td>
                  <td style={{ padding: '3px 0 3px 15px', fontWeight: 600 }}>
                    {new Date().toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Date d'échéance :</td>
                  <td style={{ padding: '3px 0 3px 15px', fontWeight: 600 }}>
                    {new Date(printing.dueDate).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 0', color: '#5A6A7A' }}>Statut :</td>
                  <td style={{ padding: '3px 0 3px 15px' }}>
                    <span
                      style={{
                        background: statusColor[printing.status]?.bg || '#F0F2F5',
                        color: statusColor[printing.status]?.text || '#5A6A7A',
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 10px',
                        borderRadius: 10,
                        display: 'inline-block',
                      }}
                    >
                      {statusColor[printing.status]?.label || 'Non payé'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Payments table */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 20,
            border: '1px solid #e5e9f0',
          }}
        >
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #e5e9f0' }}>
              <th
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: 12,
                  color: '#5A6A7A',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e9f0',
                }}
              >
                Date
              </th>
              <th
                style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontSize: 12,
                  color: '#5A6A7A',
                  fontWeight: 600,
                  borderRight: '1px solid #e5e9f0',
                }}
              >
                Description
              </th>
              <th
                style={{
                  padding: '10px 12px',
                  textAlign: 'right',
                  fontSize: 12,
                  color: '#5A6A7A',
                  fontWeight: 600,
                }}
              >
                Montant
              </th>
            </tr>
          </thead>
          <tbody>
            {printing.payments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  style={{
                    padding: '15px 12px',
                    textAlign: 'center',
                    fontSize: 13,
                    color: '#5A6A7A',
                  }}
                >
                  Aucun paiement enregistré pour le moment.
                </td>
              </tr>
            ) : (
              printing.payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRight: '1px solid #e5e9f0',
                    }}
                  >
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: 13,
                      borderRight: '1px solid #e5e9f0',
                    }}
                  >
                    {p.note || 'Paiement de frais scolaires'}
                  </td>
                  <td
                    style={{
                      padding: '8px 12px',
                      fontSize: 13,
                      textAlign: 'right',
                      fontWeight: 500,
                    }}
                  >
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
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                  {printing.amount.toLocaleString('fr-FR')} DT
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#5A6A7A' }}>Total payé :</td>
                <td style={{ padding: '4px 0', textAlign: 'right', fontWeight: 600 }}>
                  {paid.toLocaleString('fr-FR')} DT
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #1e3a8a' }}>
                <td
                  style={{
                    padding: '6px 0',
                    fontWeight: 700,
                    color: balance > 0 ? '#C0392B' : '#27500A',
                  }}
                >
                  Solde restant :
                </td>
                <td
                  style={{
                    padding: '6px 0',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: balance > 0 ? '#C0392B' : '#27500A',
                  }}
                >
                  {balance.toLocaleString('fr-FR')} DT
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid #e5e9f0',
            paddingTop: 15,
            fontSize: 12,
            color: '#5A6A7A',
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
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
            color: '#1e3a8a',
          }}
        >
          ← Retour
        </button>
      </div>
    );
  }

  // Non‑printing view
  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
      {/* Responsive styles */}
      <style>{`
        .desktop-table { display: block; }
        .mobile-cards { display: none; }

        @media (max-width: 768px) {
          .desktop-table { display: none; }
          .mobile-cards { display: block; }
          h1 { font-size: 24px !important; }
          p { font-size: 14px !important; }
          .mobile-invoice-card {
            background: #fff;
            border: 1px solid #E5E9F0;
            border-radius: 14px;
            padding: 16px;
            margin-bottom: 12px;
            box-shadow: 0 4px 12px rgba(7,27,74,0.06);
          }
          .mobile-invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          }
          .mobile-invoice-student {
            font-weight: 600;
            color: #071B4A;
            font-size: 16px;
          }
          .mobile-invoice-badge {
            font-size: 12px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          }
          .mobile-invoice-meta {
            font-size: 13px;
            color: #5A6A7A;
            margin-bottom: 8px;
          }
          .mobile-invoice-amounts {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .mobile-invoice-amount-item {
            font-size: 13px;
          }
          .mobile-invoice-amount-label {
            color: #5A6A7A;
            font-size: 11px;
          }
          .mobile-invoice-amount-value {
            font-weight: 600;
            color: #1A1A2E;
          }
          .mobile-invoice-print-btn {
            width: 100%;
            background: #071B4A;
            color: #fff;
            border: none;
            border-radius: 10px;
            padding: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .mobile-invoice-print-btn:active {
            background: #0A2540;
          }
        }
        @media (max-width: 480px) {
          .mobile-invoice-amount-item {
            font-size: 12px;
          }
          .mobile-invoice-student {
            font-size: 15px;
          }
        }
      `}</style>

      <h1 style={{ color: '#071B4A', marginBottom: 4, fontSize: 28 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24, fontSize: 15 }}>Ce que vous devez payer pour chacun de vos enfants.</p>

      {/* Desktop table (hidden on mobile via CSS) */}
      <div className="desktop-table">
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
                      <span style={{ background: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span>{sc.icon}</span> {sc.label}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => setPrinting(inv)}
                        style={{ background: '#071B4A', color: '#fff', border: 'none', borderRadius: 16, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        🖨️ Imprimer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards (shown only on mobile via CSS) */}
      <div className="mobile-cards">
        {invoices.length === 0 && (
          <div style={{ textAlign: 'center', color: '#5A6A7A', padding: 30 }}>
            Aucune facture pour le moment.
          </div>
        )}
        {invoices.map((inv) => {
          const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
          const remaining = inv.amount - paid;
          const sc = statusColor[inv.status] ?? statusColor.PENDING;
          return (
            <div key={inv.id} className="mobile-invoice-card">
              <div className="mobile-invoice-header">
                <span className="mobile-invoice-student">
                  {inv.student.firstName} {inv.student.lastName}
                </span>
                <span
                  className="mobile-invoice-badge"
                  style={{ background: sc.bg, color: sc.text }}
                >
                  {sc.icon} {sc.label}
                </span>
              </div>
              <div className="mobile-invoice-meta">
                {inv.class.name} — {inv.semester}
              </div>
              <div className="mobile-invoice-amounts">
                <div className="mobile-invoice-amount-item">
                  <div className="mobile-invoice-amount-label">Dû</div>
                  <div className="mobile-invoice-amount-value">{inv.amount.toLocaleString('fr-FR')} DT</div>
                </div>
                <div className="mobile-invoice-amount-item">
                  <div className="mobile-invoice-amount-label">Payé</div>
                  <div className="mobile-invoice-amount-value">{paid.toLocaleString('fr-FR')} DT</div>
                </div>
                <div className="mobile-invoice-amount-item">
                  <div className="mobile-invoice-amount-label">Reste</div>
                  <div className="mobile-invoice-amount-value" style={{ color: remaining > 0 ? '#C0392B' : '#27500A' }}>
                    {remaining.toLocaleString('fr-FR')} DT
                  </div>
                </div>
              </div>
              <button
                className="mobile-invoice-print-btn"
                onClick={() => setPrinting(inv)}
              >
                🖨️ Imprimer le reçu
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 12, color: '#5A6A7A', fontWeight: 600, borderBottom: '1px solid #E5E9F0', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #F5F5F5' };