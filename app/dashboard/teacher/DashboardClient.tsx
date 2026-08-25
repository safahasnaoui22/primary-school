'use client';

import { useState } from 'react';
import Link from 'next/link';
import ActionToast, { ToastData } from '@/components/ActionToast';

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
interface AttendanceClassSummary {
  classId: string; className: string; totalStudents: number; present: number; absent: number; late: number; unmarked: number;
  students: { id: string; firstName: string; lastName: string; status: string | null }[];
}
interface HomeworkItem { id: string; title: string; deadline: string; className: string; completedCount: number; totalCount: number; }
interface TaskItem { id: string; title: string; dueDate: string | null; completed: boolean; }
interface PerformanceItem { studentId: string; studentName: string; className: string; grades: { subject: string; gradeValue: string }[]; }
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

const eventTypeLabel: Record<string, { label: string; color: string; emoji: string }> = {
  EXAM: { label: 'Examen', color: '#C0392B', emoji: '📝' },
  ACTIVITY: { label: 'Activité', color: '#4C7C59', emoji: '🎨' },
  TRIP: { label: 'Sortie', color: '#071B4A', emoji: '🚌' },
  MEETING: { label: 'Réunion parents', color: '#FFB400', emoji: '👨‍👩‍👧' },
  EVENT: { label: 'Événement', color: '#8A5A00', emoji: '🎉' },
};

const statusColor: Record<string, string> = { PRESENT: '#4C7C59', ABSENT: '#C0392B', LATE: '#FFB400' };
const statusLabel: Record<string, string> = { PRESENT: 'Présent', ABSENT: 'Absent', LATE: 'Retard' };
const roleLabel: Record<string, string> = { SCHOOL_OWNER: "Chef d'établissement", PARENT: 'Parent', TEACHER: 'Enseignant' };

function gradeColor(grade: string) {
  const letter = grade[0];
  if (letter === 'A') return { bg: '#EAF3DE', text: '#27500A' };
  if (letter === 'B') return { bg: '#FAEEDA', text: '#633806' };
  return { bg: '#FAECE7', text: '#712B13' };
}

export default function TeacherDashboardClient({
  teacherName, classGroups, students, todaySchedule, attendanceSummary,
  homeworks, tasks: initialTasks, studentPerformance, birthdays, recentConversations, unreadCount,
}: Props) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const [search, setSearch] = useState('');
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState(attendanceSummary);
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [markingKey, setMarkingKey] = useState<string | null>(null);

  const filteredStudents = search.trim()
    ? students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()))
    : [];

  const markAttendance = async (classId: string, studentId: string, status: string) => {
    const key = `${classId}:${studentId}`;
    setMarkingKey(key);
    const res = await fetch('/api/teacher/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, classId, status }),
    });
    setMarkingKey(null);
    if (res.ok) {
      setAttendance((prev) =>
        prev.map((c) => {
          if (c.classId !== classId) return c;
          const wasUnmarked = c.students.find((s) => s.id === studentId)?.status === null;
          const updatedStudents = c.students.map((s) => (s.id === studentId ? { ...s, status } : s));
          const present = updatedStudents.filter((s) => s.status === 'PRESENT').length;
          const absent = updatedStudents.filter((s) => s.status === 'ABSENT').length;
          const late = updatedStudents.filter((s) => s.status === 'LATE').length;
          return { ...c, students: updatedStudents, present, absent, late, unmarked: wasUnmarked ? c.unmarked - 1 : c.unmarked };
        })
      );
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    setSavingTask(true);
    const res = await fetch('/api/teacher/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTask }),
    });
    const data = await res.json();
    setSavingTask(false);
    if (res.ok) {
      setTasks((prev) => [{ id: data.id, title: data.title, dueDate: data.dueDate, completed: false }, ...prev]);
      setNewTask('');
      setToast({ title: 'Tâche ajoutée', message: `« ${newTask} » a été ajoutée à votre liste.`, emoji: '✅', tone: 'success' });
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
    await fetch(`/api/teacher/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed }),
    });
  };

  const deleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/teacher/tasks/${id}`, { method: 'DELETE' });
  };

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
        .t-input { padding: 9px 12px; border-radius: 8px; border: 1px solid #DCE1E8; font-size: 13px; outline: none; width: 100%; font-family: 'Inter', sans-serif; }
        .t-btn { background: #FFB400; color: #071B4A; border: none; border-radius: 20px; padding: 8px 16px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .t-link { font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; }
        .t-avatar { width: 32px; height: 32px; border-radius: 50%; background: #071B4A; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; font-family: 'IBM Plex Mono', monospace; }
        .t-mark-btn { border: 1px solid #E5E9F0; background: #fff; border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; }
        .t-mark-btn.active { color: #fff; border-color: transparent; }
      `}</style>

      <div style={{ marginTop: 8, marginBottom: 24 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>Espace enseignant</span>
        <h1 className="t-heading" style={{ fontSize: 32, margin: '6px 0 4px' }}>Bonjour, {teacherName}</h1>
        <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Voici votre journée en un coup d'œil.</p>
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
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F5F5F5', fontSize: 13 }}>
                  <span><strong>{s.firstName} {s.lastName}</strong> — {s.className}</span>
                  <span style={{ color: '#5A6A7A' }}>{s.parentNames.join(', ') || 'Aucun parent lié'}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Today's Schedule */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>📅 Emploi du jour</h2>
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
        </div>

        {/* To Do Today */}
        <div className="t-card">
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>✅ À faire aujourd'hui</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              placeholder="Nouvelle tâche..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
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
                <button
                  onClick={() => setExpandedClassId(isOpen ? null : c.classId)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
                >
                  <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{c.className}</strong>
                  <span style={{ fontSize: 12, color: '#5A6A7A' }}>
                    ✅ {c.present} · ⏰ {c.late} · ❌ {c.absent} · {c.unmarked} non marqué{c.unmarked !== 1 ? 's' : ''} {isOpen ? '▲' : '▼'}
                  </span>
                </button>
                {isOpen && (
                  <div style={{ padding: '8px 16px', borderTop: '1px solid #F0F0F0' }}>
                    {c.students.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                        <span style={{ fontSize: 13 }}>{s.firstName} {s.lastName}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {['PRESENT', 'LATE', 'ABSENT'].map((st) => {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Class Overview */}
        <div className="t-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 className="t-heading" style={{ fontSize: 16 }}>🏫 Mes classes</h2>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}