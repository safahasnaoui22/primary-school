'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import { Avatar, Icon, Modal, tintFor } from '../luxury-ui';

interface ClassOption { id: string; name: string; }
interface StudentRow {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  class: { id: string; name: string; teachers: string[]; teacherName: string | null } | null;
  parents: { id: string; username: string; email: string }[];
  createdAt: string;
}

type Chip = 'all' | 'noClass' | 'noParent';
type Sort = 'name' | 'nameDesc' | 'recent' | 'class';

function ageOf(iso: string | null) {
  if (!iso) return null;
  const b = new Date(iso);
  const n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && n.getDate() < b.getDate())) a--;
  return a >= 0 && a < 30 ? a : null;
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [chip, setChip] = useState<Chip>('all');
  const [sort, setSort] = useState<Sort>('name');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editClass, setEditClass] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const [deleting, setDeleting] = useState<StudentRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [toast, setToast] = useState<ToastData | null>(null);

  const load = useCallback(async () => {
    const [sRes, cRes] = await Promise.all([
      fetch('/api/school-owner/students'),
      fetch('/api/school-owner/classes'),
    ]);
    if (sRes.ok) setStudents(await sRes.json());
    if (cRes.ok) {
      const data = await cRes.json();
      setClasses(data.map((c: any) => ({ id: c.id, name: c.name })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Allow deep links like /dashboard/school-owner/students?class=<id> (used by the Classes page)
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get('class');
    if (c) setClassFilter(c);
  }, []);

  /* ---------- derived data ---------- */
  const total = students.length;
  const noClass = students.filter((s) => !s.class).length;
  const noParent = students.filter((s) => s.parents.length === 0).length;
  const monthAgo = Date.now() - 30 * 86400000;
  const recent = students.filter((s) => new Date(s.createdAt).getTime() >= monthAgo).length;
  const placedPct = total > 0 ? Math.round(((total - noClass) / total) * 100) : 0;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = students.filter((s) => {
      if (classFilter && s.class?.id !== classFilter) return false;
      if (chip === 'noClass' && s.class) return false;
      if (chip === 'noParent' && s.parents.length > 0) return false;
      if (!q) return true;
      return (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        `${s.lastName} ${s.firstName}`.toLowerCase().includes(q) ||
        (s.class?.name.toLowerCase().includes(q) ?? false) ||
        s.parents.some((p) => p.username.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      );
    });
    const byName = (a: StudentRow, b: StudentRow) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fr');
    return [...list].sort((a, b) => {
      if (sort === 'nameDesc') return byName(b, a);
      if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'class') return (a.class?.name ?? '\uffff').localeCompare(b.class?.name ?? '\uffff', 'fr') || byName(a, b);
      return byName(a, b);
    });
  }, [students, search, classFilter, chip, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const from = filtered.length === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = Math.min(current * pageSize, filtered.length);

  const pageButtons = useMemo(() => {
    const out: (number | '…')[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - current) <= 1) out.push(i);
      else if (out[out.length - 1] !== '…') out.push('…');
    }
    return out;
  }, [totalPages, current]);

  const hasFilters = !!(search || classFilter || chip !== 'all');
  const resetFilters = () => { setSearch(''); setClassFilter(''); setChip('all'); setPage(1); };

  /* ---------- actions ---------- */
  const openEdit = (s: StudentRow) => {
    setEditing(s);
    setEditFirst(s.firstName);
    setEditLast(s.lastName);
    setEditClass(s.class?.id || '');
    setEditError('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    if (!editFirst.trim() || !editLast.trim()) {
      setEditError('Le prénom et le nom sont requis.');
      return;
    }
    setSaving(true);
    setEditError('');
    const res = await fetch(`/api/school-owner/students/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: editFirst, lastName: editLast, classId: editClass || null }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setToast({ title: 'Élève modifié', message: `${editFirst} ${editLast} a été mis à jour.`, emoji: '✅', tone: 'success' });
      setEditing(null);
      load();
    } else {
      setEditError(data.error || 'La modification a échoué.');
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const name = `${deleting.firstName} ${deleting.lastName}`;
    const res = await fetch(`/api/school-owner/students/${deleting.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    setDeleteBusy(false);
    if (res.ok) {
      setToast({ title: 'Élève supprimé', message: `${name} a été retiré du système.`, emoji: '🗑️', tone: 'success' });
      setDeleting(null);
      load();
    } else {
      setToast({ title: 'Échec de la suppression', message: data.error || 'Une erreur est survenue.', emoji: '⚠️', tone: 'error' });
      setDeleting(null);
    }
  };

  const exportCsv = () => {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const header = ['Prénom', 'Nom', 'Classe', 'Enseignants', 'Parents', 'Emails parents', 'Inscrit le'];
    const rows = filtered.map((s) => [
      s.firstName,
      s.lastName,
      s.class?.name ?? '',
      s.class?.teachers.join(' / ') ?? '',
      s.parents.map((p) => p.username).join(' / '),
      s.parents.map((p) => p.email).join(' / '),
      fmt(s.createdAt),
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(esc).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eleves.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const chips: { key: Chip; label: string; count: number }[] = [
    { key: 'all', label: 'Tous', count: total },
    { key: 'noClass', label: 'Sans classe', count: noClass },
    { key: 'noParent', label: 'Sans parent', count: noParent },
  ];

  const stats = [
    { label: 'Élèves inscrits', value: total, sub: `${placedPct}% affectés à une classe`, icon: Icon.student, tone: 'navy' },
    { label: 'Sans classe', value: noClass, sub: noClass > 0 ? 'À affecter' : 'Tout le monde est placé', icon: Icon.alert, tone: noClass > 0 ? 'amber' : 'green' },
    { label: 'Sans parent lié', value: noParent, sub: noParent > 0 ? 'Compte parent à relier' : 'Tous les dossiers sont liés', icon: Icon.link, tone: noParent > 0 ? 'red' : 'green' },
    { label: 'Nouveaux (30 j)', value: recent, sub: 'Inscrits ce dernier mois', icon: Icon.spark, tone: 'muted' },
  ];

  return (
    <div className="lx-wrap">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <Link href="/dashboard/school-owner" className="lx-back">{Icon.back} Tableau de bord</Link>

      {/* ---------- Hero ---------- */}
      <div className="lx-hero">
        <div className="lx-hero-in">
          <div>
            <div className="lx-eyebrow">Gestion de l&apos;école</div>
            <h1 className="lx-h1">Élèves</h1>
            <p className="lx-lead">
              Tous les élèves inscrits, leur classe, leurs enseignants et les parents rattachés — en un coup d&apos;œil.
            </p>
          </div>
          <div className="lx-hero-actions">
            <button type="button" className="lx-btn glass" onClick={exportCsv} disabled={filtered.length === 0}>
              {Icon.download} Exporter CSV
            </button>
            <Link href="/dashboard/school-owner/enrollments" className="lx-btn gold">
              {Icon.plus} Inscriptions
            </Link>
          </div>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="lx-stats">
        {stats.map((s) => (
          <div className="lx-stat" key={s.label}>
            <div className="lx-stat-top">
              <span className="lx-stat-lbl">{s.label}</span>
              <span className={`lx-ico ${s.tone}`}>{s.icon}</span>
            </div>
            <div className="lx-stat-val">{loading ? '–' : s.value}</div>
            <div className="lx-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* ---------- Table card ---------- */}
      <div className="lx-card">
        <div className="lx-toolbar">
          <div className="lx-search">
            {Icon.search}
            <input
              className="lx-input"
              type="search"
              placeholder="Rechercher un élève, un parent, une classe…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              aria-label="Rechercher un élève"
            />
          </div>

          <select
            className="lx-select"
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            aria-label="Filtrer par classe"
          >
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="lx-chips" role="tablist" aria-label="Filtres rapides">
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                role="tab"
                aria-selected={chip === c.key}
                className={`lx-chip${chip === c.key ? ' on' : ''}`}
                onClick={() => { setChip(c.key); setPage(1); }}
              >
                {c.label}<span className="lx-chip-n">{c.count}</span>
              </button>
            ))}
          </div>

          <select className="lx-select lx-spacer" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Trier">
            <option value="name">Nom (A–Z)</option>
            <option value="nameDesc">Nom (Z–A)</option>
            <option value="recent">Plus récents</option>
            <option value="class">Par classe</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: 'grid', gap: 14 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="lx-skel" style={{ width: 42, height: 42, borderRadius: '50%' }} />
                <div style={{ flex: 1, display: 'grid', gap: 8 }}>
                  <div className="lx-skel" style={{ height: 12, width: '30%' }} />
                  <div className="lx-skel" style={{ height: 10, width: '18%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-ico">{Icon.student}</div>
            <h3>Aucun élève pour le moment</h3>
            <p>Les élèves apparaîtront ici dès que des inscriptions seront approuvées.</p>
            <Link href="/dashboard/school-owner/enrollments" className="lx-btn navy">Voir les inscriptions</Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-ico">{Icon.search}</div>
            <h3>Aucun résultat</h3>
            <p>Aucun élève ne correspond à votre recherche ou à ces filtres.</p>
            <button type="button" className="lx-btn soft" onClick={resetFilters}>Réinitialiser les filtres</button>
          </div>
        ) : (
          <>
            <table className="lx-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Classe</th>
                  <th>Enseignant(s)</th>
                  <th>Parent(s)</th>
                  <th>Inscrit le</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((s) => {
                  const full = `${s.firstName} ${s.lastName}`;
                  const age = ageOf(s.birthDate);
                  const tint = s.class ? tintFor(s.class.name) : null;
                  const parentsShown = s.parents.slice(0, 2);
                  const parentsExtra = s.parents.length - parentsShown.length;
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="lx-person">
                          <Avatar name={full} />
                          <div style={{ minWidth: 0 }}>
                            <Link href={`/dashboard/school-owner/students/${s.id}`} className="lx-name">{full}</Link>
                            <span className="lx-subtle">{age !== null ? `${age} an${age > 1 ? 's' : ''}` : 'Âge non renseigné'}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Classe">
                        {s.class && tint ? (
                          <span className="lx-pill" style={{ background: tint.bg, color: tint.fg }}>{s.class.name}</span>
                        ) : (
                          <span className="lx-badge warn">Non assignée</span>
                        )}
                      </td>
                      <td data-label="Enseignant(s)">
                        {s.class && s.class.teachers.length > 0 ? (
                          <div className="lx-row">
                            <span className="lx-stack">
                              {s.class.teachers.slice(0, 3).map((t) => <Avatar key={t} name={t} size="sm" />)}
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#26344F' }}>
                              {s.class.teachers[0]}
                              {s.class.teachers.length > 1 && <span className="lx-muted"> +{s.class.teachers.length - 1}</span>}
                            </span>
                          </div>
                        ) : (
                          <span className="lx-muted">—</span>
                        )}
                      </td>
                      <td data-label="Parent(s)">
                        {s.parents.length === 0 ? (
                          <span className="lx-badge bad">Aucun parent lié</span>
                        ) : (
                          <div className="lx-row" title={s.parents.map((p) => `${p.username} · ${p.email}`).join('\n')}>
                            {parentsShown.map((p) => (
                              <span className="lx-chipmini" key={p.id}>
                                <Avatar name={p.username} size="sm" />
                                <span className="t">{p.username}</span>
                              </span>
                            ))}
                            {parentsExtra > 0 && <span className="lx-more">+{parentsExtra}</span>}
                          </div>
                        )}
                      </td>
                      <td data-label="Inscrit le"><span className="lx-date">{fmt(s.createdAt)}</span></td>
                      <td className="lx-td-actions">
                        <div className="lx-actions">
                          <Link className="lx-act" href={`/dashboard/school-owner/students/${s.id}`} title="Voir la fiche" aria-label={`Voir la fiche de ${full}`}>{Icon.eye}</Link>
                          <button type="button" className="lx-act" onClick={() => openEdit(s)} title="Modifier" aria-label={`Modifier ${full}`}>{Icon.edit}</button>
                          <button type="button" className="lx-act danger" onClick={() => setDeleting(s)} title="Supprimer" aria-label={`Supprimer ${full}`}>{Icon.trash}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="lx-foot">
              <span>
                {from}–{to} sur {filtered.length} élève{filtered.length !== 1 ? 's' : ''}
                {hasFilters && filtered.length !== total ? ` (filtré sur ${total})` : ''}
              </span>
              <div className="lx-row">
                <select className="lx-select" style={{ height: 34, fontSize: 12.5 }} value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} aria-label="Lignes par page">
                  {[10, 25, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
                </select>
                <div className="lx-pager">
                  <button type="button" className="lx-pg" onClick={() => setPage(current - 1)} disabled={current === 1} aria-label="Page précédente">{Icon.chevL}</button>
                  {pageButtons.map((p, i) =>
                    p === '…' ? (
                      <span key={`e${i}`} style={{ padding: '0 4px' }}>…</span>
                    ) : (
                      <button key={p} type="button" className={`lx-pg${p === current ? ' on' : ''}`} onClick={() => setPage(p)}>{p}</button>
                    )
                  )}
                  <button type="button" className="lx-pg" onClick={() => setPage(current + 1)} disabled={current === totalPages} aria-label="Page suivante">{Icon.chevR}</button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ---------- Edit modal ---------- */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Modifier l'élève"
        subtitle="Mettez à jour le nom ou changez la classe de l'élève."
        footer={
          <>
            <button type="button" className="lx-btn soft" onClick={() => setEditing(null)}>Annuler</button>
            <button type="button" className="lx-btn gold" onClick={saveEdit} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
          </>
        }
      >
        {editError && <div className="lx-err">{editError}</div>}
        <div className="lx-2col">
          <div className="lx-field">
            <label htmlFor="ef">Prénom</label>
            <input id="ef" className="lx-input" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
          </div>
          <div className="lx-field">
            <label htmlFor="el">Nom</label>
            <input id="el" className="lx-input" value={editLast} onChange={(e) => setEditLast(e.target.value)} />
          </div>
        </div>
        <div className="lx-field">
          <label htmlFor="ec">Classe</label>
          <select id="ec" className="lx-select" style={{ width: '100%' }} value={editClass} onChange={(e) => setEditClass(e.target.value)}>
            <option value="">— Aucune classe —</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Modal>

      {/* ---------- Delete modal ---------- */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Supprimer cet élève ?"
        subtitle="Cette action est définitive."
        width={460}
        footer={
          <>
            <button type="button" className="lx-btn soft" onClick={() => setDeleting(null)}>Annuler</button>
            <button type="button" className="lx-btn danger" onClick={confirmDelete} disabled={deleteBusy}>{deleteBusy ? 'Suppression…' : 'Supprimer définitivement'}</button>
          </>
        }
      >
        {deleting && (
          <div className="lx-person" style={{ padding: '4px 0 12px' }}>
            <Avatar name={`${deleting.firstName} ${deleting.lastName}`} />
            <div>
              <div className="lx-name">{deleting.firstName} {deleting.lastName}</div>
              <span className="lx-subtle">{deleting.class ? `Classe ${deleting.class.name}` : 'Sans classe'}</span>
            </div>
          </div>
        )}
        <p style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.6, margin: '0 0 10px' }}>
          L&apos;élève et ses données associées seront retirés du système.
        </p>
      </Modal>
    </div>
  );
}