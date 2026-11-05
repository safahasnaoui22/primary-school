'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ActionToast, { ToastData } from '@/app/components/ActionToast';

/* ------------------------------------------------------------------ */
/* Types (unchanged – page.tsx keeps passing the same props)          */
/* ------------------------------------------------------------------ */
interface StudentEntry {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  classId: string;
  parentNames: string[];
  birthDate: string | null;
}
interface ClassGroup { classId: string; className: string; count: number; }
interface ScheduleItem { id: string; title: string; date: string; type: string; description: string | null; }
interface AttendanceStudent { id: string; firstName: string; lastName: string; status: string | null; }
interface AttendanceClassSummary {
  classId: string;
  className: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  unmarked: number;
  students: AttendanceStudent[];
}
interface HomeworkItem { id: string; title: string; deadline: string; className: string; completedCount: number; totalCount: number; }
interface TaskItem { id: string; title: string; dueDate: string | null; completed: boolean; }
interface PerformanceItem { studentId: string; studentName: string; className: string; grades: { subject: string; value: number }[]; }
interface BirthdayItem { id: string; firstName: string; lastName: string; className: string; nextOccurrence: string; }
interface ConversationPreview { id: string; otherName: string; otherRole: string; lastMessage: string | null; }

interface Props {
  teacherName: string;
  classGroups: ClassGroup[];
  students: StudentEntry[];
  todaySchedule: ScheduleItem[];
  attendanceSummary: AttendanceClassSummary[];
  homeworks: HomeworkItem[];
  tasks: TaskItem[];
  studentPerformance: PerformanceItem[];
  birthdays: BirthdayItem[];
  recentConversations: ConversationPreview[];
  unreadCount: number;
}

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */
const eventType: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', bg: '#FDE8E8', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#2F7A4F', bg: '#E3F6EE', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#1E3A8A', bg: '#E6ECFA', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#A66F00', bg: '#FFF1CC', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#7A4DB3', bg: '#F1E8FC', emoji: '🎉' },
};

const STATUSES = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'] as const;
const statusLabel: Record<string, string> = { PRESENT: 'Présent', LATE: 'Retard', ABSENT: 'Absent', EXCUSED: 'Excusé' };
const statusColor: Record<string, string> = { PRESENT: '#2FA06C', LATE: '#F5A300', ABSENT: '#DB4B4B', EXCUSED: '#7C8AA3' };

const roleLabel: Record<string, string> = {
  SCHOOL_OWNER: "Chef d'établissement",
  PARENT: 'Parent',
  TEACHER: 'Enseignant',
};

const AVATARS: [string, string][] = [
  ['#071B4A', '#FFFFFF'],
  ['#FFB400', '#071B4A'],
  ['#1E3A8A', '#FFFFFF'],
  ['#E6ECFA', '#071B4A'],
  ['#FFF1CC', '#8A5A00'],
  ['#0F766E', '#FFFFFF'],
];
const TINTS: { bg: string; fg: string }[] = [
  { bg: '#E6ECFA', fg: '#1E3A8A' },
  { bg: '#E3F6EE', fg: '#0F8A5F' },
  { bg: '#FFF1CC', fg: '#8A5A00' },
  { bg: '#F3E8FF', fg: '#6B21A8' },
  { bg: '#FDE8EF', fg: '#B0275B' },
  { bg: '#E0F4FB', fg: '#0B6A8A' },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}
function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const [bg, fg] = AVATARS[hash(name) % AVATARS.length];
  return (
    <span
      className="td-av"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36), background: bg, color: fg }}
      title={name}
    >
      {initials(name)}
    </span>
  );
}

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const diffDays = (iso: string, now: Date) =>
  Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / 86400000);

function relLabel(n: number) {
  if (n === 0) return "Aujourd'hui";
  if (n === 1) return 'Demain';
  if (n === -1) return 'Hier';
  if (n < 0) return `Il y a ${-n} j`;
  return `Dans ${n} j`;
}

function recount(students: AttendanceStudent[]) {
  return {
    present: students.filter((s) => s.status === 'PRESENT').length,
    absent: students.filter((s) => s.status === 'ABSENT').length,
    late: students.filter((s) => s.status === 'LATE').length,
    excused: students.filter((s) => s.status === 'EXCUSED').length,
    unmarked: students.filter((s) => s.status === null).length,
  };
}

function gradeTone(v: number) {
  if (v >= 16) return { bg: '#E3F6EE', fg: '#1F7A52' };
  if (v >= 10) return { bg: '#FFF4D6', fg: '#8A5A00' };
  return { bg: '#FDE8E8', fg: '#B42B2B' };
}

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const Ic = {
  search: (<svg width="18" height="18" viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>),
  x: (<svg width="14" height="14" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d="M6 6l12 12M18 6L6 18" /></svg>),
  plus: (<svg width="16" height="16" viewBox="0 0 24 24" {...S} strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>),
  chev: (<svg width="16" height="16" viewBox="0 0 24 24" {...S} strokeWidth={2.2}><path d="M6 9l6 6 6-6" /></svg>),
  users: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><circle cx="17.5" cy="9" r="2.4" /><path d="M15.5 14.3c2.6.3 4.5 2.1 4.5 4.7" /></svg>),
  clip: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 13l2 2 4-4" /></svg>),
  book: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></svg>),
  msg: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>),
  cal: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>),
  check: (<svg width="13" height="13" viewBox="0 0 24 24" {...S} strokeWidth={3.2}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>),
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function TeacherDashboardClient({
  teacherName,
  classGroups,
  students,
  todaySchedule,
  attendanceSummary,
  homeworks,
  tasks: initialTasks,
  studentPerformance,
  birthdays,
  recentConversations,
  unreadCount,
}: Props) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [now, setNow] = useState<Date | null>(null); // set after mount → no server/client date mismatch
  const [search, setSearch] = useState('');
  const [attendance, setAttendance] = useState<AttendanceClassSummary[]>(attendanceSummary);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(
    () => attendanceSummary.find((c) => c.unmarked > 0)?.classId ?? null
  );
  const [markingKey, setMarkingKey] = useState<string | null>(null);
  const [bulkId, setBulkId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [showAllPerf, setShowAllPerf] = useState(false);

  useEffect(() => { setNow(new Date()); }, []);

  /* ---------- derived ---------- */
  const totalStudents = students.length;
  const totalUnmarked = attendance.reduce((n, c) => n + c.unmarked, 0);
  const totalMarked = attendance.reduce((n, c) => n + (c.totalStudents - c.unmarked), 0);
  const allStudentsToday = attendance.reduce((n, c) => n + c.totalStudents, 0);
  const pendingTasks = tasks.filter((t) => !t.completed).length;

  const hour = now?.getHours() ?? 9;
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const dateLabel = now
    ? now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || `${s.lastName} ${s.firstName}`.toLowerCase().includes(q));
  }, [search, students]);

  const agenda = useMemo(() => {
    if (!now) return [];
    const groups = new Map<string, { label: string; sub: string; items: ScheduleItem[] }>();
    for (const e of todaySchedule) {
      const d = startOfDay(new Date(e.date));
      const key = d.toISOString();
      if (!groups.has(key)) {
        const n = diffDays(e.date, now);
        const weekday = d.toLocaleDateString('fr-FR', { weekday: 'long' });
        groups.set(key, {
          label: n === 0 ? "Aujourd'hui" : n === 1 ? 'Demain' : weekday.charAt(0).toUpperCase() + weekday.slice(1),
          sub: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          items: [],
        });
      }
      groups.get(key)!.items.push(e);
    }
    return Array.from(groups.values());
  }, [todaySchedule, now]);

  const perfShown = showAllPerf ? studentPerformance : studentPerformance.slice(0, 6);

  /* ---------- actions ---------- */
  const errorToast = (message: string) =>
    setToast({ title: 'Erreur', message, emoji: '⚠️', tone: 'error' });

  const applyStatuses = (classId: string, updates: { studentId: string; status: string }[]) => {
    const map = new Map(updates.map((u) => [u.studentId, u.status]));
    setAttendance((prev) =>
      prev.map((c) => {
        if (c.classId !== classId) return c;
        const list = c.students.map((s) => (map.has(s.id) ? { ...s, status: map.get(s.id)! } : s));
        return { ...c, students: list, ...recount(list) };
      })
    );
  };

  const markAttendance = async (classId: string, studentId: string, status: string) => {
    const key = `${classId}:${studentId}`;
    try {
      setMarkingKey(key);
      const res = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, classId, status }),
      });
      if (!res.ok) {
        errorToast("Impossible d'enregistrer la présence.");
        return;
      }
      applyStatuses(classId, [{ studentId, status }]);
    } catch {
      errorToast("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setMarkingKey(null);
    }
  };

  const markAllPresent = async (classId: string) => {
    const cls = attendance.find((c) => c.classId === classId);
    if (!cls) return;
    const targets = cls.students.filter((s) => s.status === null);
    if (targets.length === 0) return;
    setBulkId(classId);
    const done = await Promise.all(
      targets.map(async (s) => {
        try {
          const res = await fetch('/api/teacher/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: s.id, classId, status: 'PRESENT' }),
          });
          return res.ok ? s.id : null;
        } catch {
          return null;
        }
      })
    );
    const okIds = done.filter((x): x is string => x !== null);
    if (okIds.length > 0) applyStatuses(classId, okIds.map((studentId) => ({ studentId, status: 'PRESENT' })));
    setBulkId(null);
    if (okIds.length === targets.length) {
      setToast({ title: 'Présences enregistrées', message: `${okIds.length} élève${okIds.length > 1 ? 's' : ''} marqué${okIds.length > 1 ? 's' : ''} présent${okIds.length > 1 ? 's' : ''} (${cls.className}).`, emoji: '✅', tone: 'success' });
    } else {
      errorToast(`${targets.length - okIds.length} présence(s) n'ont pas pu être enregistrées.`);
    }
  };

  const addTask = async () => {
    const title = newTask.trim();
    if (!title || savingTask) return;
    try {
      setSavingTask(true);
      const res = await fetch('/api/teacher/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (!res.ok) {
        errorToast(data?.error ?? "Impossible d'ajouter la tâche.");
        return;
      }
      setTasks((prev) => [{ id: data.id, title: data.title, dueDate: data.dueDate ?? null, completed: false }, ...prev]);
      setNewTask('');
      setToast({ title: 'Tâche ajoutée', message: `« ${title} » a été ajoutée à votre liste.`, emoji: '✅', tone: 'success' });
    } catch {
      errorToast("Impossible d'ajouter la tâche.");
    } finally {
      setSavingTask(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const next = !completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
    try {
      const res = await fetch(`/api/teacher/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: next }),
      });
      if (!res.ok) throw new Error('fail');
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
      errorToast('Impossible de modifier la tâche.');
    }
  };

  const deleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/teacher/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('fail');
    } catch {
      setTasks((prev) => [task, ...prev]);
      errorToast('Impossible de supprimer la tâche.');
    }
  };

  const scrollToAttendance = () =>
    document.getElementById('td-attendance')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* ---------- stat tiles ---------- */
  const nextHomework = homeworks[0];

  /* ================================================================ */
  return (
    <div className="td-wrap">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .td-wrap { max-width: 1240px; margin: 0 auto; padding: 24px 28px 64px; font-family: Inter, sans-serif; color: #1A2233; }
        .td-h { font-family: Fraunces, serif; font-weight: 700; color: #071B4A; margin: 0; }
        .td-av { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: 700; flex-shrink: 0; letter-spacing: .02em; }

        /* Hero */
        .td-hero { position: relative; border-radius: 24px; padding: 32px 36px 74px; color: #fff; background: linear-gradient(135deg, #071B4A 0%, #0A2A6B 62%, #12378A 100%); box-shadow: 0 18px 40px rgba(7,27,74,.2); z-index: 5; }
        .td-hero-bg { position: absolute; inset: 0; border-radius: 24px; overflow: hidden; pointer-events: none; }
        .td-hero-bg::before { content: ''; position: absolute; right: -90px; top: -130px; width: 400px; height: 400px; border-radius: 50%; background: radial-gradient(circle, rgba(255,180,0,.5), rgba(255,180,0,0) 68%); }
        .td-hero-bg::after { content: ''; position: absolute; left: -70px; bottom: -150px; width: 300px; height: 300px; border-radius: 50%; border: 1px solid rgba(255,255,255,.1); box-shadow: 0 0 0 38px rgba(255,255,255,.03), 0 0 0 80px rgba(255,255,255,.02); }
        .td-hero-in { position: relative; display: flex; justify-content: space-between; align-items: flex-end; gap: 24px; flex-wrap: wrap; }
        .td-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 11.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #FFB400; margin-bottom: 12px; min-height: 14px; }
        .td-eyebrow::before { content: ''; width: 26px; height: 2px; background: #FFB400; border-radius: 2px; }
        .td-h1 { font-family: Fraunces, serif; font-weight: 700; font-size: 36px; line-height: 1.08; letter-spacing: -.015em; margin: 0; color: #fff; }
        .td-lead { margin: 12px 0 0; color: rgba(255,255,255,.75); font-size: 15px; line-height: 1.55; }
        .td-lead b { color: #FFB400; font-weight: 700; }

        .td-search { position: relative; width: 360px; max-width: 100%; }
        .td-search > svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8794A8; pointer-events: none; }
        .td-search input { width: 100%; height: 46px; padding: 0 40px 0 44px; border-radius: 14px; border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.96); font-family: inherit; font-size: 14px; color: #1A2233; outline: none; transition: box-shadow .15s; }
        .td-search input:focus { box-shadow: 0 0 0 3px rgba(255,180,0,.45); }
        .td-search input::placeholder { color: #8794A8; }
        .td-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px; border-radius: 8px; border: none; background: #EDF1F8; color: #5A6A7A; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .td-results { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border-radius: 16px; box-shadow: 0 20px 50px rgba(7,27,74,.28); padding: 6px; z-index: 30; max-height: 360px; overflow-y: auto; color: #1A2233; }
        .td-res { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 11px; }
        .td-res:hover { background: #F5F8FD; }
        .td-res-n { font-weight: 700; font-size: 14px; color: #071B4A; }
        .td-res-s { font-size: 12.5px; color: #6B7A90; margin-top: 2px; }
        .td-pill { display: inline-flex; align-items: center; font-size: 11.5px; font-weight: 700; padding: 2px 9px; border-radius: 999px; white-space: nowrap; }
        .td-none { padding: 16px 12px; font-size: 13.5px; color: #6B7A90; }

        /* Stats */
        .td-stats { position: relative; z-index: 2; margin: -46px 22px 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .td-stat { position: relative; display: block; text-align: left; font-family: inherit; background: #fff; border: 1px solid #E8ECF3; border-radius: 18px; padding: 18px 20px; box-shadow: 0 10px 28px rgba(7,27,74,.09); overflow: hidden; text-decoration: none; color: inherit; cursor: pointer; transition: transform .2s, box-shadow .2s; }
        .td-stat:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(7,27,74,.14); }
        .td-stat::before { content: ''; position: absolute; left: 0; top: 0; right: 0; height: 3px; background: linear-gradient(90deg, #FFB400, rgba(255,180,0,0)); }
        .td-stat-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .td-stat-l { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #7A8AA0; }
        .td-ico { width: 38px; height: 38px; border-radius: 11px; display: inline-flex; align-items: center; justify-content: center; }
        .td-ico.navy { background: #E6ECFA; color: #071B4A; }
        .td-ico.green { background: #E3F6EE; color: #0F8A5F; }
        .td-ico.amber { background: #FFF1CC; color: #B27300; }
        .td-ico.red { background: #FDE8E8; color: #C53030; }
        .td-stat-v { font-family: Fraunces, serif; font-weight: 700; font-size: 32px; line-height: 1; color: #071B4A; }
        .td-stat-s { font-size: 12.5px; color: #6B7A90; margin-top: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        /* Quick actions */
        .td-quick { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 22px; }
        .td-q { display: inline-flex; align-items: center; gap: 9px; background: #fff; border: 1px solid #E2E7F0; color: #071B4A; font-size: 13.5px; font-weight: 600; padding: 10px 16px; border-radius: 999px; text-decoration: none; transition: all .15s; }
        .td-q:hover { background: #071B4A; border-color: #071B4A; color: #fff; transform: translateY(-1px); }
        .td-q svg { width: 17px; height: 17px; }

        /* Grid & cards */
        .td-main { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); gap: 20px; align-items: start; }
        .td-col { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
        .td-card { background: #fff; border: 1px solid #E8ECF3; border-radius: 20px; box-shadow: 0 6px 24px rgba(7,27,74,.055); padding: 22px; scroll-margin-top: 16px; }
        .td-ch { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; }
        .td-ct { font-family: Fraunces, serif; font-weight: 700; font-size: 19px; color: #071B4A; margin: 0; display: flex; align-items: center; gap: 10px; }
        .td-sub { font-size: 12.5px; color: #7A8AA0; margin-top: 3px; font-family: Inter, sans-serif; font-weight: 500; }
        .td-link { font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 2px solid #FFB400; padding-bottom: 1px; white-space: nowrap; }
        .td-link:hover { color: #0A2A6B; }
        .td-count { font-size: 11.5px; font-weight: 700; background: #FFB400; color: #071B4A; padding: 2px 9px; border-radius: 999px; font-family: Inter, sans-serif; }
        .td-empty { text-align: center; padding: 22px 10px; color: #7A8AA0; font-size: 13.5px; }
        .td-empty b { display: block; font-size: 22px; margin-bottom: 4px; }

        /* Attendance */
        .td-cls { border: 1px solid #E8ECF3; border-radius: 16px; margin-bottom: 12px; overflow: hidden; transition: border-color .15s, box-shadow .15s; }
        .td-cls:last-child { margin-bottom: 0; }
        .td-cls.open { border-color: #CBD5EA; box-shadow: 0 6px 18px rgba(7,27,74,.06); }
        .td-cls-h { width: 100%; display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: transparent; border: none; cursor: pointer; font-family: inherit; text-align: left; }
        .td-cls-h:hover { background: #FAFBFE; }
        .td-cls-sq { width: 42px; height: 42px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
        .td-cls-m { min-width: 0; flex: 1; }
        .td-cls-n { font-weight: 700; color: #071B4A; font-size: 15px; }
        .td-cls-c { font-size: 12.5px; color: #7A8AA0; margin-top: 2px; }
        .td-bar { display: flex; height: 8px; border-radius: 999px; overflow: hidden; background: #EDF1F8; margin-top: 8px; }
        .td-bar i { display: block; height: 100%; transition: width .4s ease; }
        .td-cnt { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
        .td-cn { font-size: 12px; font-weight: 700; padding: 3px 9px; border-radius: 999px; white-space: nowrap; }
        .td-chev { color: #8794A8; transition: transform .2s; display: inline-flex; flex-shrink: 0; }
        .td-cls.open .td-chev { transform: rotate(180deg); }
        .td-cls-b { border-top: 1px solid #EEF1F6; padding: 6px 16px 12px; background: #FDFDFF; }
        .td-bulk { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 0; }
        .td-bulk span { font-size: 12.5px; color: #7A8AA0; }
        .td-btn { display: inline-flex; align-items: center; gap: 7px; border: none; background: #FFB400; color: #071B4A; font-family: inherit; font-size: 13px; font-weight: 700; padding: 9px 16px; border-radius: 11px; cursor: pointer; box-shadow: 0 6px 14px rgba(255,180,0,.3); transition: transform .15s, background .15s; white-space: nowrap; }
        .td-btn:hover:not(:disabled) { background: #FFC21F; transform: translateY(-1px); }
        .td-btn:disabled { opacity: .6; cursor: not-allowed; }
        .td-stu { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-top: 1px solid #F0F3F8; }
        .td-stu-n { flex: 1; min-width: 0; font-size: 14px; font-weight: 600; color: #26344F; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-seg { display: inline-flex; gap: 4px; background: #F0F3F8; border-radius: 11px; padding: 3px; }
        .td-seg button { border: none; background: transparent; font-family: inherit; font-size: 12px; font-weight: 600; color: #5A6A7A; padding: 6px 11px; border-radius: 8px; cursor: pointer; transition: all .12s; white-space: nowrap; }
        .td-seg button:hover:not(:disabled):not(.on) { background: #fff; }
        .td-seg button.on { color: #fff; box-shadow: 0 2px 8px rgba(7,27,74,.18); }
        .td-seg button:disabled { opacity: .55; cursor: wait; }

        /* Performance */
        .td-perf { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid #F0F3F8; }
        .td-perf:first-of-type { border-top: none; padding-top: 0; }
        .td-perf-m { flex: 1; min-width: 0; }
        .td-perf-n { font-weight: 700; color: #071B4A; font-size: 14px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .td-grades { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 7px; }
        .td-g { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 8px; }
        .td-avg { text-align: right; flex-shrink: 0; }
        .td-avg b { font-family: Fraunces, serif; font-size: 22px; color: #071B4A; line-height: 1; }
        .td-avg span { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #98A4B6; margin-top: 3px; }
        .td-more { width: 100%; margin-top: 12px; border: 1px dashed #CBD3E1; background: #FAFBFE; color: #4A5A70; font-family: inherit; font-size: 13px; font-weight: 600; padding: 10px; border-radius: 12px; cursor: pointer; }
        .td-more:hover { background: #F0F4FB; }

        /* Agenda */
        .td-day { font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #7A8AA0; margin: 4px 0 10px; display: flex; justify-content: space-between; }
        .td-day span { font-weight: 600; letter-spacing: 0; text-transform: none; color: #98A4B6; }
        .td-ev { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 13px; background: #F8FAFD; margin-bottom: 8px; }
        .td-ev-i { width: 36px; height: 36px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 17px; flex-shrink: 0; }
        .td-ev-t { font-size: 13.5px; font-weight: 600; color: #071B4A; }
        .td-ev-k { font-size: 11.5px; font-weight: 700; margin-top: 2px; }
        .td-agenda-grp + .td-agenda-grp { margin-top: 14px; }

        /* Tasks */
        .td-add { display: flex; gap: 8px; margin-bottom: 12px; }
        .td-add input { flex: 1; min-width: 0; height: 42px; padding: 0 14px; border-radius: 12px; border: 1px solid #E2E7F0; background: #F8FAFD; font-family: inherit; font-size: 14px; outline: none; }
        .td-add input:focus { border-color: #071B4A; background: #fff; box-shadow: 0 0 0 3px rgba(255,180,0,.28); }
        .td-add button { width: 42px; height: 42px; border: none; border-radius: 12px; background: #071B4A; color: #FFB400; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .td-add button:hover:not(:disabled) { background: #0A2A6B; }
        .td-add button:disabled { opacity: .6; cursor: not-allowed; }
        .td-task { display: flex; align-items: center; gap: 12px; padding: 10px 4px; border-top: 1px solid #F0F3F8; }
        .td-task:first-of-type { border-top: none; }
        .td-box { width: 22px; height: 22px; border-radius: 7px; border: 2px solid #C5CEDF; background: #fff; color: transparent; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; padding: 0; transition: all .15s; }
        .td-box.on { background: #2FA06C; border-color: #2FA06C; color: #fff; }
        .td-task-t { flex: 1; min-width: 0; font-size: 14px; color: #26344F; word-break: break-word; }
        .td-task-t.done { text-decoration: line-through; color: #98A4B6; }
        .td-del { border: none; background: transparent; color: #B0B9C8; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .td-del:hover { background: #FDE8E8; color: #C53030; }

        /* Homework */
        .td-hw { padding: 12px 0; border-top: 1px solid #F0F3F8; }
        .td-hw:first-of-type { border-top: none; padding-top: 0; }
        .td-hw-h { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
        .td-hw-t { font-size: 14px; font-weight: 700; color: #071B4A; }
        .td-hw-m { display: flex; align-items: center; gap: 8px; margin-top: 5px; flex-wrap: wrap; font-size: 12.5px; color: #6B7A90; }
        .td-meter { height: 7px; background: #EDF1F8; border-radius: 999px; overflow: hidden; margin-top: 10px; }
        .td-meter i { display: block; height: 100%; background: linear-gradient(90deg, #071B4A, #FFB400); border-radius: 999px; transition: width .5s ease; }
        .td-hw-p { font-size: 12px; font-weight: 700; color: #4A5A70; white-space: nowrap; }

        /* Birthdays / messages rows */
        .td-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid #F0F3F8; }
        .td-row:first-of-type { border-top: none; padding-top: 0; }
        .td-row-m { flex: 1; min-width: 0; }
        .td-row-n { font-size: 14px; font-weight: 700; color: #071B4A; display: flex; align-items: center; gap: 8px; }
        .td-row-s { font-size: 12.5px; color: #6B7A90; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .td-when { text-align: right; flex-shrink: 0; font-size: 12px; font-weight: 700; color: #071B4A; }
        .td-when span { display: block; font-weight: 500; color: #7A8AA0; margin-top: 2px; }

        @media (max-width: 1100px) {
          .td-main { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .td-stats { grid-template-columns: repeat(2, 1fr); margin-left: 12px; margin-right: 12px; }
        }
        @media (max-width: 640px) {
          .td-wrap { padding: 16px 14px 56px; }
          .td-hero { padding: 26px 22px 68px; border-radius: 20px; }
          .td-hero-bg { border-radius: 20px; }
          .td-h1 { font-size: 28px; }
          .td-search { width: 100%; }
          .td-stats { margin: -44px 6px 18px; gap: 12px; }
          .td-stat { padding: 14px; }
          .td-stat-v { font-size: 27px; }
          .td-card { padding: 18px 16px; border-radius: 18px; }
          .td-cls-h { flex-wrap: wrap; }
          .td-cnt { justify-content: flex-start; width: 100%; }
          .td-stu { flex-wrap: wrap; }
          .td-seg { width: 100%; }
          .td-seg button { flex: 1; padding: 8px 4px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .td-stat, .td-q, .td-btn, .td-bar i, .td-meter i { transition: none; }
        }
      `}</style>

      {/* ================= HERO ================= */}
      <section className="td-hero">
        <div className="td-hero-bg" />
        <div className="td-hero-in">
          <div>
            <div className="td-eyebrow">{dateLabel || 'Espace enseignant'}</div>
            <h1 className="td-h1">{greeting}, {teacherName || 'Enseignant'}</h1>
            <p className="td-lead">
              {classGroups.length} classe{classGroups.length !== 1 ? 's' : ''} · {totalStudents} élève{totalStudents !== 1 ? 's' : ''}
              {totalUnmarked > 0 ? (
                <> · <b>{totalUnmarked} présence{totalUnmarked !== 1 ? 's' : ''} à marquer</b></>
              ) : allStudentsToday > 0 ? (
                <> · <b>appel du jour terminé ✓</b></>
              ) : null}
            </p>
          </div>

          <div className="td-search">
            {Ic.search}
            <input
              placeholder="Rechercher un élève…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Rechercher un élève"
            />
            {search && (
              <button type="button" className="td-clear" onClick={() => setSearch('')} aria-label="Effacer">{Ic.x}</button>
            )}
            {search.trim() && (
              <div className="td-results">
                {results.length === 0 ? (
                  <div className="td-none">Aucun élève trouvé.</div>
                ) : (
                  <>
                    {results.slice(0, 6).map((s) => {
                      const t = TINTS[hash(s.className) % TINTS.length];
                      return (
                        <div className="td-res" key={s.id}>
                          <Avatar name={`${s.firstName} ${s.lastName}`} size={38} />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div className="td-res-n">{s.firstName} {s.lastName}</div>
                            <div className="td-res-s">{s.parentNames.join(', ') || 'Aucun parent lié'}</div>
                          </div>
                          <span className="td-pill" style={{ background: t.bg, color: t.fg }}>{s.className}</span>
                        </div>
                      );
                    })}
                    {results.length > 6 && <div className="td-none">+ {results.length - 6} autre{results.length - 6 > 1 ? 's' : ''} résultat{results.length - 6 > 1 ? 's' : ''} — affinez la recherche</div>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <div className="td-stats">
        <Link href="/dashboard/teacher/classroom" className="td-stat">
          <div className="td-stat-top"><span className="td-stat-l">Mes élèves</span><span className="td-ico navy">{Ic.users}</span></div>
          <div className="td-stat-v">{totalStudents}</div>
          <div className="td-stat-s">dans {classGroups.length} classe{classGroups.length !== 1 ? 's' : ''}</div>
        </Link>

        <button type="button" className="td-stat" onClick={scrollToAttendance}>
          <div className="td-stat-top"><span className="td-stat-l">Appel du jour</span><span className={`td-ico ${totalUnmarked > 0 ? 'amber' : 'green'}`}>{Ic.clip}</span></div>
          <div className="td-stat-v">{totalUnmarked}</div>
          <div className="td-stat-s">{totalUnmarked > 0 ? 'à marquer aujourd’hui' : allStudentsToday > 0 ? 'Tout est à jour' : 'Aucun élève'}</div>
        </button>

        <Link href="/dashboard/teacher/classroom" className="td-stat">
          <div className="td-stat-top"><span className="td-stat-l">Devoirs à venir</span><span className="td-ico green">{Ic.book}</span></div>
          <div className="td-stat-v">{homeworks.length}</div>
          <div className="td-stat-s">{nextHomework ? `Prochain : ${nextHomework.title}` : 'Aucun devoir prévu'}</div>
        </Link>

        <Link href="/dashboard/messages" className="td-stat">
          <div className="td-stat-top"><span className="td-stat-l">Messages</span><span className={`td-ico ${unreadCount > 0 ? 'red' : 'navy'}`}>{Ic.msg}</span></div>
          <div className="td-stat-v">{unreadCount}</div>
          <div className="td-stat-s">{unreadCount > 0 ? `non lu${unreadCount !== 1 ? 's' : ''}` : 'Aucun message non lu'}</div>
        </Link>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="td-quick">
        <Link href="/dashboard/teacher/attendance" className="td-q">{Ic.clip} Faire l’appel</Link>
        <Link href="/dashboard/teacher/classroom" className="td-q">{Ic.book} Devoirs & ressources</Link>
        <Link href="/dashboard/teacher/timetable" className="td-q">{Ic.cal} Emploi du temps</Link>
        <Link href="/dashboard/messages" className="td-q">{Ic.msg} Messagerie</Link>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="td-main">
        {/* ---------- LEFT ---------- */}
        <div className="td-col">
          {/* Attendance */}
          <section className="td-card" id="td-attendance">
            <div className="td-ch">
              <div>
                <h2 className="td-ct">Présences du jour</h2>
                <div className="td-sub">
                  {allStudentsToday > 0 ? `${totalMarked} / ${allStudentsToday} élèves marqués` : 'Aucune classe assignée'}
                </div>
              </div>
              <Link href="/dashboard/teacher/attendance" className="td-link">Page complète →</Link>
            </div>

            {attendance.length === 0 ? (
              <div className="td-empty"><b>🏫</b>Aucune classe assignée pour le moment.</div>
            ) : (
              attendance.map((c) => {
                const open = expandedClassId === c.classId;
                const tint = TINTS[hash(c.className) % TINTS.length];
                const total = Math.max(c.totalStudents, 1);
                const pct = (n: number) => `${(n / total) * 100}%`;
                return (
                  <div key={c.classId} className={`td-cls${open ? ' open' : ''}`}>
                    <button type="button" className="td-cls-h" onClick={() => setExpandedClassId(open ? null : c.classId)} aria-expanded={open}>
                      <span className="td-cls-sq" style={{ background: tint.bg, color: tint.fg }}>{c.className.slice(0, 3).toUpperCase()}</span>
                      <span className="td-cls-m">
                        <div className="td-cls-n">{c.className}</div>
                        <div className="td-cls-c">{c.totalStudents} élève{c.totalStudents !== 1 ? 's' : ''}</div>
                        <div className="td-bar" aria-hidden>
                          <i style={{ width: pct(c.present), background: statusColor.PRESENT }} />
                          <i style={{ width: pct(c.late), background: statusColor.LATE }} />
                          <i style={{ width: pct(c.excused), background: statusColor.EXCUSED }} />
                          <i style={{ width: pct(c.absent), background: statusColor.ABSENT }} />
                        </div>
                      </span>
                      <span className="td-cnt">
                        <span className="td-cn" style={{ background: '#E3F6EE', color: '#1F7A52' }}>{c.present} présent{c.present !== 1 ? 's' : ''}</span>
                        {c.late > 0 && <span className="td-cn" style={{ background: '#FFF4D6', color: '#8A5A00' }}>{c.late} retard{c.late !== 1 ? 's' : ''}</span>}
                        {c.absent > 0 && <span className="td-cn" style={{ background: '#FDE8E8', color: '#B42B2B' }}>{c.absent} absent{c.absent !== 1 ? 's' : ''}</span>}
                        {c.excused > 0 && <span className="td-cn" style={{ background: '#EDF1F8', color: '#5A6A7A' }}>{c.excused} excusé{c.excused !== 1 ? 's' : ''}</span>}
                        {c.unmarked > 0 && <span className="td-cn" style={{ background: '#F0F2F6', color: '#6B7A90' }}>{c.unmarked} à marquer</span>}
                      </span>
                      <span className="td-chev">{Ic.chev}</span>
                    </button>

                    {open && (
                      <div className="td-cls-b">
                        {c.unmarked > 0 && (
                          <div className="td-bulk">
                            <span>{c.unmarked} élève{c.unmarked !== 1 ? 's' : ''} sans statut</span>
                            <button type="button" className="td-btn" onClick={() => markAllPresent(c.classId)} disabled={bulkId === c.classId}>
                              {Ic.check} {bulkId === c.classId ? 'Enregistrement…' : 'Marquer tous présents'}
                            </button>
                          </div>
                        )}
                        {c.students.map((s) => {
                          const key = `${c.classId}:${s.id}`;
                          return (
                            <div className="td-stu" key={s.id}>
                              <Avatar name={`${s.firstName} ${s.lastName}`} size={34} />
                              <span className="td-stu-n">{s.firstName} {s.lastName}</span>
                              <div className="td-seg" role="group" aria-label={`Statut de ${s.firstName}`}>
                                {STATUSES.map((st) => {
                                  const on = s.status === st;
                                  return (
                                    <button
                                      key={st}
                                      type="button"
                                      className={on ? 'on' : ''}
                                      style={on ? { background: statusColor[st] } : undefined}
                                      disabled={markingKey === key}
                                      aria-pressed={on}
                                      onClick={() => markAttendance(c.classId, s.id, st)}
                                    >
                                      {statusLabel[st]}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </section>

          {/* Performance */}
          <section className="td-card">
            <div className="td-ch">
              <div>
                <h2 className="td-ct">Aperçu des performances</h2>
                <div className="td-sub">Dernière note par matière</div>
              </div>
            </div>

            {studentPerformance.length === 0 ? (
              <div className="td-empty"><b>📈</b>Aucun élève pour le moment.</div>
            ) : (
              <>
                {perfShown.map((s) => {
                  const avg = s.grades.length > 0 ? s.grades.reduce((n, g) => n + g.value, 0) / s.grades.length : null;
                  const at = avg !== null ? gradeTone(avg) : null;
                  const ct = TINTS[hash(s.className) % TINTS.length];
                  return (
                    <div className="td-perf" key={s.studentId}>
                      <Avatar name={s.studentName} size={40} />
                      <div className="td-perf-m">
                        <div className="td-perf-n">
                          {s.studentName}
                          <span className="td-pill" style={{ background: ct.bg, color: ct.fg }}>{s.className}</span>
                        </div>
                        {s.grades.length === 0 ? (
                          <div className="td-sub" style={{ marginTop: 6 }}>Aucune note enregistrée</div>
                        ) : (
                          <div className="td-grades">
                            {s.grades.map((g) => {
                              const t = gradeTone(g.value);
                              return <span className="td-g" key={g.subject} style={{ background: t.bg, color: t.fg }}>{g.subject} · {g.value}</span>;
                            })}
                          </div>
                        )}
                      </div>
                      {avg !== null && at && (
                        <div className="td-avg">
                          <b style={{ color: at.fg }}>{avg.toFixed(1)}</b>
                          <span>Moyenne</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {studentPerformance.length > 6 && (
                  <button type="button" className="td-more" onClick={() => setShowAllPerf((v) => !v)}>
                    {showAllPerf ? 'Voir moins' : `Voir tous les élèves (${studentPerformance.length})`}
                  </button>
                )}
              </>
            )}
          </section>
        </div>

        {/* ---------- RIGHT ---------- */}
        <div className="td-col">
          {/* Agenda */}
          <section className="td-card">
            <div className="td-ch">
              <div>
                <h2 className="td-ct">Agenda de la semaine</h2>
                <div className="td-sub">7 prochains jours</div>
              </div>
              <Link href="/dashboard/teacher/timetable" className="td-link">Horaires →</Link>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="td-empty"><b>🗓️</b>Rien de prévu cette semaine.</div>
            ) : !now ? (
              <div className="td-empty">Chargement…</div>
            ) : (
              agenda.map((g) => (
                <div className="td-agenda-grp" key={g.label + g.sub}>
                  <div className="td-day">{g.label}<span>{g.sub}</span></div>
                  {g.items.map((e) => {
                    const et = eventType[e.type] ?? eventType.EVENT;
                    return (
                      <div className="td-ev" key={e.id}>
                        <span className="td-ev-i" style={{ background: et.bg }}>{et.emoji}</span>
                        <div style={{ minWidth: 0 }}>
                          <div className="td-ev-t">{e.title}</div>
                          <div className="td-ev-k" style={{ color: et.color }}>{et.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </section>

          {/* Tasks */}
          <section className="td-card">
            <div className="td-ch">
              <h2 className="td-ct">À faire {pendingTasks > 0 && <span className="td-count">{pendingTasks}</span>}</h2>
            </div>
            <div className="td-add">
              <input
                placeholder="Ajouter une tâche…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                aria-label="Nouvelle tâche"
              />
              <button type="button" onClick={addTask} disabled={savingTask || !newTask.trim()} aria-label="Ajouter">{Ic.plus}</button>
            </div>

            {tasks.length === 0 ? (
              <div className="td-empty"><b>✅</b>Aucune tâche. Profitez-en !</div>
            ) : (
              tasks.map((t) => (
                <div className="td-task" key={t.id}>
                  <button type="button" className={`td-box${t.completed ? ' on' : ''}`} onClick={() => toggleTask(t.id, t.completed)} aria-label={t.completed ? 'Marquer comme à faire' : 'Marquer comme faite'} aria-pressed={t.completed}>
                    {Ic.check}
                  </button>
                  <span className={`td-task-t${t.completed ? ' done' : ''}`}>{t.title}</span>
                  <button type="button" className="td-del" onClick={() => deleteTask(t.id)} aria-label={`Supprimer ${t.title}`}>{Ic.x}</button>
                </div>
              ))
            )}
          </section>

          {/* Homework */}
          <section className="td-card">
            <div className="td-ch">
              <h2 className="td-ct">Devoirs à venir</h2>
              <Link href="/dashboard/teacher/classroom" className="td-link">Gérer →</Link>
            </div>
            {homeworks.length === 0 ? (
              <div className="td-empty"><b>📚</b>Aucun devoir à venir.</div>
            ) : (
              homeworks.map((h) => {
                const pct = h.totalCount > 0 ? Math.round((h.completedCount / h.totalCount) * 100) : 0;
                const n = now ? diffDays(h.deadline, now) : null;
                const urgent = n !== null && n <= 1;
                return (
                  <div className="td-hw" key={h.id}>
                    <div className="td-hw-h">
                      <span className="td-hw-t">{h.title}</span>
                      <span className="td-hw-p">{h.completedCount}/{h.totalCount}</span>
                    </div>
                    <div className="td-hw-m">
                      <span className="td-pill" style={{ background: TINTS[hash(h.className) % TINTS.length].bg, color: TINTS[hash(h.className) % TINTS.length].fg }}>{h.className}</span>
                      {n !== null && (
                        <span style={{ fontWeight: 700, color: urgent ? '#C53030' : '#6B7A90' }}>{relLabel(n)}</span>
                      )}
                    </div>
                    <div className="td-meter"><i style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })
            )}
          </section>

          {/* Birthdays */}
          <section className="td-card">
            <div className="td-ch"><h2 className="td-ct">Anniversaires 🎂</h2></div>
            {birthdays.length === 0 ? (
              <div className="td-empty"><b>🎈</b>Aucun anniversaire dans les 30 prochains jours.</div>
            ) : (
              <>
                {birthdays.slice(0, 5).map((b) => {
                  const n = now ? diffDays(b.nextOccurrence, now) : null;
                  return (
                    <div className="td-row" key={b.id}>
                      <Avatar name={`${b.firstName} ${b.lastName}`} size={38} />
                      <div className="td-row-m">
                        <div className="td-row-n">{b.firstName} {b.lastName}</div>
                        <div className="td-row-s">{b.className}</div>
                      </div>
                      <div className="td-when">
                        {n === 0 ? "Aujourd'hui 🎉" : now ? new Date(b.nextOccurrence).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''}
                        {n !== null && n > 0 && <span>{relLabel(n)}</span>}
                      </div>
                    </div>
                  );
                })}
                {birthdays.length > 5 && <div className="td-sub" style={{ marginTop: 10 }}>+ {birthdays.length - 5} autre{birthdays.length - 5 > 1 ? 's' : ''} ce mois-ci</div>}
              </>
            )}
          </section>

          {/* Messages */}
          <section className="td-card">
            <div className="td-ch">
              <h2 className="td-ct">Messages {unreadCount > 0 && <span className="td-count">{unreadCount}</span>}</h2>
              <Link href="/dashboard/messages" className="td-link">Voir tout →</Link>
            </div>
            {recentConversations.length === 0 ? (
              <div className="td-empty"><b>💬</b>Aucune conversation.</div>
            ) : (
              recentConversations.map((c) => (
                <div className="td-row" key={c.id}>
                  <Avatar name={c.otherName} size={38} />
                  <div className="td-row-m">
                    <div className="td-row-n">
                      {c.otherName}
                      <span className="td-pill" style={{ background: '#EDF1F8', color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</span>
                    </div>
                    {c.lastMessage && <div className="td-row-s">{c.lastMessage}</div>}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}