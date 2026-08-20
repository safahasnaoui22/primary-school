'use client';

import { useState } from 'react';

interface Student { id: string; firstName: string; lastName: string; }
interface ClassData { id: string; name: string; students: Student[]; }

const tabs = ['Ressources', 'Devoirs', 'Calendrier', 'Progrès'] as const;
type Tab = typeof tabs[number];

const resourceTypes = [
  { value: 'PDF', label: 'PDF de cours' },
  { value: 'WORKSHEET', label: 'Feuille d\'exercices' },
  { value: 'VIDEO', label: 'Vidéo éducative' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'LINK', label: 'Lien externe' },
  { value: 'REVISION', label: 'Document de révision' },
];

const eventTypes = [
  { value: 'EXAM', label: 'Examen' },
  { value: 'ACTIVITY', label: 'Activité scolaire' },
  { value: 'TRIP', label: 'Sortie' },
  { value: 'MEETING', label: 'Réunion parents' },
  { value: 'EVENT', label: 'Événement spécial' },
];

const progressCategories = [
  { value: 'READING', label: 'Lecture', emoji: '⭐' },
  { value: 'MATH', label: 'Mathématiques', emoji: '🧮' },
  { value: 'PARTICIPATION', label: 'Participation', emoji: '🎨' },
  { value: 'WRITING', label: 'Écriture', emoji: '✍️' },
  { value: 'GENERAL', label: 'Général', emoji: '📘' },
];

const progressLevels = [
  { value: 'EXCELLENT', label: 'Excellent progrès' },
  { value: 'GOOD', label: 'Bonne participation' },
  { value: 'IMPROVING', label: 'En amélioration' },
  { value: 'NEEDS_PRACTICE', label: 'À approfondir' },
];

export default function ClassroomClient({ classes }: { classes: ClassData[] }) {
  const [tab, setTab] = useState<Tab>('Ressources');
  const [msg, setMsg] = useState('');

  // Resources
  const [resClass, setResClass] = useState('');
  const [resType, setResType] = useState('PDF');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');

  // Homework
  const [hwClass, setHwClass] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwUrl, setHwUrl] = useState('');
  const [hwDeadline, setHwDeadline] = useState('');

  // Calendar
  const [evClass, setEvClass] = useState('');
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evType, setEvType] = useState('EVENT');

  // Progress
  const [prStudent, setPrStudent] = useState('');
  const [prCategory, setPrCategory] = useState('READING');
  const [prLevel, setPrLevel] = useState('EXCELLENT');
  const [prNote, setPrNote] = useState('');

  const allStudents = classes.flatMap((c) => c.students.map((s) => ({ ...s, className: c.name })));

  const submitResource = async () => {
    if (!resClass || !resTitle) return setMsg('Classe et titre requis.');
    const res = await fetch('/api/teacher/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: resClass, type: resType, title: resTitle, description: resDesc, fileUrl: resUrl }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Ressource publiée.' : data.error);
    if (res.ok) { setResTitle(''); setResDesc(''); setResUrl(''); }
  };

  const submitHomework = async () => {
    if (!hwClass || !hwTitle || !hwDeadline) return setMsg('Classe, titre et échéance requis.');
    const res = await fetch('/api/teacher/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: hwClass, title: hwTitle, instructions: hwInstructions, fileUrl: hwUrl, deadline: hwDeadline }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Devoir créé.' : data.error);
    if (res.ok) { setHwTitle(''); setHwInstructions(''); setHwUrl(''); setHwDeadline(''); }
  };

  const submitEvent = async () => {
    if (!evTitle || !evDate) return setMsg('Titre et date requis.');
    const res = await fetch('/api/teacher/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: evClass || null, title: evTitle, description: evDesc, date: evDate, type: evType }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Événement ajouté.' : data.error);
    if (res.ok) { setEvTitle(''); setEvDesc(''); setEvDate(''); }
  };

  const submitProgress = async () => {
    if (!prStudent) return setMsg('Choisissez un élève.');
    const res = await fetch('/api/teacher/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: prStudent, category: prCategory, level: prLevel, note: prNote }),
    });
    const data = await res.json();
    setMsg(res.ok ? 'Mise à jour de progrès envoyée.' : data.error);
    if (res.ok) setPrNote('');
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Ma classe</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 20 }}>Ressources, devoirs, calendrier et suivi des progrès.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((tName) => (
          <button
            key={tName}
            onClick={() => { setTab(tName); setMsg(''); }}
            style={{
              padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E9F0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === tName ? '#071B4A' : '#fff', color: tab === tName ? '#fff' : '#071B4A',
            }}
          >
            {tName}
          </button>
        ))}
      </div>

      {msg && <p style={{ fontSize: 13, color: '#5A6A7A', marginBottom: 16 }}>{msg}</p>}

      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20 }}>
        {tab === 'Ressources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={resClass} onChange={(e) => setResClass(e.target.value)} style={inputStyle}>
              <option value="">Classe...</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={resType} onChange={(e) => setResType(e.target.value)} style={inputStyle}>
              {resourceTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input placeholder="Titre" value={resTitle} onChange={(e) => setResTitle(e.target.value)} style={inputStyle} />
            <textarea placeholder="Description (optionnel)" value={resDesc} onChange={(e) => setResDesc(e.target.value)} rows={2} style={inputStyle} />
            <input placeholder="Lien (Google Drive, YouTube, etc.)" value={resUrl} onChange={(e) => setResUrl(e.target.value)} style={inputStyle} />
            <button onClick={submitResource} style={btnStyle}>Publier la ressource</button>
          </div>
        )}

        {tab === 'Devoirs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={hwClass} onChange={(e) => setHwClass(e.target.value)} style={inputStyle}>
              <option value="">Classe...</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Titre du devoir" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)} style={inputStyle} />
            <textarea placeholder="Instructions" value={hwInstructions} onChange={(e) => setHwInstructions(e.target.value)} rows={3} style={inputStyle} />
            <input placeholder="Lien du document (optionnel)" value={hwUrl} onChange={(e) => setHwUrl(e.target.value)} style={inputStyle} />
            <label style={{ fontSize: 12, color: '#5A6A7A' }}>Date limite</label>
            <input type="date" value={hwDeadline} onChange={(e) => setHwDeadline(e.target.value)} style={inputStyle} />
            <button onClick={submitHomework} style={btnStyle}>Créer le devoir</button>
          </div>
        )}

        {tab === 'Calendrier' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={evClass} onChange={(e) => setEvClass(e.target.value)} style={inputStyle}>
              <option value="">Toute l'école (optionnel)</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={evType} onChange={(e) => setEvType(e.target.value)} style={inputStyle}>
              {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <input placeholder="Titre de l'événement" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} style={inputStyle} />
            <textarea placeholder="Description (optionnel)" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={2} style={inputStyle} />
            <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} style={inputStyle} />
            <button onClick={submitEvent} style={btnStyle}>Ajouter au calendrier</button>
          </div>
        )}

        {tab === 'Progrès' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={prStudent} onChange={(e) => setPrStudent(e.target.value)} style={inputStyle}>
              <option value="">Élève...</option>
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.className})</option>
              ))}
            </select>
            <select value={prCategory} onChange={(e) => setPrCategory(e.target.value)} style={inputStyle}>
              {progressCategories.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
            </select>
            <select value={prLevel} onChange={(e) => setPrLevel(e.target.value)} style={inputStyle}>
              {progressLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <textarea placeholder="Note (optionnel)" value={prNote} onChange={(e) => setPrNote(e.target.value)} rows={2} style={inputStyle} />
            <button onClick={submitProgress} style={btnStyle}>Envoyer la mise à jour</button>
          </div>
        )}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 14, outline: 'none', width: '100%' };
const btnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' };