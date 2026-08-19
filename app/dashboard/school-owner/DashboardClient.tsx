'use client';

import Link from 'next/link';
import { Reveal } from '@/lib/reveal';

interface Teacher {
  id: string;
  username: string;
  email: string;
  createdAt: string;
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
}

const fontImports =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap";

export default function SchoolOwnerDashboardClient({
  schoolName,
  ownerName,
  teacherCount,
  studentCount,
  pendingEnrollments,
  recentTeachers,
  revenueCollected,
  unpaidCount,
}: Props) {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', fontFamily: 'Inter, sans-serif', paddingBottom: 60 }}>
      <link href={fontImports} rel="stylesheet" />

      <style>{`
        .so-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(7,27,74,0.06);
          border: 1px solid #EEF1F6;
        }
        .so-heading {
          font-family: 'Fraunces', serif;
          color: #071B4A;
          font-weight: 700;
          margin: 0;
        }
        .so-stat-value {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          color: #071B4A;
          line-height: 1;
        }
        .so-stat-card {
          position: relative;
          overflow: hidden;
          padding: 22px 20px;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .so-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(7,27,74,0.12);
        }
        .so-stat-card::after {
          content: '';
          position: absolute;
          top: -30px;
          right: -30px;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: rgba(255,180,0,0.08);
        }
        .so-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #071B4A;
          text-decoration: none;
          border-bottom: 1px solid #FFB400;
          padding-bottom: 1px;
        }
        .so-pill {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 12px;
          background: #FFF3D6;
          color: #8A5A00;
          letter-spacing: 0.3px;
        }
        .so-action {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 20px;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .so-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(7,27,74,0.1);
        }
        .so-action .label { font-weight: 700; color: #071B4A; font-size: 14px; }
        .so-action .sub { font-size: 12px; color: #5A6A7A; }
        @keyframes so-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .so-pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #FFB400; display: inline-block;
          animation: so-pulse 1.6s ease-in-out infinite;
        }
      `}</style>

      <Reveal>
        <div style={{ marginTop: 8, marginBottom: 28 }}>
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              letterSpacing: 1.5,
              color: '#5A6A7A',
              textTransform: 'uppercase',
            }}
          >
            Tableau de bord — Chef d'établissement
          </span>
          <h1 className="so-heading" style={{ fontSize: 34, margin: '6px 0 4px' }}>
            {schoolName}
          </h1>
          <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>
            Bienvenue, {ownerName}. Voici un aperçu détaillé de votre établissement.
          </p>
        </div>
      </Reveal>

      {/* Stat cards — staggered fade-in */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
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
            <div className="so-stat-value" style={{ fontSize: 30, color: unpaidCount > 0 ? '#C0392B' : '#071B4A' }}>
              {unpaidCount}
            </div>
            <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Factures impayées</div>
          </div>
        </Reveal>
      </div>

      {/* Pending enrollments callout */}
      {pendingEnrollments > 0 && (
        <Reveal delay={0.1}>
          <div
            className="so-card"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 24px',
              marginBottom: 28,
              borderLeft: '4px solid #FFB400',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="so-pulse-dot" />
              <div>
                <div style={{ fontWeight: 700, color: '#071B4A', fontSize: 15 }}>
                  {pendingEnrollments} demande{pendingEnrollments > 1 ? 's' : ''} d'inscription à examiner
                </div>
                <div style={{ fontSize: 13, color: '#5A6A7A' }}>
                  Des familles attendent une réponse pour rejoindre {schoolName}.
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/school-owner/enrollments"
              style={{
                background: '#071B4A',
                color: '#fff',
                padding: '9px 20px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Examiner →
            </Link>
          </div>
        </Reveal>
      )}

      {/* Recent teachers */}
      <Reveal delay={0.1}>
        <div className="so-card" style={{ padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="so-heading" style={{ fontSize: 18 }}>Enseignants récents</h2>
            <Link href="/dashboard/school-owner/teachers" className="so-link-btn">
              Voir tous →
            </Link>
          </div>

          {recentTeachers.length === 0 ? (
            <p style={{ color: '#5A6A7A', fontSize: 14 }}>
              Aucun enseignant pour le moment. Ajoutez votre premier enseignant pour commencer.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {recentTeachers.map((t, i) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 0',
                    borderBottom: i < recentTeachers.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: '#071B4A',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {t.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#071B4A' }}>{t.username}</div>
                      <div style={{ fontSize: 12, color: '#5A6A7A' }}>{t.email}</div>
                    </div>
                  </div>
                  <span className="so-pill">
                    {new Date(t.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      {/* Quick actions grid */}
      <Reveal delay={0.1}>
        <h2 className="so-heading" style={{ fontSize: 18, marginBottom: 14 }}>Actions rapides</h2>
      </Reveal>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
        }}
      >
        {[
          { href: '/dashboard/school-owner/teachers/new', label: 'Ajouter un enseignant', sub: 'Créer un compte enseignant' },
          { href: '/dashboard/school-owner/enrollments', label: "Demandes d'inscription", sub: `${pendingEnrollments} en attente` },
          { href: '/dashboard/school-owner/students', label: 'Élèves', sub: `${studentCount} inscrits` },
          { href: '/dashboard/school-owner/payments', label: 'Paiements', sub: `${unpaidCount} factures à suivre` },
          { href: '/dashboard/messages', label: 'Messagerie', sub: 'Contacter parents et enseignants' },
   { 
  href: 'https://primary-school-two.vercel.app/dashboard/school-owner/classes', 
  label: "Classes", 
  sub: 'Gérer les classes de l’école' 
},
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
  );
}