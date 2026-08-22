'use client';

import { useEffect, useState, useCallback } from 'react';

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
  const [editClassId, setEditClassId] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    const params = new URLSearchParams();
    if (classFilter) params.set('classId', classFilter);
    if (search) params.set('search', search);
    const res = await fetch(`/api/school-owner/students?${params.toString()}`);
    if (res.ok) {
      setStudents(await res.json());
    } else {
      setError(`Erreur de chargement (${res.status})`);
    }
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
    setEditClassId(s.class?.id || '');
    setEditFirstName(s.firstName);
    setEditLastName(s.lastName);
    setError(null);
  };

  const saveEdit = async (studentId: string) => {
    setSavingId(studentId);
    setError(null);
    const res = await fetch(`/api/school-owner/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classId: editClassId || null,
        firstName: editFirstName,
        lastName: editLastName,
      }),
    });
    setSavingId(null);
    if (!res.ok) {
      setError(`Échec de la mise à jour (${res.status})`);
      return;
    }
    setEditingId(null);
    loadStudents();
  };

  const deleteStudent = async (studentId: string, name: string) => {
    if (!confirm(`Supprimer ${name} ? Cette action est irréversible.`)) return;
    setDeletingId(studentId);
    setError(null);
    const res = await fetch(`/api/school-owner/students/${studentId}`, { method: 'DELETE' });
    setDeletingId(null);
    if (!res.ok) {
      setError(`Échec de la suppression (${res.status})`);
      return;
    }
    loadStudents();
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1150, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h1 style={{ color: '#071B4A', margin: 0 }}>Élèves</h1>
        <span style={{ fontSize: 13, color: '#5A6A7A' }}>{students.length} élève{students.length !== 1 ? 's' : ''}</span>
      </div>
      <p style={{ color: '#5A6A7A', marginBottom: 20 }}>Tous les élèves inscrits, avec leur classe et leur(s) parent(s).</p>

      {error && (
        <div style={{ background: '#FDEDEC', color: '#C0392B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

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
              <th style={thStyle}>Actions</th>
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
                  <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: 90 }} />
                        <input value={editLastName} onChange={(e) => setEditLastName(e.target.value)} style={{ ...inputStyle, padding: '6px 8px', width: 90 }} />
                      </div>
                    ) : (
                      <>{s.firstName} {s.lastName}</>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {isEditing ? (
                      <select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} style={{ ...inputStyle, padding: '6px 10px' }}>
                        <option value="">— aucune —</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: s.class ? '#1A1A2E' : '#C0392B' }}>
                        {s.class ? s.class.name : 'Non assignée'}
                      </span>
                    )}
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
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => saveEdit(s.id)} disabled={savingId === s.id} style={smallBtnStyle}>
                          {savingId === s.id ? '...' : 'OK'}
                        </button>
                        <button onClick={() => setEditingId(null)} style={cancelBtnStyle}>Annuler</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => startEdit(s)} style={editBtnStyle}>Modifier</button>
                        <button
                          onClick={() => deleteStudent(s.id, `${s.firstName} ${s.lastName}`)}
                          disabled={deletingId === s.id}
                          style={deleteBtnStyle}
                        >
                          {deletingId === s.id ? '...' : 'Supprimer'}
                        </button>
                      </div>
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

const thStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 12, color: '#5A6A7A', fontWeight: 600, borderBottom: '1px solid #E5E9F0' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #F5F5F5' };
const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 13, outline: 'none' };
const smallBtnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' };
const cancelBtnStyle: React.CSSProperties = { background: '#EEE', color: '#333', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const editBtnStyle: React.CSSProperties = { background: '#071B4A', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const deleteBtnStyle: React.CSSProperties = { background: '#C0392B', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' };