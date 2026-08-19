'use client';

import { useEffect, useState, useCallback } from 'react';

interface FeeEntry { id: string; semester: string; amount: number; }
interface ClassEntry { id: string; name: string; studentCount: number; feeStructures: FeeEntry[]; }
interface InvoiceRow {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  student: { firstName: string; lastName: string };
  parent: { username: string; email: string };
  payments: { id: string; amount: number; note: string | null; voided: boolean; createdAt: string }[];
}

const statusColor: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#F0F2F5', text: '#5A6A7A', label: 'Non payé' },
  PARTIAL: { bg: '#FAEEDA', text: '#633806', label: 'Partiel' },
  PAID: { bg: '#EAF3DE', text: '#27500A', label: 'Payé' },
  OVERDUE: { bg: '#FAECE7', text: '#712B13', label: 'En retard' },
};

export default function SchoolOwnerPaymentsPage() {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [newSemester, setNewSemester] = useState<Record<string, string>>({});
  const [newAmount, setNewAmount] = useState<Record<string, string>>({});

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [genMsg, setGenMsg] = useState('');

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [payAmount, setPayAmount] = useState<Record<string, string>>({});
  const [payNote, setPayNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const loadClasses = useCallback(async () => {
    const res = await fetch('/api/school-owner/fee-structures');
    if (res.ok) setClasses(await res.json());
  }, []);

  const loadInvoices = useCallback(async () => {
    if (!selectedClass || !selectedSemester) return;
    const res = await fetch(`/api/school-owner/invoices?classId=${selectedClass}&semester=${encodeURIComponent(selectedSemester)}`);
    if (res.ok) setInvoices(await res.json());
  }, [selectedClass, selectedSemester]);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const setFee = async (classId: string) => {
    const semester = newSemester[classId];
    const amount = newAmount[classId];
    if (!semester || !amount) return;
    await fetch('/api/school-owner/fee-structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId, semester, amount }),
    });
    setNewSemester({ ...newSemester, [classId]: '' });
    setNewAmount({ ...newAmount, [classId]: '' });
    loadClasses();
  };

  const generateInvoices = async () => {
    if (!selectedClass || !selectedSemester || !dueDate) {
      setGenMsg('Sélectionnez une classe, un semestre et une date limite.');
      return;
    }
    const res = await fetch('/api/school-owner/invoices/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: selectedClass, semester: selectedSemester, dueDate }),
    });
    const data = await res.json();
    if (res.ok) {
      setGenMsg(`${data.created} facture(s) créée(s). ${data.skippedExisting} déjà existante(s). ${data.skippedNoParent} sans parent lié.`);
      loadInvoices();
    } else {
      setGenMsg(data.error);
    }
  };

  const recordPayment = async (invoiceId: string) => {
    const amount = payAmount[invoiceId];
    if (!amount) return;
    setBusy(invoiceId);
    const res = await fetch(`/api/school-owner/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, note: payNote[invoiceId] || null }),
    });
    const data = await res.json();
    setBusy(null);
    if (res.ok) {
      setPayAmount({ ...payAmount, [invoiceId]: '' });
      setPayNote({ ...payNote, [invoiceId]: '' });
      loadInvoices();
    } else {
      alert(data.error);
    }
  };

  const voidPayment = async (invoiceId: string, paymentId: string) => {
    const reason = prompt('Raison de la correction (optionnel) :') || undefined;
    await fetch(`/api/school-owner/invoices/${invoiceId}/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voided: true, voidedReason: reason }),
    });
    loadInvoices();
  };

  const saveEditedAmount = async (invoiceId: string, paymentId: string) => {
    await fetch(`/api/school-owner/invoices/${invoiceId}/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: editAmount }),
    });
    setEditingPayment(null);
    loadInvoices();
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 28 }}>Tarifs, factures et suivi des paiements en espèces.</p>

      {/* Fee structure */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E9F0', padding: 20, marginBottom: 32 }}>
        <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 14 }}>Tarifs par classe et semestre</h2>
        {classes.length === 0 ? (
          <p style={{ color: '#5A6A7A', fontSize: 14 }}>
            Aucune classe trouvée. Créez d'abord des classes avant de définir les tarifs.
          </p>
        ) : (
          classes.map((c) => (
            <div key={c.id} style={{ borderBottom: '1px solid #F0F0F0', padding: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ color: '#071B4A', fontSize: 14 }}>{c.name}</strong>
                <span style={{ fontSize: 12, color: '#5A6A7A' }}>{c.studentCount} élève{c.studentCount > 1 ? 's' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {c.feeStructures.map((f) => (
                  <span key={f.id} style={{ background: '#FFF3D6', color: '#8A5A00', fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 10 }}>
                    {f.semester} — {f.amount.toLocaleString('fr-FR')} DT
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="Semestre (ex: Semestre 1)"
                  value={newSemester[c.id] || ''}
                  onChange={(e) => setNewSemester({ ...newSemester, [c.id]: e.target.value })}
                  style={{ ...inputStyle, maxWidth: 200 }}
                />
                <input
                  type="number"
                  placeholder="Montant (DT)"
                  value={newAmount[c.id] || ''}
                  onChange={(e) => setNewAmount({ ...newAmount, [c.id]: e.target.value })}
                  style={{ ...inputStyle, maxWidth: 140 }}
                />
                <button onClick={() => setFee(c.id)} style={smallBtnStyle}>Enregistrer</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generate invoices */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E9F0', padding: 20, marginBottom: 32 }}>
        <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 14 }}>Générer les factures</h2>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} style={inputStyle}>
            <option value="">Classe...</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            placeholder="Semestre"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            style={{ ...inputStyle, maxWidth: 180 }}
          />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          <button onClick={generateInvoices} style={{ ...smallBtnStyle, background: '#071B4A' }}>Générer</button>
        </div>
        {genMsg && <p style={{ fontSize: 13, color: '#5A6A7A', marginTop: 10 }}>{genMsg}</p>}
      </div>

      {/* Invoice / payment table */}
      {invoices.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E9F0', padding: 20 }}>
          <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 14 }}>
            Factures — {classes.find((c) => c.id === selectedClass)?.name} · {selectedSemester}
          </h2>
          {invoices.map((inv) => {
            const paid = inv.payments.filter((p) => !p.voided).reduce((s, p) => s + p.amount, 0);
            const remaining = inv.amount - paid;
            const sc = statusColor[inv.status] ?? statusColor.PENDING;
            return (
              <div key={inv.id} style={{ borderBottom: '1px solid #F0F0F0', padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ color: '#071B4A' }}>{inv.student.firstName} {inv.student.lastName}</strong>
                    <span style={{ fontSize: 12, color: '#5A6A7A', marginLeft: 8 }}>({inv.parent.username})</span>
                  </div>
                  <span style={{ background: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 10 }}>
                    {sc.label}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#5A6A7A', marginBottom: 10 }}>
                  Dû : {inv.amount.toLocaleString('fr-FR')} DT · Payé : {paid.toLocaleString('fr-FR')} DT · Restant : {remaining.toLocaleString('fr-FR')} DT
                </div>

                {inv.payments.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    {inv.payments.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: p.voided ? '#C0392B' : '#1A1A2E', padding: '4px 0', textDecoration: p.voided ? 'line-through' : 'none' }}>
                        {editingPayment === p.id ? (
                          <span style={{ display: 'flex', gap: 6 }}>
                            <input value={editAmount} onChange={(e) => setEditAmount(e.target.value)} style={{ ...inputStyle, width: 80, padding: '4px 8px' }} />
                            <button onClick={() => saveEditedAmount(inv.id, p.id)} style={{ ...smallBtnStyle, padding: '2px 10px' }}>OK</button>
                          </span>
                        ) : (
                          <span>{p.amount.toLocaleString('fr-FR')} DT — {new Date(p.createdAt).toLocaleDateString('fr-FR')} {p.note ? `(${p.note})` : ''}</span>
                        )}
                        {!p.voided && editingPayment !== p.id && (
                          <span style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => { setEditingPayment(p.id); setEditAmount(String(p.amount)); }} style={linkBtnStyle}>Corriger</button>
                            <button onClick={() => voidPayment(inv.id, p.id)} style={{ ...linkBtnStyle, color: '#C0392B' }}>Annuler</button>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {remaining > 0 && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="Montant reçu"
                      value={payAmount[inv.id] || ''}
                      onChange={(e) => setPayAmount({ ...payAmount, [inv.id]: e.target.value })}
                      style={{ ...inputStyle, maxWidth: 130 }}
                    />
                    <input
                      placeholder="Note (optionnel)"
                      value={payNote[inv.id] || ''}
                      onChange={(e) => setPayNote({ ...payNote, [inv.id]: e.target.value })}
                      style={{ ...inputStyle, maxWidth: 180 }}
                    />
                    <button onClick={() => recordPayment(inv.id)} disabled={busy === inv.id} style={{ ...smallBtnStyle, background: '#4C7C59' }}>
                      {busy === inv.id ? '...' : 'Confirmer le paiement'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 13, outline: 'none' };
const smallBtnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const linkBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#071B4A', fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' };