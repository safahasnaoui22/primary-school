'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface ChildEntry {
  firstName: string;
  lastName: string;
  age: string;
  gender?: string;
  classId: string;
  previousSchool?: string;
}

interface DocumentEntry {
  name: string;
  url: string;
}

interface EnrollmentRequest {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childrenJson: ChildEntry[];
  medical: string | null;
  documents: DocumentEntry[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const tabs = [
  { key: 'PENDING', label: 'En attente' },
  { key: 'APPROVED', label: 'Approuvées' },
  { key: 'REJECTED', label: 'Refusées' },
];

const genderLabel: Record<string, string> = { M: 'Garçon', F: 'Fille' };

const statusStyle: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#FFF3D6', text: '#8A5A00', label: 'En attente' },
  APPROVED: { bg: '#EAF3DE', text: '#27500A', label: 'Approuvée' },
  REJECTED: { bg: '#FAECE7', text: '#712B13', label: 'Refusée' },
};

const fontImports =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap";

function initials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function fileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return '📄';
  if (['jpg', 'jpeg', 'png'].includes(ext ?? '')) return '🖼️';
  return '📎';
}

export default function EnrollmentsPage() {
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [requests, setRequests] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ studentsCreated: number } | null>(null);
  const [classMap, setClassMap] = useState<Record<string, string>>({});

  const busyIdsRef = useRef<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/school-owner/enrollments?status=${filter}`);
    if (res.ok) setRequests(await res.json());
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetch('/api/classes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClassMap(Object.fromEntries(data.map((c: any) => [c.id, c.name])));
        }
      });
  }, []);

  const approve = async (id: string) => {
    if (busyIdsRef.current.has(id)) return;
    busyIdsRef.current.add(id);
    setBusyId(id);
    setLastResult(null);
    try {
      const res = await fetch(`/api/school-owner/enrollments/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setLastResult({ studentsCreated: data.studentsCreated });
        load();
      } else {
        alert(data.error || "Échec de l'approbation");
      }
    } finally {
      busyIdsRef.current.delete(id);
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    if (busyIdsRef.current.has(id)) return;
    if (!confirm("Refuser cette demande d'inscription ?")) return;
    busyIdsRef.current.add(id);
    setBusyId(id);
    try {
      const res = await fetch(`/api/school-owner/enrollments/${id}/reject`, { method: 'POST' });
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        alert(data.error || 'Échec du refus');
      }
    } finally {
      busyIdsRef.current.delete(id);
      setBusyId(null);
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1160, margin: '0 auto', padding: '0 24px 60px' }}>
      <link href={fontImports} rel="stylesheet" />

      <style>{`
        @keyframes enr-row-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes enr-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .enr-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 700; margin: 0; }
        .enr-card { background: #fff; border-radius: 16px; border: 1px solid #EEF1F6; box-shadow: 0 4px 18px rgba(7,27,74,0.06); overflow: hidden; }
        .enr-tab { padding: 9px 18px; border-radius: 20px; border: 1px solid #E5E9F0; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .18s ease; background: #fff; color: #071B4A; }
        .enr-tab:hover { border-color: #FFB400; }
        .enr-tab.active { background: #071B4A; color: #fff; border-color: #071B4A; }
        .enr-table { width: 100%; border-collapse: collapse; }
        .enr-table thead th { text-align: left; font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.4px; color: #5A6A7A; font-weight: 700; padding: 14px 18px; background: #F8F9FB; border-bottom: 1px solid #EEF1F6; }
        .enr-row { animation: enr-row-in .35s ease backwards; cursor: pointer; transition: background .15s ease; }
        .enr-row:hover { background: #FAFBFD; }
        .enr-row td { padding: 14px 18px; font-size: 13.5px; color: #1A1A2E; border-bottom: 1px solid #F5F6F8; vertical-align: middle; }
        .enr-avatar { width: 34px; height: 34px; border-radius: 50%; background: #071B4A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; flex-shrink: 0; }
        .enr-chevron { display: inline-block; transition: transform .25s ease; color: #FFB400; }
        .enr-chevron.open { transform: rotate(180deg); }
        .enr-detail-wrap { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .3s ease; }
        .enr-detail-wrap.open { grid-template-rows: 1fr; }
        .enr-detail-inner { overflow: hidden; }
        .enr-doc-chip { display: inline-flex; align-items: center; gap: 6px; background: #F0F2F6; border-radius: 8px; padding: 6px 12px; font-size: 12.5px; color: #071B4A; text-decoration: none; font-weight: 600; transition: background .15s ease; }
        .enr-doc-chip:hover { background: #FFF3D6; }
        .enr-child-card { background: #FAFAFA; padding: '10px 12px'; border-radius: 8px; }
        .enr-btn-approve { background: #4C7C59; color: #fff; border: none; border-radius: 20px; padding: 9px 20px; font-weight: 600; font-size: 13.5px; cursor: pointer; transition: opacity .15s ease; }
        .enr-btn-approve:hover { opacity: 0.9; }
        .enr-btn-reject { background: #fff; color: #C0392B; border: 1px solid #C0392B; border-radius: 20px; padding: 9px 20px; font-weight: 600; font-size: 13.5px; cursor: pointer; transition: background .15s ease; }
        .enr-btn-reject:hover { background: #FAECE7; }
        .enr-pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: #FFB400; display: inline-block; animation: enr-pulse 1.6s ease-in-out infinite; margin-right: 6px; }
        .enr-skeleton { background: linear-gradient(90deg, #F0F2F6 25%, #F8F9FB 50%, #F0F2F6 75%); background-size: 200% 100%; animation: enr-shimmer 1.4s infinite; border-radius: 6px; }
        @keyframes enr-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div style={{ marginTop: 28, marginBottom: 24 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
          Chef d'établissement
        </span>
        <h1 className="enr-heading" style={{ fontSize: 30, margin: '6px 0 4px' }}>Demandes d'inscription</h1>
        <p style={{ color: '#5A6A7A', fontSize: 14, margin: 0 }}>
          Examinez et validez les inscriptions envoyées par les parents.
        </p>
      </div>

      {lastResult && (
        <div style={{ background: '#EAF3DE', border: '1px solid #C7E0AE', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontSize: 14, color: '#27500A' }}>
          <strong>Inscription approuvée.</strong> {lastResult.studentsCreated} élève{lastResult.studentsCreated > 1 ? 's' : ''} ajouté{lastResult.studentsCreated > 1 ? 's' : ''} et lié{lastResult.studentsCreated > 1 ? 's' : ''} au compte du parent.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key as any)}
            className={`enr-tab ${filter === t.key ? 'active' : ''}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="enr-card">
        <table className="enr-table">
          <thead>
            <tr>
              <th>Famille</th>
              <th>Contact</th>
              <th>Enfants</th>
              <th>Documents</th>
              <th>Date</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} style={{ padding: 24 }}>
                  <div className="enr-skeleton" style={{ height: 16, marginBottom: 10, width: '90%' }} />
                  <div className="enr-skeleton" style={{ height: 16, width: '70%' }} />
                </td>
              </tr>
            )}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '40px 18px', textAlign: 'center', color: '#5A6A7A', fontSize: 14 }}>
                  Aucune demande dans cette catégorie.
                </td>
              </tr>
            )}
            {!loading && requests.map((r, i) => {
              const isOpen = expandedId === r.id;
              const sc = statusStyle[r.status] ?? statusStyle.PENDING;
              return (
                <>
                  <tr
                    key={r.id}
                    className="enr-row"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => setExpandedId(isOpen ? null : r.id)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="enr-avatar">{initials(r.parentName)}</div>
                        <span style={{ fontWeight: 600, color: '#071B4A' }}>{r.parentName}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#5A6A7A' }}>{r.parentEmail}</div>
                      <div style={{ fontSize: 12.5, color: '#5A6A7A' }}>{r.parentPhone}</div>
                    </td>
                    <td>
                      {r.childrenJson.length} enfant{r.childrenJson.length > 1 ? 's' : ''}
                    </td>
                    <td>
                      {r.documents.length > 0 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: '#071B4A', fontWeight: 600 }}>
                          📎 {r.documents.length}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12.5, color: '#B0B8C4' }}>Aucun</span>
                      )}
                    </td>
                    <td style={{ fontSize: 12.5, color: '#5A6A7A' }}>
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '4px 12px', borderRadius: 12, background: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center' }}>
                        {r.status === 'PENDING' && <span className="enr-pulse-dot" />}
                        {sc.label}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`enr-chevron ${isOpen ? 'open' : ''}`}>▼</span>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={7} style={{ padding: 0, border: 'none' }}>
                      <div className={`enr-detail-wrap ${isOpen ? 'open' : ''}`}>
                        <div className="enr-detail-inner">
                          <div style={{ padding: '4px 24px 24px', background: '#FAFBFD' }}>
                            {r.medical && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11.5, color: '#5A6A7A', marginBottom: 4, fontWeight: 700, textTransform: 'uppercase' }}>
                                  Remarques médicales
                                </div>
                                <div style={{ fontSize: 13.5 }}>{r.medical}</div>
                              </div>
                            )}

                            <div style={{ fontSize: 11.5, color: '#5A6A7A', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
                              Enfants
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                              {r.childrenJson.map((c, ci) => (
                                <div key={ci} style={{ fontSize: 13.5, background: '#fff', border: '1px solid #EEF1F6', padding: '10px 14px', borderRadius: 8 }}>
                                  <div style={{ fontWeight: 600, color: '#071B4A' }}>
                                    {c.firstName} {c.lastName}
                                    {c.gender && <span style={{ fontWeight: 400, color: '#5A6A7A' }}> · {genderLabel[c.gender] ?? c.gender}</span>}
                                  </div>
                                  <div style={{ color: '#5A6A7A', fontSize: 12.5, marginTop: 2 }}>
                                    {c.age} ans · {classMap[c.classId] ?? 'Classe inconnue'}
                                    {c.previousSchool && ` · Ancienne école : ${c.previousSchool}`}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div style={{ fontSize: 11.5, color: '#5A6A7A', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase' }}>
                              Documents
                            </div>
                            {r.documents.length === 0 ? (
                              <p style={{ fontSize: 13, color: '#B0B8C4', marginBottom: 16 }}>Aucun document envoyé.</p>
                            ) : (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                {r.documents.map((doc, di) => (
                                  <a
                                    key={di}
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="enr-doc-chip"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {fileIcon(doc.name)} {doc.name}
                                  </a>
                                ))}
                              </div>
                            )}

                            {r.status === 'PENDING' && (
                              <div style={{ display: 'flex', gap: 10 }} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => approve(r.id)} disabled={busyId === r.id} className="enr-btn-approve">
                                  {busyId === r.id ? 'Traitement...' : 'Approuver'}
                                </button>
                                <button onClick={() => reject(r.id)} disabled={busyId === r.id} className="enr-btn-reject">
                                  Refuser
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}