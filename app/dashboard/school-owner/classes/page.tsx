'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import { Avatar, Icon, Modal, tintFor } from '../luxury-ui';

interface Teacher { id: string; username: string; email: string; }
interface ClassRow {
  id: string;
  name: string;
  teachers: Teacher[];
  studentCount: number;
  noParentCount: number;
  students: { id: string; firstName: string; lastName: string }[];
  createdAt: string;
}

type Sort = 'name' | 'students' | 'recent';
type View = 'grid' | 'table';

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

/* ------------------------------------------------------------------ */
/* Create / edit modal (name + multi-select teachers)                 */
/* ------------------------------------------------------------------ */
function ClassModal({
  cls,
  teachers,
  onClose,
  onDone,
}: {
  cls: ClassRow | 'new';
  teachers: Teacher[];
  onClose: () => void;
  onDone: (t: ToastData) => void;
}) {
  const isNew = cls === 'new';
  const [name, setName] = useState(isNew ? '' : cls.name);
  const [selected, setSelected] = useState<string[]>(isNew ? [] : cls.teachers.map((t) => t.id));
  const [q, setQ] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const shown = teachers.filter(
    (t) => !q.trim() || t.username.toLowerCase().includes(q.toLowerCase()) || t.email.toLowerCase().includes(q.toLowerCase())
  );
  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = async () => {
    if (!name.trim()) {
      setError('Le nom de la classe est requis.');
      return;
    }
    setBusy(true);
    setError('');
    const res = await fetch(isNew ? '/api/school-owner/classes' : `/api/school-owner/classes/${cls.id}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), teacherIds: selected }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) {
      onDone({
        title: isNew ? 'Classe créée' : 'Classe mise à jour',
        message: isNew ? `${name.trim()} a été ajoutée.` : `${name.trim()} a été mise à jour.`,
        emoji: '✅',
        tone: 'success',
      });
    } else {
      setError(data.error || 'Une erreur est survenue.');
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isNew ? 'Nouvelle classe' : 'Gérer la classe'}
      subtitle={isNew ? 'Donnez un nom à la classe et affectez ses enseignants.' : 'Renommez la classe et ajustez son équipe pédagogique.'}
      width={560}
      footer={
        <>
          <button type="button" className="lx-btn soft" onClick={onClose}>Annuler</button>
          <button type="button" className="lx-btn gold" onClick={submit} disabled={busy}>
            {busy ? 'Enregistrement…' : isNew ? 'Créer la classe' : 'Enregistrer'}
          </button>
        </>
      }
    >
      {error && <div className="lx-err">{error}</div>}

      <div className="lx-field">
        <label htmlFor="cn">Nom de la classe</label>
        <input id="cn" className="lx-input" placeholder="ex : CP1, CE2, 6ème A…" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      </div>

      <div className="lx-field">
        <label>Enseignants · {selected.length} sélectionné{selected.length !== 1 ? 's' : ''}</label>
        {teachers.length === 0 ? (
          <div className="lx-note">
            {Icon.alert} Aucun enseignant dans l&apos;école.{' '}
            <Link href="/dashboard/school-owner/teachers/new" style={{ textDecoration: 'underline' }}>Ajouter un enseignant</Link>
          </div>
        ) : (
          <div className="lx-pick">
            <div style={{ padding: 10, borderBottom: '1px solid #EEF1F6' }}>
              <div className="lx-search" style={{ maxWidth: 'none' }}>
                {Icon.search}
                <input className="lx-input" style={{ height: 38 }} placeholder="Filtrer les enseignants…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
            <div className="lx-pick-list">
              {shown.length === 0 && <div style={{ padding: 16, fontSize: 13, color: '#7A8AA0' }}>Aucun enseignant trouvé.</div>}
              {shown.map((t) => {
                const on = selected.includes(t.id);
                return (
                  <button type="button" key={t.id} className={`lx-pick-row${on ? ' on' : ''}`} onClick={() => toggle(t.id)} aria-pressed={on}>
                    <Avatar name={t.username} size="md" />
                    <span className="lx-pick-meta"><b>{t.username}</b><span>{t.email}</span></span>
                    <span className="lx-check">{Icon.check}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */
export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('name');
  const [view, setView] = useState<View>('grid');

  const [modal, setModal] = useState<ClassRow | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ClassRow | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const load = useCallback(async () => {
    const [cRes, tRes] = await Promise.all([
      fetch('/api/school-owner/classes'),
      fetch('/api/school-owner/teachers'),
    ]);
    if (cRes.ok) setClasses(await cRes.json());
    if (tRes.ok) setTeachers(await tRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ---------- derived ---------- */
  const totalClasses = classes.length;
  const totalStudents = classes.reduce((n, c) => n + c.studentCount, 0);
  const avg = totalClasses > 0 ? Math.round((totalStudents / totalClasses) * 10) / 10 : 0;
  const noTeacher = classes.filter((c) => c.teachers.length === 0).length;
  const maxStudents = Math.max(1, ...classes.map((c) => c.studentCount));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = classes.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.teachers.some((t) => t.username.toLowerCase().includes(q))
    );
    return [...list].sort((a, b) => {
      if (sort === 'students') return b.studentCount - a.studentCount || a.name.localeCompare(b.name, 'fr');
      if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name, 'fr', { numeric: true });
    });
  }, [classes, query, sort]);

  /* ---------- actions ---------- */
  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    const res = await fetch(`/api/school-owner/classes/${deleting.id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));
    setDeleteBusy(false);
    if (res.ok) {
      setToast({ title: 'Classe supprimée', message: `${deleting.name} a été supprimée.`, emoji: '🗑️', tone: 'success' });
      setDeleting(null);
      load();
    } else {
      setToast({ title: 'Suppression impossible', message: data.error || 'Une erreur est survenue.', emoji: '⚠️', tone: 'error' });
      setDeleting(null);
    }
  };

  const stats = [
    { label: 'Classes', value: totalClasses, sub: 'Actives dans votre école', icon: Icon.building, tone: 'navy' },
    { label: 'Élèves', value: totalStudents, sub: 'Répartis dans les classes', icon: Icon.student, tone: 'green' },
    { label: 'Moyenne / classe', value: avg, sub: 'Élèves par classe', icon: Icon.chart, tone: 'muted' },
    { label: 'Sans enseignant', value: noTeacher, sub: noTeacher > 0 ? 'À affecter' : 'Toutes les classes ont une équipe', icon: Icon.alert, tone: noTeacher > 0 ? 'amber' : 'green' },
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
            <h1 className="lx-h1">Classes</h1>
            <p className="lx-lead">
              Organisez vos classes, leur équipe pédagogique et suivez leurs effectifs. Elles alimentent aussi les tarifs de paiement et les listes d&apos;élèves.
            </p>
          </div>
          <div className="lx-hero-actions">
            <button type="button" className="lx-btn gold" onClick={() => setModal('new')}>
              {Icon.plus} Nouvelle classe
            </button>
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

      {/* ---------- Content card ---------- */}
      <div className="lx-card">
        <div className="lx-toolbar">
          <div className="lx-search">
            {Icon.search}
            <input
              className="lx-input"
              type="search"
              placeholder="Rechercher une classe ou un enseignant…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Rechercher une classe"
            />
          </div>

          <select className="lx-select lx-spacer" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Trier">
            <option value="name">Nom (A–Z)</option>
            <option value="students">Effectif (décroissant)</option>
            <option value="recent">Plus récentes</option>
          </select>

          <div className="lx-seg" role="group" aria-label="Affichage">
            <button type="button" className={view === 'grid' ? 'on' : ''} onClick={() => setView('grid')} aria-label="Vue cartes" title="Vue cartes">{Icon.grid}</button>
            <button type="button" className={view === 'table' ? 'on' : ''} onClick={() => setView('table')} aria-label="Vue tableau" title="Vue tableau">{Icon.list}</button>
          </div>
        </div>

        {loading ? (
          <div className="lx-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="lx-cls" style={{ gap: 14 }}>
                <div className="lx-skel" style={{ height: 24, width: '40%' }} />
                <div className="lx-skel" style={{ height: 10, width: '100%' }} />
                <div className="lx-skel" style={{ height: 38, width: '70%' }} />
                <div className="lx-skel" style={{ height: 38, width: '100%' }} />
              </div>
            ))}
          </div>
        ) : totalClasses === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-ico">{Icon.building}</div>
            <h3>Aucune classe pour le moment</h3>
            <p>Créez votre première classe pour commencer à y affecter des enseignants et des élèves.</p>
            <button type="button" className="lx-btn gold" onClick={() => setModal('new')}>{Icon.plus} Créer une classe</button>
          </div>
        ) : visible.length === 0 ? (
          <div className="lx-empty">
            <div className="lx-empty-ico">{Icon.search}</div>
            <h3>Aucun résultat</h3>
            <p>Aucune classe ne correspond à « {query} ».</p>
            <button type="button" className="lx-btn soft" onClick={() => setQuery('')}>Effacer la recherche</button>
          </div>
        ) : view === 'grid' ? (
          <div className="lx-grid">
            {visible.map((c) => {
              const tint = tintFor(c.name);
              const pct = Math.round((c.studentCount / maxStudents) * 100);
              const shownStudents = c.students.slice(0, 5);
              const extra = c.studentCount - shownStudents.length;
              return (
                <div className="lx-cls" key={c.id}>
                  <div className="lx-cls-bar" style={{ background: tint.solid }} />

                  <div className="lx-cls-head">
                    <div>
                      <h3 className="lx-cls-name">{c.name}</h3>
                      <div className="lx-cls-created">Créée le {fmt(c.createdAt)}</div>
                    </div>
                    <div className="lx-cls-count">
                      <div className="lx-cls-num">{c.studentCount}</div>
                      <div className="lx-cls-num-l">élève{c.studentCount !== 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  <div className="lx-meter" title={`${pct}% de la plus grande classe`}><i style={{ width: `${pct}%` }} /></div>

                  <div>
                    <div className="lx-sec-l">Équipe pédagogique</div>
                    {c.teachers.length === 0 ? (
                      <span className="lx-badge warn">Sans enseignant</span>
                    ) : (
                      <div className="lx-tlist">
                        {c.teachers.slice(0, 3).map((t) => (
                          <div className="lx-trow" key={t.id}>
                            <Avatar name={t.username} size="md" />
                            <span className="t">{t.username}</span>
                          </div>
                        ))}
                        {c.teachers.length > 3 && <span className="lx-more" style={{ alignSelf: 'flex-start' }}>+{c.teachers.length - 3} autre{c.teachers.length - 3 > 1 ? 's' : ''}</span>}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="lx-sec-l">Élèves</div>
                    {c.studentCount === 0 ? (
                      <span className="lx-subtle" style={{ margin: 0 }}>Aucun élève dans cette classe</span>
                    ) : (
                      <div className="lx-row">
                        <span className="lx-stack">
                          {shownStudents.map((s) => <Avatar key={s.id} name={`${s.firstName} ${s.lastName}`} size="md" />)}
                        </span>
                        {extra > 0 && <span className="lx-more">+{extra}</span>}
                      </div>
                    )}
                  </div>

                  {c.noParentCount > 0 && (
                    <div className="lx-note">{Icon.link} {c.noParentCount} élève{c.noParentCount > 1 ? 's' : ''} sans parent lié</div>
                  )}

                  <div className="lx-cls-foot">
                    <button type="button" className="lx-btn navy sm" onClick={() => setModal(c)}>{Icon.edit} Gérer</button>
                    <Link href={`/dashboard/school-owner/students?class=${c.id}`} className="lx-btn soft sm">{Icon.users} Élèves</Link>
                    <button
                      type="button"
                      className="lx-act danger"
                      style={{ flex: '0 0 36px' }}
                      onClick={() => setDeleting(c)}
                      title="Supprimer la classe"
                      aria-label={`Supprimer ${c.name}`}
                    >
                      {Icon.trash}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <table className="lx-table">
              <thead>
                <tr>
                  <th>Classe</th>
                  <th>Enseignant(s)</th>
                  <th>Effectif</th>
                  <th>Suivi</th>
                  <th>Créée le</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const tint = tintFor(c.name);
                  const pct = Math.round((c.studentCount / maxStudents) * 100);
                  return (
                    <tr key={c.id}>
                      <td>
                        <span className="lx-pill" style={{ background: tint.bg, color: tint.fg, fontSize: 14, fontWeight: 700 }}>{c.name}</span>
                      </td>
                      <td data-label="Enseignant(s)">
                        {c.teachers.length === 0 ? (
                          <span className="lx-badge warn">Sans enseignant</span>
                        ) : (
                          <div className="lx-row">
                            <span className="lx-stack">{c.teachers.slice(0, 3).map((t) => <Avatar key={t.id} name={t.username} size="sm" />)}</span>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: '#26344F' }}>
                              {c.teachers[0].username}
                              {c.teachers.length > 1 && <span className="lx-muted"> +{c.teachers.length - 1}</span>}
                            </span>
                          </div>
                        )}
                      </td>
                      <td data-label="Effectif" style={{ minWidth: 150 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <b style={{ fontFamily: 'Fraunces, serif', fontSize: 18, color: '#071B4A', minWidth: 24 }}>{c.studentCount}</b>
                          <div className="lx-meter" style={{ flex: 1, minWidth: 70 }}><i style={{ width: `${pct}%` }} /></div>
                        </div>
                      </td>
                      <td data-label="Suivi">
                        {c.noParentCount > 0 ? (
                          <span className="lx-badge bad">{c.noParentCount} sans parent</span>
                        ) : c.studentCount > 0 ? (
                          <span className="lx-badge ok">Dossiers complets</span>
                        ) : (
                          <span className="lx-badge plain">Vide</span>
                        )}
                      </td>
                      <td data-label="Créée le"><span className="lx-date">{fmt(c.createdAt)}</span></td>
                      <td className="lx-td-actions">
                        <div className="lx-actions">
                          <Link className="lx-act" href={`/dashboard/school-owner/students?class=${c.id}`} title="Voir les élèves" aria-label={`Voir les élèves de ${c.name}`}>{Icon.eye}</Link>
                          <button type="button" className="lx-act" onClick={() => setModal(c)} title="Gérer" aria-label={`Gérer ${c.name}`}>{Icon.edit}</button>
                          <button type="button" className="lx-act danger" onClick={() => setDeleting(c)} title="Supprimer" aria-label={`Supprimer ${c.name}`}>{Icon.trash}</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {!loading && visible.length > 0 && (
          <div className="lx-foot">
            <span>{visible.length} classe{visible.length !== 1 ? 's' : ''}{visible.length !== totalClasses ? ` sur ${totalClasses}` : ''}</span>
            <span>{totalStudents} élève{totalStudents !== 1 ? 's' : ''} au total</span>
          </div>
        )}
      </div>

      {/* ---------- Create / edit ---------- */}
      {modal && (
        <ClassModal
          key={modal === 'new' ? 'new' : modal.id}
          cls={modal}
          teachers={teachers}
          onClose={() => setModal(null)}
          onDone={(t) => { setToast(t); setModal(null); load(); }}
        />
      )}

      {/* ---------- Delete ---------- */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Supprimer la classe ?"
        subtitle={deleting ? `Classe ${deleting.name}` : undefined}
        width={460}
        footer={
          <>
            <button type="button" className="lx-btn soft" onClick={() => setDeleting(null)}>
              {deleting && deleting.studentCount > 0 ? 'Fermer' : 'Annuler'}
            </button>
            {deleting && deleting.studentCount === 0 && (
              <button type="button" className="lx-btn danger" onClick={confirmDelete} disabled={deleteBusy}>
                {deleteBusy ? 'Suppression…' : 'Supprimer'}
              </button>
            )}
          </>
        }
      >
        {deleting && deleting.studentCount > 0 ? (
          <div className="lx-note" style={{ alignItems: 'flex-start', lineHeight: 1.55 }}>
            {Icon.alert}
            <span>
              Impossible de supprimer : {deleting.studentCount} élève{deleting.studentCount > 1 ? 's sont' : ' est'} encore dans cette classe.
              Déplacez-{deleting.studentCount > 1 ? 'les' : 'le'} d&apos;abord vers une autre classe.
            </span>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: '#5A6A7A', lineHeight: 1.6, margin: '0 0 10px' }}>
            La classe sera supprimée définitivement ainsi que ses affectations d&apos;enseignants.
          </p>
        )}
      </Modal>
    </div>
  );
}