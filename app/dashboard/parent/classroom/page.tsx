'use client';

import { useEffect, useState } from 'react';

interface ChildOption { id: string; firstName: string; lastName: string; }
interface Resource { id: string; type: string; title: string; description: string | null; fileUrl: string | null; teacherName: string; createdAt: string; }
interface Homework { id: string; title: string; instructions: string | null; fileUrl: string | null; deadline: string; completed: boolean; }
interface CalEvent { id: string; title: string; description: string | null; date: string; type: string; }
interface Progress { id: string; category: string; level: string; note: string | null; teacherName: string; createdAt: string; }

const typeLabel: Record<string, string> = { PDF: '📄 PDF', WORKSHEET: '📝 Feuille d\'exercices', VIDEO: '🎥 Vidéo', IMAGE: '🖼️ Image', LINK: '🔗 Lien', REVISION: '📚 Révision' };
const eventTypeLabel: Record<string, { label: string; color: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59' },
  TRIP: { label: 'Sortie', color: '#071B4A' },
  MEETING: { label: 'Réunion parents', color: '#FFB400' },
  EVENT: { label: 'Événement', color: '#8A5A00' },
};
const categoryDisplay: Record<string, { label: string; emoji: string }> = {
  READING: { label: 'Lecture', emoji: '⭐' },
  MATH: { label: 'Mathématiques', emoji: '🧮' },
  PARTICIPATION: { label: 'Participation', emoji: '🎨' },
  WRITING: { label: 'Écriture', emoji: '✍️' },
  GENERAL: { label: 'Général', emoji: '📘' },
};
const levelLabel: Record<string, string> = {
  EXCELLENT: 'Excellent progrès',
  GOOD: 'Bonne participation',
  IMPROVING: 'En amélioration',
  NEEDS_PRACTICE: 'À approfondir',
};

export default function ParentClassroomPage() {
  const [children, setChildren] = useState<ChildOption[]>([]);
  const [activeId, setActiveId] = useState('');
  const [data, setData] = useState<{ resources: Resource[]; homeworks: Homework[]; events: CalEvent[]; progress: Progress[] } | null>(null);
  const [tab, setTab] = useState<'Ressources' | 'Devoirs' | 'Calendrier' | 'Progrès'>('Devoirs');

  useEffect(() => {
    fetch('/api/parent/children-list').then((r) => r.json()).then((list) => {
      if (Array.isArray(list) && list.length) {
        setChildren(list);
        setActiveId(list[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeId) return;
    fetch(`/api/parent/classroom?studentId=${activeId}`).then((r) => r.json()).then(setData);
  }, [activeId]);

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#071B4A', marginBottom: 4 }}>Classe de mon enfant</h1>
      <p style={{ color: '#5A6A7A', marginBottom: 20 }}>Ressources, devoirs, calendrier et progrès.</p>

      {children.length > 1 && (
        <select value={activeId} onChange={(e) => setActiveId(e.target.value)} style={{ ...inputStyle, marginBottom: 16, maxWidth: 260 }}>
          {children.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['Ressources', 'Devoirs', 'Calendrier', 'Progrès'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: '1px solid #E5E9F0', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: tab === t ? '#071B4A' : '#fff', color: tab === t ? '#fff' : '#071B4A',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {!data ? (
        <p style={{ color: '#5A6A7A', fontSize: 14 }}>Chargement...</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #E5E9F0', borderRadius: 12, padding: 20 }}>
          {tab === 'Ressources' && (
            data.resources.length === 0 ? <p style={emptyStyle}>Aucune ressource pour le moment.</p> :
            data.resources.map((r) => (
              <div key={r.id} style={rowStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#071B4A', fontSize: 14 }}>{typeLabel[r.type] ?? r.title} — {r.title}</strong>
                  {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>Ouvrir →</a>}
                </div>
                {r.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{r.description}</p>}
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>{r.teacherName} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</p>
              </div>
            ))
          )}

          {tab === 'Devoirs' && (
            data.homeworks.length === 0 ? <p style={emptyStyle}>Aucun devoir pour le moment.</p> :
            data.homeworks.map((h) => (
              <div key={h.id} style={rowStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ color: '#071B4A', fontSize: 14 }}>{h.title}</strong>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 10px', borderRadius: 10, background: h.completed ? '#EAF3DE' : '#FAEEDA', color: h.completed ? '#27500A' : '#633806' }}>
                    {h.completed ? '✓ Complété' : 'En attente'}
                  </span>
                </div>
                {h.instructions && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{h.instructions}</p>}
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>Échéance : {new Date(h.deadline).toLocaleDateString('fr-FR')}</p>
                {h.fileUrl && <a href={h.fileUrl} target="_blank" rel="noopener noreferrer" style={linkStyle}>Voir le document →</a>}
              </div>
            ))
          )}

          {tab === 'Calendrier' && (
            data.events.length === 0 ? <p style={emptyStyle}>Aucun événement à venir.</p> :
            data.events.map((e) => {
              const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
              return (
                <div key={e.id} style={{ ...rowStyle, borderLeft: `3px solid ${et.color}`, paddingLeft: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong style={{ color: '#071B4A', fontSize: 14 }}>{e.title}</strong>
                    <span style={{ fontSize: 12, color: et.color, fontWeight: 700 }}>{et.label}</span>
                  </div>
                  {e.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{e.description}</p>}
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>{new Date(e.date).toLocaleDateString('fr-FR')}</p>
                </div>
              );
            })
          )}

          {tab === 'Progrès' && (
            data.progress.length === 0 ? <p style={emptyStyle}>Aucune mise à jour de progrès pour le moment.</p> : (
              <div>
                <p style={{ fontWeight: 600, color: '#071B4A', marginBottom: 12 }}>Progrès de votre enfant</p>
                {data.progress.map((p) => {
                  const cat = categoryDisplay[p.category] ?? categoryDisplay.GENERAL;
                  return (
                    <div key={p.id} style={rowStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: 14 }}>{cat.emoji} {cat.label}: {levelLabel[p.level] ?? p.level}</strong>
                        <span style={{ fontSize: 12, color: '#5A6A7A' }}>{new Date(p.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {p.note && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{p.note}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>— {p.teacherName}</p>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = { padding: '9px 12px', borderRadius: 8, border: '1px solid #DCE1E8', fontSize: 13, outline: 'none' };
const rowStyle: React.CSSProperties = { padding: '12px 0', borderBottom: '1px solid #F0F0F0' };
const linkStyle: React.CSSProperties = { fontSize: 12, color: '#FFB400', fontWeight: 600 };
const emptyStyle: React.CSSProperties = { color: '#5A6A7A', fontSize: 14 };