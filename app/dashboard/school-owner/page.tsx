'use client';

import { useEffect, useState, useCallback } from 'react';

interface Teacher { id: string; username: string; email: string; }
interface ClassRow {
  id: string;
  name: string;
  teachers: { id: string; username: string }[];
  studentCount: number;
  createdAt: string;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [newName, setNewName] = useState('');
  const [newTeacherIds, setNewTeacherIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTeacherIds, setEditTeacherIds] = useState<string[]>([]);

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

  const toggleNewTeacher = (id: string) => {
    setNewTeacherIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const toggleEditTeacher = (id: string) => {
    setEditTeacherIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

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
      body: JSON.stringify({ name: newName, teacherIds: newTeacherIds }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setNewName('');
      setNewTeacherIds([]);
      loadClasses();
    } else {
      setMsg(data.error);
    }
  };

  const startEdit = (c: ClassRow) => {
    setEditingId(c.id);
    setEditTeacherIds(c.teachers.map((t) => t.id));
  };

  const saveTeachers = async (classId: string) => {
    await fetch(`/api/school-owner/classes/${classId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherIds: editTeacherIds }),
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
        Créez les classes de votre école — vous pouvez assigner un ou plusieurs enseignants à chacune.
      </p>

      {/* Create form */}
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 16, marginBottom: 24 }}>
        <input
          placeholder="Nom de la classe (ex: CP1)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ ...inputStyle, maxWidth: 260, marginBottom: 12 }}
        />

        <div style={{ fontSize: 12, color: '#5A6A7A', marginBottom: 6, fontWeight: 600 }}>
          Enseignants (sélectionnez-en autant que nécessaire)
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {teachers.length === 0 ? (
            <span style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun enseignant disponible.</span>
          ) : (
            teachers.map((t) => (
              <label
                key={t.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13,
                  padding: '6px 12px', borderRadius: 16,
                  border: `1px solid ${newTeacherIds.includes(t.id) ? '#FFB400' : '#DCE1E8'}`,
                  background: newTeacherIds.includes(t.id) ? '#FFF3D6' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={newTeacherIds.includes(t.id)}
                  onChange={() => toggleNewTeacher(t.id)}
                  style={{ margin: 0 }}
                />
                {t.username}
              </label>
            ))
          )}
        </div>

        <button onClick={createClass} disabled={creating} style={smallBtnStyle}>
          {creating ? '...' : '+ Créer la classe'}
        </button>
        {msg && <p style={{ fontSize: 13, color: '#C0392B', marginTop: 10 }}>{msg}</p>}
      </div>

      {/* Classes table */}
      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FA', textAlign: 'left' }}>
              <th style={thStyle}>Classe</th>
              <th style={thStyle}>Enseignant(s)</th>
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
                <td style={{ ...tdStyle, fontWeight: 600, color: '#071B4A', verticalAlign: 'top' }}>{c.name}</td>
                <td style={tdStyle}>
                  {editingId === c.id ? (
                    <div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                        {teachers.map((t) => (
                          <label
                            key={t.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
                              padding: '4px 10px', borderRadius: 14,
                              border: `1px solid ${editTeacherIds.includes(t.id) ? '#FFB400' : '#DCE1E8'}`,
                              background: editTeacherIds.includes(t.id) ? '#FFF3D6' : '#fff',
                              cursor: 'pointer',
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={editTeacherIds.includes(t.id)}
                              onChange={() => toggleEditTeacher(t.id)}
                              style={{ margin: 0 }}
                            />
                            {t.username}
                          </label>
                        ))}
                      </div>
                      <button onClick={() => saveTeachers(c.id)} style={{ ...smallBtnStyle, padding: '6px 12px' }}>
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{ ...smallBtnStyle, padding: '6px 12px', background: '#F0F2F5', color: '#071B4A', marginLeft: 6 }}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <span onClick={() => startEdit(c)} style={{ cursor: 'pointer' }}>
                      {c.teachers.length === 0 ? (
                        <span style={{ color: '#C0392B', textDecoration: 'underline dotted' }}>Non assigné</span>
                      ) : (
                        <span style={{ color: '#1A1A2E', textDecoration: 'underline dotted' }}>
                          {c.teachers.map((t) => t.username).join(', ')}
                        </span>
                      )}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, verticalAlign: 'top' }}>{c.studentCount}</td>
                <td style={{ ...tdStyle, verticalAlign: 'top' }}>
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