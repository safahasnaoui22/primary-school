'use client';

import { useEffect, useState, useCallback   } from 'react';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import Link from 'next/link'
interface ClassOption { id: string; name: string; }
interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  class: { id: string; name: string; teacherName: string | null } | null;
  parents: { id: string; username: string; email: string }[];
  createdAt: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const loadStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (classFilter) params.set('classId', classFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/school-owner/students?${params.toString()}`);
    if (res.ok) setStudents(await res.json());
  }, [classFilter, search]);

  const loadClasses = useCallback(async () => {
    const res = await fetch('/api/school-owner/classes');
    if (res.ok) {
      const data = await res.json();
      setClasses(data.map((c: any) => ({ id: c.id, name: c.name })));
    }
  }, []);

  useEffect(() => { loadClasses(); }, [loadClasses]);
  useEffect(() => {
    const t = setTimeout(loadStudents, 250);
    return () => clearTimeout(t);
  }, [loadStudents]);

  const startEdit = (s: StudentRow) => {
    setEditingId(s.id);
    setEditFirstName(s.firstName);
    setEditLastName(s.lastName);
    setEditClassId(s.class?.id || '');
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/school-owner/students/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: editFirstName, lastName: editLastName, classId: editClassId || null }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setToast({ title: 'Élève modifié', message: `${editFirstName} ${editLastName} a été mis à jour.`, emoji: '✅', tone: 'success' });
      setEditingId(null);
      loadStudents();
    } else {
      setToast({ title: 'Échec', message: data.error || 'La modification a échoué.', emoji: '⚠️', tone: 'error' });
    }
  };

  const deleteStudent = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement ${name} ? Cette action est irréversible.`)) return;
    setDeletingId(id);
    const res = await fetch(`/api/school-owner/students/${id}`, { method: 'DELETE' });
    const data = await res.json();
    setDeletingId(null);
    if (res.ok) {
      setToast({ title: 'Élève supprimé', message: `${name} a été retiré du système.`, emoji: '🗑️', tone: 'success' });
      loadStudents();
    } else {
      setToast({ title: 'Échec de la suppression', message: data.error || 'Une erreur est survenue.', emoji: '⚠️', tone: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ color: '#071B4A', margin: 0 }}>Élèves</h1>
        <span style={{ fontSize: 13, color: '#5A6A7A' }}>{students.length} élève{students.length !== 1 ? 's' : ''}</span>
      </div>
      <p style={{ color: '#5A6A7A', marginBottom: 20 }}>Tous les élèves inscrits, avec leur classe et leur(s) parent(s).</p>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Rechercher un élève..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: 240 }}
        />
        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} style={inputStyle}>
          <option value="">Toutes les classes</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Élève</th>
              <th style={thStyle}>Classe</th>
              <th style={thStyle}>Enseignant</th>
              <th style={thStyle}>Parent(s)</th>
              <th style={thStyle}>Inscrit le</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr><td style={tdStyle} colSpan={6}>Aucun élève trouvé.</td></tr>
            )}
            {students.map((s) => {
              const isEditing = editingId === s.id;
              return (
                <tr key={s.id}>
                  {isEditing ? (
                    <>
                     <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A' }}>
  <Link href={`/dashboard/school-owner/students/${s.id}`} style={{ color: '#071B4A', textDecoration: 'none' }}>
    {s.firstName} {s.lastName}
  </Link>
</td>
                      <td style={tdStyle}>
                        <select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} style={{ ...inputStyle, padding: '6px 8px' }}>
                          <option value="">— aucune —</option>
                          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle} colSpan={2}>
                        <button onClick={() => saveEdit(s.id)} disabled={saving} style={smallBtnStyle}>
                          {saving ? '...' : 'Enregistrer'}
                        </button>
                        <button onClick={() => setEditingId(null)} style={{ ...smallBtnStyle, background: '#F0F2F5', color: '#071B4A', marginLeft: 6 }}>
                          Annuler
                        </button>
                      </td>
                      <td style={tdStyle}>{new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td style={tdStyle}></td>
                    </>
                  ) : (
                    <>
                      <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A' }}>{s.firstName} {s.lastName}</td>
                      <td style={tdStyle}>
                        {s.class ? s.class.name : <span style={{ color: '#C0392B' }}>Non assignée</span>}
                      </td>
                      <td style={tdStyle}>{s.class?.teacherName ?? <span style={{ color: '#5A6A7A' }}>—</span>}</td>
                      <td style={tdStyle}>
                        {s.parents.length === 0 ? (
                          <span style={{ color: '#C0392B' }}>Aucun parent lié</span>
                        ) : (
                          s.parents.map((p) => p.username).join(', ')
                        )}
                      </td>
                      <td style={tdStyle}>{new Date(s.createdAt).toLocaleDateString('fr-FR')}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={() => startEdit(s)} style={linkBtnStyle}>Modifier</button>
                          <button
                            onClick={() => deleteStudent(s.id, `${s.firstName} ${s.lastName}`)}
                            disabled={deletingId === s.id}
                            style={{ ...linkBtnStyle, color: '#C0392B' }}
                          >
                            {deletingId === s.id ? '...' : 'Supprimer'}
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 12, color: '#5A6A7A', fontWeight: 600, borderBottom: '1px solid #E5E9F0' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #F5F5F5' };
const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 13, outline: 'none' };
const smallBtnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' };
const linkBtnStyle: React.CSSProperties = { background: 'none', border: 'none', color: '#071B4A', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' };