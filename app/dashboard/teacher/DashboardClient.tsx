// app/dashboard/teacher/DashboardClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import {
  FiSearch,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiEdit3,
  FiBookOpen,
  FiUsers,
  FiMessageSquare,
  FiTrendingUp,
  FiGift,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiTrash2,
  FiHome,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiBell,
  FiMenu,
  FiX,
  FiAward,
  FiActivity,
  FiFileText,
  FiTarget,
} from 'react-icons/fi';

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
  teacherRole: string;
  teacherAvatar: string | null;
  classGroups: ClassGroup[];
  students: StudentEntry[];
  todaySchedule: ScheduleItem[];
  attendanceSummary: AttendanceClassSummary[];
  attendanceRateByClass: { className: string; rate: number }[];
  homeworks: HomeworkItem[];
  homeworkCompletionRate: { title: string; rate: number }[];
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

// Simple Bar Chart Component
function BarChart({ data, color = '#4C7C59', maxValue = 100 }: { data: { label: string; value: number }[]; color?: string; maxValue?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, width: 80, textAlign: 'right', color: '#5A6A7A' }}>{item.label}</span>
          <div style={{ flex: 1, background: '#F0F2F5', borderRadius: 4, height: 20, overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min((item.value / maxValue) * 100, 100)}%`,
                height: '100%',
                background: color,
                borderRadius: 4,
                transition: 'width 0.5s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: 4,
              }}
            >
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{item.value}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Donut Chart Component
function DonutChart({ data, size = 120 }: { data: { label: string; value: number; color: string }[]; size?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let cumulativePercent = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox="0 0 36 36">
        {data.map((d, idx) => {
          const startAngle = cumulativePercent * 360;
          const percent = total > 0 ? (d.value / total) * 100 : 0;
          cumulativePercent += percent / 100;
          const endAngle = cumulativePercent * 360;
          const largeArcFlag = percent > 50 ? 1 : 0;
          
          const startX = 18 + 15.9 * Math.cos((startAngle - 90) * (Math.PI / 180));
          const startY = 18 + 15.9 * Math.sin((startAngle - 90) * (Math.PI / 180));
          const endX = 18 + 15.9 * Math.cos((endAngle - 90) * (Math.PI / 180));
          const endY = 18 + 15.9 * Math.sin((endAngle - 90) * (Math.PI / 180));

          return (
            <path
              key={idx}
              d={`M 18 2.1 A 15.9 15.9 0 ${largeArcFlag} 1 ${endX} ${endY} L 18 18 Z`}
              fill={d.color}
            />
          );
        })}
        <circle cx="18" cy="18" r="8" fill="#fff" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.map((d, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
            <span style={{ color: '#5A6A7A' }}>{d.label}:</span>
            <strong style={{ color: '#071B4A' }}>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TeacherDashboardClient({
  teacherName,
  teacherRole,
  teacherAvatar,
  classGroups,
  students,
  todaySchedule,
  attendanceSummary,
  attendanceRateByClass,
  homeworks,
  homeworkCompletionRate,
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  const filteredStudents = search.trim()
    ? students.filter((s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()))
    : [];

  const totalStudents = students.length;
  const totalClasses = classGroups.length;
  const avgAttendanceRate = attendanceRateByClass.length > 0
    ? Math.round(attendanceRateByClass.reduce((sum, a) => sum + a.rate, 0) / attendanceRateByClass.length)
    : 0;
  const avgHomeworkCompletion = homeworkCompletionRate.length > 0
    ? Math.round(homeworkCompletionRate.reduce((sum, h) => sum + h.rate, 0) / homeworkCompletionRate.length)
    : 0;

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

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: <FiHome size={18} /> },
    { id: 'attendance', label: 'Présences', icon: <FiCheckCircle size={18} /> },
    { id: 'grades', label: 'Notes', icon: <FiBarChart2 size={18} /> },
    { id: 'homework', label: 'Devoirs', icon: <FiBookOpen size={18} /> },
    { id: 'messages', label: 'Messages', icon: <FiMessageSquare size={18} />, badge: unreadCount },
    { id: 'settings', label: 'Paramètres', icon: <FiSettings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F9FB', fontFamily: 'Inter, sans-serif' }}>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap" rel="stylesheet" />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .t-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 18px rgba(7,27,74,0.06);
          border: 1px solid #EEF1F6;
          padding: 22px;
          transition: all 0.3s ease;
        }
        .t-card:hover {
          box-shadow: 0 6px 24px rgba(7,27,74,0.1);
        }
        .t-heading {
          font-family: 'Fraunces', serif;
          color: #071B4A;
          font-weight: 700;
          margin: 0;
        }
        .t-input {
          padding: 9px 12px;
          border-radius: 8px;
          border: 1px solid #DCE1E8;
          font-size: 13px;
          outline: none;
          width: 100%;
          font-family: 'Inter', sans-serif;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .t-input:focus {
          border-color: #FFB400;
        }
        .t-btn {
          background: #FFB400;
          color: #071B4A;
          border: none;
          border-radius: 20px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .t-btn:hover {
          background: #FFC933;
          transform: translateY(-1px);
        }
        .t-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .t-link {
          font-size: 13px;
          font-weight: 600;
          color: #071B4A;
          text-decoration: none;
          border-bottom: 1px solid #FFB400;
        }
        .t-mark-btn {
          border: 1px solid #E5E9F0;
          background: #fff;
          border-radius: 8px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .t-mark-btn:hover {
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
        .sidebar {
          width: 240px;
          background: #fff;
          border-right: 1px solid #EEF1F6;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }
        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          cursor: pointer;
          border-radius: 8px;
          margin: 2px 8px;
          font-size: 13px;
          color: #5A6A7A;
          transition: all 0.2s;
          text-decoration: none;
        }
        .sidebar-item:hover {
          background: #F8F9FB;
          color: #071B4A;
        }
        .sidebar-item.active {
          background: #FFF3D6;
          color: #071B4A;
          font-weight: 600;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 12px;
          background: #fff;
          border: 1px solid #EEF1F6;
        }
        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
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
      `}</style>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid #EEF1F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#FFB400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#071B4A', fontSize: 16 }}>
              É
            </div>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#071B4A' }}>EduConnect</span>
          </div>
        </div>

        <div style={{ padding: '16px 8px', flex: 1, overflowY: 'auto' }}>
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              href={item.id === 'dashboard' ? '/dashboard/teacher' : item.id === 'messages' ? '/dashboard/messages' : `#${item.id}`}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span style={{ marginLeft: 'auto', background: '#FFB400', color: '#071B4A', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 10 }}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #EEF1F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            {teacherAvatar ? (
              <Image src={teacherAvatar} alt={teacherName} width={32} height={32} style={{ borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FFB400', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: '#071B4A', fontSize: 14 }}>
                {teacherName.charAt(0)}
              </div>
            )}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#071B4A' }}>{teacherName}</div>
              <div style={{ fontSize: 10, color: '#5A6A7A' }}>{roleLabel[teacherRole] ?? teacherRole}</div>
            </div>
          </div>
          <button className="sidebar-item" style={{ width: '100%' }}>
            <FiLogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 240, padding: '20px 24px' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-btn"
            >
              <FiMenu size={24} />
            </button>
            <div>
              <h1 className="t-heading" style={{ fontSize: 28 }}>
                Tableau de bord
              </h1>
              <p style={{ color: '#5A6A7A', fontSize: 13, margin: 0 }}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <FiBell size={20} color="#5A6A7A" />
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#C0392B', color: '#fff', fontSize: 9, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E8F5E9' }}>
              <FiUsers size={20} color="#4C7C59" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>{totalStudents}</div>
              <div style={{ fontSize: 11, color: '#5A6A7A' }}>Élèves</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#E3F2FD' }}>
              <FiBookOpen size={20} color="#1976D2" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>{totalClasses}</div>
              <div style={{ fontSize: 11, color: '#5A6A7A' }}>Classes</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#FFF3E0' }}>
              <FiTrendingUp size={20} color="#FF9800" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>{avgAttendanceRate}%</div>
              <div style={{ fontSize: 11, color: '#5A6A7A' }}>Taux de présence</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#F3E5F5' }}>
              <FiAward size={20} color="#9C27B0" />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#071B4A' }}>{avgHomeworkCompletion}%</div>
              <div style={{ fontSize: 11, color: '#5A6A7A' }}>Devoirs complétés</div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="t-grid-2">
          <div className="t-card">
            <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 16 }}>
              📊 Taux de présence par classe
            </h2>
            <BarChart data={attendanceRateByClass.map(a => ({ label: a.className, value: a.rate }))} color="#4C7C59" />
          </div>
          <div className="t-card">
            <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 16 }}>
              🎯 Complétion des devoirs
            </h2>
            <BarChart data={homeworkCompletionRate.map(h => ({ label: h.title.substring(0, 20), value: h.rate }))} color="#FF9800" />
          </div>
        </div>

        {/* Search Students */}
        <div className="t-card" style={{ marginBottom: 20 }}>
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 10 }}>
            <FiSearch size={16} style={{ display: 'inline', marginRight: 6 }} />
            Rechercher un élève
          </h2>
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
                    <span style={{ color: '#5A6A7A' }}>{s.parentNames.join(', ') || 'Aucun parent lié'}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Schedule and Tasks */}
        <div className="t-grid-2">
          <div className="t-card">
            <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>
              <FiCalendar size={16} style={{ display: 'inline', marginRight: 6 }} />
              Emploi du jour
            </h2>
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

          <div className="t-card">
            <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>
              <FiCheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />
              À faire aujourd'hui
            </h2>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                placeholder="Nouvelle tâche..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addTask(); }}
                className="t-input"
              />
              <button onClick={addTask} disabled={savingTask} className="t-btn">
                <FiPlus size={16} />
              </button>
            </div>
            {tasks.length === 0 ? (
              <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune tâche pour le moment.</p>
            ) : (
              tasks.map((t) => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <input
                    type="checkbox"
                    checked={t.completed}
                    onChange={() => toggleTask(t.id, t.completed)}
                  />
                  <span style={{ flex: 1, fontSize: 13, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? '#5A6A7A' : '#1A1A2E' }}>
                    {t.title}
                  </span>
                  <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', fontSize: 12 }}>
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Attendance */}
        <div className="t-card" style={{ marginBottom: 16 }}>
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>
            <FiCheckCircle size={16} style={{ display: 'inline', marginRight: 6 }} />
            Présences du jour
          </h2>
          {attendance.length === 0 ? (
            <p style={{ fontSize: 13, color: '#5A6A7A' }}>Aucune classe assignée.</p>
          ) : (
            attendance.map((c) => {
              const isOpen = expandedClassId === c.classId;
              return (
                <div key={c.classId} style={{ border: '1px solid #F0F0F0', borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedClassId(isOpen ? null : c.classId)}
                    style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', gap: 10 }}
                  >
                    <strong style={{ fontSize: 13.5, color: '#071B4A' }}>{c.className}</strong>
                    <span style={{ fontSize: 12, color: '#5A6A7A' }}>
                      ✅ {c.present} · ⏰ {c.late} · ❌ {c.absent} · 📝 {c.excused} · {c.unmarked} non marqué{c.unmarked !== 1 ? 's' : ''} {isOpen ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </span>
                  </button>
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

        {/* Homework and Birthdays */}
        <div className="t-grid-2">
          <div className="t-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="t-heading" style={{ fontSize: 16 }}>
                <FiBookOpen size={16} style={{ display: 'inline', marginRight: 6 }} />
                Activités à venir
              </h2>
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
                  <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>
                    {h.className} · Échéance {new Date(h.deadline).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="t-card">
            <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>
              <FiGift size={16} style={{ display: 'inline', marginRight: 6 }} />
              Anniversaires à venir
            </h2>
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
          <h2 className="t-heading" style={{ fontSize: 16, marginBottom: 12 }}>
            <FiTrendingUp size={16} style={{ display: 'inline', marginRight: 6 }} />
            Aperçu des performances
          </h2>
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
                      const c = gradeColor(g.value);
                      return (
                        <span key={g.subject} style={{ fontSize: 11.5, background: c.bg, color: c.text, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>
                          {g.subject}: {g.value}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Classes and Messages */}
        <div className="t-grid-2">
          <div className="t-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="t-heading" style={{ fontSize: 16 }}>
                <FiUsers size={16} style={{ display: 'inline', marginRight: 6 }} />
                Mes classes
              </h2>
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

          <div className="t-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 className="t-heading" style={{ fontSize: 16 }}>
                <FiMessageSquare size={16} style={{ display: 'inline', marginRight: 6 }} />
                Messages {unreadCount > 0 && (
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
                <div key={c.id} style={{ padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#071B4A' }}>{c.otherName}</div>
                  <div style={{ fontSize: 11.5, color: '#5A6A7A' }}>{roleLabel[c.otherRole] ?? c.otherRole}</div>
                  {c.lastMessage && <div style={{ fontSize: 11.5, color: '#5A6A7A', marginTop: 3 }}>{c.lastMessage}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          div[style*="margin-left: 240px"] {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}