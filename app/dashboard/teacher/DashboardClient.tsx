import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import TeacherDashboardClient from './DashboardClient';

export default async function TeacherDashboard() {
  const session = await auth();

  if (!session?.user.schoolId) {
    return (
      <div style={{ padding: 40, fontFamily: 'Inter, sans-serif', color: '#5A6A7A' }}>
        Aucune école n'est liée à votre compte. Contactez votre chef d'établissement.
      </div>
    );
  }

  const classes = await prisma.class.findMany({
    where: { teacherId: session.user.id },
    orderBy: { name: 'asc' },
    include: {
      students: {
        orderBy: { lastName: 'asc' },
        include: {
          parents: {
            include: { parent: { select: { id: true, username: true, email: true } } },
          },
        },
      },
    },
  });

  const allStudents = classes.flatMap((c: any) =>
    c.students.map((s: any) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      className: c.name,
      parentNames: s.parents.map((p: any) => p.parent.username),
    }))
  );

  const classGroups = classes.map((c: any) => ({
    className: c.name,
    count: c.students.length,
  }));

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
    include: {
      userA: { select: { id: true, username: true, role: true } },
      userB: { select: { id: true, username: true, role: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  const unreadCount = await prisma.message.count({
    where: {
      conversation: { OR: [{ userAId: session.user.id }, { userBId: session.user.id }] },
      senderId: { not: session.user.id },
      readAt: null,
    },
  });

  return (
    <TeacherDashboardClient
      teacherName={session.user.name ?? ''}
      classGroups={classGroups}
      students={allStudents}
      recentConversations={conversations.map((c: any) => {
        const other = c.userAId === session.user.id ? c.userB : c.userA;
        return {
          id: c.id,
          otherName: other.username,
          otherRole: other.role,
          lastMessage: c.messages[0]?.content ?? null,
        };
      })}
      unreadCount={unreadCount}
    />
  );
} 'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Reveal } from '@/lib/reveal';

interface StudentEntry {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  parentNames: string[];
}

interface ConversationPreview {
  id: string;
  otherName: string;
  otherRole: string;
  lastMessage: string | null;
}

interface Props {
  teacherName: string;
  classGroups: { className: string; count: number }[];
  students: StudentEntry[];
  recentConversations: ConversationPreview[];
  unreadCount: number;
}

const roleLabel: Record<string, string> = {
  SCHOOL_OWNER: "Chef d'établissement",
  PARENT: 'Parent',
  TEACHER: 'Enseignant',
};

// --- Typewriter Component ---
function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (index < text.length) {
      intervalRef.current = setInterval(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 45);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index, text]);

  return (
    <span>
      {displayed}
      <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>
    </span>
  );
}

export default function TeacherDashboardClient({
  teacherName,
  classGroups,
  students,
  recentConversations,
  unreadCount,
}: Props) {
  const classNames = classGroups.map((g) => g.className);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarWidth = sidebarOpen ? 260 : 72;
  const mainMarginLeft = sidebarOpen ? 260 : 72;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#F8F9FC', display: 'flex' }}>
      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

        :root {
          --navy: #071B4A;
          --gold: #FFB400;
          --muted: #5A6A7A;
          --border: #E9EEF5;
          --card-bg: #ffffff;
          --shadow: 0 4px 20px rgba(7,27,74,0.06);
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .t-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          color: #E6EAF2;
          text-decoration: none;
          transition: background 0.2s, color 0.2s;
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
        }

        .t-sidebar-link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .t-sidebar-link.active {
          background: rgba(255,180,0,0.15);
          color: #FFB400;
          font-weight: 600;
        }

        .t-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(7,27,74,0.06);
          border: 1px solid #EEF1F6;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .t-card:hover {
          box-shadow: 0 8px 30px rgba(7,27,74,0.1);
        }
        .t-heading {
          font-family: 'Fraunces', serif;
          color: #071B4A;
          font-weight: 700;
          margin: 0;
        }
        .t-stat-card {
          padding: 20px;
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .t-stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 26px rgba(7,27,74,0.1);
        }
        .t-stat-value {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          color: #071B4A;
          font-size: 28px;
          line-height: 1;
        }
        .t-class-tab {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid #E5E9F0;
          background: #fff;
          font-size: 13px;
          font-weight: 600;
          color: #071B4A;
        }
        .t-action {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 18px 20px;
          text-decoration: none;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .t-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(7,27,74,0.1);
        }
        .t-action .label { font-weight: 700; color: #071B4A; font-size: 14px; }
        .t-action .sub { font-size: 12px; color: #5A6A7A; }
        .t-avatar {
          width: 34px; height: 34px; border-radius: 50%;
          background: #071B4A; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          font-family: 'IBM Plex Mono', monospace;
          flex-shrink: 0;
        }
      `}</style>

      {/* SIDEBAR */}
      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarWidth,
          background: 'linear-gradient(180deg, #071B4A 0%, #0A2540 100%)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowX: 'hidden',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#071B4A', fontWeight: 700, fontSize: 18 }}>
                S
              </div>
              <span style={{ color: '#fff', fontFamily: 'Fraunces, serif', fontWeight: 600, fontSize: 18 }}>SchoolApp</span>
            </div>
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#071B4A', fontWeight: 700, fontSize: 18, margin: '0 auto' }}>
              S
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: 20,
              padding: 6,
              borderRadius: 6,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link href="/dashboard/teacher" className={`t-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>🏠</span>
            {sidebarOpen && <span>Tableau de bord</span>}
          </Link>
          <Link href="/dashboard/messages" className={`t-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>💬</span>
            {sidebarOpen && <span>Messages</span>}
            {unreadCount > 0 && sidebarOpen && (
              <span style={{ marginLeft: 'auto', background: 'var(--gold)', color: '#071B4A', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/teacher/classroom" className={`t-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>📚</span>
            {sidebarOpen && <span>ClassRoom</span>}
          </Link>
          <Link href="/dashboard/teacher/grades" className={`t-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>📝</span>
            {sidebarOpen && <span>Notes</span>}
          </Link>
          <Link href="/dashboard/teacher/classes" className={`t-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>👥</span>
            {sidebarOpen && <span>Classes</span>}
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="t-avatar" style={{ background: 'var(--gold)', color: '#071B4A', width: 32, height: 32 }}>
              {teacherName.charAt(0)}
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 600 }}>{teacherName}</p>
                <p style={{ margin: 0, color: '#A0B0C0', fontSize: 11 }}>Enseignant</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          marginLeft: mainMarginLeft,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          padding: '24px 32px',
          minWidth: 0,
        }}
      >
        <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60 }}>
          {/* Header with Typewriter */}
          <Reveal>
            <div style={{ marginTop: 8, marginBottom: 24 }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
                Espace enseignant
              </span>
              <h1 className="t-heading" style={{ fontSize: 32, margin: '6px 0 4px', minHeight: 40 }}>
                <Typewriter text={`Bonjour, ${teacherName}`} />
              </h1>
              <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>
                {classNames.length > 0
                  ? `Vous encadrez ${classNames.length} classe${classNames.length > 1 ? 's' : ''} : ${classNames.join(', ')}.`
                  : "Aucune classe ne vous a encore été assignée — contactez votre chef d'établissement."}
              </p>
            </div>
          </Reveal>

          {classNames.length === 0 ? (
            <Reveal delay={0.1}>
              <div className="t-card" style={{ padding: 24, borderLeft: '4px solid #FFB400' }}>
                <p style={{ margin: 0, color: '#5A6A7A', fontSize: 14 }}>
                  Dès que des classes vous seront assignées, votre liste d'élèves et vos outils de classe apparaîtront ici.
                </p>
              </div>
            </Reveal>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
                <Reveal delay={0}>
                  <div className="t-card t-stat-card">
                    <div className="t-stat-value">{students.length}</div>
                    <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Élèves au total</div>
                  </div>
                </Reveal>
                <Reveal delay={0.08}>
                  <div className="t-card t-stat-card">
                    <div className="t-stat-value">{classNames.length}</div>
                    <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Classes encadrées</div>
                  </div>
                </Reveal>
                <Reveal delay={0.16}>
                  <div className="t-card t-stat-card">
                    <div className="t-stat-value" style={{ color: unreadCount > 0 ? '#FFB400' : '#071B4A' }}>
                      {unreadCount}
                    </div>
                    <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Messages non lus</div>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                  {classGroups.map((g) => (
                    <span key={g.className} className="t-class-tab">
                      {g.className} · {g.count} élève{g.count !== 1 ? 's' : ''}
                    </span>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="t-card" style={{ padding: 24, marginBottom: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 className="t-heading" style={{ fontSize: 18 }}>Liste des élèves</h2>
                  </div>
                  {students.length === 0 ? (
                    <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun élève dans vos classes pour le moment.</p>
                  ) : (
                    <div style={{ border: '1px solid #F0F0F0', borderRadius: 10, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#FAFAFA', textAlign: 'left' }}>
                            <th style={thStyle}>Élève</th>
                            <th style={thStyle}>Classe</th>
                            <th style={thStyle}>Parent(s)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((s) => (
                            <tr key={s.id}>
                              <td style={tdStyle}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="t-avatar">{(s.firstName[0] ?? '') + (s.lastName[0] ?? '')}</div>
                                  {s.firstName} {s.lastName}
                                </div>
                              </td>
                              <td style={tdStyle}>{s.className}</td>
                              <td style={tdStyle}>
                                {s.parentNames.length > 0 ? s.parentNames.join(', ') : <span style={{ color: '#C0392B' }}>Aucun parent lié</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </Reveal>
            </>
          )}

          <Reveal delay={0.1}>
            <div className="t-card" style={{ padding: 24, marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="t-heading" style={{ fontSize: 18 }}>Messages récents</h2>
                <Link href="/dashboard/messages" style={{ fontSize: 13, fontWeight: 600, color: '#071B4A', textDecoration: 'none', borderBottom: '1px solid #FFB400' }}>
                  Voir tout →
                </Link>
              </div>
              {recentConversations.length === 0 ? (
                <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune conversation pour le moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentConversations.map((c) => (
                    <Link
                      key={c.id}
                      href="/dashboard/messages"
                      style={{ display: 'flex', justifyContent: 'space-between', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</div>
                        <div style={{ fontSize: 12, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</div>
                      </div>
                      {c.lastMessage && (
                        <div style={{ fontSize: 13, color: '#5A6A7A', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.lastMessage}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h2 className="t-heading" style={{ fontSize: 18, marginBottom: 14 }}>Actions rapides</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { href: '/dashboard/teacher/classroom', label: "classroom", sub: 'Non encore connecté aux données' },
              { href: '/dashboard/teacher/grades', label: 'Saisir les notes', sub: 'Non encore connecté aux données' },
              { href: '/dashboard/messages', label: 'Messagerie', sub: 'Contacter parents et direction' },
            ].map((a, i) => (
              <Reveal key={a.href} delay={0.05 * i}>
                <Link href={a.href} className="t-card t-action">
                  <span className="label">{a.label}</span>
                  <span className="sub">{a.sub}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 12,
  color: '#5A6A7A',
  fontWeight: 600,
  borderBottom: '1px solid #E5E9F0',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 14,
  color: '#1A1A2E',
  borderBottom: '1px solid #F5F5F5',
}; 