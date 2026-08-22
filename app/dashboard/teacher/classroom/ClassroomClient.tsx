'use client';

import ActionToast, { ToastData } from '@/app/components/ActionToast';
import FileDropZone from '@/app/components/FileDropZone';
import { useState, useEffect, useCallback } from 'react';


interface Student { id: string; firstName: string; lastName: string; }
interface ClassData { id: string; name: string; students: Student[]; }

interface HomeworkStudent { id: string; firstName: string; lastName: string; completed: boolean; }
interface HomeworkEntry {
  id: string;
  title: string;
  instructions: string | null;
  fileUrl: string | null;
  deadline: string;
  className: string;
  students: HomeworkStudent[];
}

const tabs = ['Ressources', 'Devoirs', 'Calendrier', 'Progrès'] as const;
type Tab = typeof tabs[number];

const resourceTypes = [
  { value: 'PDF', label: 'PDF de cours', emoji: '📄' },
  { value: 'WORKSHEET', label: 'Feuille d\'exercices', emoji: '📝' },
  { value: 'VIDEO', label: 'Vidéo éducative', emoji: '🎥' },
  { value: 'IMAGE', label: 'Image', emoji: '🖼️' },
  { value: 'LINK', label: 'Lien externe', emoji: '🔗' },
  { value: 'REVISION', label: 'Document de révision', emoji: '📚' },
];

const eventTypes = [
  { value: 'EXAM', label: 'Examen', emoji: '📝' },
  { value: 'ACTIVITY', label: 'Activité scolaire', emoji: '🎨' },
  { value: 'TRIP', label: 'Sortie', emoji: '🚌' },
  { value: 'MEETING', label: 'Réunion parents', emoji: '👨‍👩‍👧' },
  { value: 'EVENT', label: 'Événement spécial', emoji: '🎉' },
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
  const [toast, setToast] = useState<ToastData | null>(null);

  // Resources
  const [resClass, setResClass] = useState('');
  const [resType, setResType] = useState('PDF');
  const [resTitle, setResTitle] = useState('');
  const [resDesc, setResDesc] = useState('');
  const [resUrl, setResUrl] = useState('');
  const [resFilename, setResFilename] = useState('');

  // Homework — creation
  const [hwClass, setHwClass] = useState('');
  const [hwTitle, setHwTitle] = useState('');
  const [hwInstructions, setHwInstructions] = useState('');
  const [hwUrl, setHwUrl] = useState('');
  const [hwFilename, setHwFilename] = useState('');
  const [hwDeadline, setHwDeadline] = useState('');

  // Homework — tracking
  const [homeworks, setHomeworks] = useState<HomeworkEntry[]>([]);
  const [loadingHw, setLoadingHw] = useState(false);
  const [expandedHwId, setExpandedHwId] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string | null>(null);

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

  const loadHomeworks = useCallback(async () => {
    setLoadingHw(true);
    const res = await fetch('/api/teacher/homework');
    if (res.ok) setHomeworks(await res.json());
    setLoadingHw(false);
  }, []);

  useEffect(() => {
    if (tab === 'Devoirs') loadHomeworks();
  }, [tab, loadHomeworks]);

  const submitResource = async () => {
    if (!resClass || !resTitle) {
      setToast({ title: 'Champs manquants', message: 'Choisissez une classe et un titre.', emoji: '⚠️', tone: 'error' });
      return;
    }
    const res = await fetch('/api/teacher/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: resClass, type: resType, title: resTitle, description: resDesc, fileUrl: resUrl }),
    });
    const data = await res.json();
    if (res.ok) {
      const typeInfo = resourceTypes.find((t) => t.value === resType);
      setToast({
        title: 'Merci ! Ressource publiée',
        message: `« ${resTitle} » ${typeInfo?.label.toLowerCase() ?? ''} a bien été ajouté${resFilename ? ` (${resFilename})` : ''} et est visible par les parents.`,
        emoji: typeInfo?.emoji ?? '✅',
        tone: 'success',
      });
      setResTitle(''); setResDesc(''); setResUrl(''); setResFilename('');
    } else {
      setToast({ title: 'Échec', message: data.error || "La ressource n'a pas pu être publiée.", emoji: '⚠️', tone: 'error' });
    }
  };

  const submitHomework = async () => {
    if (!hwClass || !hwTitle || !hwDeadline) {
      setToast({ title: 'Champs manquants', message: 'Classe, titre et échéance sont requis.', emoji: '⚠️', tone: 'error' });
      return;
    }
    const res = await fetch('/api/teacher/homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: hwClass, title: hwTitle, instructions: hwInstructions, fileUrl: hwUrl, deadline: hwDeadline }),
    });
    const data = await res.json();
    if (res.ok) {
      setToast({
        title: 'Merci ! Devoir créé',
        message: `« ${hwTitle} »${hwFilename ? ` avec le document ${hwFilename}` : ''} a été envoyé aux parents, échéance le ${new Date(hwDeadline).toLocaleDateString('fr-FR')}.`,
        emoji: '📚',
        tone: 'success',
      });
      setHwTitle(''); setHwInstructions(''); setHwUrl(''); setHwFilename(''); setHwDeadline('');
      loadHomeworks();
    } else {
      setToast({ title: 'Échec', message: data.error || "Le devoir n'a pas pu être créé.", emoji: '⚠️', tone: 'error' });
    }
  };

  const toggleCompletion = async (homeworkId: string, studentId: string, current: boolean) => {
    const key = `${homeworkId}:${studentId}`;
    setSavingStatus(key);
    const res = await fetch(`/api/teacher/homework/${homeworkId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, completed: !current }),
    });
    setSavingStatus(null);
    if (res.ok) {
      setHomeworks((prev) =>
        prev.map((h) =>
          h.id === homeworkId
            ? { ...h, students: h.students.map((s) => (s.id === studentId ? { ...s, completed: !current } : s)) }
            : h
        )
      );
    }
  };

  const submitEvent = async () => {
    if (!evTitle || !evDate) {
      setToast({ title: 'Champs manquants', message: 'Titre et date sont requis.', emoji: '⚠️', tone: 'error' });
      return;
    }
    const res = await fetch('/api/teacher/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classId: evClass || null, title: evTitle, description: evDesc, date: evDate, type: evType }),
    });
    const data = await res.json();
    if (res.ok) {
      const typeInfo = eventTypes.find((t) => t.value === evType);
      setToast({
        title: 'Merci ! Événement ajouté',
        message: `« ${evTitle} » (${typeInfo?.label ?? ''}) est maintenant visible dans le calendrier des parents.`,
        emoji: typeInfo?.emoji ?? '📅',
        tone: 'success',
      });
      setEvTitle(''); setEvDesc(''); setEvDate('');
    } else {
      setToast({ title: 'Échec', message: data.error || "L'événement n'a pas pu être ajouté.", emoji: '⚠️', tone: 'error' });
    }
  };

  const submitProgress = async () => {
    if (!prStudent) {
      setToast({ title: 'Élève manquant', message: 'Choisissez un élève.', emoji: '⚠️', tone: 'error' });
      return;
    }
    const student = allStudents.find((s) => s.id === prStudent);
    const res = await fetch('/api/teacher/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: prStudent, category: prCategory, level: prLevel, note: prNote }),
    });
    const data = await res.json();
    if (res.ok) {
      const catInfo = progressCategories.find((c) => c.value === prCategory);
      const levelInfo = progressLevels.find((l) => l.value === prLevel);
      setToast({
        title: 'Merci ! Progrès envoyé',
        message: `${catInfo?.emoji ?? ''} ${catInfo?.label ?? ''} — ${levelInfo?.label ?? ''} pour ${student?.firstName ?? 'cet élève'} a été partagé avec le parent.`,
        emoji: '⭐',
        tone: 'success',
      });
      setPrNote('');
    } else {
      setToast({ title: 'Échec', message: data.error || "La mise à jour n'a pas pu être envoyée.", emoji: '⚠️', tone: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Ma classe</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 20 }}>Ressources, devoirs, calendrier et suivi des progrès.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((tName) => (
          <button
            key={tName}
            onClick={() => setTab(tName)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E9F0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === tName ? '#071B4A' : '#fff', color: tab === tName ? '#fff' : '#071B4A',
            }}
          >
            {tName}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20, marginBottom: tab === 'Devoirs' ? 20 : 0 }}>
        {tab === 'Ressources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <select value={resClass} onChange={(e) => setResClass(e.target.value)} style={inputStyle}>
              <option value="">Classe...</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={resType} onChange={(e) => setResType(e.target.value)} style={inputStyle}>
              {resourceTypes.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
            </select>
            <input placeholder="Titre" value={resTitle} onChange={(e) => setResTitle(e.target.value)} style={inputStyle} />
            <textarea placeholder="Description (optionnel)" value={resDesc} onChange={(e) => setResDesc(e.target.value)} rows={2} style={inputStyle} />
            {resType === 'VIDEO' || resType === 'LINK' ? (
              <input placeholder="Lien (YouTube, site externe, etc.)" value={resUrl} onChange={(e) => setResUrl(e.target.value)} style={inputStyle} />
            ) : (
              <FileDropZone onUploaded={(url, name) => { setResUrl(url); setResFilename(name); }} />
            )}
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
            <FileDropZone onUploaded={(url, name) => { setHwUrl(url); setHwFilename(name); }} />
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
              {eventTypes.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
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

      {tab === 'Devoirs' && (
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20 }}>
          <h2 style={{ color: '#071B4A', fontSize: 16, marginBottom: 14 }}>Suivi des devoirs</h2>

          {loadingHw ? (
            <p style={{ color: '#5A6A7A', fontSize: 14 }}>Chargement...</p>
          ) : homeworks.length === 0 ? (
            <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun devoir créé pour le moment.</p>
          ) : (
            homeworks.map((h) => {
              const isOpen = expandedHwId === h.id;
              const completedCount = h.students.filter((s) => s.completed).length;
              const overdue = new Date(h.deadline) < new Date();
              return (
                <div key={h.id} style={{ border: '1px solid #F0F0F0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedHwId(isOpen ? null : h.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '14px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#071B4A', fontSize: 14 }}>{h.title}</div>
                      <div style={{ fontSize: 12, color: '#5A6A7A' }}>
                        {h.className} · Échéance {new Date(h.deadline).toLocaleDateString('fr-FR')}
                        {overdue && <span style={{ color: '#C0392B', fontWeight: 600 }}> · En retard</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FFB400' }}>
                      {completedCount}/{h.students.length} {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: '1px solid #F0F0F0', padding: '10px 16px' }}>
                      {h.students.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun élève dans cette classe.</p>
                      ) : (
                        h.students.map((s) => {
                          const key = `${h.id}:${s.id}`;
                          return (
                            <label
                              key={s.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F5F5', cursor: 'pointer', fontSize: 13 }}
                            >
                              <input
                                type="checkbox"
                                checked={s.completed}
                                disabled={savingStatus === key}
                                onChange={() => toggleCompletion(h.id, s.id, s.completed)}
                              />
                              <span style={{ color: s.completed ? '#27500A' : '#1A1A2E', fontWeight: s.completed ? 600 : 400 }}>
                                {s.firstName} {s.lastName}
                              </span>
                              {savingStatus === key && <span style={{ fontSize: 11, color: '#5A6A7A' }}>...</span>}
                            </label>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '10px 14px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 14, outline: 'none', width: '100%' };
const btnStyle: React.CSSProperties = { background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 20, padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer' };