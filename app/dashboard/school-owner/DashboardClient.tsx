'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reveal } from '@/lib/reveal';
import Sidebar from './Sidebar';
import ActionToast, { ToastData } from '@/app/components/ActionToast';

interface Teacher { id: string; username: string; email: string; createdAt: string; }
interface TrendPoint { label: string; revenue: number; students: number; }
interface HealthData { studentsNoClass: number; studentsNoParent: number; classesNoTeacher: number; }
interface ClassOption { id: string; name: string; }
interface AnnouncementItem { id: string; title: string; body: string; category: string; createdAt: string; }
interface EventItem { id: string; title: string; description: string | null; date: string; type: string; }
interface ConversationPreview { id: string; otherName: string; otherRole: string; lastMessage: string | null; unreadCount: number; }

interface Props {
  schoolName: string;
  ownerName: string;
  teacherCount: number;
  studentCount: number;
  pendingEnrollments: number;
  recentTeachers: Teacher[];
  revenueCollected: number;
  unpaidCount: number;
  trend: TrendPoint[];
  invoiceStatusBreakdown: Record<string, number>;
  health: HealthData;
  classes: ClassOption[];
  announcements: AnnouncementItem[];
  upcomingEvents: EventItem[];
  conversations: ConversationPreview[];
}

const fontImports =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap";

const categoryColor: Record<string, string> = { ANNOUNCEMENT: '#FFB400', ACHIEVEMENT: '#4C7C59', POLICY: '#071B4A' };
const categoryLabel: Record<string, string> = { ANNOUNCEMENT: 'Annonce', ACHIEVEMENT: 'Réussite', POLICY: 'Politique' };
const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
};
const roleLabel: Record<string, string> = { TEACHER: 'Enseignant', PARENT: 'Parent', SCHOOL_OWNER: "Chef d'établissement" };

function TrendChart({ trend }: { trend: TrendPoint[] }) {
  const w = 560, h = 190, pad = 28;
  const maxRevenue = Math.max(...trend.map((t) => t.revenue), 1);
  const maxStudents = Math.max(...trend.map((t) => t.students), 1);
  const stepX = (w - pad * 2) / (trend.length - 1 || 1);

  const revenuePoints = trend.map((t, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (t.revenue / maxRevenue) * (h - pad * 2);
    return `${x},${y}`;
  });
  const studentPoints = trend.map((t, i) => {
    const x = pad + i * stepX;
    const y = h - pad - (t.students / maxStudents) * (h - pad * 2);
    return `${x},${y}`;
  });

  const areaPath = `M${pad},${h - pad} L${revenuePoints.join(' L')} L${pad + (trend.length - 1) * stepX},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB400" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFB400" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h - pad - f * (h - pad * 2)} y2={h - pad - f * (h - pad * 2)} stroke="#E5E9F0" strokeWidth="1" />
      ))}
      <path d={areaPath} fill="url(#revFill)" style={{ transition: 'd .4s ease' }} />
      <polyline points={revenuePoints.join(' ')} fill="none" stroke="#FFB400" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={studentPoints.join(' ')} fill="none" stroke="#071B4A" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" strokeLinejoin="round" />
      {trend.map((t, i) => {
        const x = pad + i * stepX;
        const yRev = h - pad - (t.revenue / maxRevenue) * (h - pad * 2);
        return (
          <g key={t.label}>
            <circle cx={x} cy={yRev} r="3.5" fill="#FFB400" stroke="#fff" strokeWidth="1.5" />
            <text x={x} y={h - 6} textAnchor="middle" fontSize="10.5" fill="#5A6A7A" fontFamily="Inter, sans-serif">{t.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function StatusBar({ breakdown }: { breakdown: Record<string, number> }) {
  const total = (breakdown.PAID ?? 0) + (breakdown.PENDING ?? 0) + (breakdown.OVERDUE ?? 0);
  const segments = [
    { key: 'PAID', label: 'Payées', color: '#3ED598', value: breakdown.PAID ?? 0 },
    { key: 'PENDING', label: 'En attente', color: '#FFB400', value: breakdown.PENDING ?? 0 },
    { key: 'OVERDUE', label: 'En retard', color: '#C0392B', value: breakdown.OVERDUE ?? 0 },
  ];
  return (
    <div>
      <div style={{ display: 'flex', height: 12, borderRadius: 8, overflow: 'hidden', background: '#F0F2F6' }}>
        {segments.map((s) => (
          <div key={s.key} style={{ width: total ? `${(s.value / total) * 100}%` : 0, background: s.color, transition: 'width .5s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
        {segments.map((s) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#5A6A7A' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
            {s.label} <strong style={{ color: '#071B4A' }}>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SchoolOwnerDashboardClient({
  schoolName, ownerName, teacherCount, studentCount, pendingEnrollments, recentTeachers,
  revenueCollected, unpaidCount, trend, invoiceStatusBreakdown, health, classes,
  announcements, upcomingEvents, conversations,
}: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);

  const [showAnnForm, setShowAnnForm] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annCategory, setAnnCategory] = useState('ANNOUNCEMENT');
  const [savingAnn, setSavingAnn] = useState(false);

  const [showEvForm, setShowEvForm] = useState(false);
  const [evTitle, setEvTitle] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evType, setEvType] = useState('EVENT');
  const [evClassId, setEvClassId] = useState('');
  const [savingEv, setSavingEv] = useState(false);

  const totalHealthIssues = health.studentsNoClass + health.studentsNoParent + health.classesNoTeacher;

  const submitAnnouncement = async () => {
    if (!annTitle || !annBody) {
      setToast({ title: 'Champs manquants', message: 'Titre et contenu sont requis.', emoji: '⚠️', tone: 'error' });
      return;
    }
    setSavingAnn(true);
    const res = await fetch('/api/school-owner/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: annTitle, body: annBody, category: annCategory }),
    });
    const data = await res.json();
    setSavingAnn(false);
    if (res.ok) {
      setToast({ title: 'Annonce publiée', message: `« ${annTitle} » est maintenant visible par les parents et enseignants.`, emoji: '📢', tone: 'success' });
      setAnnTitle(''); setAnnBody(''); setShowAnnForm(false);
      router.refresh();
    } else {
      setToast({ title: 'Échec', message: data.error, emoji: '⚠️', tone: 'error' });
    }
  };

  const submitEvent = async () => {
    if (!evTitle || !evDate) {
      setToast({ title: 'Champs manquants', message: 'Titre et date sont requis.', emoji: '⚠️', tone: 'error' });
      return;
    }
    setSavingEv(true);
    const res = await fetch('/api/school-owner/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: evTitle, description: evDesc, date: evDate, type: evType, classId: evClassId || null }),
    });
    const data = await res.json();
    setSavingEv(false);
    if (res.ok) {
      const typeInfo = eventTypeLabel[evType];
      setToast({ title: 'Événement ajouté', message: `« ${evTitle} » (${typeInfo.label}) est visible dans le calendrier.`, emoji: typeInfo.emoji, tone: 'success' });
      setEvTitle(''); setEvDesc(''); setEvDate(''); setEvClassId(''); setShowEvForm(false);
      router.refresh();
    } else {
      setToast({ title: 'Échec', message: data.error, emoji: '⚠️', tone: 'error' });
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F8FB', fontFamily: 'Inter, sans-serif' }}>
      <link href={fontImports} rel="stylesheet" />
      <Sidebar schoolName={schoolName} />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .so-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 18px rgba(7,27,74,0.06); border: 1px solid #EEF1F6; }
        .so-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 700; margin: 0; }
        .so-stat-value { font-family: 'Fraunces', serif; font-weight: 700; color: #071B4A; line-height: 1; }
        .so-stat-card { position: relative; overflow: hidden; padding: 22px 20px; transition: transform .25s ease, box-shadow .25s ease; }
        .so-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(7,27,74,0.12); }
        .so-stat-card::after { content: ''; position: absolute; top: -30px; right: -30px; width: 90px; height: 90px; border-radius: 50%; background: rgba(255,180,0,0.08); }
        .so-link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; padding-bottom: 1px; background: none; border-left: none; border-right: none; border-top: none; cursor: pointer; padding: 0 0 1px; }
        .so-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background: #FFF3D6; color: #8A5A00; letter-spacing: 0.3px; }
        .so-action { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        .so-action:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(7,27,74,0.1); }
        .so-action .label { font-weight: 700; color: #071B4A; font-size: 14px; }
        .so-action .sub { font-size: 12px; color: #5A6A7A; }
        @keyframes so-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        .so-pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFB400; display: inline-block; animation: so-pulse 1.6s ease-in-out infinite; }
        .so-input { padding: 9px 12px; border-radius: 8px; border: 1px solid #DCE1E8; font-size: 13px; outline: none; width: 100%; font-family: 'Inter', sans-serif; }
        .so-btn { background: #FFB400; color: #071B4A; border: none; border-radius: 20px; padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; }
      `}</style>

      <div style={{ flex: 1, maxWidth: 1120, margin: '0 auto', padding: '0 24px 60px', width: '100%' }}>
        <Reveal>
          <div style={{ marginTop: 28, marginBottom: 28 }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
              Tableau de bord — Chef d'établissement
            </span>
            <h1 className="so-heading" style={{ fontSize: 34, margin: '6px 0 4px' }}>{schoolName}</h1>
            <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Bienvenue, {ownerName}. Voici un aperçu détaillé de votre établissement.</p>
          </div>
        </Reveal>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
          <Reveal delay={0.0}>
            <div className="so-card so-stat-card">
              <div className="so-stat-value" style={{ fontSize: 30 }}>{teacherCount}</div>
              <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Enseignants</div>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="so-card so-stat-card">
              <div className="so-stat-value" style={{ fontSize: 30 }}>{studentCount}</div>
              <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Élèves inscrits</div>
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="so-card so-stat-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="so-stat-value" style={{ fontSize: 30 }}>{pendingEnrollments}</div>
                {pendingEnrollments > 0 && <span className="so-pulse-dot" />}
              </div>
              <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Demandes en attente</div>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="so-card so-stat-card">
              <div className="so-stat-value" style={{ fontSize: 30 }}>{revenueCollected.toLocaleString('fr-FR')} DT</div>
              <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Revenus encaissés</div>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="so-card so-stat-card">
              <div className="so-stat-value" style={{ fontSize: 30, color: unpaidCount > 0 ? '#C0392B' : '#071B4A' }}>{unpaidCount}</div>
              <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Factures impayées</div>
            </div>
          </Reveal>
        </div>

        {pendingEnrollments > 0 && (
          <Reveal delay={0.1}>
            <div className="so-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', marginBottom: 20, borderLeft: '4px solid #FFB400' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="so-pulse-dot" />
                <div>
                  <div style={{ fontWeight: 700, color: '#071B4A', fontSize: 15 }}>
                    {pendingEnrollments} demande{pendingEnrollments > 1 ? 's' : ''} d'inscription à examiner
                  </div>
                  <div style={{ fontSize: 13, color: '#5A6A7A' }}>Des familles attendent une réponse pour rejoindre {schoolName}.</div>
                </div>
              </div>
              <Link href="/dashboard/school-owner/enrollments" style={{ background: '#071B4A', color: '#fff', padding: '9px 20px', borderRadius: 20, fontSize: 13, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Examiner →
              </Link>
            </div>
          </Reveal>
        )}

        {/* Data health */}
        <Reveal delay={0.1}>
          <div
            className="so-card"
            style={{
              padding: '18px 24px', marginBottom: 20,
              borderLeft: `4px solid ${totalHealthIssues > 0 ? '#C0392B' : '#4C7C59'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: totalHealthIssues > 0 ? 10 : 0 }}>
              <span style={{ fontSize: 18 }}>{totalHealthIssues > 0 ? '⚠️' : '✅'}</span>
              <strong style={{ color: '#071B4A', fontSize: 15 }}>
                {totalHealthIssues > 0 ? `${totalHealthIssues} élément(s) à corriger` : 'Tout est en ordre'}
              </strong>
            </div>
            {totalHealthIssues > 0 && (
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                {health.studentsNoClass > 0 && (
                  <Link href="/dashboard/school-owner/students" style={{ color: '#C0392B', textDecoration: 'underline' }}>
                    {health.studentsNoClass} élève{health.studentsNoClass > 1 ? 's' : ''} sans classe assignée
                  </Link>
                )}
                {health.classesNoTeacher > 0 && (
                  <Link href="/dashboard/school-owner/classes" style={{ color: '#C0392B', textDecoration: 'underline' }}>
                    {health.classesNoTeacher} classe{health.classesNoTeacher > 1 ? 's' : ''} sans enseignant
                  </Link>
                )}
                {health.studentsNoParent > 0 && (
                  <Link href="/dashboard/school-owner/students" style={{ color: '#C0392B', textDecoration: 'underline' }}>
                    {health.studentsNoParent} élève{health.studentsNoParent > 1 ? 's' : ''} sans parent lié
                  </Link>
                )}
              </div>
            )}
          </div>
        </Reveal>

        {/* Chart section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16, marginBottom: 20 }}>
          <Reveal delay={0.1}>
            <div className="so-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <h2 className="so-heading" style={{ fontSize: 17 }}>Tendance sur 6 mois</h2>
                <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: '#5A6A7A' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2.5, background: '#FFB400', display: 'inline-block' }} /> Revenus</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2.5, background: '#071B4A', display: 'inline-block' }} /> Inscriptions</span>
                </div>
              </div>
              <TrendChart trend={trend} />
            </div>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="so-card" style={{ padding: 24 }}>
              <h2 className="so-heading" style={{ fontSize: 17, marginBottom: 16 }}>État des factures</h2>
              <StatusBar breakdown={invoiceStatusBreakdown} />
            </div>
          </Reveal>
        </div>

        {/* Announcements + Events */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <Reveal delay={0.1}>
            <div className="so-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="so-heading" style={{ fontSize: 17 }}>Annonces</h2>
                <button className="so-link-btn" onClick={() => setShowAnnForm((s) => !s)}>
                  {showAnnForm ? 'Annuler' : '+ Publier'}
                </button>
              </div>

              {showAnnForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
                  <input placeholder="Titre" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} className="so-input" />
                  <textarea placeholder="Contenu" value={annBody} onChange={(e) => setAnnBody(e.target.value)} rows={3} className="so-input" />
                  <select value={annCategory} onChange={(e) => setAnnCategory(e.target.value)} className="so-input">
                    <option value="ANNOUNCEMENT">Annonce</option>
                    <option value="ACHIEVEMENT">Réussite</option>
                    <option value="POLICY">Politique</option>
                  </select>
                  <button onClick={submitAnnouncement} disabled={savingAnn} className="so-btn">
                    {savingAnn ? '...' : 'Publier'}
                  </button>
                </div>
              )}

              {announcements.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune annonce pour le moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {announcements.map((a) => (
                    <div key={a.id} style={{ borderLeft: `3px solid ${categoryColor[a.category] ?? '#071B4A'}`, paddingLeft: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: categoryColor[a.category] ?? '#071B4A' }}>{categoryLabel[a.category] ?? a.category}</span>
                        <span style={{ fontSize: 11, color: '#5A6A7A' }}>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#1A1A2E' }}>{a.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="so-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="so-heading" style={{ fontSize: 17 }}>Événements à venir</h2>
                <button className="so-link-btn" onClick={() => setShowEvForm((s) => !s)}>
                  {showEvForm ? 'Annuler' : '+ Ajouter'}
                </button>
              </div>

              {showEvForm && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
                  <input placeholder="Titre" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} className="so-input" />
                  <textarea placeholder="Description (optionnel)" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={2} className="so-input" />
                  <select value={evType} onChange={(e) => setEvType(e.target.value)} className="so-input">
                    {Object.entries(eventTypeLabel).map(([key, v]) => <option key={key} value={key}>{v.emoji} {v.label}</option>)}
                  </select>
                  <select value={evClassId} onChange={(e) => setEvClassId(e.target.value)} className="so-input">
                    <option value="">Toute l'école</option>
                    {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="so-input" />
                  <button onClick={submitEvent} disabled={savingEv} className="so-btn">
                    {savingEv ? '...' : 'Ajouter au calendrier'}
                  </button>
                </div>
              )}

              {upcomingEvents.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun événement à venir.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {upcomingEvents.map((e) => {
                    const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                    return (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{et.emoji} {e.title}</span>
                          <div style={{ fontSize: 11, color: '#5A6A7A' }}>{new Date(e.date).toLocaleDateString('fr-FR')}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: et.color }}>{et.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        {/* Recent teachers + Messages */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          <Reveal delay={0.1}>
            <div className="so-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="so-heading" style={{ fontSize: 17 }}>Enseignants récents</h2>
                <Link href="/dashboard/school-owner/teachers" className="so-link-btn">Voir tous →</Link>
              </div>
              {recentTeachers.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun enseignant pour le moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {recentTeachers.map((t, i) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < recentTeachers.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#071B4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                          {t.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5, color: '#071B4A' }}>{t.username}</div>
                          <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{t.email}</div>
                        </div>
                      </div>
                      <span className="so-pill">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="so-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="so-heading" style={{ fontSize: 17 }}>Messages</h2>
                <Link href="/dashboard/messages" className="so-link-btn">Boîte de réception →</Link>
              </div>
              {conversations.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune conversation pour le moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {conversations.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 10, borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#071B4A' }}>
                          {c.otherName}
                          {c.unreadCount > 0 && (
                            <span style={{ marginLeft: 6, fontSize: 10.5, background: '#FFB400', color: '#071B4A', padding: '1px 7px', borderRadius: 8, fontWeight: 700 }}>
                              {c.unreadCount}
                            </span>
                          )}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</p>
                      </div>
                      {c.lastMessage && (
                        <span style={{ fontSize: 11.5, color: '#5A6A7A', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <h2 className="so-heading" style={{ fontSize: 18, marginBottom: 14 }}>Actions rapides</h2>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { href: '/dashboard/school-owner/teachers/new', label: 'Ajouter un enseignant', sub: 'Créer un compte enseignant' },
            { href: '/dashboard/school-owner/enrollments', label: "Demandes d'inscription", sub: `${pendingEnrollments} en attente` },
            { href: '/dashboard/school-owner/students', label: 'Élèves', sub: `${studentCount} inscrits` },
            { href: '/dashboard/school-owner/payments', label: 'Paiements', sub: `${unpaidCount} factures à suivre` },
            { href: '/dashboard/messages', label: 'Messagerie', sub: 'Contacter parents et enseignants' },
            { href: '/dashboard/school-owner/classes', label: 'Classes', sub: "Gérer les classes de l'école" },
          ].map((a, i) => (
            <Reveal key={a.href} delay={0.05 * i}>
              <Link href={a.href} className="so-card so-action">
                <span className="label">{a.label}</span>
                <span className="sub">{a.sub}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}