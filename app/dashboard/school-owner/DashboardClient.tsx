'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Reveal } from '@/lib/reveal';
import Sidebar from './Sidebar';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  Wallet,
  AlertTriangle,
  Percent,
  Clock,
  AlertCircle,
  Megaphone,
  CalendarDays,
  MessageSquare,
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle,
  Plus,
  School,
  ChevronRight,
  UserPlus,
  CreditCard,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

// --------------------------------------------
// Types (same as before)
// --------------------------------------------
interface Teacher { id: string; username: string; email: string; createdAt: string; }
interface TrendPoint { label: string; revenue: number; students: number; }
interface HealthData { studentsNoClass: number; studentsNoParent: number; classesNoTeacher: number; }
interface ClassOption { id: string; name: string; }
interface AnnouncementItem { id: string; title: string; body: string; category: string; createdAt: string; }
interface EventItem { id: string; title: string; description: string | null; date: string; type: string; }
interface ConversationPreview { id: string; otherName: string; otherRole: string; lastMessage: string | null; unreadCount: number; }
interface OverdueInvoice { id: string; studentId: string; studentName: string; parentName: string; remaining: number; daysLate: number; }
interface RevenueByClassRow { className: string; semester: string; total: number; }
interface CollectionRate { current: number | null; previous: number | null; }

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
  overdueInvoices: OverdueInvoice[];
  overdueCount: number;
  revenueByClass: RevenueByClassRow[];
  collectionRate: CollectionRate;
}

// --------------------------------------------
// Constants and helpers
// --------------------------------------------
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

const STATUS_COLORS: Record<string, string> = { PAID: '#3ED598', PENDING: '#FFB400', OVERDUE: '#C0392B' };
const STATUS_LABELS: Record<string, string> = { PAID: 'Payées', PENDING: 'En attente', OVERDUE: 'En retard' };

// --------------------------------------------
// Custom Tooltip
// --------------------------------------------
function ChartTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div style={{ background: '#071B4A', color: '#fff', padding: '10px 14px', borderRadius: 10, fontSize: 12.5, boxShadow: '0 8px 24px rgba(7,27,74,0.25)' }}>
      {label && <div style={{ fontWeight: 700, marginBottom: 4, opacity: 0.85 }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color || p.fill }} />
          <span>{formatter ? formatter(p) : `${p.name}: ${p.value}`}</span>
        </div>
      ))}
    </div>
  );
}

// --------------------------------------------
// Charts (same as before, with minor styling)
// --------------------------------------------
function TrendChart({ trend }: { trend: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={230}>
      <ComposedChart data={trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFB400" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#FFB400" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#E9EDF4" />
        <XAxis dataKey="label" tick={{ fontSize: 11.5, fill: '#5A6A7A', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="revenue" tick={{ fontSize: 11, fill: '#5A6A7A', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} width={0} />
        <YAxis yAxisId="students" orientation="right" tick={{ fontSize: 11, fill: '#5A6A7A', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} width={0} />
        <Tooltip content={<ChartTooltip formatter={(p: any) => p.dataKey === 'revenue' ? `Revenus: ${p.value.toLocaleString('fr-FR')} DT` : `Inscriptions: ${p.value}`} />} />
        <Area yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#FFB400" strokeWidth={2.5} fill="url(#revFill)" activeDot={{ r: 5 }} />
        <Line yAxisId="students" type="monotone" dataKey="students" stroke="#071B4A" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: '#071B4A' }} activeDot={{ r: 5 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

function InvoiceStatusDonut({ breakdown }: { breakdown: Record<string, number> }) {
  const data = (['PAID', 'PENDING', 'OVERDUE'] as const)
    .map((key) => ({ key, label: STATUS_LABELS[key], value: breakdown[key] ?? 0, color: STATUS_COLORS[key] }))
    .filter((d) => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucune facture pour le moment.</p>;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={44} outerRadius={64} paddingAngle={3} stroke="none">
              {data.map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(p: any) => `${p.name}: ${p.value}`} />} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: '#071B4A' }}>{total}</span>
          <span style={{ fontSize: 10.5, color: '#5A6A7A' }}>factures</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {data.map((d) => (
          <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
            <span style={{ color: '#5A6A7A' }}>{d.label}</span>
            <strong style={{ color: '#071B4A' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueByClassBars({ rows }: { rows: RevenueByClassRow[] }) {
  if (rows.length === 0) {
    return <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun paiement enregistré pour le moment.</p>;
  }
  const data = rows.map((r) => ({ name: `${r.className} · ${r.semester}`, total: r.total }));
  const height = Math.max(160, data.length * 42);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={14}>
        <CartesianGrid horizontal={false} stroke="#E9EDF4" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#5A6A7A', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={170}
          tick={{ fontSize: 12.5, fill: '#071B4A', fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: 'rgba(255,180,0,0.08)' }} content={<ChartTooltip formatter={(p: any) => `${p.value.toLocaleString('fr-FR')} DT`} />} />
        <Bar dataKey="total" fill="#FFB400" radius={[0, 6, 6, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --------------------------------------------
// Main Client Component
// --------------------------------------------
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
  health,
  classes,
  announcements,
  upcomingEvents,
  conversations,
  overdueInvoices,
  overdueCount,
  revenueByClass,
  collectionRate,
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

  const rateDelta =
    collectionRate.current !== null && collectionRate.previous !== null
      ? collectionRate.current - collectionRate.previous
      : null;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F7F8FB', fontFamily: 'Inter, sans-serif' }}>
      <link href={fontImports} rel="stylesheet" />
      <Sidebar schoolName={schoolName} />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        html, body { margin: 0; padding: 0; height: 100%; }
        .so-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(7,27,74,0.06);
          border: 1px solid #EEF1F6;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .so-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(7,27,74,0.1);
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
        }
        .so-stat-card .icon-wrapper {
          position: absolute;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,180,0,0.1);
          color: #FFB400;
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
          background: none;
          border-left: none;
          border-right: none;
          border-top: none;
          cursor: pointer;
          padding: 0 0 1px;
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
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .so-action:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 24px rgba(7,27,74,0.1);
        }
        .so-action .label {
          font-weight: 700;
          color: #071B4A;
          font-size: 14px;
        }
        .so-action .sub {
          font-size: 12px;
          color: #5A6A7A;
        }
        @keyframes so-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
        .so-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFB400;
          display: inline-block;
          animation: so-pulse 1.6s ease-in-out infinite;
        }
        .so-input {
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #DCE1E8;
          font-size: 13px;
          outline: none;
          width: 100%;
          font-family: 'Inter', sans-serif;
        }
        .so-btn {
          background: #FFB400;
          color: #071B4A;
          border: none;
          border-radius: 20px;
          padding: 9px 18px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .so-content-scroll::-webkit-scrollbar { width: 8px; }
        .so-content-scroll::-webkit-scrollbar-thumb { background: #DCE1E8; border-radius: 8px; }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .grid-3 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .grid-3, .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <main className="so-content-scroll" style={{ flex: 1, height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 28px 60px' }}>
          {/* ---- TOP BANNER ---- */}
          <Reveal>
            <div
              style={{
                background: 'linear-gradient(135deg, #071B4A 0%, #0A2A6B 60%, #FFB400 160%)',
                borderRadius: 20,
                padding: '28px 32px',
                marginBottom: 28,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(7,27,74,0.2)',
              }}
            >
              {/* Decorative school icon background */}
              <School
                size={220}
                style={{
                  position: 'absolute',
                  right: -20,
                  bottom: -40,
                  opacity: 0.08,
                  transform: 'rotate(-10deg)',
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <LayoutDashboard size={18} style={{ opacity: 0.8 }} />
                  <span style={{ fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.8 }}>
                    Tableau de bord — Chef d'établissement
                  </span>
                </div>
                <h1 className="so-heading" style={{ fontSize: 32, color: '#fff', margin: '6px 0 4px' }}>
                  {schoolName}
                </h1>
                <p style={{ fontSize: 15, opacity: 0.85, margin: 0 }}>
                  Bienvenue, {ownerName}. Voici un aperçu détaillé de votre établissement.
                </p>
              </div>
            </div>
          </Reveal>

          {/* ---- STATS ROW 1 (3 cards) ---- */}
          <div className="grid-3" style={{ marginBottom: 16 }}>
            <Reveal delay={0.05}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <Users size={20} />
                </div>
                <div className="so-stat-value" style={{ fontSize: 30 }}>{teacherCount}</div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Enseignants</div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <GraduationCap size={20} />
                </div>
                <div className="so-stat-value" style={{ fontSize: 30 }}>{studentCount}</div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Élèves inscrits</div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <ClipboardCheck size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="so-stat-value" style={{ fontSize: 30 }}>{pendingEnrollments}</div>
                  {pendingEnrollments > 0 && <span className="so-pulse-dot" />}
                </div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Demandes en attente</div>
              </div>
            </Reveal>
          </div>

          {/* ---- STATS ROW 2 (3 cards) ---- */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            <Reveal delay={0.2}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <Wallet size={20} />
                </div>
                <div className="so-stat-value" style={{ fontSize: 30 }}>{revenueCollected.toLocaleString('fr-FR')} DT</div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Revenus encaissés</div>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <AlertTriangle size={20} />
                </div>
                <div className="so-stat-value" style={{ fontSize: 30, color: unpaidCount > 0 ? '#C0392B' : '#071B4A' }}>{unpaidCount}</div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Factures impayées</div>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="so-card so-stat-card">
                <div className="icon-wrapper">
                  <Percent size={20} />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div className="so-stat-value" style={{ fontSize: 30 }}>
                    {collectionRate.current !== null ? `${collectionRate.current}%` : '—'}
                  </div>
                  {rateDelta !== null && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: rateDelta >= 0 ? '#27500A' : '#C0392B', display: 'flex', alignItems: 'center' }}>
                      {rateDelta >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {Math.abs(rateDelta)} pts
                    </span>
                  )}
                </div>
                <div style={{ color: '#5A6A7A', fontSize: 13, marginTop: 4 }}>Taux de recouvrement (ce mois)</div>
              </div>
            </Reveal>
          </div>

          {/* ---- ALERT / ACTIONABLE ROW ---- */}
          {pendingEnrollments > 0 && (
            <Reveal delay={0.1}>
              <div
                className="so-card"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '18px 24px',
                  marginBottom: 20,
                  borderLeft: '4px solid #FFB400',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="so-pulse-dot" />
                  <div>
                    <div style={{ fontWeight: 700, color: '#071B4A', fontSize: 15 }}>
                      {pendingEnrollments} demande{pendingEnrollments > 1 ? 's' : ''} d'inscription à examiner
                    </div>
                    <div style={{ fontSize: 13, color: '#5A6A7A' }}>Des familles attendent une réponse pour rejoindre {schoolName}.</div>
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Examiner <ChevronRight size={16} />
                </Link>
              </div>
            </Reveal>
          )}

          {/* ---- OVERDUE INVOICES (FULL WIDTH) ---- */}
          {overdueInvoices.length > 0 && (
            <Reveal delay={0.1}>
              <div className="so-card" style={{ padding: 24, marginBottom: 20, borderLeft: '4px solid #C0392B' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={20} color="#C0392B" />
                    Factures en retard {overdueCount > 0 && <span style={{ color: '#C0392B' }}>({overdueCount})</span>}
                  </h2>
                  <Link href="/dashboard/school-owner/payments" className="so-link-btn">
                    Gérer les paiements <ChevronRight size={14} />
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {overdueInvoices.map((inv) => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{inv.studentName}</div>
                        <div style={{ fontSize: 12, color: '#5A6A7A' }}>Parent : {inv.parentName}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 13.5, fontWeight: 700, color: '#C0392B' }}>{inv.remaining.toLocaleString('fr-FR')} DT</div>
                          <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{inv.daysLate} jour{inv.daysLate > 1 ? 's' : ''} de retard</div>
                        </div>
                        <Link
                          href={`/dashboard/school-owner/students/${inv.studentId}`}
                          style={{ fontSize: 12.5, fontWeight: 700, color: '#071B4A', textDecoration: 'underline', whiteSpace: 'nowrap' }}
                        >
                          Voir
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}

          {/* ---- DATA HEALTH + ANNOUNCEMENTS + EVENTS (3 cards) ---- */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {/* Data Health */}
            <Reveal delay={0.1}>
              <div
                className="so-card"
                style={{
                  padding: '18px 24px',
                  borderLeft: `4px solid ${totalHealthIssues > 0 ? '#C0392B' : '#4C7C59'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: totalHealthIssues > 0 ? 10 : 0 }}>
                  {totalHealthIssues > 0 ? <AlertCircle size={20} color="#C0392B" /> : <CheckCircle2 size={20} color="#4C7C59" />}
                  <strong style={{ color: '#071B4A', fontSize: 15 }}>
                    {totalHealthIssues > 0 ? `${totalHealthIssues} élément(s) à corriger` : 'Tout est en ordre'}
                  </strong>
                </div>
                {totalHealthIssues > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginTop: 10 }}>
                    {health.studentsNoClass > 0 && (
                      <Link href="/dashboard/school-owner/students" style={{ color: '#C0392B', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={14} /> {health.studentsNoClass} élève{health.studentsNoClass > 1 ? 's' : ''} sans classe assignée
                      </Link>
                    )}
                    {health.classesNoTeacher > 0 && (
                      <Link href="/dashboard/school-owner/classes" style={{ color: '#C0392B', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <School size={14} /> {health.classesNoTeacher} classe{health.classesNoTeacher > 1 ? 's' : ''} sans enseignant
                      </Link>
                    )}
                    {health.studentsNoParent > 0 && (
                      <Link href="/dashboard/school-owner/students" style={{ color: '#C0392B', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserPlus size={14} /> {health.studentsNoParent} élève{health.studentsNoParent > 1 ? 's' : ''} sans parent lié
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Announcements */}
            <Reveal delay={0.15}>
              <div className="so-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Megaphone size={20} color="#FFB400" /> Annonces
                  </h2>
                  <button className="so-link-btn" onClick={() => setShowAnnForm((s) => !s)}>
                    {showAnnForm ? 'Annuler' : <><Plus size={14} /> Publier</>}
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
                      {savingAnn ? '...' : <><Plus size={14} /> Publier</>}
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

            {/* Upcoming Events */}
            <Reveal delay={0.2}>
              <div className="so-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CalendarDays size={20} color="#071B4A" /> Événements à venir
                  </h2>
                  <button className="so-link-btn" onClick={() => setShowEvForm((s) => !s)}>
                    {showEvForm ? 'Annuler' : <><Plus size={14} /> Ajouter</>}
                  </button>
                </div>

                {showEvForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #F0F0F0' }}>
                    <input placeholder="Titre" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} className="so-input" />
                    <textarea placeholder="Description (optionnel)" value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={2} className="so-input" />
                    <select value={evType} onChange={(e) => setEvType(e.target.value)} className="so-input">
                      {Object.entries(eventTypeLabel).map(([key, v]) => (
                        <option key={key} value={key}>{v.emoji} {v.label}</option>
                      ))}
                    </select>
                    <select value={evClassId} onChange={(e) => setEvClassId(e.target.value)} className="so-input">
                      <option value="">Toute l'école</option>
                      {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="so-input" />
                    <button onClick={submitEvent} disabled={savingEv} className="so-btn">
                      {savingEv ? '...' : <><Plus size={14} /> Ajouter au calendrier</>}
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

          {/* ---- CHARTS ROW: TREND + INVOICE STATUS + COLLECTION RATE ---- */}
          <div className="grid-3" style={{ marginBottom: 20 }}>
            {/* Trend Chart */}
            <Reveal delay={0.1}>
              <div className="so-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={20} color="#FFB400" /> Tendance sur 6 mois
                  </h2>
                  <div style={{ display: 'flex', gap: 14, fontSize: 11.5, color: '#5A6A7A' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2.5, background: '#FFB400', display: 'inline-block' }} /> Revenus</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 10, height: 2.5, background: '#071B4A', display: 'inline-block' }} /> Inscriptions</span>
                  </div>
                </div>
                <TrendChart trend={trend} />
              </div>
            </Reveal>

            {/* Invoice Status Donut */}
            <Reveal delay={0.15}>
              <div className="so-card" style={{ padding: 24 }}>
                <h2 className="so-heading" style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChartIcon size={20} color="#071B4A" /> État des factures
                </h2>
                <InvoiceStatusDonut breakdown={invoiceStatusBreakdown} />
              </div>
            </Reveal>

            {/* Collection Rate Card (small) */}
            <Reveal delay={0.2}>
              <div className="so-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h2 className="so-heading" style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <BarChart3 size={20} color="#FFB400" /> Taux de recouvrement
                </h2>
                {collectionRate.current === null ? (
                  <p style={{ color: '#5A6A7A' }}>Pas de données ce mois-ci.</p>
                ) : (
                  <>
                    <div style={{ fontSize: 48, fontWeight: 700, fontFamily: 'Fraunces, serif', color: '#071B4A', lineHeight: 1 }}>
                      {collectionRate.current}%
                    </div>
                    <div style={{ fontSize: 14, color: '#5A6A7A', marginTop: 8 }}>
                      {rateDelta !== null && (
                        <span style={{ fontWeight: 700, color: rateDelta >= 0 ? '#27500A' : '#C0392B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {rateDelta >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          {Math.abs(rateDelta)} pts par rapport au mois dernier
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </Reveal>
          </div>

          {/* ---- REVENUE BY CLASS (FULL WIDTH) ---- */}
          <Reveal delay={0.1}>
            <div className="so-card" style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CreditCard size={20} color="#FFB400" /> Revenus par classe et semestre
                </h2>
                <Link href="/dashboard/school-owner/payments" className="so-link-btn">
                  Détails <ChevronRight size={14} />
                </Link>
              </div>
              <RevenueByClassBars rows={revenueByClass} />
            </div>
          </Reveal>

          {/* ---- RECENT TEACHERS + MESSAGES + QUICK ACTIONS ---- */}
          <div className="grid-3" style={{ marginBottom: 24 }}>
            {/* Recent Teachers */}
            <Reveal delay={0.1}>
              <div className="so-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Users size={20} color="#071B4A" /> Enseignants récents
                  </h2>
                  <Link href="/dashboard/school-owner/teachers" className="so-link-btn">
                    Voir tous <ChevronRight size={14} />
                  </Link>
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

            {/* Messages */}
            <Reveal delay={0.15}>
              <div className="so-card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 className="so-heading" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={20} color="#071B4A" /> Messages
                  </h2>
                  <Link href="/dashboard/messages" className="so-link-btn">
                    Boîte de réception <ChevronRight size={14} />
                  </Link>
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

            {/* Quick Actions */}
            <Reveal delay={0.2}>
              <div className="so-card" style={{ padding: 24 }}>
                <h2 className="so-heading" style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={20} color="#FFB400" /> Actions rapides
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { href: '/dashboard/school-owner/teachers/new', label: 'Ajouter un enseignant', icon: <UserPlus size={16} /> },
                    { href: '/dashboard/school-owner/enrollments', label: "Demandes d'inscription", icon: <ClipboardCheck size={16} /> },
                    { href: '/dashboard/school-owner/students', label: 'Élèves', icon: <GraduationCap size={16} /> },
                    { href: '/dashboard/school-owner/payments', label: 'Paiements', icon: <CreditCard size={16} /> },
                    { href: '/dashboard/messages', label: 'Messagerie', icon: <MessageSquare size={16} /> },
                    { href: '/dashboard/school-owner/classes', label: 'Classes', icon: <School size={16} /> },
                  ].map((a, i) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: '#F9FAFC',
                        textDecoration: 'none',
                        color: '#071B4A',
                        fontSize: 13.5,
                        fontWeight: 600,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#FFB400';
                        e.currentTarget.style.color = '#071B4A';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#F9FAFC';
                        e.currentTarget.style.color = '#071B4A';
                      }}
                    >
                      {a.icon}
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}