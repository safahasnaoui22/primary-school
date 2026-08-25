'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';

interface FeeEntry { id: string; semester: string; amount: number; }
interface ClassEntry { id: string; name: string; studentCount: number; feeStructures: FeeEntry[]; }
interface Payment { id: string; amount: number; note: string | null; voided: boolean; createdAt: string; }
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  class: { id: string; name: string; teacherName: string | null } | null;
  parents: Array<{
    id: string;
    username: string;
    email: string;
  }>;
  invoices: Array<{
    id: string;
    status: string;
    amount: number;
    semester: string;
  }>;
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
    try {
      const res = await fetch('/api/school-owner/fee-structures');
      if (res.ok) {
        const data = await res.json();
        setClasses(data);
      }
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/school-owner/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/school-owner/enrollments/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error loading students:', error);
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
    try {
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
        setFeeMsg(`Tarif enregistré. ${data.created || 0} facture(s) créée(s)${data.updatedExisting ? `, ${data.updatedExisting} mise(s) à jour` : ''}${data.skippedNoParent ? `, ${data.skippedNoParent} élève(s) sans parent lié` : ''}.`);
        setNewSemester('');
        setNewAmount('');
        setNewDueDate('');
        await Promise.all([loadClasses(), loadInvoices()]);
      } else {
        setFeeMsg(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setSavingFee(false);
      setFeeMsg('Erreur réseau. Veuillez réessayer.');
    }
  };

  const recordPayment = async (invoiceId: string) => {
    const amount = payAmount[invoiceId];
    if (!amount || parseFloat(amount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }
    setBusy(invoiceId);
    try {
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
    } catch (error) {
      setBusy(null);
      alert('Erreur réseau. Veuillez réessayer.');
    }
  };

  // Create invoice for student manually
  const createInvoiceForStudent = async (student: Student) => {
    if (!student.parents || student.parents.length === 0) {
      alert('Cet élève n\'a pas de parent lié.');
      return;
    }

    if (!student.class?.id) {
      alert('Cet élève n\'a pas de classe assignée.');
      return;
    }

    const amount = prompt('Montant de la facture (DT):');
    if (!amount || parseFloat(amount) <= 0) {
      alert('Montant invalide');
      return;
    }

    const semester = prompt('Semestre (ex: Semestre 1):');
    if (!semester) {
      alert('Semestre requis');
      return;
    }

    try {
      const res = await fetch('/api/school-owner/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: student.id, 
          classId: student.class.id, 
          semester, 
          amount: parseFloat(amount) 
        }),
      });
      
      if (res.ok) {
        await loadInvoices();
        await loadStudents();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la création de la facture');
      }
    } catch (error) {
      alert('Erreur réseau. Veuillez réessayer.');
    }
  };

  // Helper function to get parent name
  const getParentName = (student: Student) => {
    if (student.parents && student.parents.length > 0) {
      return student.parents[0].username;
    }
    return 'N/A';
  };

  // Helper function to get parent email
  const getParentEmail = (student: Student) => {
    if (student.parents && student.parents.length > 0) {
      return student.parents[0].email;
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#5A6A7A' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Chargement...</div>
          <div style={{ fontSize: 14 }}>Récupération des données</div>
        </div>
      </div>
    );
  }

  // Find students without invoices
  const studentsWithoutInvoices = students.filter(student => 
    !student.invoices || student.invoices.length === 0
  );

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1150, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4, fontSize: 28 }}>Paiements</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 28, fontSize: 15 }}>
        Tarifs par classe et suivi des paiements en espèces.
      </p>

      {/* TABLE 1 — Fee structure */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ color: '#071B4A', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
          Tarifs par classe et semestre
        </h2>
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                        <td style={{ ...tdStyle, fontWeight: 600 }}>{f.amount.toLocaleString('fr-FR')} DT</td>
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
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#071B4A', marginBottom: 12 }}>
            Ajouter ou mettre à jour un tarif
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
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
            <button 
              onClick={saveFee} 
              disabled={savingFee} 
              style={{ 
                ...smallBtnStyle, 
                background: '#071B4A',
                opacity: savingFee ? 0.6 : 1,
                cursor: savingFee ? 'not-allowed' : 'pointer'
              }}
            >
              {savingFee ? 'Enregistrement...' : 'Ajouter / Mettre à jour'}
            </button>
          </div>
          {feeMsg && (
            <p style={{ 
              fontSize: 13, 
              color: feeMsg.includes('Erreur') ? '#C0392B' : '#5A6A7A', 
              marginTop: 10,
              padding: '8px 12px',
              background: feeMsg.includes('Erreur') ? '#FDF2F2' : '#F0F7FF',
              borderRadius: 6
            }}>
              {feeMsg}
            </p>
          )}
        </div>
      </div>

      {/* Students without invoices */}
      {studentsWithoutInvoices.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ color: '#071B4A', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
            Élèves inscrits sans facture ({studentsWithoutInvoices.length})
          </h2>
          <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
                  <th style={thStyle}>Parent</th>
                  <th style={thStyle}>Email Parent</th>
                  <th style={thStyle}>Élève</th>
                  <th style={thStyle}>Classe</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {studentsWithoutInvoices.map((student) => (
                  <tr key={student.id}>
                    <td style={tdStyle}>{getParentName(student)}</td>
                    <td style={tdStyle}>{getParentEmail(student)}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>
                      {student.firstName} {student.lastName}
                    </td>
                    <td style={tdStyle}>{student.class?.name || 'Non assigné'}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => createInvoiceForStudent(student)}
                        style={{ 
                          ...smallBtnStyle, 
                          background: '#4C7C59', 
                          padding: '6px 14px',
                          fontSize: 12
                        }}
                      >
                        Créer une facture
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TABLE 2 — Parents / payments */}
      <div>
        <h2 style={{ color: '#071B4A', fontSize: 20, marginBottom: 12, fontWeight: 600 }}>
          Paiements des parents ({invoices.length} factures)
        </h2>
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
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
                  <tr>
                    <td style={{ ...tdStyle, textAlign: 'center', padding: '40px 14px' }} colSpan={8}>
                      <div style={{ color: '#5A6A7A', fontSize: 14 }}>
                        Aucune facture pour le moment.
                      </div>
                      <div style={{ color: '#8A9AAB', fontSize: 12, marginTop: 4 }}>
                        Les factures apparaîtront automatiquement lorsque les parents inscriront leurs enfants et que les tarifs seront définis.
                      </div>
                    </td>
                  </tr>
                )}
                {invoices.map((inv) => {
                  const paid = inv.payments.filter((p) => !p.voided).reduce((s, p) => s + p.amount, 0);
                  const remaining = inv.amount - paid;
                  const sc = statusColor[inv.status] ?? statusColor.PENDING;
                  return (
                    <tr key={inv.id} style={{ backgroundColor: remaining === 0 ? '#FAFEF9' : 'transparent' }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600 }}>{inv.parent.username}</div>
                        <div style={{ fontSize: 11, color: '#5A6A7A' }}>{inv.parent.email}</div>
                      </td>
                      <td style={tdStyle}>
                        {inv.student.firstName} {inv.student.lastName}
                      </td>
                      <td style={tdStyle}>
                        <div>{inv.class.name}</div>
                        <div style={{ fontSize: 11, color: '#5A6A7A' }}>{inv.semester}</div>
                      </td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>
                        {inv.amount.toLocaleString('fr-FR')} DT
                      </td>
                      <td style={tdStyle}>
                        {paid.toLocaleString('fr-FR')} DT
                      </td>
                      <td style={{ 
                        ...tdStyle, 
                        fontWeight: 700, 
                        color: remaining > 0 ? '#C0392B' : '#27500A',
                        fontSize: 14
                      }}>
                        {remaining.toLocaleString('fr-FR')} DT
                      </td>
                      <td style={tdStyle}>
                        <span style={{ 
                          background: sc.bg, 
                          color: sc.text, 
                          fontSize: 12, 
                          fontWeight: 700, 
                          padding: '4px 12px', 
                          borderRadius: 12,
                          display: 'inline-block'
                        }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        {remaining > 0 ? (
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <input
                              type="number"
                              placeholder="Montant"
                              value={payAmount[inv.id] || ''}
                              onChange={(e) => setPayAmount({ ...payAmount, [inv.id]: e.target.value })}
                              style={{ ...inputStyle, width: 90, padding: '6px 10px', fontSize: 12 }}
                            />
                            <button
                              onClick={() => recordPayment(inv.id)}
                              disabled={busy === inv.id}
                              style={{ 
                                ...smallBtnStyle, 
                                background: '#4C7C59', 
                                padding: '6px 14px',
                                fontSize: 12,
                                opacity: busy === inv.id ? 0.6 : 1,
                                cursor: busy === inv.id ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {busy === inv.id ? '...' : 'Confirmer'}
                            </button>
                          </div>
                        ) : (
                          <span style={{ 
                            fontSize: 12, 
                            color: '#27500A', 
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                          }}>
                            <span style={{ fontSize: 16 }}>✓</span> Réglé
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle: CSSProperties = { 
  padding: '12px 16px', 
  fontSize: 12, 
  color: '#5A6A7A', 
  fontWeight: 600, 
  borderBottom: '1px solid #E5E9F0', 
  whiteSpace: 'nowrap',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const tdStyle: CSSProperties = { 
  padding: '12px 16px', 
  fontSize: 13, 
  color: '#1A1A2E', 
  borderBottom: '1px solid #F5F5F5',
  verticalAlign: 'middle'
};

const inputStyle: CSSProperties = { 
  padding: '9px 12px', 
  borderRadius: 8, 
  border: '1px solid #DCE1E8', 
  fontSize: 13, 
  outline: 'none',
  backgroundColor: '#fff',
  transition: 'border-color 0.2s',
  minWidth: 0
};

const smallBtnStyle: CSSProperties = { 
  color: '#fff', 
  border: 'none', 
  borderRadius: 8, 
  padding: '9px 16px', 
  fontSize: 13, 
  fontWeight: 700, 
  cursor: 'pointer',
  transition: 'all 0.2s',
  whiteSpace: 'nowrap'
};