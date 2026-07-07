'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface Subject {
  name: string;
  grade: string;
  trend: 'up' | 'down' | 'flat';
}

interface Child {
  id: string;
  name: string;
  initials: string;
  className: string;
  teacher: string;
  attendancePct: number;
  attendanceLast10: AttendanceStatus[];
  subjects: Subject[];
  upcoming: { title: string; date: string }[];
}

const children: Child[] = [
  {
    id: 'amara',
    name: 'Amara Bakr',
    initials: 'AB',
    className: 'Grade 3 — Room 12',
    teacher: 'Mrs. Owens',
    attendancePct: 96,
    attendanceLast10: ['present', 'present', 'present', 'absent', 'present', 'present', 'present', 'late', 'present', 'present'],
    subjects: [
      { name: 'Mathematics', grade: 'A', trend: 'up' },
      { name: 'Reading', grade: 'B+', trend: 'flat' },
      { name: 'Science', grade: 'A-', trend: 'up' },
      { name: 'Art', grade: 'A', trend: 'flat' },
    ],
    upcoming: [
      { title: 'Field trip permission slip due', date: 'Jul 10' },
      { title: 'Math quiz — fractions', date: 'Jul 14' },
    ],
  },
  {
    id: 'yusuf',
    name: 'Yusuf Bakr',
    initials: 'YB',
    className: 'Grade 1 — Room 4',
    teacher: 'Mr. Ibrahim',
    attendancePct: 100,
    attendanceLast10: ['present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present', 'present'],
    subjects: [
      { name: 'Reading', grade: 'A', trend: 'up' },
      { name: 'Numbers', grade: 'A', trend: 'flat' },
      { name: 'Art', grade: 'A+', trend: 'up' },
    ],
    upcoming: [{ title: 'Show and tell — bring a favorite book', date: 'Jul 11' }],
  },
];

const payment = {
  balance: 120,
  dueDate: 'Jul 20, 2026',
  status: 'due' as 'due' | 'overdue' | 'paid',
};

const messages = {
  unreadCount: 2,
  previews: [
    { from: 'Mrs. Owens', snippet: "Amara did wonderfully on today's presentation...", time: '2h ago', unread: true },
    { from: 'School Office', snippet: 'Reminder: early dismissal this Friday at 1pm.', time: '1d ago', unread: true },
    { from: 'Mr. Ibrahim', snippet: 'Yusuf left his water bottle in class, it\u2019s in lost and found.', time: '3d ago', unread: false },
  ],
};

const announcements = [
  { title: 'Enrollment for next year opens March 1st', date: 'Jul 2', tag: 'Announcement', color: '#FFB400' },
  { title: 'Updated pickup and drop-off procedure', date: 'Jun 20', tag: 'Policy', color: '#071B4A' },
];

const events = [
  { title: 'Sports Day', day: '12', month: 'Jul', time: '9:00 AM', location: 'Main field' },
  { title: 'Parent-teacher conferences', day: '18', month: 'Jul', time: '2:00 – 6:00 PM', location: 'Classrooms' },
  { title: 'Summer arts showcase', day: '25', month: 'Jul', time: '4:30 PM', location: 'Auditorium' },
];

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

function AttendanceDot({ status }: { status: AttendanceStatus }) {
  const color = status === 'present' ? '#4C7C59' : status === 'late' ? '#FFB400' : '#C0392B';
  return (
    <span
      title={status}
      style={{
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: color,
        display: 'inline-block',
      }}
    />
  );
}

export default function ParentDashboard() {
  const { data: session } = useSession();
  const [activeChildId, setActiveChildId] = useState(children[0].id);
  const child = children.find((c) => c.id === activeChildId)!;

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: 1100, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        .pd-card { background: #fff; border-radius: 14px; padding: 22px 24px; box-shadow: 0 3px 12px rgba(7,27,74,0.06); }
        .pd-heading { font-family: 'Fraunces', serif; color: #071B4A; font-weight: 600; margin: 0; }
        .pd-link-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: #071B4A; text-decoration: none; border-bottom: 1px solid #FFB400; padding-bottom: 1px; }
        .pd-folder-tab { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; padding: 10px 20px 12px; border: none; cursor: pointer; border-radius: 10px 10px 0 0; background: #E4D3B4; color: #071B4A; opacity: 0.65; display: flex; align-items: center; gap: 8px; }
        .pd-folder-tab.active { background: #fff; opacity: 1; box-shadow: 0 -3px 10px rgba(7,27,74,0.06); }
        .pd-avatar { width: 28px; height: 28px; border-radius: 50%; background: #071B4A; color: #fff; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; }
        .pd-quick-grid a { display: flex; flex-direction: column; gap: 4px; background: #fff; border-radius: 12px; padding: 16px 18px; text-decoration: none; box-shadow: 0 3px 10px rgba(7,27,74,0.06); transition: transform .2s ease; }
        .pd-quick-grid a:hover { transform: translateY(-3px); }
        .pd-quick-grid a .label { font-weight: 600; color: #071B4A; font-size: 14px; }
        .pd-quick-grid a .sub { font-size: 12px; color: #5A6A7A; }
      `}</style>

      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1.5, color: '#5A6A7A', textTransform: 'uppercase' }}>
          Parent portal
        </span>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontWeight: 600, color: '#071B4A', fontSize: 32, margin: '6px 0 4px' }}>
          Welcome back, {session?.user?.name ?? 'there'}
        </h1>
        <p style={{ color: '#5A6A7A', fontSize: 15, margin: 0 }}>Here's how things are going this week.</p>
      </div>

      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 28 }}>
          {children.map((c) => (
            <button
              key={c.id}
              className={`pd-folder-tab ${c.id === activeChildId ? 'active' : ''}`}
              onClick={() => setActiveChildId(c.id)}
            >
              <span className="pd-avatar" style={{ background: c.id === activeChildId ? '#FFB400' : '#071B4A', color: c.id === activeChildId ? '#071B4A' : '#fff' }}>
                {c.initials}
              </span>
              {c.name.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <div
        className="pd-card"
        style={{
          borderRadius: children.length > 1 ? '0 12px 12px 12px' : 12,
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div className="pd-avatar" style={{ width: 52, height: 52, fontSize: 18, background: '#071B4A' }}>
              {child.initials}
            </div>
            <div>
              <h2 className="pd-heading" style={{ fontSize: 20 }}>{child.name}</h2>
              <p style={{ color: '#5A6A7A', fontSize: 14, margin: '2px 0 0' }}>{child.className} · {child.teacher}</p>
            </div>
          </div>
          <Link href={`/dashboard/parent/messages?to=${encodeURIComponent(child.teacher)}`} className="pd-link-btn">
            Message {child.teacher.split(' ')[1] ?? child.teacher} →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Attendance — last 10 days
              </h3>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600, color: '#4C7C59' }}>
                {child.attendancePct}% this term
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {child.attendanceLast10.map((s, i) => (
                <AttendanceDot key={i} status={s} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 12, color: '#5A6A7A' }}>
              <span><AttendanceDot status="present" /> Present</span>
              <span><AttendanceDot status="late" /> Late</span>
              <span><AttendanceDot status="absent" /> Absent</span>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Coming up
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {child.upcoming.map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#1A1A2E' }}>{u.title}</span>
                  <span style={{ color: '#5A6A7A', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, whiteSpace: 'nowrap', marginLeft: 12 }}>
                    {u.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #F0F0F0', marginTop: 22, paddingTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#5A6A7A', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Grades
            </h3>
            <Link href={`/dashboard/parent/children/${child.id}/grades`} className="pd-link-btn">
              Full report card →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {child.subjects.map((s) => {
              const c = gradeColor(s.grade);
              return (
                <div key={s.name} style={{ background: '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#1A1A2E', fontWeight: 500 }}>{s.name}</span>
                    <TrendIcon trend={s.trend} />
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 600,
                      fontSize: 13,
                      padding: '2px 10px',
                      borderRadius: 8,
                      background: c.bg,
                      color: c.text,
                    }}
                  >
                    {s.grade}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="pd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 className="pd-heading" style={{ fontSize: 17 }}>Fees</h2>
            <Link href="/dashboard/parent/payments" className="pd-link-btn">History →</Link>
          </div>
          {payment.balance > 0 ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 600, color: '#071B4A' }}>
                  ${payment.balance}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 10,
                    background: payment.status === 'overdue' ? '#FAECE7' : '#FAEEDA',
                    color: payment.status === 'overdue' ? '#712B13' : '#633806',
                  }}
                >
                  {payment.status === 'overdue' ? 'Overdue' : 'Due'} {payment.dueDate}
                </span>
              </div>
              <Link
                href="/dashboard/parent/payments"
                style={{
                  display: 'inline-block',
                  marginTop: 16,
                  background: '#FFB400',
                  color: '#071B4A',
                  padding: '9px 20px',
                  borderRadius: 20,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                Pay now
              </Link>
            </>
          ) : (
            <p style={{ color: '#4C7C59', fontSize: 14, fontWeight: 500 }}>All fees are paid up. Nothing due.</p>
          )}
        </div>

        <div className="pd-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 className="pd-heading" style={{ fontSize: 17 }}>
              Messages {messages.unreadCount > 0 && (
                <span style={{ fontSize: 12, background: '#FFB400', color: '#071B4A', padding: '2px 8px', borderRadius: 10, marginLeft: 6, verticalAlign: 2 }}>
                  {messages.unreadCount} new
                </span>
              )}
            </h2>
            <Link href="/dashboard/parent/messages" className="pd-link-btn">Inbox →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.previews.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, paddingBottom: 10, borderBottom: i < messages.previews.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: m.unread ? 600 : 500, color: '#071B4A' }}>{m.from}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 13, color: '#5A6A7A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.snippet}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: '#5A6A7A', whiteSpace: 'nowrap', fontFamily: "'IBM Plex Mono', monospace" }}>
                  {m.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        <div className="pd-card">
          <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 14 }}>School announcements</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {announcements.map((a, i) => (
              <div key={i} style={{ borderLeft: `3px solid ${a.color}`, paddingLeft: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: a.color }}>{a.tag}</span>
                  <span style={{ fontSize: 11, color: '#5A6A7A', fontFamily: "'IBM Plex Mono', monospace" }}>{a.date}</span>
                </div>
                <p style={{ margin: 0, fontSize: 14, color: '#1A1A2E' }}>{a.title}</p>
              </div>
            ))}
          </div>
          <Link href="/news-events" className="pd-link-btn" style={{ display: 'inline-block', marginTop: 14 }}>
            View all news →
          </Link>
        </div>

        <div className="pd-card">
          <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 14 }}>Upcoming events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((ev, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#FFB400', textTransform: 'uppercase', fontFamily: "'IBM Plex Mono', monospace" }}>{ev.month}</div>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#071B4A' }}>{ev.day}</div>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#071B4A' }}>{ev.title}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#5A6A7A' }}>{ev.time} · {ev.location}</p>
                </div>
              </div>
            ))}
          </div>
          <Link href="/news-events" className="pd-link-btn" style={{ display: 'inline-block', marginTop: 14 }}>
            View full calendar →
          </Link>
        </div>
      </div>

      <h2 className="pd-heading" style={{ fontSize: 17, marginBottom: 12 }}>Quick actions</h2>
      <div className="pd-quick-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 40 }}>
        <Link href={`/dashboard/parent/children/${child.id}/attendance`}>
          <span className="label">Attendance record</span>
          <span className="sub">Full history for {child.name.split(' ')[0]}</span>
        </Link>
        <Link href={`/dashboard/parent/children/${child.id}/grades`}>
          <span className="label">Report card</span>
          <span className="sub">All subjects, all terms</span>
        </Link>
        <Link href="/dashboard/parent/messages">
          <span className="label">Message a teacher</span>
          <span className="sub">Start a new conversation</span>
        </Link>
        <Link href="/dashboard/parent/payments">
          <span className="label">Pay fees</span>
          <span className="sub">View invoices and pay online</span>
        </Link>
        <Link href="/dashboard/parent/profile">
          <span className="label">Account settings</span>
          <span className="sub">Update contact info and password</span>
        </Link>
      </div>
    </div>
  );
}