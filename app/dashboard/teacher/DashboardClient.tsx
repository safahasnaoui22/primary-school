'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ActionToast, { ToastData } from '@/app/components/ActionToast';

interface RosterParent { id: string; username: string; }
interface RosterStudent { id: string; firstName: string; lastName: string; parents: RosterParent[]; }
interface StudentEntry {
  id: string; firstName: string; lastName: string; className: string; classId: string;
  parentNames: string[]; parents: RosterParent[]; birthDate: string | null;
}
interface ClassGroup { classId: string; className: string; students: RosterStudent[]; count: number; }
interface ScheduleItem { id: string; title: string; date: string; type: string; description: string | null; }
interface AttendanceStudent { id: string; firstName: string; lastName: string; status: string | null; }
interface AttendanceClassSummary {
  classId: string; className: string; totalStudents: number; present: number; absent: number; late: number; unmarked: number;
  students: AttendanceStudent[];
}
interface HomeworkItem { id: string; title: string; deadline: string; className: string; completedCount: number; totalCount: number; }
interface ResourceItem { id: string; title: string; type: string; className: string; createdAt: string; }
interface ProgressItem { id: string; studentName: string; category: string; level: string; note: string | null; createdAt: string; }
interface TaskItem { id: string; title: string; dueDate: string | null; completed: boolean; }
interface PerformanceItem { studentId: string; studentName: string; className: string; grades: { subject: string; gradeValue: string }[]; }
interface BirthdayItem { id: string; firstName: string; lastName: string; className: string; nextOccurrence: string; }
interface ConversationPreview { id: string; otherName: string; otherRole: string; lastMessage: string | null; }

interface Props {
  teacherName: string;
  classGroups: ClassGroup[];
  students: StudentEntry[];
  weekSchedule: ScheduleItem[];
  attendanceSummary: AttendanceClassSummary[];
  homeworks: HomeworkItem[];
  recentResources: ResourceItem[];
  recentProgress: ProgressItem[];
  tasks: TaskItem[];
  studentPerformance: PerformanceItem[];
  birthdays: BirthdayItem[];
  recentConversations: ConversationPreview[];
  unreadCount: number;
}

const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
};

const resourceTypeEmoji: Record<string, string> = { PDF: '📄', WORKSHEET: '📝', VIDEO: '🎥', IMAGE: '🖼️', LINK: '🔗', REVISION: '📚' };
const progressCategoryEmoji: Record<string, string> = { READING: '⭐', MATH: '🧮', PARTICIPATION: '🎨', WRITING: '✍️', GENERAL: '📘' };
const progressLevelLabel: Record<string, string> = { EXCELLENT: 'Excellent progrès', GOOD: 'Bonne participation', IMPROVING: 'En amélioration', NEEDS_PRACTICE: 'À approfondir' };

const statusColor: Record<string, string> = { PRESENT: '#4C7C59', ABSENT: '#C0392B', LATE: '#FFB400' };
const statusLabel: Record<string, string> = { PRESENT: 'Présent', ABSENT: 'Absent', LATE: 'Retard' };
const attendanceStatuses = ['PRESENT', 'LATE', 'ABSENT'];
const roleLabel: Record<string, string> = { SCHOOL_OWNER: "Chef d'établissement", PARENT: 'Parent', TEACHER: 'Enseignant' };

function gradeColor(grade: string) {
  const letter = grade[0];
  if (letter === 'A') return { bg: '#EAF3DE', text: '#27500A' };
  if (letter === 'B') return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

export default function TeacherDashboardClient({
  teacherName, classGroups, students, weekSchedule, attendanceSummary, homeworks,
  recentResources, recentProgress, tasks: initialTasks, studentPerformance, birthdays,
  recentConversations, unreadCount,
}: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [rosterClassId, setRosterClassId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceClassSummary[]>(attendanceSummary);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [markingKey, setMarkingKey] = useState<string | null>(null);
  const [markingAllClassId, setMarkingAllClassId] = useState<string | null>(null);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  const today = new Date();
  const filteredStudents = search.trim()
    ? students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()))
    : [];

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
        setToast({ title: 'Erreur', message: "Impossible d'enregistrer la présence.", emoji: '⚠️', tone: 'error' });
        return;
      }
      setAttendance((prev) =>
        prev.map((c) => {
          if (c.classId !== classId) return c;
          const updatedStudents = c.students.map((s) => (s.id === studentId ? { ...s, status } : s));
          const present = updatedStudents.filter((s) => s.status === 'PRESENT').length;
          const absent = updatedStudents.filter((s) => s.status === 'ABSENT').length;
          const late = updatedStudents.filter((s) => s.status === 'LATE').length;
          const unmarked = updatedStudents.filter((s) => s.status === null).length;
          return { ...c, students: updatedStudents, present, absent, late, unmarked };
        })
      );
    } catch {
      setToast({ title: 'Erreur', message: "Une erreur est survenue.", emoji: '⚠️', tone: 'error' });
    } finally {
      setMarkingKey(null);
    }
  };

  const markAllPresent = async (classId: string) => {
    const cls = attendance.find((c) => c.classId === classId);
    if (!cls) return;
    const unmarkedStudents = cls.students.filter((s) => s.status === null);
    if (unmarkedStudents.length === 0) {
      setToast({ title: 'Déjà fait', message: 'Tous les élèves sont déjà marqués.', emoji: 'ℹ️', tone: 'success' });
      return;
    }
    setMarkingAllClassId(classId);
    try {
      await Promise.all(
        unmarkedStudents.map((s) =>
          fetch('/api/teacher/attendance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: s.id, classId, status: 'PRESENT' }),
          })
        )
      );
      setAttendance((prev) =>
        prev.map((c) => {
          if (c.classId !== classId) return c;
          const updatedStudents = c.students.map((s) => (s.status === null ? { ...s, status: 'PRESENT' } : s));
          const present = updatedStudents.filter((s) => s.status === 'PRESENT').length;
          return { ...c, students: updatedStudents, present, unmarked: 0 };
        })
      );
      setToast({ title: 'Présences enregistrées', message: `${unmarkedStudents.length} élève(s) marqué(s) présent(s).`, emoji: '✅', tone: 'success' });
    } catch {
      setToast({ title: 'Erreur', message: "Certaines présences n'ont pas pu être enregistrées.", emoji: '⚠️', tone: 'error' });
    } finally {
      setMarkingAllClassId(null);
    }
  };

  const messageParent = async (parentId: string) => {
    setMessagingId(parentId);
    try {
      const res = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: parentId }),
      });
      if (res.ok) {
        router.push('/dashboard/messages');
      } else {
        setToast({ title: 'Erreur', message: "Impossible d'ouvrir la conversation.", emoji: '⚠️', tone: 'error' });
      }
    } finally {
      setMessagingId(null);
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
        setToast({ title: 'Erreur', message: data?.error ?? "Impossible d'ajouter la tâche.", emoji: '⚠️', tone: 'error' });
        return;
      }
      setTasks((prev) => [{ id: data.id, title: data.title, dueDate: data.dueDate ?? null, completed: false }, ...prev]);
      setNewTask('');
      setToast({ title: 'Tâche ajoutée', message: `« ${title} » a été ajoutée à votre liste.`, emoji: '✅', tone: 'success' });
    } catch {
      setToast({ title: 'Erreur', message: "Impossible d'ajouter la tâche.", emoji: '⚠️', tone: 'error' });
    } finally {
      setSavingTask(false);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    const newCompleted = !completed;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)));
    try {
      const res = await fetch(`/api/teacher/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
      setToast({ title: 'Erreur', message: 'Impossible de modifier la tâche.', emoji: '⚠️', tone: 'error' });
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (!taskToDelete) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      const res = await fetch(`/api/teacher/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
    } catch {
      setTasks((prev) => [taskToDelete, ...prev]);
      setToast({ title: 'Erreur', message: 'Impossible de supprimer la tâche.', emoji: '⚠️', tone: 'error' });
    }
  };

  const todayEvents = weekSchedule.filter((e) => isSameDay(new Date(e.date), today));
  const restOfWeekEvents = weekSchedule.filter((e) => !isSameDay(new Date(e.date), today));

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', fontFamily: 'Inter, sans-serif', paddingBottom: 60 }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
        rel="stylesheet"
      />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .t-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 18px rgba(7,27,74,0.06); border: 1px solid #EEF1F6; padding: 22px; }
        .t-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 700; margin: 0; }
        .t-input { padding: 9px 12px; border-radius: 8px; border: 1px solid #DCE1E8; font-size: 13px; outline: none; width: 100%; font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .t-btn { background: #FFB400; color: #071B4A; border: none; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .t-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .t-btn-outline { background: #fff; color: #071B4A; border: 1px solid #FFB400; border-radius: 20px; padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .t-link { font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; }
        .t-mark-btn { border: 1px solid #E5E9F0; background: #fff; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; }
        .t-mark-btn.active { color: #fff; border-color: transparent; }
        .t-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .t-action { display: flex; flex-direction: column; gap: 6px; padding: 18px 20px; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease; }
        .t-action:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(7,27,74,0.1); }
        .t-action .label { font-weight: 700; color: #071B4A; font-size: 14px; }
        .t-action .sub { font-size: 12px; color: #5A6A7A; }
        @media (max-width: 700px) {
          .t-grid-2 { grid-template-columns: 1fr; }
          .t-card { padding: 16px; }
          .attendance-row { flex-direction: column !important; align-items: flex-start !important; }
          .attendance-buttons { flex-wrap: wrap; }
        }
      `}</style>

      <div style={{ marginTop: 8, marginBottom: 24 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>Espace enseignant</span>
        <h1 className="t-heading" style={{ fontSize: 32, margin: '6px 0 4px' }}>Bonjour, {teacherName}</h1>
        <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Voici votre semaine en un coup d'œil.</p>
      </div>

      {/* Student Search */}
      <div className="t-card" style={{ marginBottom: 20 }}>
        <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 10 }}>🔍 Rechercher un élève</h2>
        <input placeholder="Nom de l'élève..." value={search} onChange={(e) => setSearch(e.target.value)} className="t-input" />
        {search.trim() && (
          <div style={{ marginTop: 12 }}>
            {filteredStudents.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun élève trouvé.</p>
            ) : (
              filteredStudents.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                  <span><strong>{s.firstName} {s.lastName}</strong> — {s.className}</span>
                  <span style={{ color: '#5A6A7A' }}>{s.parentNames.join(', ') || 'Aucun parent lié'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="t-grid-2">
        {/* This Week's Schedule */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>📅 Cette semaine</h2>
          {todayEvents.length === 0 && restOfWeekEvents.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun événement cette semaine.</p>
          ) : (
            <>
              {todayEvents.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#FFB400', textTransform: 'uppercase', marginBottom: 4 }}>Aujourd'hui</div>
                  {todayEvents.map((e) => {
                    const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                    return (
                      <div key={e.id} style={{ display: 'flex', gap: 10, padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <span>{et.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{e.title}</div>
                          <div style={{ fontSize: 11.5, color: et.color, fontWeight: 600 }}>{et.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {restOfWeekEvents.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#5A6A7A', textTransform: 'uppercase', marginBottom: 4 }}>Plus tard cette semaine</div>
                  {restOfWeekEvents.map((e) => {
                    const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                    return (
                      <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <span style={{ fontSize: 13, color: '#071B4A' }}>{et.emoji} {e.title}</span>
                        <span style={{ fontSize: 11.5, color: '#5A6A7A' }}>{new Date(e.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* To Do Today */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>✅ À faire aujourd'hui</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Nouvelle tâche..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
              className="t-input"
            />
            <button onClick={addTask} disabled={savingTask} className="t-btn">+</button>
          </div>
          {tasks.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune tâche pour le moment.</p>
          ) : (
            tasks.map((t) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t.id, t.completed)} />
                <span style={{ flex: 1, fontSize: 13, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#5A6A7A' : '#1A1A2E' }}>
                  {t.title}
                </span>
                <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: 12 }}>✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Attendance */}
      <div className="t-card" style={{ marginBottom: 16 }}>
        <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>📋 Présences du jour</h2>
        {attendance.length === 0 ? (
          <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune classe assignée.</p>
        ) : (
          attendance.map((c) => {
            const isOpen = expandedClassId === c.classId;
            return (
              <div key={c.classId} style={{ border: '1px solid #F0F0F0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                  <button
                    onClick={() => setExpandedClassId(isOpen ? null : c.classId)}
                    style={{ textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', flex: 1 }}
                  >
                    <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{c.className}</strong>
                    <div style={{ fontSize: 12, color: '#5A6A7A', marginTop: 2 }}>
                      ✅ {c.present} · ⏰ {c.late} · ❌ {c.absent} · {c.unmarked} non marqué{c.unmarked !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}
                    </div>
                  </button>
                  {c.unmarked > 0 && (
                    <button
                      onClick={() => markAllPresent(c.classId)}
                      disabled={markingAllClassId === c.classId}
                      className="t-btn-outline"
                    >
                      {markingAllClassId === c.classId ? '...' : '✓ Tout marquer présent'}
                    </button>
                  )}
                </div>
                {isOpen && (
                  <div style={{ padding: '8px 16px', borderTop: '1px solid #F0F0F0' }}>
                    {c.students.map((s) => (
                      <div key={s.id} className="attendance-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #F5F5F5', gap: 10 }}>
                        <span style={{ fontSize: 13 }}>{s.firstName} {s.lastName}</span>
                        <div className="attendance-buttons" style={{ display: 'flex', gap: 6 }}>
                          {attendanceStatuses.map((st) => {
                            const key = `${c.classId}:${s.id}`;
                            const isActive = s.status === st;
                            return (
                              <button
                                key={st}
                                disabled={markingKey === key}
                                onClick={() => markAttendance(c.classId, s.id, st)}
                                className={`t-mark-btn ${isActive ? 'active' : ''}`}
                                style={isActive ? { background: statusColor[st], borderColor: statusColor[st] } : {}}
                              >
                                {statusLabel[st]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="t-grid-2">
        {/* Homework */}
        <div className="t-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="t-heading" style={{ fontSize: 16 }}>📚 Devoirs à venir</h2>
            <Link href="/dashboard/teacher/classroom" className="t-link">Gérer →</Link>
          </div>
          {homeworks.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun devoir à venir.</p>
          ) : (
            homeworks.map((h) => (
              <div key={h.id} style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{h.title}</span>
                  <span style={{ fontSize: 11.5, color: '#FFB400', fontWeight: 700 }}>{h.completedCount}/{h.totalCount}</span>
                </div>
                <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{h.className} · Échéance {new Date(h.deadline).toLocaleDateString('fr-FR')}</div>
              </div>
            ))
          )}
        </div>

        {/* Recent Resources */}
        <div className="t-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="t-heading" style={{ fontSize: 16 }}>📎 Ressources récentes</h2>
            <Link href="/dashboard/teacher/classroom" className="t-link">Gérer →</Link>
          </div>
          {recentResources.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune ressource publiée.</p>
          ) : (
            recentResources.map((r) => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                <span>{resourceTypeEmoji[r.type] ?? '📎'} {r.title}</span>
                <span style={{ color: '#5A6A7A', fontSize: 11.5 }}>{r.className}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="t-grid-2">
        {/* Birthdays */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>🎂 Anniversaires à venir</h2>
          {birthdays.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun anniversaire dans les 30 prochains jours.</p>
          ) : (
            birthdays.map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                <span>{b.firstName} {b.lastName} <span style={{ color: '#5A6A7A' }}>({b.className})</span></span>
                <span style={{ color: '#5A6A7A' }}>{new Date(b.nextOccurrence).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Progress Sent */}
        <div className="t-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="t-heading" style={{ fontSize: 16 }}>⭐ Progrès envoyés récemment</h2>
            <Link href="/dashboard/teacher/classroom" className="t-link">Envoyer →</Link>
          </div>
          {recentProgress.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune mise à jour envoyée.</p>
          ) : (
            recentProgress.map((p) => (
              <div key={p.id} style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#071B4A' }}>
                  {progressCategoryEmoji[p.category] ?? '📘'} {p.studentName} — {progressLevelLabel[p.level] ?? p.level}
                </div>
                {p.note && <div style={{ fontSize: 12, color: '#5A6A7A', marginTop: 2 }}>{p.note}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Student Performance */}
      <div className="t-card" style={{ marginBottom: 16 }}>
        <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>📈 Aperçu des performances</h2>
        {studentPerformance.length === 0 ? (
          <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun élève.</p>
        ) : (
          studentPerformance.map((s) => (
            <div key={s.studentId} style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{s.studentName}</strong>
                <span style={{ fontSize: 11.5, color: '#5A6A7A' }}>{s.className}</span>
              </div>
              {s.grades.length === 0 ? (
                <span style={{ fontSize: 12, color: '#5A6A7A' }}>Aucune note enregistrée.</span>
              ) : (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.grades.map((g) => {
                    const c = gradeColor(g.gradeValue);
                    return (
                      <span key={g.subject} style={{ fontSize: 11.5, background: c.bg, color: c.text, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                        {g.subject}: {g.gradeValue}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="t-grid-2">
        {/* Class Overview with roster + message parent */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>🏫 Mes classes</h2>
          {classGroups.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune classe assignée.</p>
          ) : (
            classGroups.map((c) => {
              const isOpen = rosterClassId === c.classId;
              return (
                <div key={c.classId} style={{ borderBottom: '1px solid #F5F5F5' }}>
                  <button
                    onClick={() => setRosterClassId(isOpen ? null : c.classId)}
                    style={{ width: '100%', display: 'flex', justifyContent: 'space-between', padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13.5 }}
                  >
                    <strong style={{ color: '#071B4A' }}>{c.className}</strong>
                    <span style={{ color: '#5A6A7A' }}>{c.count} élève{c.count !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div style={{ paddingBottom: 10 }}>
                      {c.students.map((s) => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 12.5 }}>
                          <span>{s.firstName} {s.lastName}</span>
                          {s.parents.length === 0 ? (
                            <span style={{ color: '#C0392B', fontSize: 11.5 }}>Aucun parent</span>
                          ) : (
                            <div style={{ display: 'flex', gap: 6 }}>
                              {s.parents.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => messageParent(p.id)}
                                  disabled={messagingId === p.id}
                                  style={{ fontSize: 11, color: '#071B4A', background: '#FFF3D6', border: 'none', borderRadius: 10, padding: '2px 8px', cursor: 'pointer' }}
                                >
                                  💬 {p.username}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Messages */}
        <div className="t-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="t-heading" style={{ fontSize: 16 }}>
              💬 Messages {unreadCount > 0 && <span style={{ fontSize: 11, background: '#FFB400', color: '#071B4A', padding: '1px 7px', borderRadius: 8, marginLeft: 6 }}>{unreadCount}</span>}
            </h2>
            <Link href="/dashboard/messages" className="t-link">Voir tout →</Link>
          </div>
          {recentConversations.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune conversation.</p>
          ) : (
            recentConversations.map((c) => (
              <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</div>
                <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</div>
                {c.lastMessage && <div style={{ fontSize: 11.5, color: '#5A6A7A', marginTop: 3 }}>{c.lastMessage}</div>}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>Actions rapides</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <Link href="/dashboard/teacher/classroom" className="t-card t-action">
          <span className="label">📎 Publier une ressource</span>
          <span className="sub">PDF, vidéo, lien...</span>
        </Link>
        <Link href="/dashboard/teacher/classroom" className="t-card t-action">
          <span className="label">📚 Créer un devoir</span>
          <span className="sub">Avec échéance et suivi</span>
        </Link>
        <Link href="/dashboard/teacher/classroom" className="t-card t-action">
          <span className="label">⭐ Envoyer un progrès</span>
          <span className="sub">Lecture, maths, participation</span>
        </Link>
        <Link href="/dashboard/teacher/classroom" className="t-card t-action">
          <span className="label">📅 Ajouter un événement</span>
          <span className="sub">Examen, sortie, réunion</span>
        </Link>
        <Link href="/dashboard/messages" className="t-card t-action">
          <span className="label">💬 Messagerie</span>
          <span className="sub">Contacter parents et direction</span>
        </Link>
      </div>
    </div>
  );
}