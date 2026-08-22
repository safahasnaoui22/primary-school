'use client';

import Link from 'next/link';
import { Reveal } from '@/lib/reveal';
import Sidebar from './Sidebar';

interface Teacher {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}
interface TrendPoint {
  label: string;
  revenue: number;
  students: number;
}
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
}

const fontImports =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap";

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
          <div
            key={s.key}
            style={{
              width: total ? `${(s.value / total) * 100}%` : 0,
              background: s.color,
              transition: 'width .5s ease',
            }}
          />
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
  schoolName,
  ownerName,
  teacherCount,
  studentCount,
  pendingEnrollments,
  recentTeachers,
  revenueCollected,
  unpaidCount,
  trend,
  invoiceStatusBreakdown,
}: Props) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F8FB', fontFamily: 'Inter, sans-serif' }}>
      <link href={fontImports} rel="stylesheet" />
      <Sidebar schoolName={schoolName} />

      <style>{`
        .so-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(7,27,74,0.06);
          border: 1px solid #EEF1F6;
        }
        .so-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 700; margin: 0; }
        .so-stat-value { font-family: 'Fraunces', serif; font-weight: 700; color: #071B4A; line-height: 1; }
        .so-stat-card { position: relative; overflow: hidden; padding: 22px 20px; transition: transform .25s ease, box-shadow .25s ease; }
        .so-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 28px rgba(7,27,74,0.12); }
        .so-stat-card::after { content: ''; position: absolute; top: -30px; right: -30px; width: 90px; height: 90px; border-radius: 50%; background: rgba(255,180,0,0.08); }
        .so-link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; padding-bottom: 1px; }
        .so-pill { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 12px; background: #FFF3D6; color: #8A5A00; letter-spacing: 0.3px; }
        .so-action { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        .so-action:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(7,27,74,0.1); }
        .so-action .label { font-weight: 700; color: #071B4A; font-size: 14px; }
        .so-action .sub { font-size: 12px; color: #5A6A7A; }
        @keyframes so-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.55; } }
        .so-pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #FFB400; display: inline-block; animation: so-pulse 1.6s ease-in-out infinite; }
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
            <div className="so-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', marginBottom: 24, borderLeft: '4px solid #FFB400' }}>
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

        {/* Chart section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.6fr) minmax(0,1fr)', gap: 16, marginBottom: 24 }}>
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

        {/* Recent teachers */}
        <Reveal delay={0.1}>
          <div className="so-card" style={{ padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="so-heading" style={{ fontSize: 18 }}>Enseignants récents</h2>
              <Link href="/dashboard/school-owner/teachers" className="so-link-btn">Voir tous →</Link>
            </div>
            {recentTeachers.length === 0 ? (
              <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun enseignant pour le moment. Ajoutez votre premier enseignant pour commencer.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentTeachers.map((t, i) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < recentTeachers.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#071B4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>
                        {t.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#071B4A' }}>{t.username}</div>
                        <div style={{ fontSize: 12, color: '#5A6A7A' }}>{t.email}</div>
                      </div>
                    </div>
                    <span className="so-pill">{new Date(t.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Reveal>

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