'use client';

import { useEffect, useState, useCallback } from 'react';

interface FeeEntry { id: string; semester: string; amount: number; }
interface ClassEntry { id: string; name: string; studentCount: number; feeStructures: FeeEntry[]; }
interface Payment { id: string; amount: number; note: string | null; voided: boolean; createdAt: string; }
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  classId: string;
  class: { name: string };
  parent: { username: string; email: string; phone: string | null };
}
interface InvoiceRow {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  semester: string;
  student: { firstName: string; lastName: string };
  parent: { username: string; email: string };
  class: { name: string };
  payments: Payment[];
}

const statusColor: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#F0F2F5', text: '#5A6A7A', label: 'Non payé' },
  PARTIAL: { bg: '#FAEEDA', text: '#633806', label: 'Partiel' },
  PAID: { bg: '#EAF3DE', text: '#27500A', label: 'Payé' },
  OVERDUE: { bg: '#FAECE7', text: '#712B13', label: 'En retard' },
};

export default function SchoolOwnerPaymentsPage() {
  const [classes, setClasses] = useState<ClassEntry[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [newClassId, setNewClassId] = useState('');
  const [newSemester, setNewSemester] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [savingFee, setSavingFee] = useState(false);
  const [feeMsg, setFeeMsg] = useState('');

  const [payAmount, setPayAmount] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    const res = await fetch('/api/school-owner/fee-structures');
    if (res.ok) setClasses(await res.json());
  }, []);

  const loadInvoices = useCallback(async () => {
    const res = await fetch('/api/school-owner/invoices');
    if (res.ok) setInvoices(await res.json());
  }, []);

  const loadStudents = useCallback(async () => {
    const res = await fetch('/api/school-owner/enrollments/students');
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
  }, []);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadClasses(), loadInvoices(), loadStudents()]);
      setLoading(false);
    };
    loadAll();
  }, [loadClasses, loadInvoices, loadStudents]);

  const saveFee = async () => {
    if (!newClassId || !newSemester || !newAmount || !newDueDate) {
      setFeeMsg('Remplissez tous les champs.');
      return;
    }
    setSavingFee(true);
    setFeeMsg('');
    const res = await fetch('/api/school-owner/fee-structures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        classId: newClassId, 
        semester: newSemester, 
        amount: parseFloat(newAmount), 
        dueDate: newDueDate 
      }),
    });
    const data = await res.json();
    setSavingFee(false);
    if (res.ok) {
      setFeeMsg(`Tarif enregistré. ${data.created} facture(s) créée(s)${data.updatedExisting ? `, ${data.updatedExisting} mise(s) à jour` : ''}${data.skippedNoParent ? `, ${data.skippedNoParent} élève(s) sans parent lié` : ''}.`);
      setNewSemester('');
      setNewAmount('');
      setNewDueDate('');
      await Promise.all([loadClasses(), loadInvoices()]);
    } else {
      setFeeMsg(data.error || 'Erreur lors de l\'enregistrement');
    }
  };

  const recordPayment = async (invoiceId: string) => {
    const amount = payAmount[invoiceId];
    if (!amount || parseFloat(amount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }
    setBusy(invoiceId);
    const res = await fetch(`/api/school-owner/invoices/${invoiceId}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: parseFloat(amount) }),
    });
    const data = await res.json();
    setBusy(null);
    if (res.ok) {
      setPayAmount({ ...payAmount, [invoiceId]: '' });
      await loadInvoices();
    } else {
      alert(data.error || 'Erreur lors du paiement');
    }
  };

  // Create invoice for student manually
  const createInvoiceForStudent = async (studentId: string, classId: string) => {
    const amount = prompt('Montant de la facture (DT):');
    const semester = prompt('Semestre:');
    if (amount && semester) {
      const res = await fetch('/api/school-owner/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId, 
          classId, 
          semester, 
          amount: parseFloat(amount) 
        }),
      });
      if (res.ok) {
        await loadInvoices();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création de la facture');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#5A6A7A' }}>
        Chargement...
      </div>
    );
  }

  // Find students without invoices
  const studentsWithoutInvoices = students.filter(student => 
    !invoices.some(inv => inv.student.firstName === student.firstName && inv.student.lastName === student.lastName)
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1150, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 28 }}>Tarifs par classe et suivi des paiements en espèces.</p>

      {/* TABLE 1 — Fee structure */}
      <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 12 }}>Tarifs par classe et semestre</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Classe</th>
              <th style={thStyle}>Semestre</th>
              <th style={thStyle}>Prix (DT)</th>
              <th style={thStyle}>Élèves</th>
            </tr>
          </thead>
          <tbody>
            {classes.flatMap((c) =>
              c.feeStructures.length === 0
                ? [
                    <tr key={c.id}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={{ ...tdStyle, color: '#5A6A7A' }} colSpan={2}>Aucun tarif défini</td>
                      <td style={tdStyle}>{c.studentCount}</td>
                    </tr>,
                  ]
                : c.feeStructures.map((f) => (
                    <tr key={f.id}>
                      <td style={tdStyle}>{c.name}</td>
                      <td style={tdStyle}>{f.semester}</td>
                      <td style={tdStyle}>{f.amount.toLocaleString('fr-FR')} DT</td>
                      <td style={tdStyle}>{c.studentCount}</td>
                    </tr>
                  ))
            )}
            {classes.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={4}>Aucune classe trouvée. Créez d'abord des classes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / update a fee row */}
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 16, marginBottom: 40 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={newClassId} onChange={(e) => setNewClassId(e.target.value)} style={inputStyle}>
            <option value="">Classe...</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input
            placeholder="Semestre (ex: Semestre 1)"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            style={{ ...inputStyle, maxWidth: 190 }}
          />
          <input
            type="number"
            placeholder="Prix (DT)"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            style={{ ...inputStyle, maxWidth: 120 }}
          />
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            title="Date limite de paiement"
            style={inputStyle}
          />
          <button onClick={saveFee} disabled={savingFee} style={{ ...smallBtnStyle, background: '#071B4A' }}>
            {savingFee ? '...' : 'Ajouter / Mettre à jour'}
          </button>
        </div>
        {feeMsg && <p style={{ fontSize: 13, color: '#5A6A7A', marginTop: 10 }}>{feeMsg}</p>}
      </div>

      {/* Students without invoices */}
      {studentsWithoutInvoices.length > 0 && (
        <>
          <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 12 }}>Élèves inscrits sans facture</h2>
          <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
                  <th style={thStyle}>Parent</th>
                  <th style={thStyle}>Élève</th>
                  <th style={thStyle}>Classe</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithoutInvoices.map((student) => (
                  <tr key={student.id}>
                    <td style={tdStyle}>{student.parent?.username || 'N/A'}</td>
                    <td style={tdStyle}>{student.firstName} {student.lastName}</td>
                    <td style={tdStyle}>{student.class?.name || 'N/A'}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => createInvoiceForStudent(student.id, student.classId)}
                        style={{ ...smallBtnStyle, background: '#4C7C59', padding: '6px 14px' }}
                      >
                        Créer une facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TABLE 2 — Parents / payments */}
      <h2 style={{ color: '#071B4A', fontSize: 17, marginBottom: 12 }}>Paiements des parents</h2>
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Parent</th>
              <th style={thStyle}>Élève</th>
              <th style={thStyle}>Classe / Semestre</th>
              <th style={thStyle}>Dû</th>
              <th style={thStyle}>Payé</th>
              <th style={thStyle}>Reste</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td style={tdStyle} colSpan={8}>Aucune facture pour le moment.</td></tr>
            )}
            {invoices.map((inv) => {
              const paid = inv.payments.filter((p) => !p.voided).reduce((s, p) => s + p.amount, 0);
              const remaining = inv.amount - paid;
              const sc = statusColor[inv.status] ?? statusColor.PENDING;
              return (
                <tr key={inv.id}>
                  <td style={tdStyle}>{inv.parent.username}</td>
                  <td style={tdStyle}>{inv.student.firstName} {inv.student.lastName}</td>
                  <td style={tdStyle}>{inv.class.name} — {inv.semester}</td>
                  <td style={tdStyle}>{inv.amount.toLocaleString('fr-FR')} DT</td>
                  <td style={tdStyle}>{paid.toLocaleString('fr-FR')} DT</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: remaining > 0 ? '#C0392B' : '#27500A' }}>
                    {remaining.toLocaleString('fr-FR')} DT
                  </td>
                  <td style={tdStyle}>
                    <span style={{ 
                      background: sc.bg, 
                      color: sc.text, 
                      fontSize: 12, 
                      fontWeight: 700, 
                      padding: '3px 10px', 
                      borderRadius: 10 
                    }}>
                      {sc.label}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    {remaining > 0 ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          type="number"
                          placeholder="Montant"
                          value={payAmount[inv.id] || ''}
                          onChange={(e) => setPayAmount({ ...payAmount, [inv.id]: e.target.value })}
                          style={{ ...inputStyle, width: 90, padding: '6px 10px' }}
                        />
                        <button
                          onClick={() => recordPayment(inv.id)}
                          disabled={busy === inv.id}
                          style={{ ...smallBtnStyle, background: '#4C7C59', padding: '6px 14px' }}
                        >
                          {busy === inv.id ? '...' : 'Confirmer'}
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#27500A', fontWeight: 600 }}>✓ Réglé</span>
                    )}
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

const thStyle: React.CSSProperties = { 
  padding: '11px 14px', 
  fontSize: 12, 
  color: '#5A6A7A', 
  fontWeight: 600, 
  borderBottom: '1px solid #E5E9F0', 
  whiteSpace: 'nowrap' 
};
const tdStyle: React.CSSProperties = { 
  padding: '11px 14px', 
  fontSize: 13, 
  color: '#1A1A2E', 
  borderBottom: '1px solid #F5F5F5' 
};
const inputStyle: React.CSSProperties = { 
  padding: '9px 12px', 
  borderRadius: 8, 
  border: '1px solid #DCE1E8', 
  fontSize: 13, 
  outline: 'none' 
};
const smallBtnStyle: React.CSSProperties = { 
  color: '#fff', 
  border: 'none', 
  borderRadius: 8, 
  padding: '9px 16px', 
  fontSize: 13, 
  fontWeight: 700, 
  cursor: 'pointer' 
};