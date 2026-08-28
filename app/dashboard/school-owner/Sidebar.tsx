'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard/school-owner', label: 'Tableau de bord', icon: 'home' },
  { href: '/dashboard/school-owner/teachers', label: 'Enseignants', icon: 'users' },
  { href: '/dashboard/school-owner/students', label: 'Élèves', icon: 'student' },
  { href: '/dashboard/school-owner/classes', label: 'Classes', icon: 'building' },
  { href: '/dashboard/school-owner/enrollments', label: 'Inscriptions', icon: 'clipboard' },
  { href: '/dashboard/school-owner/payments', label: 'Paiements', icon: 'card' },
  { href: '/dashboard/messages', label: 'Messagerie', icon: 'message' },
] as const;

function Icon({ name }: { name: string }) {
  const common = { width: 19, height: 19, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':
      return <svg {...common}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
    case 'users':
      return <svg {...common}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><circle cx="17.5" cy="9" r="2.4" /><path d="M15.5 14.3c2.6.3 4.5 2.1 4.5 4.7" /></svg>;
    case 'student':
      return <svg {...common}><path d="M2 8l10-4 10 4-10 4-10-4z" /><path d="M6 10.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5.5" /><path d="M22 8v6" /></svg>;
    case 'building':
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></svg>;
    case 'clipboard':
      return <svg {...common}><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 11h8M8 15h5" /></svg>;
    case 'card':
      return <svg {...common}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="M2.5 10h19" /><path d="M6 15h4" /></svg>;
    case 'message':
      return <svg {...common}><path d="M21 12a8 8 0 1 1-3.4-6.5" /><path d="M21 3v6h-6" /><path d="M8 11h.01M12 11h.01M16 11h.01" /></svg>;
    case 'chevron':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
    default:
      return null;
  }
}

export default function Sidebar({ schoolName }: { schoolName: string }) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: open ? 236 : 72,
        transition: 'width .28s cubic-bezier(.4,0,.2,1)',
        background: '#071B4A',
        color: '#fff',
        // Fills the app-shell row exactly (the row itself is pinned to 100vh
        // in DashboardClient), rather than re-declaring its own 100vh/sticky —
        // that duplication was what let the sidebar and the scrolling content
        // pane drift out of sync.
        height: '100%',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', padding: '20px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {open && (
          <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {schoolName}
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Réduire le menu' : 'Ouvrir le menu'}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            borderRadius: 8,
            width: 30,
            height: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            cursor: 'pointer',
            transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform .28s ease',
            flexShrink: 0,
          }}
        >
          <Icon name="chevron" />
        </button>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '14px 10px', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!open ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 12px',
                borderRadius: 10,
                textDecoration: 'none',
                color: active ? '#071B4A' : 'rgba(255,255,255,0.82)',
                background: active ? '#FFB400' : 'transparent',
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                transition: 'background .18s ease, color .18s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}><Icon name={item.icon} /></span>
              {open && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3ED598', flexShrink: 0 }} />
          {open && <span>Connecté</span>}
        </div>
      </div>
    </aside>
  );
}