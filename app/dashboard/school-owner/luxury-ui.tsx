'use client';

import { ReactNode, useEffect } from 'react';
import './luxury.css';

/* ---------- Avatars / colours ---------- */
const AVATARS: [string, string][] = [
  ['#071B4A', '#FFFFFF'],
  ['#FFB400', '#071B4A'],
  ['#1E3A8A', '#FFFFFF'],
  ['#E6ECFA', '#071B4A'],
  ['#FFF1CC', '#8A5A00'],
  ['#0F766E', '#FFFFFF'],
];

// Soft background / text pairs + a solid accent used for class colour bars.
const TINTS: { bg: string; fg: string; solid: string }[] = [
  { bg: '#E6ECFA', fg: '#1E3A8A', solid: '#3B63D0' },
  { bg: '#E3F6EE', fg: '#0F8A5F', solid: '#25B07F' },
  { bg: '#FFF1CC', fg: '#8A5A00', solid: '#FFB400' },
  { bg: '#F3E8FF', fg: '#6B21A8', solid: '#9B5DE5' },
  { bg: '#FDE8EF', fg: '#B0275B', solid: '#E5548A' },
  { bg: '#E0F4FB', fg: '#0B6A8A', solid: '#2BA8D0' },
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export const avatarFor = (name: string) => AVATARS[hash(name) % AVATARS.length];
export const tintFor = (name: string) => TINTS[hash(name) % TINTS.length];

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size }: { name: string; size?: 'sm' | 'md' }) {
  const [bg, fg] = avatarFor(name);
  return (
    <span className={`lx-av${size ? ' ' + size : ''}`} style={{ background: bg, color: fg }} title={name}>
      {initials(name)}
    </span>
  );
}

/* ---------- Icons ---------- */
const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const Icon = {
  search: (<svg width="17" height="17" viewBox="0 0 24 24" {...S}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>),
  plus: (<svg width="16" height="16" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></svg>),
  back: (<svg width="15" height="15" viewBox="0 0 24 24" {...S} strokeWidth={2.2}><path d="M15 18l-6-6 6-6" /></svg>),
  chevL: (<svg width="15" height="15" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d="M15 18l-6-6 6-6" /></svg>),
  chevR: (<svg width="15" height="15" viewBox="0 0 24 24" {...S} strokeWidth={2.4}><path d="M9 18l6-6-6-6" /></svg>),
  x: (<svg width="16" height="16" viewBox="0 0 24 24" {...S} strokeWidth={2.2}><path d="M6 6l12 12M18 6L6 18" /></svg>),
  check: (<svg width="14" height="14" viewBox="0 0 24 24" {...S} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>),
  edit: (<svg width="16" height="16" viewBox="0 0 24 24" {...S}><path d="M4 20h4L19 9l-4-4L4 16v4z" /><path d="M13.5 6.5l4 4" /></svg>),
  trash: (<svg width="16" height="16" viewBox="0 0 24 24" {...S}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>),
  eye: (<svg width="16" height="16" viewBox="0 0 24 24" {...S}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>),
  download: (<svg width="16" height="16" viewBox="0 0 24 24" {...S}><path d="M12 4v11M7 11l5 5 5-5M4 20h16" /></svg>),
  users: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="9" cy="8" r="3.2" /><path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" /><circle cx="17.5" cy="9" r="2.4" /><path d="M15.5 14.3c2.6.3 4.5 2.1 4.5 4.7" /></svg>),
  student: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M2 8l10-4 10 4-10 4-10-4z" /><path d="M6 10.5V16c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5.5" /><path d="M22 8v6" /></svg>),
  building: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 8h1M14 8h1M9 12h1M14 12h1M9 16h1M14 16h1" /></svg>),
  alert: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M12 3l10 18H2L12 3z" /><path d="M12 10v5M12 18h.01" /></svg>),
  link: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></svg>),
  spark: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>),
  chart: (<svg width="20" height="20" viewBox="0 0 24 24" {...S}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>),
  grid: (<svg width="17" height="17" viewBox="0 0 24 24" {...S}><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></svg>),
  list: (<svg width="17" height="17" viewBox="0 0 24 24" {...S}><path d="M4 6h16M4 12h16M4 18h16" /></svg>),
};

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="lx-ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lx-modal" role="dialog" aria-modal="true" aria-label={title} style={width ? { width: `min(${width}px, 100%)` } : undefined}>
        <div className="lx-mhead">
          <div>
            <h2 className="lx-mtitle">{title}</h2>
            {subtitle && <p className="lx-msub">{subtitle}</p>}
          </div>
          <button type="button" className="lx-x" onClick={onClose} aria-label="Fermer">{Icon.x}</button>
        </div>
        <div className="lx-mbody">{children}</div>
        {footer && <div className="lx-mfoot">{footer}</div>}
      </div>
    </div>
  );
}