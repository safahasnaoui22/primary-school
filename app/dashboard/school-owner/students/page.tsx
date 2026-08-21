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
    const t = setTimeout(loadStudents, 250); // debounce search
    return () => clearTimeout(t);
  }, [loadStudents]);

  const saveClass = async (studentId: string) => {
    await fetch(`/api/school-owner/students/${studentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: editClassId || null }),
    });
    setEditingId(null);
    loadStudents();
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1050, margin: '0 auto' }}>
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
          <option value="__none__" disabled style={{ display: 'none' }} />
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
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr><td style={tdStyle} colSpan={5}>Aucun élève trouvé.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A' }}>{s.firstName} {s.lastName}</td>
                <td style={tdStyle}>
                  {editingId === s.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select value={editClassId} onChange={(e) => setEditClassId(e.target.value)} style={{ ...inputStyle, padding: '6px 10px' }}>
                        <option value="">— aucune —</option>
                        {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button onClick={() => saveClass(s.id)} style={{ ...smallBtnStyle, padding: '6px 12px' }}>OK</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => { setEditingId(s.id); setEditClassId(s.class?.id || ''); }}
                      style={{ cursor: 'pointer', color: s.class ? '#1A1A2E' : '#C0392B', textDecoration: 'underline dotted' }}
                    >
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 12, color: '#5A6A7A', fontWeight: 600, borderBottom: '1px solid #E5E9F0' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', fontSize: 13, color: '#1A1A2E', borderBottom: '1px solid #F5F5F5' };
const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 13, outline: 'none' };
const smallBtnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' };