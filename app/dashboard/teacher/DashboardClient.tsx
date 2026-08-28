'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ActionToast, { ToastData } from '@/app/components/ActionToast';

// ---------------------------
// Types
// ---------------------------
interface StudentEntry {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  classId: string;
  parentNames: string[];
  birthDate: string | null;
}

interface ClassGroup {
  classId: string;
  className: string;
  count: number;
}

interface ScheduleItem {
  id: string;
  title: string;
  date: string;
  type: string;
  description: string | null;
}

interface AttendanceStudent {
  id: string;
  firstName: string;
  lastName: string;
  status: string | null;
}

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

interface HomeworkItem {
  id: string;
  title: string;
  deadline: string;
  className: string;
  completedCount: number;
  totalCount: number;
}

interface TaskItem {
  id: string;
  title: string;
  dueDate: string | null;
  completed: boolean;
}

interface PerformanceItem {
  studentId: string;
  studentName: string;
  className: string;
  grades: {
    subject: string;
    value: number;
  }[];
}

interface BirthdayItem {
  id: string;
  firstName: string;
  lastName: string;
  className: string;
  nextOccurrence: string;
}

interface ConversationPreview {
  id: string;
  otherName: string;
  otherRole: string;
  lastMessage: string | null;
}

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

// ---------------------------
// Constants
// ---------------------------
const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
};

const statusColor: Record<string, string> = {
  PRESENT: '#4C7C59',
  ABSENT: '#C0392B',
  LATE: '#FFB400',
  EXCUSED: '#5A6A7A',
};

const statusLabel: Record<string, string> = {
  PRESENT: 'Présent',
  ABSENT: 'Absent',
  LATE: 'Retard',
  EXCUSED: 'Excusé',
};

const attendanceStatuses = ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'];

const roleLabel: Record<string, string> = {
  SCHOOL_OWNER: "Chef d'établissement",
  PARENT: 'Parent',
  TEACHER: 'Enseignant',
};

function gradeColor(value: number) {
  if (value >= 16) return { bg: '#EAF3DE', text: '#27500A' };
  if (value >= 10) return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

// ---------------------------
// CSS Styles
// ---------------------------
const styles = `
  :root {
    --primary: #071B4A;
    --accent: #FFB400;
    --bg: #F8F9FC;
    --card-bg: #FFFFFF;
    --text: #1A1A2E;
    --text-muted: #5A6A7A;
    --border: #E5E9F0;
    --shadow-sm: 0 2px 8px rgba(7,27,74,0.04);
    --shadow-md: 0 6px 20px rgba(7,27,74,0.08);
    --radius: 16px;
  }

  body {
    background: var(--bg);
    font-family: 'Inter', sans-serif;
    color: var(--text);
  }

  .t-card {
    background: var(--card-bg);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
    padding: 22px;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .t-card:hover {
    box-shadow: var(--shadow-md);
  }

  .t-heading {
    font-family: 'Fraunces', serif;
    color: var(--primary);
    font-weight: 700;
    margin: 0;
    font-size: 16px;
  }

  .t-input {
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    font-size: 13px;
    outline: none;
    width: 100%;
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .t-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255,180,0,0.2);
  }

  .t-btn {
    background: var(--accent);
    color: var(--primary);
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.2s, transform 0.1s;
  }
  .t-btn:hover {
    background: #ffc933;
  }
  .t-btn:active {
    transform: scale(0.96);
  }
  .t-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .t-link {
    font-size: 13px;
    font-weight: 600;
    color: var(--primary);
    text-decoration: none;
    border-bottom: 1px solid var(--accent);
  }

  .t-mark-btn {
    border: 1px solid var(--border);
    background: #fff;
    border-radius: 8px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.1s;
  }
  .t-mark-btn:hover {
    background: #f7f9fc;
    transform: translateY(-1px);
  }
  .t-mark-btn.active {
    color: #fff;
    border-color: transparent;
  }

  .t-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .attendance-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #F5F5F5;
    gap: 10px;
  }
  .attendance-buttons {
    display: flex;
    gap: 6px;
  }

  .homework-item {
    padding: 8px 0;
    border-bottom: 1px solid #F5F5F5;
  }
  .birthday-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #F5F5F5;
    font-size: 13px;
  }
  .performance-item {
    padding: 10px 0;
    border-bottom: 1px solid #F5F5F5;
  }
  .conversation-item {
    padding: 8px 0;
    border-bottom: 1px solid #F5F5F5;
  }

  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 700px) {
    .t-grid-2 {
      grid-template-columns: 1fr;
    }
    .t-card {
      padding: 16px;
    }
    .attendance-row {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .attendance-buttons {
      flex-wrap: wrap;
    }
  }
`;

// ---------------------------
// Animated Components
// ---------------------------
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 },
};

function AnimatedCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className="t-card"
    >
      {children}
    </motion.div>
  );
}

// ---------------------------
// Main Component
// ---------------------------
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
  const [search, setSearch] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceClassSummary[]>(attendanceSummary);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [markingKey, setMarkingKey] = useState<string | null>(null);

  const filteredStudents = search.trim()
    ? students.filter((s) =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Attendance marking
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
          const updatedStudents = c.students.map((s) =>
            s.id === studentId ? { ...s, status } : s
          );
          const present = updatedStudents.filter((s) => s.status === 'PRESENT').length;
          const absent = updatedStudents.filter((s) => s.status === 'ABSENT').length;
          const late = updatedStudents.filter((s) => s.status === 'LATE').length;
          const excused = updatedStudents.filter((s) => s.status === 'EXCUSED').length;
          const unmarked = updatedStudents.filter((s) => s.status === null).length;
          return { ...c, students: updatedStudents, present, absent, late, excused, unmarked };
        })
      );
    } catch {
      setToast({ title: 'Erreur', message: "Une erreur est survenue lors de l'enregistrement.", emoji: '⚠️', tone: 'error' });
    } finally {
      setMarkingKey(null);
    }
  };

  // Tasks
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
      if (!res.ok) throw new Error('Failed to update task');
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
      if (!res.ok) throw new Error('Failed to delete task');
    } catch {
      setTasks((prev) => [taskToDelete, ...prev]);
      setToast({ title: 'Erreur', message: 'Impossible de supprimer la tâche.', emoji: '⚠️', tone: 'error' });
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', paddingBottom: 60, fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
      <style>{styles}</style>
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Header */}
        <motion.div variants={cardVariants} style={{ marginTop: 8, marginBottom: 24 }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
            Espace enseignant
          </span>
          <h1 className="t-heading" style={{ fontSize: 32, margin: '6px 0 4px' }}>
            Bonjour, {teacherName}
          </h1>
          <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>
            Voici votre journée en un coup d'œil.
          </p>
        </motion.div>

        {/* Search */}
        <AnimatedCard>
          <div className="section-header">
            <h2 className="t-heading">🔍 Rechercher un élève</h2>
          </div>
          <input
            placeholder="Nom de l'élève..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="t-input"
          />
          {search.trim() && (
            <div style={{ marginTop: 12 }}>
              {filteredStudents.length === 0 ? (
                <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun élève trouvé.</p>
              ) : (
                filteredStudents.map((s) => (
                  <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                    <span>
                      <strong>{s.firstName} {s.lastName}</strong> — {s.className}
                    </span>
                    <span style={{ color: '#5A6A7A' }}>
                      {s.parentNames.join(', ') || 'Aucun parent lié'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </AnimatedCard>

        {/* First Grid */}
        <div className="t-grid-2">
          {/* Schedule */}
          <AnimatedCard delay={0.05}>
            <div className="section-header">
              <h2 className="t-heading">📅 Emploi du jour</h2>
            </div>
            {todaySchedule.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun événement aujourd'hui.</p>
            ) : (
              todaySchedule.map((e) => {
                const et = eventTypeLabel[e.type] ?? eventTypeLabel.EVENT;
                return (
                  <div key={e.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                    <span>{et.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{e.title}</div>
                      <div style={{ fontSize: 11.5, color: et.color, fontWeight: 600 }}>{et.label}</div>
                    </div>
                  </div>
                );
              })
            )}
          </AnimatedCard>

          {/* To-Do */}
          <AnimatedCard delay={0.1}>
            <div className="section-header">
              <h2 className="t-heading">✅ À faire aujourd'hui</h2>
            </div>
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
                  <motion.span
                    animate={{ opacity: t.completed ? 0.6 : 1 }}
                    style={{
                      flex: 1,
                      fontSize: 13,
                      textDecoration: t.completed ? 'line-through' : 'none',
                      color: t.completed ? '#5A6A7A' : '#1A1A2E',
                    }}
                  >
                    {t.title}
                  </motion.span>
                  <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                </div>
              ))
            )}
          </AnimatedCard>
        </div>

        {/* Attendance */}
        <AnimatedCard delay={0.15} style={{ marginBottom: 16 }}>
          <div className="section-header">
            <h2 className="t-heading">📋 Présences du jour</h2>
          </div>
          {attendance.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune classe assignée.</p>
          ) : (
            attendance.map((c) => {
              const isOpen = expandedClassId === c.classId;
              return (
                <div key={c.classId} style={{ border: '1px solid #F0F0F0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedClassId(isOpen ? null : c.classId)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 10,
                    }}
                  >
                    <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{c.className}</strong>
                    <span style={{ fontSize: 12, color: '#5A6A7A' }}>
                      ✅ {c.present} · ⏰ {c.late} · ❌ {c.absent} · 📝 {c.excused} · {c.unmarked} non marqué{c.unmarked !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: '8px 16px', borderTop: '1px solid #F0F0F0' }}>
                          {c.students.map((s) => (
                            <div key={s.id} className="attendance-row">
                              <span style={{ fontSize: 13 }}>{s.firstName} {s.lastName}</span>
                              <div className="attendance-buttons">
                                {attendanceStatuses.map((st) => {
                                  const key = `${c.classId}:${s.id}`;
                                  const isActive = s.status === st;
                                  const isLoading = markingKey === key;
                                  return (
                                    <motion.button
                                      key={st}
                                      whileTap={{ scale: 0.85 }}
                                      animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                                      disabled={isLoading}
                                      onClick={() => markAttendance(c.classId, s.id, st)}
                                      className={`t-mark-btn ${isActive ? 'active' : ''}`}
                                      style={{
                                        background: isActive ? statusColor[st] : '#fff',
                                        borderColor: isActive ? statusColor[st] : '#E5E9F0',
                                        position: 'relative',
                                      }}
                                    >
                                      {isLoading && (
                                        <span
                                          style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: 12,
                                            height: 12,
                                            border: '2px solid white',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                          }}
                                        />
                                      )}
                                      <span style={{ opacity: isLoading ? 0 : 1 }}>
                                        {statusLabel[st]}
                                      </span>
                                    </motion.button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </AnimatedCard>

        {/* Second Grid */}
        <div className="t-grid-2">
          {/* Homework */}
          <AnimatedCard delay={0.2}>
            <div className="section-header">
              <h2 className="t-heading">📚 Activités à venir</h2>
              <Link href="/dashboard/teacher/classroom" className="t-link">Gérer →</Link>
            </div>
            {homeworks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun devoir à venir.</p>
            ) : (
              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
                {homeworks.map((h) => (
                  <motion.div key={h.id} variants={itemVariants} className="homework-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#071B4A' }}>{h.title}</span>
                      <span style={{ fontSize: 11.5, color: '#FFB400', fontWeight: 700 }}>
                        {h.completedCount}/{h.totalCount}
                      </span>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>
                      {h.className} · Échéance {new Date(h.deadline).toLocaleDateString('fr-FR')}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatedCard>

          {/* Birthdays */}
          <AnimatedCard delay={0.25}>
            <div className="section-header">
              <h2 className="t-heading">🎂 Anniversaires à venir</h2>
            </div>
            {birthdays.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun anniversaire dans les 30 prochains jours.</p>
            ) : (
              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}>
                {birthdays.map((b) => (
                  <motion.div key={b.id} variants={itemVariants} className="birthday-item">
                    <span>
                      {b.firstName} {b.lastName} <span style={{ color: '#5A6A7A' }}>({b.className})</span>
                    </span>
                    <span style={{ color: '#5A6A7A' }}>
                      {new Date(b.nextOccurrence).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatedCard>
        </div>

        {/* Performance */}
        <AnimatedCard delay={0.3} style={{ marginBottom: 16 }}>
          <div className="section-header">
            <h2 className="t-heading">📈 Aperçu des performances</h2>
          </div>
          {studentPerformance.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucun élève.</p>
          ) : (
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}>
              {studentPerformance.map((s) => (
                <motion.div key={s.studentId} variants={itemVariants} className="performance-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{s.studentName}</strong>
                    <span style={{ fontSize: 11.5, color: '#5A6A7A' }}>{s.className}</span>
                  </div>
                  {s.grades.length === 0 ? (
                    <span style={{ fontSize: 12, color: '#5A6A7A' }}>Aucune note enregistrée.</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {s.grades.map((g) => {
                        const c = gradeColor(g.value);
                        return (
                          <span key={g.subject} style={{ fontSize: 11.5, background: c.bg, color: c.text, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                            {g.subject}: {g.value}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatedCard>

        {/* Third Grid */}
        <div className="t-grid-2">
          {/* Classes */}
          <AnimatedCard delay={0.35}>
            <div className="section-header">
              <h2 className="t-heading">🏫 Mes classes</h2>
            </div>
            {classGroups.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune classe assignée.</p>
            ) : (
              classGroups.map((c) => (
                <div key={c.classId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13.5 }}>
                  <strong style={{ color: '#071B4A' }}>{c.className}</strong>
                  <span style={{ color: '#5A6A7A' }}>{c.count} élève{c.count !== 1 ? 's' : ''}</span>
                </div>
              ))
            )}
          </AnimatedCard>

          {/* Messages */}
          <AnimatedCard delay={0.4}>
            <div className="section-header">
              <h2 className="t-heading">
                💬 Messages{' '}
                {unreadCount > 0 && (
                  <span style={{ fontSize: 11, background: '#FFB400', color: '#071B4A', padding: '1px 7px', borderRadius: 8, marginLeft: 6 }}>
                    {unreadCount}
                  </span>
                )}
              </h2>
              <Link href="/dashboard/messages" className="t-link">Voir tout →</Link>
            </div>
            {recentConversations.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune conversation.</p>
            ) : (
              recentConversations.map((c) => (
                <div key={c.id} className="conversation-item">
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</div>
                  <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</div>
                  {c.lastMessage && (
                    <div style={{ fontSize: 11.5, color: '#5A6A7A', marginTop: 3 }}>{c.lastMessage}</div>
                  )}
                </div>
              ))
            )}
          </AnimatedCard>
        </div>
      </motion.div>
    </div>
  );
}