'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

const NAV = [
  { href: '/dashboard/teacher', label: 'Tableau de bord', icon: 'home', exact: true },
  { href: '/dashboard/teacher/attendance', label: 'Présences', icon: 'check', exact: false },
  { href: '/dashboard/teacher/classroom', label: 'Classe & ressources', icon: 'book', exact: false },
  { href: '/dashboard/teacher/timetable', label: 'Emploi du temps', icon: 'calendar', exact: false },
  { href: '/dashboard/messages', label: 'Messagerie', icon: 'message', exact: false },
] as const;

function NavIcon({ name }: { name: string }) {
  const c = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (name) {
    case 'home':
      return <svg {...c}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /></svg>;
    case 'check':
      return <svg {...c}><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M9 13l2 2 4-4" /></svg>;
    case 'book':
      return <svg {...c}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></svg>;
    case 'calendar':
      return <svg {...c}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
    case 'message':
      return <svg {...c}><path d="M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" /></svg>;
    case 'chevron':
      return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>;
    case 'menu':
      return <svg {...c}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    default:
      return null;
  }
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default function TeacherShell({
  teacherName,
  schoolName,
  unreadCount,
  children,
}: {
  teacherName: string;
  schoolName: string;
  unreadCount: number;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setDrawer(false); }, [pathname]);

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');

  const current = NAV.find(isActive);

  return (
    <div className="ts-shell">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .ts-shell { display: flex; height: calc(100dvh - 64px); overflow: hidden; background: #F4F6FB; font-family: Inter, sans-serif; }

        .ts-side { width: 248px; flex-shrink: 0; height: 100%; display: flex; flex-direction: column; background: linear-gradient(180deg, #071B4A 0%, #0A2358 100%); color: #fff; transition: width .28s cubic-bezier(.4,0,.2,1); overflow: hidden; position: relative; z-index: 60; }
        .ts-side.collapsed { width: 78px; }

        .ts-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 20px 18px 16px; }
        .ts-brand { min-width: 0; }
        .ts-brand-l { font-size: 10.5px; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: #FFB400; }
        .ts-brand-n { font-family: Fraunces, serif; font-weight: 700; font-size: 16px; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ts-collapse { width: 30px; height: 30px; flex-shrink: 0; border: none; border-radius: 9px; background: rgba(255,255,255,.09); color: #fff; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; transition: transform .28s, background .15s; }
        .ts-collapse:hover { background: rgba(255,255,255,.16); }
        .ts-side.collapsed .ts-collapse { transform: rotate(180deg); }
        .ts-side.collapsed .ts-top { justify-content: center; padding-left: 0; padding-right: 0; }
        .ts-side.collapsed .ts-brand { display: none; }

        .ts-sec { font-size: 10.5px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,.4); padding: 8px 22px 6px; white-space: nowrap; }
        .ts-side.collapsed .ts-sec { visibility: hidden; height: 6px; padding: 0; }

        .ts-nav { display: flex; flex-direction: column; gap: 3px; padding: 4px 12px; flex: 1; overflow-y: auto; }
        .ts-link { position: relative; display: flex; align-items: center; gap: 13px; padding: 11px 13px; border-radius: 12px; color: rgba(255,255,255,.78); text-decoration: none; font-size: 14px; font-weight: 500; white-space: nowrap; transition: background .16s, color .16s; }
        .ts-link:hover { background: rgba(255,255,255,.09); color: #fff; }
        .ts-link.active { background: #FFB400; color: #071B4A; font-weight: 700; box-shadow: 0 6px 16px rgba(255,180,0,.28); }
        .ts-ico { display: inline-flex; flex-shrink: 0; }
        .ts-label { overflow: hidden; text-overflow: ellipsis; flex: 1; }
        .ts-badge { min-width: 20px; height: 20px; padding: 0 6px; border-radius: 999px; background: #FFB400; color: #071B4A; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; }
        .ts-link.active .ts-badge { background: #071B4A; color: #FFB400; }
        .ts-side.collapsed .ts-label { display: none; }
        .ts-side.collapsed .ts-link { justify-content: center; padding: 12px 0; }
        .ts-side.collapsed .ts-badge { position: absolute; top: 5px; right: 11px; min-width: 9px; height: 9px; padding: 0; font-size: 0; border: 2px solid #0A2358; }

        .ts-me { margin: 12px; padding: 12px; border-radius: 14px; background: rgba(255,255,255,.07); display: flex; align-items: center; gap: 11px; }
        .ts-me-av { width: 38px; height: 38px; border-radius: 50%; background: #FFB400; color: #071B4A; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; flex-shrink: 0; }
        .ts-me-n { font-size: 13.5px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ts-me-s { font-size: 11.5px; color: rgba(255,255,255,.55); margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ts-me-t { min-width: 0; }
        .ts-side.collapsed .ts-me { justify-content: center; padding: 10px 0; background: transparent; }
        .ts-side.collapsed .ts-me-t { display: none; }

        .ts-body { flex: 1; min-width: 0; height: 100%; display: flex; flex-direction: column; }
        .ts-main { flex: 1; min-height: 0; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #C9D2E3 transparent; }
        .ts-mobilebar { display: none; align-items: center; gap: 12px; padding: 10px 14px; background: #fff; border-bottom: 1px solid #E8ECF3; flex-shrink: 0; }
        .ts-burger { width: 38px; height: 38px; border: none; border-radius: 10px; background: #EDF1F8; color: #071B4A; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
        .ts-mb-t { font-family: Fraunces, serif; font-weight: 700; font-size: 17px; color: #071B4A; }
        .ts-scrim { display: none; }

        @media (max-width: 900px) {
          .ts-side { position: fixed; left: 0; top: 64px; bottom: 0; height: auto; width: 270px; transform: translateX(-100%); transition: transform .28s cubic-bezier(.4,0,.2,1); box-shadow: 0 0 40px rgba(7,27,74,.35); }
          .ts-side.open { transform: none; }
          .ts-side.collapsed { width: 270px; }
          .ts-side.collapsed .ts-label, .ts-side.collapsed .ts-me-t, .ts-side.collapsed .ts-brand { display: block; }
          .ts-side.collapsed .ts-label { display: inline; }
          .ts-side.collapsed .ts-link { justify-content: flex-start; padding: 11px 13px; }
          .ts-side.collapsed .ts-sec { visibility: visible; height: auto; padding: 8px 22px 6px; }
          .ts-side.collapsed .ts-badge { position: static; min-width: 20px; height: 20px; padding: 0 6px; font-size: 11.5px; border: none; }
          .ts-side.collapsed .ts-me { justify-content: flex-start; background: rgba(255,255,255,.07); padding: 12px; }
          .ts-collapse { display: none; }
          .ts-mobilebar { display: flex; }
          .ts-scrim { display: block; position: fixed; inset: 64px 0 0 0; background: rgba(7,27,74,.45); backdrop-filter: blur(3px); z-index: 55; animation: ts-fade .2s ease; }
        }
        @keyframes ts-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .ts-side, .ts-collapse, .ts-scrim { transition: none; animation: none; } }
      `}</style>

      {drawer && <div className="ts-scrim" onClick={() => setDrawer(false)} />}

      <aside className={`ts-side${collapsed ? ' collapsed' : ''}${drawer ? ' open' : ''}`} aria-label="Navigation enseignant">
        <div className="ts-top">
          <div className="ts-brand">
            <div className="ts-brand-l">Espace enseignant</div>
            <div className="ts-brand-n">{schoolName || 'Mon école'}</div>
          </div>
          <button
            type="button"
            className="ts-collapse"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            <NavIcon name="chevron" />
          </button>
        </div>

        <div className="ts-sec">Menu</div>
        <nav className="ts-nav">
          {NAV.map((item) => {
            const active = isActive(item);
            const showBadge = item.icon === 'message' && unreadCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`ts-link${active ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
              >
                <span className="ts-ico"><NavIcon name={item.icon} /></span>
                <span className="ts-label">{item.label}</span>
                {showBadge && <span className="ts-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="ts-me">
          <span className="ts-me-av">{initials(teacherName)}</span>
          <div className="ts-me-t">
            <div className="ts-me-n">{teacherName || 'Enseignant'}</div>
            <div className="ts-me-s">Enseignant</div>
          </div>
        </div>
      </aside>

      <div className="ts-body">
        <div className="ts-mobilebar">
          <button type="button" className="ts-burger" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu">
            <NavIcon name="menu" />
          </button>
          <span className="ts-mb-t">{current?.label ?? 'Espace enseignant'}</span>
        </div>
        <main className="ts-main">{children}</main>
      </div>
    </div>
  );
}