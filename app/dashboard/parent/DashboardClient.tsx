'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';

interface Subject {
  name: string;
  grade: string;
  trend: 'up' | 'down' | 'flat';
  /** Optional recent numeric history (e.g. last 5 assessments, 0-100) for the sparkline */
  history?: number[];
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  teacherName: string;
  createdAt: string;
}

interface AttendanceDay {
  date: string; // ISO date
  status: 'present' | 'late' | 'absent';
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
  /** Optional fuller attendance record for the calendar modal. Falls back to attendanceLast10 if absent. */
  attendanceMonth?: AttendanceDay[];
  subjects: Subject[];
  resources: Resource[];
}

interface ConversationPreview {
  id: string;
  otherName: string;
  otherRole: string;
  lastMessage: string | null;
  unread?: boolean;
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

interface PaymentHistoryEntry {
  id: string;
  amount: number;
  date: string;
  status: 'PAID' | 'OVERDUE' | 'PENDING';
  description: string;
}

interface NotificationItem {
  id: string;
  type: 'grade' | 'resource' | 'attendance' | 'message' | 'announcement' | 'payment';
  message: string;
  createdAt: string;
  read: boolean;
  childId?: string;
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
  /** Optional — richer payment history. If absent, only the current invoice card is shown. */
  paymentHistory?: PaymentHistoryEntry[];
  /** Optional — notification feed for the bell icon. If absent, the bell is hidden. */
  notifications?: NotificationItem[];
  onMarkAllMessagesRead?: () => void;
  onMarkAllNotificationsRead?: () => void;
  onLogout?: () => void;
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

const paymentStatusLabel: Record<string, { label: string; bg: string; text: string }> = {
  PAID: { label: 'Payé', bg: '#EAF3DE', text: '#27500A' },
  OVERDUE: { label: 'En retard', bg: '#FAECE7', text: '#712B13' },
  PENDING: { label: 'En attente', bg: '#FAEEDA', text: '#633806' },
};

const notificationIcon: Record<NotificationItem['type'], string> = {
  grade: '📊',
  resource: '📎',
  attendance: '🕒',
  message: '💬',
  announcement: '📢',
  payment: '💳',
};

function gradeColor(grade: string) {
  const letter = grade[0];
  if (letter === 'A') return { bg: '#EAF3DE', text: '#27500A' };
  if (letter === 'B') return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

function attendanceStatusLabel(status: string) {
  if (status === 'present') return 'Présent';
  if (status === 'late') return 'Retard';
  return 'Absent';
}

function TrendIcon({ trend }: { trend: Subject['trend'] }) {
  const label = trend === 'up' ? 'en progression' : trend === 'down' ? 'en baisse' : 'stable';
  if (trend === 'up') return <span role="img" aria-label={label} style={{ color: '#4C7C59' }}>&#8593;</span>;
  if (trend === 'down') return <span role="img" aria-label={label} style={{ color: '#C0392B' }}>&#8595;</span>;
  return <span role="img" aria-label={label} style={{ color: '#5A6A7A' }}>&#8212;</span>;
}

function AttendanceDot({ status }: { status: string }) {
  const color = status === 'present' ? '#4C7C59' : status === 'late' ? '#FFB400' : '#C0392B';
  return (
    <span
      role="img"
      aria-label={attendanceStatusLabel(status)}
      title={attendanceStatusLabel(status)}
      style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }}
    />
  );
}

/** Tiny inline sparkline for a subject's recent grade history. No chart library needed. */
function Sparkline({ values }: { values: number[] }) {
  if (!values || values.length < 2) return null;
  const w = 72;
  const h = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const last = values[values.length - 1];
  const first = values[0];
  const stroke = last >= first ? '#4C7C59' : '#C0392B';
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" style={{ display: 'block', marginTop: 4 }}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Typewriter Component (respects prefers-reduced-motion) ---
function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('');
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayed(text);
      return;
    }
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
  }, [index, text, reducedMotion]);

  return (
    <span aria-label={text}>
      <span aria-hidden="true">
        {displayed}
        {!reducedMotion && <span style={{ animation: 'blink 1s step-end infinite' }}>|</span>}
      </span>
    </span>
  );
}

/** Simple month calendar built from attendance records. Falls back to a message if no monthly data given. */
function AttendanceCalendar({ days }: { days: AttendanceDay[] }) {
  if (!days || days.length === 0) {
    return <p style={{ fontSize: 13, color: '#5A6A7A' }}>Le calendrier détaillé n'est pas encore disponible pour cet enfant.</p>;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
      {days.map((d) => {
        const date = new Date(d.date);
        const color = d.status === 'present' ? '#EAF3DE' : d.status === 'late' ? '#FAEEDA' : '#FAECE7';
        const text = d.status === 'present' ? '#27500A' : d.status === 'late' ? '#633806' : '#712B13';
        return (
          <div
            key={d.date}
            title={`${date.toLocaleDateString('fr-FR')} · ${attendanceStatusLabel(d.status)}`}
            style={{ background: color, color: text, borderRadius: 8, padding: '8px 4px', textAlign: 'center', fontSize: 12, fontWeight: 600 }}
          >
            {date.getDate()}
          </div>
        );
      })}
    </div>
  );
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
  paymentHistory,
  notifications,
  onMarkAllMessagesRead,
  onMarkAllNotificationsRead,
  onLogout,
}: Props) {
  const [activeChildId, setActiveChildId] = useState(children[0]?.id ?? null);
  const child = children.find((c) => c.id === activeChildId) ?? null;

  // Sidebar: desktop collapse and mobile open/close are independent concerns now.
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [resourceQuery, setResourceQuery] = useState('');

  // Fade-in on mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarOpenVisual = isMobile ? mobileOpen : !desktopCollapsed;
  const mainMarginLeft = isMobile ? 0 : desktopCollapsed ? 72 : 260;

  const unreadNotifCount = (notifications ?? []).filter((n) => !n.read).length;

  const filteredResources = useMemo(() => {
    if (!child) return [];
    const q = resourceQuery.trim().toLowerCase();
    if (!q) return child.resources;
    return child.resources.filter(
      (r) => r.title.toLowerCase().includes(q) || (r.description ?? '').toLowerCase().includes(q) || r.teacherName.toLowerCase().includes(q)
    );
  }, [child, resourceQuery]);

  const handlePrintReportCard = () => {
    window.print();
  };

  // Mobile shortcut items – first four general, last four quick actions
  const generalShortcuts = [
    { title: 'Frais de scolarité', subtitle: 'Historique →', link: '/dashboard/parent/payments', icon: '💳' },
    { title: 'Messages', subtitle: 'Boîte de réception →', link: '/dashboard/messages', icon: '💬' },
    { title: 'Annonces de l’école', subtitle: 'Voir toutes les actualités →', link: '/news-events', icon: '📢' },
    { title: 'Événements à venir', subtitle: 'Calendrier scolaire →', link: '/dashboard/parent/events', icon: '📅' },
  ];

  const quickActionShortcuts = [
    { title: 'Inscrire un enfant', subtitle: 'Nouvelle demande d’inscription', link: '/dashboard/parent/enroll', icon: '➕' },
    { title: 'Message à un enseignant', subtitle: 'Démarrer une conversation', link: '/dashboard/messages', icon: '✉️' },
    { title: 'Payer les frais', subtitle: 'Voir les factures et payer en ligne', link: '/dashboard/parent/payments', icon: '💳' },
    { title: 'ClassRoom', subtitle: 'Accéder à la classe', link: '/dashboard/parent/classroom', icon: '📚' },
  ];

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

        @media (prefers-reduced-motion: reduce) {
          .pd-fade-in { animation: none !important; opacity: 1 !important; }
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
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: inherit;
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
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          cursor: pointer;
          font-family: inherit;
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

        /* ===== Layout helper classes (replace fragile attribute selectors) ===== */
        .pd-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .pd-child-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 24px;
        }
        .pd-subjects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }
        .pd-attendance-row {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .pd-attendance-legend {
          display: flex;
          gap: 14px;
          margin-top: 10px;
          font-size: 12px;
          color: var(--muted);
          flex-wrap: wrap;
        }
        .pd-event-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pd-summary-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
        .pd-summary-card {
          background: #fff;
          border-radius: 12px;
          padding: 14px 16px;
          box-shadow: 0 3px 10px rgba(7,27,74,0.06);
          cursor: pointer;
          border: 2px solid transparent;
          text-align: left;
          font-family: inherit;
        }
        .pd-summary-card.active {
          border-color: var(--gold);
        }

        /* Notification bell */
        .pd-bell-wrap { position: relative; }
        .pd-bell-btn {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          position: relative;
        }
        .pd-bell-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #C0392B;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          border-radius: 10px;
          padding: 1px 5px;
          min-width: 16px;
          text-align: center;
        }
        .pd-notif-panel {
          position: absolute;
          right: 0;
          top: 48px;
          width: 320px;
          max-height: 380px;
          overflow-y: auto;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(7,27,74,0.18);
          z-index: 1200;
          padding: 8px;
        }
        .pd-notif-item {
          display: flex;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
        }
        .pd-notif-item.unread { background: #FFF8E8; }

        .pd-resource-search {
          width: 100%;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          font-size: 13px;
          margin-bottom: 10px;
          font-family: inherit;
        }

        .pd-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(7,27,74,0.45);
          z-index: 1300;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .pd-modal {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          max-width: 440px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .pd-sidebar-footer-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #A0B0C0;
          font-size: 12px;
          cursor: pointer;
          padding: 6px 0;
          font-family: inherit;
        }
        .pd-sidebar-footer-btn:hover { color: #fff; }

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

        .hide-on-mobile {
          display: inline-flex;
        }

        .mobile-shortcuts {
          display: none;
        }

        @media print {
          .sidebar, .hamburger-btn, .pd-bell-wrap, .mobile-shortcuts, .hide-on-mobile,
          .desktop-sections, .pd-summary-row, .pd-resource-search { display: none !important; }
          main { margin-left: 0 !important; padding: 0 !important; }
          body { background: #fff !important; }
        }

        @media (max-width: 768px) {
          .hamburger-btn { display: block; }
          .sidebar { transform: translateX(-100%); width: 260px !important; }
          .sidebar.open { transform: translateX(0); }
          main { margin-left: 0 !important; padding: 12px 16px !important; }
          .pd-fade-in { padding: 0 !important; }
          h1 { font-size: 24px !important; min-height: auto !important; }
          .pd-heading { font-size: 18px !important; }
          .hide-on-mobile { display: none !important; }
          .pd-fade-in > div:first-child { flex-direction: column !important; align-items: flex-start !important; }
          .pd-folder-tab { padding: 8px 14px !important; font-size: 13px !important; white-space: nowrap; }
          .pd-folder-tab .pd-avatar { width: 24px !important; height: 24px !important; font-size: 10px !important; }
          .pd-child-tabs-row { overflow-x: auto !important; flex-wrap: nowrap !important; padding-bottom: 8px !important; -webkit-overflow-scrolling: touch; }
          .pd-card { padding: 16px !important; border-radius: 12px !important; }
          .pd-child-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .pd-two-col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .pd-quick-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
          .pd-quick-grid a { padding: 12px !important; }
          .pd-quick-grid a .label { font-size: 13px !important; }
          .pd-quick-grid a .sub { font-size: 11px !important; }
          .pd-attendance-row { gap: 4px !important; }
          .pd-attendance-legend { gap: 8px !important; font-size: 11px !important; }
          .pd-resource-item { padding: 8px 0 !important; }
          .pd-resource-item span { font-size: 13px !important; }
          .pd-subjects-grid { grid-template-columns: 1fr 1fr !important; gap: 8px !important; }
          .pd-subjects-grid > div { padding: 8px 10px !important; }
          .pd-event-item { gap: 8px !important; }
          .pd-event-item .pd-event-date { width: 36px !important; }
          .pd-event-item .pd-event-day { font-size: 16px !important; }
          .pd-card div[style*="border-left: 3px solid"] { padding-left: 8px !important; }
          .pd-card div[style*="border-left: 3px solid"] p { font-size: 13px !important; }
          .pd-invoice-amount { font-size: 24px !important; }
          .pd-message-preview { max-width: 120px !important; }
          .pd-card a[style*="background: #FFB400;"] { padding: 6px 14px !important; font-size: 13px !important; }
          a[style*="background: #FFB400; color: #071B4A; padding: 10px 20px;"] { padding: 8px 16px !important; font-size: 13px !important; }
          .pd-link-btn { font-size: 12px !important; }
          h1 .typewriter { font-size: 24px !important; }
          .pd-notif-panel { width: 90vw; right: -8px; }
          .mobile-shortcuts { display: block; margin-top: 24px; }
          .mobile-shortcuts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .mobile-shortcut-card { background: #ffffff; border-radius: 14px; padding: 16px; box-shadow: 0 4px 12px rgba(7, 27, 74, 0.08); display: flex; flex-direction: column; align-items: flex-start; text-decoration: none; transition: transform 0.2s, box-shadow 0.2s; }
          .mobile-shortcut-card:active { transform: scale(0.97); box-shadow: 0 2px 8px rgba(7, 27, 74, 0.12); }
          .mobile-shortcut-icon { font-size: 24px; margin-bottom: 8px; }
          .mobile-shortcut-title { font-weight: 600; color: var(--navy); font-size: 14px; line-height: 1.3; }
          .mobile-shortcut-subtitle { font-size: 11px; color: var(--muted); margin-top: 2px; }
          .desktop-sections { display: none !important; }
        }

        @media (max-width: 480px) {
          .pd-fade-in { padding: 0 !important; }
          h1 { font-size: 20px !important; }
          .pd-card { padding: 12px !important; }
          .pd-quick-grid { grid-template-columns: 1fr !important; }
          .pd-subjects-grid { grid-template-columns: 1fr 1fr !important; }
          .pd-folder-tab { font-size: 12px !important; padding: 6px 10px !important; }
          .pd-folder-tab .pd-avatar { width: 20px !important; height: 20px !important; font-size: 9px !important; }
          span[title][style*="width: 10px; height: 10px;"] { width: 8px !important; height: 8px !important; }
          .pd-invoice-amount { font-size: 20px !important; }
          .mobile-shortcuts-grid { gap: 8px; }
          .mobile-shortcut-card { padding: 12px; }
          .mobile-shortcut-icon { font-size: 20px; }
          .mobile-shortcut-title { font-size: 12px; }
          .mobile-shortcut-subtitle { font-size: 10px; }
        }
      `}</style>

      <button className="hamburger-btn" onClick={() => setMobileOpen((o) => !o)} aria-label="Ouvrir/fermer le menu" aria-expanded={mobileOpen}>
        ☰
      </button>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpenVisual && isMobile ? 'open' : ''}`}>
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {(!isMobile ? !desktopCollapsed : true) ? (
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
          {!isMobile && (
            <button
              onClick={() => setDesktopCollapsed((c) => !c)}
              aria-label={desktopCollapsed ? 'Développer le menu' : 'Réduire le menu'}
              style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 20, padding: 6, borderRadius: 6, transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {desktopCollapsed ? '▶' : '◀'}
            </button>
          )}
        </div>

        <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Link href="/dashboard/parent" className="pd-sidebar-link active">
            <span>🏠</span>
            {(isMobile || !desktopCollapsed) && <span>Tableau de bord</span>}
          </Link>
          <Link href="/dashboard/messages" className="pd-sidebar-link">
            <span>💬</span>
            {(isMobile || !desktopCollapsed) && <span>Messages</span>}
            {unreadCount > 0 && (isMobile || !desktopCollapsed) && (
              <span style={{ marginLeft: 'auto', background: 'var(--gold)', color: '#071B4A', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                {unreadCount}
              </span>
            )}
            {unreadCount > 0 && !isMobile && desktopCollapsed && (
              <span aria-hidden="true" style={{ position: 'absolute', marginLeft: 18, marginTop: -18, width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)' }} />
            )}
          </Link>
          <Link href="/dashboard/parent/payments" className="pd-sidebar-link">
            <span>💳</span>
            {(isMobile || !desktopCollapsed) && <span>Paiements</span>}
          </Link>
          <Link href="/dashboard/parent/classroom" className="pd-sidebar-link">
            <span>📚</span>
            {(isMobile || !desktopCollapsed) && <span>ClassRoom</span>}
          </Link>
          <Link href="/dashboard/parent/enroll" className="pd-sidebar-link">
            <span>➕</span>
            {(isMobile || !desktopCollapsed) && <span>Inscrire un enfant</span>}
          </Link>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className="pd-avatar" style={{ background: 'var(--gold)', color: '#071B4A', width: 32, height: 32 }}>
              {parentName.charAt(0)}
            </div>
            {(isMobile || !desktopCollapsed) && (
              <div>
                <p style={{ margin: 0, color: '#fff', fontSize: 13, fontWeight: 600 }}>{parentName}</p>
                <p style={{ margin: 0, color: '#A0B0C0', fontSize: 11 }}>Parent</p>
              </div>
            )}
          </div>
          {(isMobile || !desktopCollapsed) && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link href="/dashboard/parent/settings" className="pd-sidebar-footer-btn" style={{ textDecoration: 'none' }}>
                <span>⚙️</span> Paramètres du compte
              </Link>
              <button className="pd-sidebar-footer-btn" onClick={onLogout}>
                <span>🚪</span> Se déconnecter
              </button>
            </div>
          )}
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {notifications && (
                <div className="pd-bell-wrap">
                  <button
                    className="pd-bell-btn"
                    aria-label={`Notifications${unreadNotifCount > 0 ? `, ${unreadNotifCount} non lues` : ''}`}
                    onClick={() => setNotifOpen((o) => !o)}
                  >
                    🔔
                    {unreadNotifCount > 0 && <span className="pd-bell-badge">{unreadNotifCount}</span>}
                  </button>
                  {notifOpen && (
                    <div className="pd-notif-panel" role="dialog" aria-label="Notifications">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 6px 8px' }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: '#071B4A' }}>Notifications</span>
                        {unreadNotifCount > 0 && (
                          <button className="pd-link-btn" style={{ fontSize: 11 }} onClick={onMarkAllNotificationsRead}>
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#5A6A7A', padding: '0 6px 6px' }}>Aucune notification.</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className={`pd-notif-item ${!n.read ? 'unread' : ''}`}>
                            <span aria-hidden="true">{notificationIcon[n.type]}</span>
                            <div>
                              <p style={{ margin: 0, fontSize: 12.5, color: '#1A1A2E' }}>{n.message}</p>
                              <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5A6A7A' }}>
                                {new Date(n.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              <Link
                href="/dashboard/parent/enroll"
                className="hide-on-mobile"
                style={{ background: '#FFB400', color: '#071B4A', padding: '10px 20px', borderRadius: 20, fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                + Inscrire un enfant
              </Link>
            </div>
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
              {/* MULTI-CHILD SUMMARY ROW — quick glance before drilling into a child */}
              {children.length > 1 && (
                <div className="pd-summary-row" role="tablist" aria-label="Résumé par enfant">
                  {children.map((c) => {
                    const avg = c.subjects.length
                      ? Math.round((c.subjects.filter((s) => s.grade[0] === 'A').length / c.subjects.length) * 100)
                      : null;
                    return (
                      <button
                        key={c.id}
                        className={`pd-summary-card ${c.id === activeChildId ? 'active' : ''}`}
                        role="tab"
                        aria-selected={c.id === activeChildId}
                        onClick={() => setActiveChildId(c.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <span className="pd-avatar" style={{ background: '#071B4A' }}>{c.firstName[0]}{c.lastName[0]}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: '#071B4A' }}>{c.firstName}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 11, color: '#5A6A7A' }}>
                          Assiduité : {c.attendancePct !== null ? `${c.attendancePct}%` : '—'}
                        </p>
                        {avg !== null && <p style={{ margin: '2px 0 0', fontSize: 11, color: '#5A6A7A' }}>{avg}% de mentions A</p>}
                      </button>
                    );
                  })}
                </div>
              )}

              {children.length > 1 && (
                <div className="pd-child-tabs-row" style={{ display: 'flex', gap: 6, marginTop: 20 }}>
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
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <button className="pd-link-btn" onClick={handlePrintReportCard}>
                        Télécharger le bulletin (PDF) →
                      </button>
                      {child.teacherId && (
                        <Link href="/dashboard/messages" className="pd-link-btn">
                          Message {child.teacherName} →
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="pd-child-grid">
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
                          <div className="pd-attendance-row">
                            {child.attendanceLast10.map((s, i) => (
                              <AttendanceDot key={i} status={s} />
                            ))}
                          </div>
                          <div className="pd-attendance-legend">
                            <span><AttendanceDot status="present" /> Présent</span>
                            <span><AttendanceDot status="late" /> Retard</span>
                            <span><AttendanceDot status="absent" /> Absent</span>
                          </div>
                          <button className="pd-link-btn" style={{ marginTop: 10 }} onClick={() => setAttendanceModalOpen(true)}>
                            Voir le calendrier complet →
                          </button>
                        </>
                      )}
                    </div>

                    <div>
                      <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Ressources de classe
                      </h3>
                      {child.resources.length > 3 && (
                        <input
                          className="pd-resource-search"
                          type="search"
                          placeholder="Rechercher une ressource…"
                          value={resourceQuery}
                          onChange={(e) => setResourceQuery(e.target.value)}
                          aria-label="Rechercher une ressource"
                        />
                      )}
                      {child.resources.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune ressource publiée pour le moment.</p>
                      ) : filteredResources.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun résultat pour « {resourceQuery} ».</p>
                      ) : (
                        <div>
                          {filteredResources.map((r) => (
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
                      <div className="pd-subjects-grid">
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
                              {s.history && s.history.length >= 2 && <Sparkline values={s.history} />}
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

          {/* MOBILE ONLY SHORTCUT GRID */}
          <div className="mobile-shortcuts">
            <div className="mobile-shortcuts-grid">
              {generalShortcuts.map((item, idx) => (
                <Link key={idx} href={item.link} className="mobile-shortcut-card">
                  <span className="mobile-shortcut-icon">{item.icon}</span>
                  <span className="mobile-shortcut-title">{item.title}</span>
                  <span className="mobile-shortcut-subtitle">{item.subtitle}</span>
                </Link>
              ))}
            </div>

            <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 12, marginTop: 24 }}>
              Actions rapides
            </h2>

            <div className="mobile-shortcuts-grid">
              {quickActionShortcuts.map((item, idx) => (
                <Link key={idx} href={item.link} className="mobile-shortcut-card">
                  <span className="mobile-shortcut-icon">{item.icon}</span>
                  <span className="mobile-shortcut-title">{item.title}</span>
                  <span className="mobile-shortcut-subtitle">{item.subtitle}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* DESKTOP SECTIONS (hidden on mobile) */}
          <div className="pd-two-col desktop-sections" style={{ marginBottom: 20, marginTop: children.length === 0 ? 20 : 0 }}>
            <div className="pd-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="pd-heading" style={{ fontSize: 17 }}>Frais de scolarité</h2>
                <Link href="/dashboard/parent/payments" className="pd-link-btn">Historique →</Link>
              </div>
              {invoice ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span className="pd-invoice-amount" style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, color: '#071B4A' }}>
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

              {paymentHistory && paymentHistory.length > 0 && (
                <div style={{ marginTop: 18, borderTop: '1px solid #F0F0F0', paddingTop: 14 }}>
                  <h3 style={{ fontSize: 12, fontWeight: 600, color: '#5A6A7A', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Historique des paiements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {paymentHistory.slice(0, 4).map((p) => {
                      const st = paymentStatusLabel[p.status];
                      return (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                          <span style={{ color: '#1A1A2E' }}>{p.description}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: '#5A6A7A' }}>{p.amount.toLocaleString('fr-FR')} DT</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 8, background: st.bg, color: st.text }}>{st.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {unreadCount > 0 && (
                    <button className="pd-link-btn" onClick={onMarkAllMessagesRead}>Tout marquer comme lu</button>
                  )}
                  <Link href="/dashboard/messages" className="pd-link-btn">Boîte de réception →</Link>
                </div>
              </div>
              {conversations.length === 0 ? (
                <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucune conversation pour le moment.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {conversations.map((c) => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 10, borderBottom: '1px solid #F0F0F0' }}>
                      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {c.unread && <span aria-label="Non lu" style={{ width: 7, height: 7, borderRadius: '50%', background: '#FFB400', flexShrink: 0 }} />}
                        <div>
                          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</p>
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</p>
                        </div>
                      </div>
                      {c.lastMessage && (
                        <span className="pd-message-preview" style={{ fontSize: 12, color: '#5A6A7A', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.lastMessage}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pd-card desktop-sections" style={{ marginBottom: 28 }}>
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

          <div className="pd-card desktop-sections" style={{ marginBottom: 28 }}>
            <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 14 }}>Événements à venir</h2>
            {upcomingEvents.length === 0 ? (
              <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucun événement à venir.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcomingEvents.map((e) => {
                  const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                  return (
                    <div key={e.id} className="pd-event-item">
                      <div className="pd-event-date" style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#FFB400', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>
                          {new Date(e.date).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                        <div className="pd-event-day" style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#071B4A' }}>
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

          <div className="desktop-sections">
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
        </div>
      </main>

      {/* ATTENDANCE CALENDAR MODAL */}
      {attendanceModalOpen && child && (
        <div className="pd-modal-overlay" onClick={() => setAttendanceModalOpen(false)}>
          <div className="pd-modal" role="dialog" aria-label="Calendrier d'assiduité" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="pd-heading" style={{ fontSize: 17 }}>Assiduité — {child.firstName}</h2>
              <button className="pd-link-btn" onClick={() => setAttendanceModalOpen(false)} aria-label="Fermer">✕</button>
            </div>
            <AttendanceCalendar days={child.attendanceMonth ?? []} />
          </div>
        </div>
      )}
    </div>
  );
}