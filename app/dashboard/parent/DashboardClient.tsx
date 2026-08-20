'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Subject {
  name: string;
  grade: string;
  trend: 'up' | 'down' | 'flat';
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  teacherName: string;
  createdAt: string;
}

interface ChildData {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  teacherName: string | null;
  teacherId: string | null;
  attendancePct: number | null;
  attendanceLast10: string[];
  subjects: Subject[];
  resources: Resource[];
}

interface ConversationPreview {
  id: string;
  otherName: string;
  otherRole: string;
  lastMessage: string | null;
}

interface AnnouncementPreview {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

interface InvoicePreview {
  amount: number;
  dueDate: string;
  status: string;
}

interface Props {
  parentName: string;
  children: ChildData[];
  pendingEnrollment: boolean;
  conversations: ConversationPreview[];
  unreadCount: number;
  announcements: AnnouncementPreview[];
  invoice: InvoicePreview | null;
}

const categoryColor: Record<string, string> = {
  ANNOUNCEMENT: '#FFB400',
  ACHIEVEMENT: '#4C7C59',
  POLICY: '#071B4A',
};

const categoryLabel: Record<string, string> = {
  ANNOUNCEMENT: 'Annonce',
  ACHIEVEMENT: 'Réussite',
  POLICY: 'Politique',
};

const roleLabel: Record<string, string> = {
  SCHOOL_OWNER: "Chef d'établissement",
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
};

function gradeColor(grade: string) {
  const letter = grade[0];
  if (letter === 'A') return { bg: '#EAF3DE', text: '#27500A' };
  if (letter === 'B') return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

function TrendIcon({ trend }: { trend: Subject['trend'] }) {
  if (trend === 'up') return <span style={{ color: '#4C7C59' }}>&#8593;</span>;
  if (trend === 'down') return <span style={{ color: '#C0392B' }}>&#8595;</span>;
  return <span style={{ color: '#5A6A7A' }}>&#8212;</span>;
}

function AttendanceDot({ status }: { status: string }) {
  const color = status === 'present' ? '#4C7C59' : status === 'late' ? '#FFB400' : '#C0392B';
  return <span title={status} style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />;
}

export default function ParentDashboardClient({
  parentName,
  children,
  pendingEnrollment,
  conversations,
  unreadCount,
  announcements,
  invoice,
}: Props) {
  const [activeChildId, setActiveChildId] = useState(children[0]?.id ?? null);
  const child = children.find((c) => c.id === activeChildId) ?? null;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .pd-card { background: #fff; border-radius: 14px; padding: 22px 24px; box-shadow: 0 3px 12px rgba(7,27,74,0.06); }
        .pd-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 600; margin: 0; }
        .pd-link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; padding-bottom: 1px; }
        .pd-folder-tab { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; padding: 10px 20px 12px; border: none; cursor: pointer; border-radius: 10px 10px 0 0; background: #E4D3B4; color: #071B4A; opacity: 0.65; display: flex; align-items: center; gap: 8px; }
        .pd-folder-tab.active { background: #fff; opacity: 1; box-shadow: 0 -3px 10px rgba(7,27,74,0.06); }
        .pd-avatar { width: 28px; height: 28px; border-radius: 50%; background: #071B4A; color: #fff; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; }
        .pd-quick-grid a { display: flex; flex-direction: column; gap: 4px; background: #fff; border-radius: 12px; padding: 16px 18px; text-decoration: none; box-shadow: 0 3px 10px rgba(7,27,74,0.06); transition: transform .2s ease; }
        .pd-quick-grid a:hover { transform: translateY(-3px); }
        .pd-quick-grid a .label { font-weight: 600; color: #071B4A; font-size: 14px; }
        .pd-quick-grid a .sub { font-size: 12px; color: #5A6A7A; }
        .pd-resource-item { padding: 10px 0; border-bottom: 1px solid #F0F0F0; }
        .pd-resource-item:last-child { border-bottom: none; }
      `}</style>

      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
            Espace parent
          </span>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#071B4A', fontSize: 32, margin: '6px 0 4px' }}>
            Bienvenue, {parentName}
          </h1>
          <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Voici un aperçu de la scolarité de vos enfants.</p>
        </div>
        <Link
          href="/dashboard/parent/enroll"
          style={{ background: '#FFB400', color: '#071B4A', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
        >
          + Inscrire un enfant
        </Link>
      </div>

      {pendingEnrollment && (
        <div style={{ background: '#FFF3D6', border: '1px solid #FFE0A0', borderRadius: 10, padding: '12px 18px', marginTop: 16, fontSize: 14, color: '#8A5A00' }}>
          Une demande d'inscription est en cours d'examen par l'école.
        </div>
      )}

      {children.length === 0 ? (
        <div className="pd-card" style={{ marginTop: 24, textAlign: 'center', padding: 48 }}>
          <p style={{ color: '#5A6A7A', fontSize: 15, marginBottom: 16 }}>
            Aucun enfant n'est encore lié à votre compte.
          </p>
          <Link
            href="/dashboard/parent/enroll"
            style={{ background: '#071B4A', color: '#fff', padding: '10px 24px', borderRadius: 20, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}
          >
            Inscrire mon premier enfant
          </Link>
        </div>
      ) : (
        <>
          {children.length > 1 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
              {children.map((c) => (
                <button
                  key={c.id}
                  className={`pd-folder-tab ${c.id === activeChildId ? 'active' : ''}`}
                  onClick={() => setActiveChildId(c.id)}
                >
                  <span className="pd-avatar" style={{ background: c.id === activeChildId ? '#FFB400' : '#071B4A', color: c.id === activeChildId ? '#071B4A' : '#fff' }}>
                    {c.firstName[0]}{c.lastName[0]}
                  </span>
                  {c.firstName}
                </button>
              ))}
            </div>
          )}

          {child && (
            <div className="pd-card" style={{ borderRadius: children.length > 1 ? '0 12px 12px 12px' : 12, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="pd-avatar" style={{ width: 52, height: 52, fontSize: 18, background: '#071B4A' }}>
                    {child.firstName[0]}{child.lastName[0]}
                  </div>
                  <div>
                    <h2 className="pd-heading" style={{ fontSize: 20 }}>{child.firstName} {child.lastName}</h2>
                    <p style={{ color: '#5A6A7A', fontSize: 14, margin: '2px 0 0' }}>
                      {child.className}{child.teacherName ? ` · ${child.teacherName}` : ''}
                    </p>
                  </div>
                </div>
                {child.teacherId && (
                  <Link href="/dashboard/messages" className="pd-link-btn">
                    Message {child.teacherName} →
                  </Link>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      Assiduité — 10 derniers jours
                    </h3>
                    {child.attendancePct !== null && (
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#4C7C59' }}>
                        {child.attendancePct}% ce trimestre
                      </span>
                    )}
                  </div>
                  {child.attendanceLast10.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune donnée d'assiduité pour le moment.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {child.attendanceLast10.map((s, i) => (
                          <AttendanceDot key={i} status={s} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: '#5A6A7A' }}>
                        <span><AttendanceDot status="present" /> Présent</span>
                        <span><AttendanceDot status="late" /> Retard</span>
                        <span><AttendanceDot status="absent" /> Absent</span>
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Ressources de classe
                  </h3>
                  {child.resources.length === 0 ? (
                    <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune ressource publiée pour le moment.</p>
                  ) : (
                    <div>
                      {child.resources.map((r) => (
                        <div key={r.id} className="pd-resource-item">
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{r.title}</span>
                            {r.fileUrl && (
                              <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#FFB400', fontWeight: 600 }}>
                                Ouvrir →
                              </a>
                            )}
                          </div>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#5A6A7A' }}>
                            {r.teacherName} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F0F0F0', marginTop: 22, paddingTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Notes
                  </h3>
                </div>
                {child.subjects.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune note enregistrée pour le moment.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {child.subjects.map((s) => {
                      const c = gradeColor(s.grade);
                      return (
                        <div key={s.name} style={{ background: '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>{s.name}</span>
                            <TrendIcon trend={s.trend} />
                          </div>
                          <span style={{ display: 'inline-block', marginTop: 6, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 13, padding: '2px 10px', borderRadius: 8, background: c.bg, color: c.text }}>
                            {s.grade}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20, marginTop: children.length === 0 ? 20 : 0 }}>
        <div className="pd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 className="pd-heading" style={{ fontSize: 17 }}>Frais de scolarité</h2>
            <Link href="/dashboard/parent/payments" className="pd-link-btn">Historique →</Link>
          </div>
          {invoice ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, color: '#071B4A' }}>
                  {invoice.amount.toLocaleString('fr-FR')} DT
                </span>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 10, background: invoice.status === 'OVERDUE' ? '#FAECE7' : '#FAEEDA', color: invoice.status === 'OVERDUE' ? '#712B13' : '#633806' }}>
                  {invoice.status === 'OVERDUE' ? 'En retard' : 'Échéance'} {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <Link href="/dashboard/parent/payments" style={{ display: 'inline-block', marginTop: 16, background: '#FFB400', color: '#071B4A', padding: '9px 20px', borderRadius: 20, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                Payer maintenant
              </Link>
            </>
          ) : (
            <p style={{ color: '#4C7C59', fontSize: 14, fontWeight: 500 }}>Tous les frais sont réglés.</p>
          )}
        </div>

        <div className="pd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 className="pd-heading" style={{ fontSize: 17 }}>
              Messages {unreadCount > 0 && (
                <span style={{ fontSize: 12, background: '#FFB400', color: '#071B4A', padding: '2px 8px', borderRadius: 10, marginLeft: 6, verticalAlign: 2 }}>
                  {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
                </span>
              )}
            </h2>
            <Link href="/dashboard/messages" className="pd-link-btn">Boîte de réception →</Link>
          </div>
          {conversations.length === 0 ? (
            <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucune conversation pour le moment.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {conversations.map((c) => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 10, borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</p>
                  </div>
                  {c.lastMessage && (
                    <span style={{ fontSize: 12, color: '#5A6A7A', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lastMessage}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pd-card" style={{ marginBottom: 28 }}>
        <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 14 }}>Annonces de l'école</h2>
        {announcements.length === 0 ? (
          <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucune annonce pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map((a) => (
              <div key={a.id} style={{ borderLeft: `3px solid ${categoryColor[a.category] ?? '#071B4A'}`, paddingLeft: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: categoryColor[a.category] ?? '#071B4A' }}>
                    {categoryLabel[a.category] ?? a.category}
                  </span>
                  <span style={{ fontSize: 11, color: '#5A6A7A', fontFamily: "'IBM Plex Mono', monospace" }}>
                    {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#1A1A2E' }}>{a.title}</p>
              </div>
            ))}
          </div>
        )}
        <Link href="/news-events" className="pd-link-btn" style={{ display: 'inline-block', marginTop: 14 }}>
          Voir toutes les actualités →
        </Link>
      </div>

      <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 12 }}>Actions rapides</h2>
      <div className="pd-quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
        <Link href="/dashboard/parent/enroll">
          <span className="label">Inscrire un enfant</span>
          <span className="sub">Nouvelle demande d'inscription</span>
        </Link>
        <Link href="/dashboard/messages">
          <span className="label">Message à un enseignant</span>
          <span className="sub">Démarrer une conversation</span>
        </Link>
        <Link href="/dashboard/parent/payments">
          <span className="label">Payer les frais</span>
          <span className="sub">Voir les factures et payer en ligne</span>
        </Link>
        <Link href="/dashboard/parent/classroom">
          <span className="label">ClassRoom</span>
          <span className="sub">classroom</span>
        </Link>
      </div>
    </div>
  );
}