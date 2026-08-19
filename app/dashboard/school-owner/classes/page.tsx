'use client';

import { useEffect, useState, useCallback } from 'react';

interface Teacher { id: string; username: string; email: string; }
interface ClassRow {
  id: string;
  name: string;
  teacher: { id: string; username: string } | null;
  studentCount: number;
  createdAt: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newName, setNewName] = useState('');
  const [newTeacherId, setNewTeacherId] = useState('');
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTeacherId, setEditTeacherId] = useState('');

  const loadClasses = useCallback(async () => {
    const res = await fetch('/api/school-owner/classes');
    if (res.ok) setClasses(await res.json());
  }, []);

  const loadTeachers = useCallback(async () => {
    const res = await fetch('/api/school-owner/teachers');
    if (res.ok) setTeachers(await res.json());
  }, []);

  useEffect(() => {
    loadClasses();
    loadTeachers();
  }, [loadClasses, loadTeachers]);

  const createClass = async () => {
    if (!newName.trim()) {
      setMsg('Le nom de la classe est requis.');
      return;
    }
    setCreating(true);
    setMsg('');
    const res = await fetch('/api/school-owner/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, teacherId: newTeacherId || null }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setNewName('');
      setNewTeacherId('');
      loadClasses();
    } else {
      setMsg(data.error);
    }
  };

  const saveTeacher = async (classId: string) => {
    await fetch(`/api/school-owner/classes/${classId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherId: editTeacherId }),
    });
    setEditingId(null);
    loadClasses();
  };

  const deleteClass = async (id: string, studentCount: number) => {
    if (studentCount > 0) {
      alert(`Impossible de supprimer : ${studentCount} élève(s) sont encore dans cette classe.`);
      return;
    }
    if (!confirm('Supprimer cette classe ?')) return;
    const res = await fetch(`/api/school-owner/classes/${id}`, { method: 'DELETE' });
    if (res.ok) loadClasses();
    else {
      const data = await res.json();
      alert(data.error);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Classes</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 24 }}>
        Créez les classes de votre école — elles apparaîtront ensuite dans les tarifs de paiement et les listes d'élèves.
      </p>

      {/* Create form */}
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            placeholder="Nom de la classe (ex: CP1)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ ...inputStyle, maxWidth: 220 }}
          />
          <select value={newTeacherId} onChange={(e) => setNewTeacherId(e.target.value)} style={inputStyle}>
            <option value="">Enseignant (optionnel)</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.username}</option>
            ))}
          </select>
          <button onClick={createClass} disabled={creating} style={smallBtnStyle}>
            {creating ? '...' : '+ Créer la classe'}
          </button>
        </div>
        {msg && <p style={{ fontSize: 13, color: '#C0392B', marginTop: 10 }}>{msg}</p>}
      </div>

      {/* Classes table */}
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Classe</th>
              <th style={thStyle}>Enseignant</th>
              <th style={thStyle}>Élèves</th>
              <th style={thStyle}></th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 && (
              <tr><td style={tdStyle} colSpan={4}>Aucune classe pour le moment. Créez-en une ci-dessus.</td></tr>
            )}
            {classes.map((c) => (
              <tr key={c.id}>
                <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A' }}>{c.name}</td>
                <td style={tdStyle}>
                  {editingId === c.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select value={editTeacherId} onChange={(e) => setEditTeacherId(e.target.value)} style={{ ...inputStyle, padding: '6px 10px' }}>
                        <option value="">— aucun —</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>{t.username}</option>
                        ))}
                      </select>
                      <button onClick={() => saveTeacher(c.id)} style={{ ...smallBtnStyle, padding: '6px 12px' }}>OK</button>
                    </div>
                  ) : (
                    <span
                      onClick={() => { setEditingId(c.id); setEditTeacherId(c.teacher?.id || ''); }}
                      style={{ cursor: 'pointer', color: c.teacher ? '#1A1A2E' : '#C0392B', textDecoration: 'underline dotted' }}
                    >
                      {c.teacher ? c.teacher.username : 'Non assigné'}
                    </span>
                  )}
                </td>
                <td style={tdStyle}>{c.studentCount}</td>
                <td style={tdStyle}>
                  <button
                    onClick={() => deleteClass(c.id, c.studentCount)}
                    style={{ background: 'none', border: 'none', color: '#C0392B', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Supprimer
                  </button>
                </td>
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