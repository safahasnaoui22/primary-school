'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export interface TeacherRow {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  createdLabel: string;
  isNew: boolean;
  thisMonth: boolean;
  classes: { id: string; name: string }[];
}

type Filter = 'all' | 'assigned' | 'unassigned';
type Sort = 'recent' | 'oldest' | 'name';

const AVATARS: [string, string][] = [
  ['#071B4A', '#FFFFFF'],
  ['#FFB400', '#071B4A'],
  ['#1E3A8A', '#FFFFFF'],
  ['#E6ECFA', '#071B4A'],
  ['#FFF1CC', '#8A5A00'],
  ['#0F766E', '#FFFFFF'],
];

function avatarFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATARS[h % AVATARS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const I = {
  stroke: 'currentColor',
  fill: 'none',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const Icon = {
  search: (
    <svg width="17" height="17" viewBox="0 0 24 24" {...I}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" {...I} strokeWidth={2.4}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  back: (
    <svg width="15" height="15" viewBox="0 0 24 24" {...I} strokeWidth={2.2}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...I}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.5 20c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.5 14.3c2.6.3 4.5 2.1 4.5 4.7" />
    </svg>
  ),
  book: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...I}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M4 5.5v16" />
    </svg>
  ),
  alert: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...I}>
      <path d="M12 3l10 18H2L12 3z" />
      <path d="M12 10v5M12 18h.01" />
    </svg>
  ),
  spark: (
    <svg width="20" height="20" viewBox="0 0 24 24" {...I}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" {...I}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" {...I}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
    </svg>
  ),
  check: (
    <svg width="16" height="16" viewBox="0 0 24 24" {...I} strokeWidth={2.6}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  ),
};

export default function TeachersClient({ teachers }: { teachers: TeacherRow[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const total = teachers.length;
  const assigned = teachers.filter((t) => t.classes.length > 0).length;
  const unassigned = total - assigned;
  const thisMonth = teachers.filter((t) => t.thisMonth).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = teachers.filter((t) => {
      if (filter === 'assigned' && t.classes.length === 0) return false;
      if (filter === 'unassigned' && t.classes.length > 0) return false;
      if (!q) return true;
      return (
        t.username.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.classes.some((c) => c.name.toLowerCase().includes(q))
      );
    });
    list = [...list].sort((a, b) => {
      if (sort === 'name') return a.username.localeCompare(b.username, 'fr');
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === 'oldest' ? d : -d;
    });
    return list;
  }, [teachers, query, filter, sort]);

  const copyEmail = async (t: TeacherRow) => {
    try {
      await navigator.clipboard.writeText(t.email);
      setCopiedId(t.id);
      setTimeout(() => setCopiedId((c) => (c === t.id ? null : c)), 1600);
    } catch {
      /* clipboard unavailable – ignore */
    }
  };

  const chips: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: total },
    { key: 'assigned', label: 'Avec classe', count: assigned },
    { key: 'unassigned', label: 'Sans classe', count: unassigned },
  ];

  const stats = [
    { label: 'Enseignants', value: total, icon: Icon.users, tone: 'navy' },
    { label: 'Avec une classe', value: assigned, icon: Icon.book, tone: 'green' },
    { label: 'Sans classe', value: unassigned, icon: Icon.alert, tone: unassigned > 0 ? 'amber' : 'muted' },
    { label: 'Ajoutés ce mois', value: thisMonth, icon: Icon.spark, tone: 'gold' },
  ];

  return (
    <div className="tp-wrap">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .tp-wrap { max-width: 1200px; margin: 0 auto; padding: 28px 28px 64px; font-family: Inter, sans-serif; color: #1A2233; }
        .tp-back { display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; color: #5A6A7A; text-decoration: none; margin-bottom: 14px; padding: 4px 10px 4px 6px; border-radius: 999px; transition: background .15s, color .15s; }
        .tp-back:hover { background: #EDF1F8; color: #071B4A; }

        .tp-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 26px; }
        .tp-title { font-family: Fraunces, serif; font-weight: 700; color: #071B4A; font-size: 34px; line-height: 1.1; margin: 0; letter-spacing: -0.01em; }
        .tp-sub { color: #6B7A90; font-size: 14.5px; margin: 8px 0 0; }
        .tp-btn { display: inline-flex; align-items: center; gap: 8px; background: #FFB400; color: #071B4A; padding: 11px 20px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 6px 16px rgba(255,180,0,.32); transition: transform .15s, box-shadow .15s, background .15s; white-space: nowrap; }
        .tp-btn:hover { transform: translateY(-1px); background: #FFC21F; box-shadow: 0 10px 22px rgba(255,180,0,.4); }

        .tp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 22px; }
        .tp-stat { background: #fff; border: 1px solid #E8ECF3; border-radius: 16px; padding: 18px 20px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 18px rgba(7,27,74,.05); transition: transform .2s, box-shadow .2s; }
        .tp-stat:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(7,27,74,.09); }
        .tp-ico { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .tp-ico.navy { background: #E6ECFA; color: #071B4A; }
        .tp-ico.green { background: #E3F6EE; color: #0F8A5F; }
        .tp-ico.amber { background: #FFF1CC; color: #B27300; }
        .tp-ico.gold { background: #FFF6DB; color: #C98A00; }
        .tp-ico.muted { background: #F0F2F6; color: #8794A8; }
        .tp-stat-val { font-family: Fraunces, serif; font-weight: 700; font-size: 28px; line-height: 1; color: #071B4A; }
        .tp-stat-lbl { font-size: 12.5px; color: #6B7A90; margin-top: 5px; font-weight: 500; }

        .tp-card { background: #fff; border: 1px solid #E8ECF3; border-radius: 18px; box-shadow: 0 4px 22px rgba(7,27,74,.06); overflow: hidden; }

        .tp-toolbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; padding: 16px 20px; border-bottom: 1px solid #EEF1F6; }
        .tp-search { position: relative; flex: 1 1 260px; min-width: 200px; max-width: 380px; }
        .tp-search svg { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #8794A8; pointer-events: none; }
        .tp-input { width: 100%; height: 42px; padding: 0 14px 0 40px; border: 1px solid #E2E7F0; border-radius: 12px; background: #F8FAFD; font-size: 14px; font-family: inherit; color: #1A2233; outline: none; transition: border-color .15s, box-shadow .15s, background .15s; }
        .tp-input::placeholder { color: #98A4B6; }
        .tp-input:focus { border-color: #071B4A; background: #fff; box-shadow: 0 0 0 3px rgba(7,27,74,.1); }
        .tp-chips { display: flex; gap: 6px; flex-wrap: wrap; }
        .tp-chip { border: 1px solid #E2E7F0; background: #fff; color: #4A5A70; font-family: inherit; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; transition: all .15s; }
        .tp-chip:hover { border-color: #C9D2E3; background: #F5F8FD; }
        .tp-chip.on { background: #071B4A; border-color: #071B4A; color: #fff; }
        .tp-chip-n { font-size: 11.5px; padding: 1px 7px; border-radius: 999px; background: #EDF1F8; color: #071B4A; font-weight: 700; }
        .tp-chip.on .tp-chip-n { background: rgba(255,255,255,.18); color: #fff; }
        .tp-select { margin-left: auto; height: 42px; padding: 0 34px 0 14px; border: 1px solid #E2E7F0; border-radius: 12px; background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%235A6A7A' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E") no-repeat right 12px center; appearance: none; font-family: inherit; font-size: 13.5px; font-weight: 600; color: #1A2233; cursor: pointer; outline: none; }
        .tp-select:focus { border-color: #071B4A; box-shadow: 0 0 0 3px rgba(7,27,74,.1); }

        .tp-table { width: 100%; border-collapse: collapse; }
        .tp-table thead th { text-align: left; padding: 13px 20px; font-size: 11.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: #7A8AA0; background: #FAFBFE; border-bottom: 1px solid #EEF1F6; white-space: nowrap; }
        .tp-table tbody tr { transition: background .15s; }
        .tp-table tbody tr:hover { background: #F7F9FE; }
        .tp-table tbody td { padding: 16px 20px; border-bottom: 1px solid #F0F3F8; font-size: 14px; vertical-align: middle; }
        .tp-table tbody tr:last-child td { border-bottom: none; }

        .tp-person { display: flex; align-items: center; gap: 14px; min-width: 0; }
        .tp-av { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; letter-spacing: .02em; box-shadow: 0 0 0 3px #fff, 0 0 0 4px #E8ECF3; }
        .tp-name { font-weight: 700; color: #071B4A; font-size: 14.5px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .tp-new { font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #8A5A00; background: #FFF1CC; padding: 2px 8px; border-radius: 999px; }
        .tp-mail { color: #5A6A7A; font-size: 13.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px; display: block; }

        .tp-classes { display: flex; flex-wrap: wrap; gap: 6px; }
        .tp-pill { font-size: 12.5px; font-weight: 600; color: #071B4A; background: #EAF0FC; padding: 4px 11px; border-radius: 999px; white-space: nowrap; }
        .tp-pill.more { background: #F0F2F6; color: #5A6A7A; }
        .tp-none { font-size: 12.5px; font-weight: 600; color: #B27300; background: #FFF6DB; padding: 4px 11px; border-radius: 999px; display: inline-flex; align-items: center; gap: 6px; }
        .tp-none::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #F59E0B; }

        .tp-date { color: #5A6A7A; font-size: 13.5px; white-space: nowrap; }

        .tp-actions { display: flex; gap: 6px; justify-content: flex-end; }
        .tp-act { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #E2E7F0; background: #fff; color: #5A6A7A; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; text-decoration: none; transition: all .15s; }
        .tp-act:hover { background: #071B4A; border-color: #071B4A; color: #fff; }
        .tp-act.ok { background: #E3F6EE; border-color: #BFE7D4; color: #0F8A5F; }

        .tp-foot { padding: 13px 20px; border-top: 1px solid #EEF1F6; background: #FAFBFE; font-size: 12.5px; color: #7A8AA0; }

        .tp-empty { text-align: center; padding: 64px 24px; }
        .tp-empty-ico { width: 64px; height: 64px; border-radius: 20px; background: #EAF0FC; color: #071B4A; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; }
        .tp-empty h3 { font-family: Fraunces, serif; color: #071B4A; font-size: 20px; margin: 0 0 6px; }
        .tp-empty p { color: #6B7A90; font-size: 14px; margin: 0 0 18px; }
        .tp-reset { border: none; background: #EDF1F8; color: #071B4A; font-family: inherit; font-weight: 700; font-size: 13px; padding: 9px 16px; border-radius: 10px; cursor: pointer; }
        .tp-reset:hover { background: #E0E7F5; }

        @media (max-width: 960px) {
          .tp-stats { grid-template-columns: repeat(2, 1fr); }
          .tp-select { margin-left: 0; }
        }
        @media (max-width: 720px) {
          .tp-wrap { padding: 20px 16px 56px; }
          .tp-title { font-size: 28px; }
          .tp-head .tp-btn { width: 100%; justify-content: center; }
          .tp-search { max-width: none; flex-basis: 100%; }
          .tp-stat { padding: 14px; gap: 10px; }
          .tp-ico { width: 38px; height: 38px; }
          .tp-stat-val { font-size: 24px; }

          .tp-table thead { display: none; }
          .tp-table, .tp-table tbody, .tp-table tr, .tp-table td { display: block; width: 100%; }
          .tp-table tbody tr { padding: 16px 18px; border-bottom: 1px solid #F0F3F8; position: relative; }
          .tp-table tbody tr:last-child { border-bottom: none; }
          .tp-table tbody td { padding: 0; border: none; }
          .tp-table tbody td + td { margin-top: 12px; }
          .tp-table td[data-label]::before { content: attr(data-label); display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: #98A4B6; margin-bottom: 5px; }
          .tp-table td.tp-td-actions { position: absolute; top: 14px; right: 14px; width: auto; margin: 0; }
          .tp-mail { max-width: 100%; }
          .tp-person { padding-right: 90px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tp-stat, .tp-btn, .tp-act, .tp-chip { transition: none; }
        }
      `}</style>

      <Link href="/dashboard/school-owner" className="tp-back">
        {Icon.back} Tableau de bord
      </Link>

      <div className="tp-head">
        <div>
          <h1 className="tp-title">Enseignants</h1>
          <p className="tp-sub">Gérez l&apos;équipe pédagogique de votre école et ses affectations de classes.</p>
        </div>
        <Link href="/dashboard/school-owner/teachers/new" className="tp-btn">
          {Icon.plus} Ajouter un enseignant
        </Link>
      </div>

      <div className="tp-stats">
        {stats.map((s) => (
          <div className="tp-stat" key={s.label}>
            <div className={`tp-ico ${s.tone}`}>{s.icon}</div>
            <div>
              <div className="tp-stat-val">{s.value}</div>
              <div className="tp-stat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tp-card">
        <div className="tp-toolbar">
          <div className="tp-search">
            {Icon.search}
            <input
              className="tp-input"
              type="search"
              placeholder="Rechercher un nom, un email, une classe…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher un enseignant"
            />
          </div>

          <div className="tp-chips" role="tablist" aria-label="Filtrer les enseignants">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={filter === c.key}
                className={`tp-chip${filter === c.key ? ' on' : ''}`}
                onClick={() => setFilter(c.key)}
              >
                {c.label}
                <span className="tp-chip-n">{c.count}</span>
              </button>
            ))}
          </div>

          <select
            className="tp-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Trier"
          >
            <option value="recent">Plus récents</option>
            <option value="oldest">Plus anciens</option>
            <option value="name">Nom (A–Z)</option>
          </select>
        </div>

        {total === 0 ? (
          <div className="tp-empty">
            <div className="tp-empty-ico">{Icon.users}</div>
            <h3>Aucun enseignant pour le moment</h3>
            <p>Ajoutez votre premier enseignant pour commencer à organiser vos classes.</p>
            <Link href="/dashboard/school-owner/teachers/new" className="tp-btn">
              {Icon.plus} Ajouter un enseignant
            </Link>
          </div>
        ) : visible.length === 0 ? (
          <div className="tp-empty">
            <div className="tp-empty-ico">{Icon.search}</div>
            <h3>Aucun résultat</h3>
            <p>Aucun enseignant ne correspond à votre recherche ou à ce filtre.</p>
            <button
              type="button"
              className="tp-reset"
              onClick={() => {
                setQuery('');
                setFilter('all');
              }}
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <>
            <table className="tp-table">
              <thead>
                <tr>
                  <th>Enseignant</th>
                  <th>Classes</th>
                  <th>Ajouté le</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => {
                  const [bg, fg] = avatarFor(t.username);
                  const shown = t.classes.slice(0, 3);
                  const extra = t.classes.length - shown.length;
                  return (
                    <tr key={t.id}>
                      <td>
                        <div className="tp-person">
                          <div className="tp-av" style={{ background: bg, color: fg }}>
                            {initials(t.username)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div className="tp-name">
                              {t.username}
                              {t.isNew && <span className="tp-new">Nouveau</span>}
                            </div>
                            <span className="tp-mail" title={t.email}>{t.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Classes">
                        {t.classes.length === 0 ? (
                          <span className="tp-none">Aucune classe</span>
                        ) : (
                          <div className="tp-classes">
                            {shown.map((c) => (
                              <span className="tp-pill" key={c.id}>{c.name}</span>
                            ))}
                            {extra > 0 && <span className="tp-pill more">+{extra}</span>}
                          </div>
                        )}
                      </td>
                      <td data-label="Ajouté le">
                        <span className="tp-date">{t.createdLabel}</span>
                      </td>
                      <td className="tp-td-actions">
                        <div className="tp-actions">
                          <button
                            type="button"
                            className={`tp-act${copiedId === t.id ? ' ok' : ''}`}
                            onClick={() => copyEmail(t)}
                            title={copiedId === t.id ? 'Copié !' : "Copier l'email"}
                            aria-label={`Copier l'email de ${t.username}`}
                          >
                            {copiedId === t.id ? Icon.check : Icon.copy}
                          </button>
                          <a
                            className="tp-act"
                            href={`mailto:${t.email}`}
                            title="Envoyer un email"
                            aria-label={`Envoyer un email à ${t.username}`}
                          >
                            {Icon.mail}
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="tp-foot">
              {visible.length} enseignant{visible.length !== 1 ? 's' : ''} affiché{visible.length !== 1 ? 's' : ''}
              {visible.length !== total ? ` sur ${total}` : ''}
            </div>
          </>
        )}
      </div>
    </div>
  );
}