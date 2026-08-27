'use client';

import { useState, useEffect, useRef } from 'react';
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

interface EventPreview {
  id: string;
  title: string;
  date: string;
  type: string;
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
  upcomingEvents: EventPreview[];
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

const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
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

  return <span>{displayed}<span style={{ animation: 'blink 1s step-end infinite' }}>|</span></span>;
}

export default function ParentDashboardClient({
  parentName,
  children,
  pendingEnrollment,
  conversations,
  unreadCount,
  announcements,
  upcomingEvents,
  invoice,
}: Props) {
  const [activeChildId, setActiveChildId] = useState(children[0]?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const child = children.find((c) => c.id === activeChildId) ?? null;

  // Fade-in on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-close sidebar on mobile and detect mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true); // reopen on desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarWidth = sidebarOpen ? 260 : 72;
  const mainMarginLeft = sidebarOpen ? 260 : 72;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', minHeight: '100vh', background: '#F8F9FC', display: 'flex' }}>
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

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .pd-fade-in {
          animation: fadeInUp 0.5s ease forwards;
          opacity: 0;
        }

        .pd-sidebar-link {
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

        .pd-sidebar-link:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .pd-sidebar-link.active {
          background: rgba(255,180,0,0.15);
          color: #FFB400;
          font-weight: 600;
        }

        .pd-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 24px;
          box-shadow: var(--shadow);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pd-card:hover {
          box-shadow: 0 8px 30px rgba(7,27,74,0.1);
        }
        .pd-heading {
          font-family: 'Fraunces', serif;
          color: var(--navy);
          font-weight: 600;
          margin: 0;
        }
        .pd-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--navy);
          text-decoration: none;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .pd-link-btn:hover {
          color: var(--gold);
          border-color: var(--navy);
        }
        .pd-folder-tab {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 10px 20px 12px;
          border: none;
          cursor: pointer;
          border-radius: 10px 10px 0 0;
          background: #E4D3B4;
          color: var(--navy);
          opacity: 0.65;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: opacity 0.2s, background 0.2s;
        }
        .pd-folder-tab.active {
          background: #fff;
          opacity: 1;
          box-shadow: 0 -3px 10px rgba(7,27,74,0.06);
        }
        .pd-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--navy);
          color: #fff;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'IBM Plex Mono', monospace;
          flex-shrink: 0;
        }
        .pd-quick-grid a {
          display: flex;
          flex-direction: column;
          gap: 4px;
          background: #fff;
          border-radius: 12px;
          padding: 16px 18px;
          text-decoration: none;
          box-shadow: 0 3px 10px rgba(7,27,74,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .pd-quick-grid a:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(7,27,74,0.12);
        }
        .pd-quick-grid a .label {
          font-weight: 600;
          color: var(--navy);
          font-size: 14px;
        }
        .pd-quick-grid a .sub {
          font-size: 12px;
          color: var(--muted);
        }
        .pd-resource-item {
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }
        .pd-resource-item:last-child {
          border-bottom: none;
        }

        /* ===== MOBILE RESPONSIVENESS ===== */
        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 260px;
          background: linear-gradient(180deg, #071B4A 0%, #0A2540 100%);
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease;
          overflow-x: hidden;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          box-shadow: 4px 0 20px rgba(0,0,0,0.1);
        }

        /* Hamburger button – hidden by default on desktop */
        .hamburger-btn {
          display: none;
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 1001;
          background: #071B4A;
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 20px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        /* Hide the "Inscrire un enfant" button on mobile */
        .hide-on-mobile {
          display: inline-flex;
        }

        @media (max-width: 768px) {
          .hamburger-btn {
            display: block;
          }

          .sidebar {
            transform: translateX(-100%);
            width: 260px !important;
          }
          .sidebar.open {
            transform: translateX(0);
          }

          /* Main content takes full width */
          main {
            margin-left: 0 !important;
            padding: 12px 16px !important;
          }

          /* General layout & typography */
          .pd-fade-in {
            padding: 0 !important;
          }

          h1 {
            font-size: 24px !important;
            min-height: auto !important;
          }

          .pd-heading {
            font-size: 18px !important;
          }

          /* Hide the "Inscrire un enfant" button */
          .hide-on-mobile {
            display: none !important;
          }

          /* Header action button */
          .pd-fade-in > div:first-child {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          /* Child folder tabs – horizontal scroll */
          .pd-folder-tab {
            padding: 8px 14px !important;
            font-size: 13px !important;
            white-space: nowrap;
          }
          .pd-folder-tab .pd-avatar {
            width: 24px !important;
            height: 24px !important;
            font-size: 10px !important;
          }
          /* Container of tabs (the flex row) – add scroll */
          div[style*="display: flex; gap: 6px; margin-top: 28px;"] {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 8px !important;
            -webkit-overflow-scrolling: touch;
          }

          /* Cards */
          .pd-card {
            padding: 16px !important;
            border-radius: 12px !important;
          }

          /* Two-column grids -> single column */
          .pd-card > div[style*="display: grid; grid-template-columns: 1fr 1fr;"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          /* Main two-column layout (frais + messages) */
          div[style*="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"] {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }

          /* Quick actions grid */
          .pd-quick-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
          .pd-quick-grid a {
            padding: 12px !important;
          }
          .pd-quick-grid a .label {
            font-size: 13px !important;
          }
          .pd-quick-grid a .sub {
            font-size: 11px !important;
          }

          /* Attendance dots */
          .pd-card div[style*="display: flex; gap: 6px;"] {
            gap: 4px !important;
            flex-wrap: wrap !important;
          }
          .pd-card div[style*="display: flex; gap: 14px; margin-top: 10px;"] {
            gap: 8px !important;
            font-size: 11px !important;
            flex-wrap: wrap !important;
          }

          /* Resources list */
          .pd-resource-item {
            padding: 8px 0 !important;
          }
          .pd-resource-item span {
            font-size: 13px !important;
          }

          /* Grades grid */
          div[style*="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));"] {
            grid-template-columns: 1fr 1fr !important;
            gap: 8px !important;
          }
          div[style*="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));"] > div {
            padding: 8px 10px !important;
          }

          /* Event items */
          .pd-card div[style*="display: flex; align-items: center; gap: 12px;"] {
            gap: 8px !important;
          }
          .pd-card div[style*="width: 44px; text-align: center;"] {
            width: 36px !important;
          }
          .pd-card div[style*="font-family: 'Fraunces', serif; font-size: 20px;"] {
            font-size: 16px !important;
          }

          /* Announcement items */
          .pd-card div[style*="border-left: 3px solid"] {
            padding-left: 8px !important;
          }
          .pd-card div[style*="border-left: 3px solid"] p {
            font-size: 13px !important;
          }

          /* Invoice amount */
          .pd-card span[style*="font-family: 'Fraunces', serif; font-size: 28px;"] {
            font-size: 24px !important;
          }

          /* Messages preview */
          .pd-card div[style*="display: flex; flex-direction: column; gap: 10px;"] > div {
            flex-wrap: wrap !important;
          }
          .pd-card div[style*="max-width: 160px; overflow: hidden;"] {
            max-width: 120px !important;
          }

          /* Buttons */
          .pd-card a[style*="background: #FFB400;"] {
            padding: 6px 14px !important;
            font-size: 13px !important;
          }
          a[style*="background: #FFB400; color: #071B4A; padding: 10px 20px;"] {
            padding: 8px 16px !important;
            font-size: 13px !important;
          }

          /* Link buttons */
          .pd-link-btn {
            font-size: 12px !important;
          }

          /* Typewriter effect – reduce size */
          h1 .typewriter {
            font-size: 24px !important;
          }
        }

        @media (max-width: 480px) {
          .pd-fade-in {
            padding: 0 !important;
          }

          h1 {
            font-size: 20px !important;
          }

          .pd-card {
            padding: 12px !important;
          }

          .pd-quick-grid {
            grid-template-columns: 1fr !important;
          }

          div[style*="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));"] {
            grid-template-columns: 1fr 1fr !important;
          }

          .pd-folder-tab {
            font-size: 12px !important;
            padding: 6px 10px !important;
          }

          .pd-folder-tab .pd-avatar {
            width: 20px !important;
            height: 20px !important;
            font-size: 9px !important;
          }

          span[title][style*="width: 10px; height: 10px;"] {
            width: 8px !important;
            height: 8px !important;
          }

          .pd-card span[style*="font-family: 'Fraunces', serif; font-size: 28px;"] {
            font-size: 20px !important;
          }
        }
      `}</style>

      {/* HAMBURGER BUTTON (visible only on mobile via CSS) */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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
          <Link href="/dashboard/parent" className={`pd-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>🏠</span>
            {sidebarOpen && <span>Tableau de bord</span>}
          </Link>
          <Link href="/dashboard/messages" className={`pd-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>💬</span>
            {sidebarOpen && <span>Messages</span>}
            {unreadCount > 0 && sidebarOpen && (
              <span style={{ marginLeft: 'auto', background: 'var(--gold)', color: '#071B4A', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                {unreadCount}
              </span>
            )}
          </Link>
          <Link href="/dashboard/parent/payments" className={`pd-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>💳</span>
            {sidebarOpen && <span>Paiements</span>}
          </Link>
          <Link href="/dashboard/parent/classroom" className={`pd-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>📚</span>
            {sidebarOpen && <span>ClassRoom</span>}
          </Link>
          <Link href="/dashboard/parent/enroll" className={`pd-sidebar-link ${sidebarOpen ? '' : 'justify-center'}`}>
            <span>➕</span>
            {sidebarOpen && <span>Inscrire un enfant</span>}
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="pd-avatar" style={{ background: 'var(--gold)', color: '#071B4A', width: 32, height: 32 }}>
              {parentName.charAt(0)}
            </div>
            {sidebarOpen && (
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 600 }}>{parentName}</p>
                <p style={{ margin: 0, color: '#A0B0C0', fontSize: 11 }}>Parent</p>
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
        <div className={mounted ? 'pd-fade-in' : ''} style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* HEADER */}
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
                Espace parent
              </span>
              <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#071B4A', fontSize: 32, margin: '6px 0 4px', minHeight: 40 }}>
                <Typewriter text={`Bienvenue, ${parentName}`} />
              </h1>
              <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Voici un aperçu de la scolarité de vos enfants.</p>
            </div>
            <Link
              href="/dashboard/parent/enroll"
              className="hide-on-mobile"   // 👈 AJOUTÉ ICI
              style={{ background: '#FFB400', color: '#071B4A', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
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

          {/* SECTION FRAIS + MESSAGES – toujours en colonne sur mobile grâce aux media queries */}
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

          <div className="pd-card" style={{ marginBottom: 28 }}>
            <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 14 }}>Événements à venir</h2>
            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucun événement à venir.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingEvents.map((e) => {
                  const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#FFB400', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                          {new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#071B4A' }}>
                          {new Date(e.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#071B4A' }}>
                          {et.emoji} {e.title}
                        </p>
                        <p style={{ margin: 0, fontSize: 12, color: et.color, fontWeight: 600 }}>{et.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
      </main>
    </div>
  );
}