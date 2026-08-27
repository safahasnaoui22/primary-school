'use client';

import { useEffect, useState } from 'react';

interface ChildOption { id: string; firstName: string; lastName: string; }
interface Resource { id: string; type: string; title: string; description: string | null; fileUrl: string | null; teacherName: string; createdAt: string; }
interface Homework { id: string; title: string; instructions: string | null; fileUrl: string | null; deadline: string; completed: boolean; }
interface CalEvent { id: string; title: string; description: string | null; date: string; type: string; }
interface Progress { id: string; category: string; level: string; note: string | null; teacherName: string; createdAt: string; }

const typeLabel: Record<string, { label: string; icon: string }> = {
  PDF: { label: 'PDF', icon: '📄' },
  WORKSHEET: { label: "Feuille d'exercices", icon: '📝' },
  VIDEO: { label: 'Vidéo', icon: '🎥' },
  IMAGE: { label: 'Image', icon: '🖼️' },
  LINK: { label: 'Lien', icon: '🔗' },
  REVISION: { label: 'Révision', icon: '📚' },
};

const eventTypeLabel: Record<string, { label: string; color: string; icon: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', icon: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', icon: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', icon: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', icon: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', icon: '🎉' },
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

  const tabs = [
    { key: 'Ressources', label: 'Ressources', icon: '📁' },
    { key: 'Devoirs', label: 'Devoirs', icon: '📋' },
    { key: 'Calendrier', label: 'Calendrier', icon: '📅' },
    { key: 'Progrès', label: 'Progrès', icon: '📈' },
  ] as const;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
      {/* Global styles for responsiveness and fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        :root {
          --navy: #071B4A;
          --gold: #FFB400;
          --muted: #5A6A7A;
          --border: #E9EEF5;
          --card-bg: #ffffff;
          --shadow: 0 4px 20px rgba(7,27,74,0.06);
        }

        .classroom-container {
          font-family: 'Inter', sans-serif;
        }

        .tab-bar {
          display: flex;
          gap: 6px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: #fff;
          color: var(--navy);
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: var(--navy);
          color: #fff;
          border-color: var(--navy);
        }
        .tab-btn:hover:not(.active) {
          background: #F0F2F5;
        }
        .tab-btn .tab-icon {
          font-size: 16px;
        }

        .content-card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .item-row {
          padding: 12px 0;
          border-bottom: 1px solid #F0F0F0;
        }
        .item-row:last-child {
          border-bottom: none;
        }

        .resource-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F0F2F5;
          color: var(--navy);
          padding: 2px 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          margin-right: 6px;
        }

        .status-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .status-badge.completed {
          background: #EAF3DE;
          color: #27500A;
        }
        .status-badge.pending {
          background: #FAEEDA;
          color: #633806;
        }

        @media (max-width: 768px) {
          .tab-bar {
            overflow-x: auto;
            flex-wrap: nowrap;
            justify-content: flex-start;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 4px;
          }
          .tab-btn {
            flex-shrink: 0;
            font-size: 12px;
            padding: 7px 12px;
          }
          .content-card {
            padding: 16px;
            border-radius: 12px;
          }
          .item-row {
            padding: 10px 0;
          }
          h1 {
            font-size: 24px !important;
          }
          p {
            font-size: 14px !important;
          }
        }
        @media (max-width: 480px) {
          .tab-btn {
            font-size: 11px;
            padding: 6px 10px;
          }
          .tab-btn .tab-icon {
            font-size: 14px;
          }
          .content-card {
            padding: 12px;
          }
        }
      `}</style>

      <div className="classroom-container">
        <h1 style={{ fontFamily: "'Fraunces', serif", color: '#071B4A', marginBottom: 4, fontSize: 28 }}>
          📚 Classe de mon enfant
        </h1>
        <p style={{ color: '#5A6A7A', marginBottom: 20, fontSize: 15 }}>
          Ressources, devoirs, calendrier et progrès.
        </p>

        {children.length > 1 && (
          <div style={{ marginBottom: 16, maxWidth: 260 }}>
            <select
              value={activeId}
              onChange={(e) => setActiveId(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid #DCE1E8',
                fontSize: 13,
                outline: 'none',
                background: '#fff',
                color: '#071B4A',
                fontWeight: 500,
              }}
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  👦 {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tab bar with icons */}
        <div className="tab-bar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab-btn ${tab === t.key ? 'active' : ''}`}
            >
              <span className="tab-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {!data ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#5A6A7A' }}>
            <div style={{ fontSize: 24, marginBottom: 10 }}>⏳</div>
            Chargement...
          </div>
        ) : (
          <div className="content-card">
            {tab === 'Ressources' && (
              data.resources.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune ressource pour le moment.</p>
              ) : (
                data.resources.map((r) => {
                  const type = typeLabel[r.type] ?? { label: r.type, icon: '📘' };
                  return (
                    <div key={r.id} className="item-row">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <span className="resource-type-badge">
                            {type.icon} {type.label}
                          </span>
                          <strong style={{ color: '#071B4A', fontSize: 14 }}>{r.title}</strong>
                        </div>
                        {r.fileUrl && (
                          <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#FFB400', fontWeight: 600 }}>
                            Ouvrir →
                          </a>
                        )}
                      </div>
                      {r.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{r.description}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>
                        👤 {r.teacherName} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  );
                })
              )
            )}

            {tab === 'Devoirs' && (
              data.homeworks.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun devoir pour le moment.</p>
              ) : (
                data.homeworks.map((h) => (
                  <div key={h.id} className="item-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <strong style={{ color: '#071B4A', fontSize: 14 }}>📌 {h.title}</strong>
                      <span className={`status-badge ${h.completed ? 'completed' : 'pending'}`}>
                        {h.completed ? '✓ Complété' : '⏳ En attente'}
                      </span>
                    </div>
                    {h.instructions && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{h.instructions}</p>}
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>
                      🗓️ Échéance : {new Date(h.deadline).toLocaleDateString('fr-FR')}
                    </p>
                    {h.fileUrl && <a href={h.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#FFB400', fontWeight: 600 }}>Voir le document →</a>}
                  </div>
                ))
              )
            )}

            {tab === 'Calendrier' && (
              data.events.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun événement à venir.</p>
              ) : (
                data.events.map((e) => {
                  const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                  return (
                    <div key={e.id} className="item-row" style={{ borderLeft: `3px solid ${et.color}`, paddingLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <strong style={{ color: '#071B4A', fontSize: 14 }}>
                          {et.icon} {e.title}
                        </strong>
                        <span style={{ fontSize: 12, color: et.color, fontWeight: 700 }}>
                          {et.label}
                        </span>
                      </div>
                      {e.description && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#5A6A7A' }}>{e.description}</p>}
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: '#5A6A7A' }}>
                        📅 {new Date(e.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  );
                })
              )
            )}

            {tab === 'Progrès' && (
              data.progress.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune mise à jour de progrès pour le moment.</p>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: '#071B4A', marginBottom: 12 }}>📈 Progrès de votre enfant</p>
                  {data.progress.map((p) => {
                    const cat = categoryDisplay[p.category] ?? categoryDisplay.GENERAL;
                    return (
                      <div key={p.id} className="item-row">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <strong style={{ fontSize: 14, color: '#071B4A' }}>
                            {cat.emoji} {cat.label}: {levelLabel[p.level] ?? p.level}
                          </strong>
                          <span style={{ fontSize: 12, color: '#5A6A7A' }}>
                            {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                          </span>
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
    </div>
  );
}