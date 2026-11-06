'use client';

// File: app/dashboard/school-owner/timetable/TimetableClient.tsx

import { CSSProperties, ReactNode, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import {
  DAYS,
  HOUR_SLOTS,
  SUBJECT_SUGGESTIONS,
  TimetableEntryDTO,
  entryHours,
  subjectTint,
  todayIndex,
} from '@/lib/timetable-constants';
import { Icon, Modal } from '../luxury-ui';

interface ClassOption { id: string; name: string; }
interface TeacherOption { id: string; username: string; }
interface Link_ { classId: string; teacherId: string; }

interface Props {
  classes: ClassOption[];
  teachers: TeacherOption[];
  entries: TimetableEntryDTO[];
  links?: Link_[];
}

type Mode = 'class' | 'teacher';

interface SlotSelection {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  existing: TimetableEntryDTO | null;
}

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const CalIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
);
const ClockIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" {...S}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
);

export default function TimetableClient({ classes, teachers, entries, links = [] }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);

  const [mode, setMode] = useState<Mode>('class');
  const [selectedId, setSelectedId] = useState<string>(classes[0]?.id ?? '');
  const [slot, setSlot] = useState<SlotSelection | null>(null);

  // Modal form
  const [subject, setSubject] = useState('');
  const [otherId, setOtherId] = useState(''); // teacherId when mode=class, classId when mode=teacher
  const [room, setRoom] = useState('');
  const [repeat, setRepeat] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [today, setToday] = useState<number | null>(null);
  useEffect(() => { setToday(todayIndex()); }, []);

  /* ---------------- derived data ---------------- */
  const options = useMemo(
    () => (mode === 'class' ? classes.map((c) => ({ id: c.id, name: c.name })) : teachers.map((t) => ({ id: t.id, name: t.username }))),
    [mode, classes, teachers]
  );
  const otherOptions = mode === 'class' ? teachers.map((t) => ({ id: t.id, name: t.username })) : classes.map((c) => ({ id: c.id, name: c.name }));
  const selectedName = options.find((o) => o.id === selectedId)?.name ?? '';

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach((e) => {
      const k = mode === 'class' ? e.classId : e.teacherId;
      m.set(k, (m.get(k) ?? 0) + 1);
    });
    return m;
  }, [entries, mode]);

  const visibleEntries = useMemo(
    () => (selectedId ? entries.filter((e) => (mode === 'class' ? e.classId === selectedId : e.teacherId === selectedId)) : []),
    [entries, mode, selectedId]
  );

  const findEntry = (day: number, start: string) => visibleEntries.find((e) => e.dayOfWeek === day && e.startTime === start);

  const stats = useMemo(() => {
    const classesCovered = new Set(entries.map((e) => e.classId)).size;
    const teachersScheduled = new Set(entries.map((e) => e.teacherId)).size;
    return { classesCovered, teachersScheduled, hours: entryHours(entries) };
  }, [entries]);
  const todayCount = today === null ? 0 : entries.filter((e) => e.dayOfWeek === today).length;

  const selectionHours = entryHours(visibleEntries);
  const selectionOthers = new Set(visibleEntries.map((e) => (mode === 'class' ? e.teacherId : e.classId))).size;

  /* ---------------- conflict helpers ---------------- */
  const busy = (kind: 'class' | 'teacher', id: string, day: number, start: string, ignoreId?: string) =>
    entries.some(
      (e) => e.id !== ignoreId && e.dayOfWeek === day && e.startTime === start && (kind === 'class' ? e.classId === id : e.teacherId === id)
    );
  const selfKind: 'class' | 'teacher' = mode;
  const otherKind: 'class' | 'teacher' = mode === 'class' ? 'teacher' : 'class';

  const dayConflict = (d: number) => {
    if (!slot) return false;
    return busy(selfKind, selectedId, d, slot.startTime) || (!!otherId && busy(otherKind, otherId, d, slot.startTime));
  };

  const formClassId = mode === 'class' ? selectedId : otherId;
  const formTeacherId = mode === 'class' ? otherId : selectedId;
  const notAssigned =
    !!formClassId && !!formTeacherId && !links.some((l) => l.classId === formClassId && l.teacherId === formTeacherId);

  /* ---------------- actions ---------------- */
  const switchMode = (m: Mode) => {
    setMode(m);
    setSelectedId(m === 'class' ? classes[0]?.id ?? '' : teachers[0]?.id ?? '');
  };

  const openSlot = (day: number, start: string, end: string) => {
    const existing = findEntry(day, start) ?? null;
    setSlot({ dayOfWeek: day, startTime: start, endTime: end, existing });
    setSubject(existing?.subject ?? '');
    setOtherId(existing ? (mode === 'class' ? existing.teacherId : existing.classId) : '');
    setRoom(existing?.room ?? '');
    setRepeat([]);
    setConfirmDelete(false);
  };

  const closeModal = () => { if (!saving) setSlot(null); };

  const errorToast = (message: string, title = 'Échec') =>
    setToast({ title, message, emoji: '⚠️', tone: 'error' });

  const handleSave = async () => {
    if (!slot || !selectedId) return;
    if (!subject.trim() || !otherId) {
      errorToast(`La matière et ${mode === 'class' ? 'l’enseignant' : 'la classe'} sont requis.`, 'Champs manquants');
      return;
    }
    const base = {
      classId: formClassId,
      teacherId: formTeacherId,
      subject: subject.trim(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      room: room.trim() || null,
    };

    setSaving(true);
    try {
      if (slot.existing) {
        const res = await fetch('/api/school-owner/timetable', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...base, id: slot.existing.id, dayOfWeek: slot.dayOfWeek }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) { errorToast(data.error ?? 'Une erreur est survenue.'); return; }
        setToast({ title: 'Cours mis à jour', message: `${base.subject} — ${DAYS[slot.dayOfWeek]} ${slot.startTime}`, emoji: '🗓️', tone: 'success' });
        setSlot(null);
        router.refresh();
        return;
      }

      // Create (optionally repeated on other days)
      const days = [slot.dayOfWeek, ...repeat.filter((d) => d !== slot.dayOfWeek)];
      const done: number[] = [];
      const failed: string[] = [];
      for (const d of days) {
        const res = await fetch('/api/school-owner/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...base, dayOfWeek: d }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) done.push(d);
        else failed.push(`${DAYS[d]} : ${data.error ?? 'erreur'}`);
      }

      if (done.length > 0) router.refresh();
      if (failed.length === 0) {
        setToast({
          title: done.length > 1 ? 'Cours ajoutés' : 'Cours ajouté',
          message: done.length > 1
            ? `${base.subject} ajouté sur ${done.length} jours à ${slot.startTime}.`
            : `${base.subject} — ${DAYS[slot.dayOfWeek]} ${slot.startTime}`,
          emoji: '🗓️',
          tone: 'success',
        });
        setSlot(null);
      } else if (done.length > 0) {
        errorToast(`${done.length} ajouté(s). Non ajouté(s) → ${failed.join(' · ')}`, 'Ajout partiel');
        setSlot(null);
      } else {
        errorToast(failed[0]);
      }
    } catch {
      errorToast('Impossible de joindre le serveur.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!slot?.existing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/school-owner/timetable?id=${slot.existing.id}`, { method: 'DELETE' });
      if (res.ok) {
        setToast({ title: 'Cours supprimé', message: `${slot.existing.subject} retiré de l’emploi du temps.`, emoji: '🗑️', tone: 'success' });
        setSlot(null);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        errorToast(data.error ?? 'Une erreur est survenue.');
      }
    } catch {
      errorToast('Impossible de joindre le serveur.');
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- render ---------------- */
  const noOptions = options.length === 0;

  const stat = (label: string, value: string | number, sub: string, icon: ReactNode, tone: string) => (
    <div className="lx-stat" key={label}>
      <div className="lx-stat-top">
        <span className="lx-stat-lbl">{label}</span>
        <span className={`lx-ico ${tone}`}>{icon}</span>
      </div>
      <div className="lx-stat-val">{value}</div>
      <div className="lx-stat-sub">{sub}</div>
    </div>
  );

  return (
    <div className="lx-wrap">
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap"
        rel="stylesheet"
      />
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .tt-chips { display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 8px; scrollbar-width: thin; scrollbar-color: #C9D2E3 transparent; }
        .tt-chips .lx-chip { flex-shrink: 0; }
        .tt-chip-n.zero { background: #F0F2F6; color: #98A4B6; }
        .tt-sum { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-size: 13px; color: #6B7A90; padding: 0 20px 14px; }
        .tt-sum b { color: #071B4A; }
        .tt-wrapgrid { overflow-x: auto; padding: 4px 14px 18px; }
        .tt-table { width: 100%; min-width: 880px; border-collapse: separate; border-spacing: 6px; table-layout: fixed; }
        .tt-th { padding: 10px 4px 12px; text-align: center; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #7A8AA0; position: relative; }
        .tt-th.today { color: #071B4A; }
        .tt-th.today::after { content: ''; position: absolute; left: 22%; right: 22%; bottom: 3px; height: 3px; border-radius: 3px; background: #FFB400; }
        .tt-th small { display: block; font-size: 10px; font-weight: 600; letter-spacing: .04em; color: #B27300; text-transform: none; margin-top: 2px; }
        .tt-time { width: 78px; text-align: right; padding-right: 8px; vertical-align: top; position: sticky; left: 0; background: #fff; z-index: 2; }
        .tt-time b { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: #071B4A; padding-top: 14px; }
        .tt-time span { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #98A4B6; }
        .tt-td.today-col { background: linear-gradient(180deg, rgba(255,180,0,.07), rgba(255,180,0,0) 70%); border-radius: 12px; }
        .tt-add { width: 100%; min-height: 66px; border-radius: 12px; border: 1.5px dashed #E0E6F0; background: transparent; color: #C5CEDF; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all .15s; }
        .tt-add:hover { border-color: #FFB400; background: #FFF9E8; color: #B27300; transform: scale(1.015); }
        .tt-cell { position: relative; width: 100%; min-height: 66px; border: none; border-left: 4px solid var(--accent); border-radius: 12px; padding: 9px 11px; text-align: left; cursor: pointer; font-family: inherit; display: flex; flex-direction: column; gap: 2px; transition: transform .15s, box-shadow .15s; }
        .tt-cell:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(7,27,74,.13); }
        .tt-cell-s { font-size: 13px; font-weight: 700; line-height: 1.2; }
        .tt-cell-o { font-size: 12px; color: #4A5A70; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tt-room { align-self: flex-start; margin-top: 3px; font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,.75); color: #4A5A70; padding: 1px 8px; border-radius: 999px; }
        .tt-edit { position: absolute; top: 7px; right: 8px; opacity: 0; color: #4A5A70; transition: opacity .15s; }
        .tt-cell:hover .tt-edit { opacity: .8; }
        .tt-break td { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #A6B1C4; background: repeating-linear-gradient(135deg, #F7F9FC 0 8px, #FFFFFF 8px 16px); border-radius: 10px; padding: 7px 0; }
        .tt-note { display: flex; gap: 10px; align-items: flex-start; font-size: 12.5px; line-height: 1.5; font-weight: 500; color: #8A5A00; background: #FFF8E4; border-radius: 12px; padding: 10px 14px; margin-bottom: 16px; }
        .tt-note a { color: inherit; font-weight: 700; text-decoration: underline; }
        .tt-days { display: flex; flex-wrap: wrap; gap: 6px; }
        .tt-day { border: 1px solid #E2E7F0; background: #fff; color: #4A5A70; font-family: inherit; font-size: 12.5px; font-weight: 600; padding: 7px 12px; border-radius: 999px; cursor: pointer; transition: all .15s; }
        .tt-day:hover:not(:disabled) { border-color: #C9D2E3; background: #F5F8FD; }
        .tt-day.on { background: #071B4A; border-color: #071B4A; color: #fff; }
        .tt-day:disabled { opacity: .4; cursor: not-allowed; text-decoration: line-through; }
        .tt-help { font-size: 12px; color: #7A8AA0; margin-top: 7px; }
        @media (max-width: 720px) { .tt-sum { padding: 0 14px 12px; } .tt-wrapgrid { padding: 4px 6px 14px; } }
      `}</style>

      <Link href="/dashboard/school-owner" className="lx-back">{Icon.back} Tableau de bord</Link>

      {/* ---------- Hero ---------- */}
      <div className="lx-hero">
        <div className="lx-hero-in">
          <div>
            <div className="lx-eyebrow">Gestion de l&apos;école</div>
            <h1 className="lx-h1">Emploi du temps</h1>
            <p className="lx-lead">
              Chaque cours relie une classe et un enseignant : il apparaît automatiquement dans l&apos;emploi du temps de l&apos;enseignant et sur le tableau de bord des parents de la classe.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- Stats ---------- */}
      <div className="lx-stats">
        {stat('Cours planifiés', entries.length, `${stats.hours} h par semaine`, CalIcon, 'navy')}
        {stat('Classes couvertes', `${stats.classesCovered}/${classes.length}`, stats.classesCovered < classes.length ? 'Certaines classes sont vides' : 'Toutes ont un horaire', Icon.building, stats.classesCovered < classes.length && classes.length > 0 ? 'amber' : 'green')}
        {stat('Enseignants planifiés', `${stats.teachersScheduled}/${teachers.length}`, 'Ont au moins un cours', Icon.users, 'green')}
        {stat('Aujourd’hui', todayCount, today === null ? 'Pas de cours le dimanche' : 'Cours, toutes classes', ClockIcon, 'muted')}
      </div>

      {/* ---------- Editor card ---------- */}
      <div className="lx-card">
        <div className="lx-toolbar">
          <div className="lx-seg" role="group" aria-label="Mode">
            <button type="button" className={mode === 'class' ? 'on' : ''} style={{ width: 'auto', padding: '0 16px', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }} onClick={() => switchMode('class')}>
              Par classe
            </button>
            <button type="button" className={mode === 'teacher' ? 'on' : ''} style={{ width: 'auto', padding: '0 16px', fontWeight: 700, fontSize: 13, fontFamily: 'inherit' }} onClick={() => switchMode('teacher')}>
              Par enseignant
            </button>
          </div>
          <span style={{ fontSize: 13, color: '#7A8AA0' }}>
            {mode === 'class' ? 'Visible par les parents et les enseignants concernés.' : 'Visible dans l’espace de l’enseignant.'}
          </span>
        </div>

        {noOptions ? (
          <div className="lx-empty">
            <div className="lx-empty-ico">{mode === 'class' ? Icon.building : Icon.users}</div>
            <h3>{mode === 'class' ? 'Aucune classe' : 'Aucun enseignant'}</h3>
            <p>{mode === 'class' ? 'Créez d’abord une classe pour construire son emploi du temps.' : 'Ajoutez d’abord un enseignant à votre école.'}</p>
            <Link href={mode === 'class' ? '/dashboard/school-owner/classes' : '/dashboard/school-owner/teachers/new'} className="lx-btn navy">
              {mode === 'class' ? 'Aller aux classes' : 'Ajouter un enseignant'}
            </Link>
          </div>
        ) : (
          <>
            <div style={{ padding: '14px 18px 4px' }}>
              <div className="tt-chips" role="tablist" aria-label={mode === 'class' ? 'Classes' : 'Enseignants'}>
                {options.map((o) => {
                  const n = counts.get(o.id) ?? 0;
                  return (
                    <button key={o.id} type="button" role="tab" aria-selected={selectedId === o.id} className={`lx-chip${selectedId === o.id ? ' on' : ''}`} onClick={() => setSelectedId(o.id)}>
                      {o.name}
                      <span className={`lx-chip-n tt-chip-n${n === 0 ? ' zero' : ''}`}>{n}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="tt-sum">
              <b>{selectedName}</b>
              <span>·</span>
              <span>{visibleEntries.length} cours</span>
              <span>·</span>
              <span>{selectionHours} h / semaine</span>
              {visibleEntries.length > 0 && (<><span>·</span><span>{selectionOthers} {mode === 'class' ? `enseignant${selectionOthers > 1 ? 's' : ''}` : `classe${selectionOthers > 1 ? 's' : ''}`}</span></>)}
            </div>

            <div className="tt-wrapgrid">
              <table className="tt-table">
                <thead>
                  <tr>
                    <th style={{ width: 78 }} />
                    {DAYS.map((d, i) => (
                      <th key={d} className={`tt-th${today === i ? ' today' : ''}`}>
                        {d}
                        {today === i && <small>Aujourd&apos;hui</small>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {HOUR_SLOTS.map((hs, idx) => {
                    const next = HOUR_SLOTS[idx + 1];
                    return (
                      <FragmentRows key={hs.start}>
                        <tr>
                          <td className="tt-time"><b>{hs.start}</b><span>{hs.end}</span></td>
                          {DAYS.map((_, di) => {
                            const entry = findEntry(di, hs.start);
                            const t = entry ? subjectTint(entry.subject) : null;
                            return (
                              <td key={di} className={`tt-td${today === di ? ' today-col' : ''}`}>
                                {entry && t ? (
                                  <button
                                    type="button"
                                    className="tt-cell"
                                    style={{ background: t.bg, color: t.fg, ['--accent' as string]: t.accent } as CSSProperties}
                                    onClick={() => openSlot(di, hs.start, hs.end)}
                                    aria-label={`Modifier ${entry.subject}, ${DAYS[di]} ${hs.start}`}
                                  >
                                    <span className="tt-edit">{Icon.edit}</span>
                                    <span className="tt-cell-s">{entry.subject}</span>
                                    <span className="tt-cell-o">{mode === 'class' ? entry.teacherName : entry.className}</span>
                                    {entry.room && <span className="tt-room">Salle {entry.room}</span>}
                                  </button>
                                ) : (
                                  <button type="button" className="tt-add" onClick={() => openSlot(di, hs.start, hs.end)} aria-label={`Ajouter un cours, ${DAYS[di]} ${hs.start}`}>
                                    {Icon.plus}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                        {next && next.start !== hs.end && (
                          <tr className="tt-break"><td colSpan={DAYS.length + 1}>Pause · {hs.end} – {next.start}</td></tr>
                        )}
                      </FragmentRows>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ---------- Add / edit modal ---------- */}
      <Modal
        open={!!slot}
        onClose={closeModal}
        title={slot ? `${DAYS[slot.dayOfWeek]} · ${slot.startTime} – ${slot.endTime}` : ''}
        subtitle={`${mode === 'class' ? 'Classe' : 'Enseignant'} ${selectedName}`}
        width={540}
        footer={
          slot && (
            <>
              {slot.existing && (
                confirmDelete ? (
                  <button type="button" className="lx-btn danger" style={{ marginRight: 'auto' }} onClick={handleDelete} disabled={saving}>
                    Confirmer la suppression
                  </button>
                ) : (
                  <button type="button" className="lx-btn soft" style={{ marginRight: 'auto', color: '#C53030' }} onClick={() => setConfirmDelete(true)} disabled={saving}>
                    {Icon.trash} Supprimer
                  </button>
                )
              )}
              <button type="button" className="lx-btn soft" onClick={closeModal} disabled={saving}>Annuler</button>
              <button type="button" className="lx-btn gold" onClick={handleSave} disabled={saving}>
                {saving ? 'Enregistrement…' : slot.existing ? 'Enregistrer' : repeat.length > 0 ? `Ajouter sur ${repeat.length + 1} jours` : 'Ajouter le cours'}
              </button>
            </>
          )
        }
      >
        {slot && (
          <>
            <div className="lx-field">
              <label htmlFor="tt-subject">Matière</label>
              <input id="tt-subject" className="lx-input" list="tt-subjects" placeholder="ex. Mathématiques" value={subject} onChange={(e) => setSubject(e.target.value)} autoFocus maxLength={80} />
              <datalist id="tt-subjects">
                {SUBJECT_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>

            <div className="lx-field">
              <label htmlFor="tt-other">{mode === 'class' ? 'Enseignant' : 'Classe'}</label>
              <select id="tt-other" className="lx-select" style={{ width: '100%' }} value={otherId} onChange={(e) => setOtherId(e.target.value)}>
                <option value="">{mode === 'class' ? 'Choisir un enseignant…' : 'Choisir une classe…'}</option>
                {otherOptions.map((o) => {
                  const isBusy = busy(otherKind, o.id, slot.dayOfWeek, slot.startTime, slot.existing?.id);
                  return (
                    <option key={o.id} value={o.id} disabled={isBusy}>
                      {o.name}{isBusy ? (mode === 'class' ? ' — occupé à ce créneau' : ' — a déjà un cours') : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {notAssigned && (
              <div className="tt-note">
                <span>{Icon.alert}</span>
                <span>
                  Cet enseignant n&apos;est pas encore affecté à cette classe. Le cours apparaîtra dans son emploi du temps, mais il ne pourra pas faire l&apos;appel ni publier de devoirs pour cette classe tant qu&apos;il n&apos;est pas ajouté dans{' '}
                  <Link href="/dashboard/school-owner/classes">Classes → Gérer</Link>.
                </span>
              </div>
            )}

            <div className="lx-field">
              <label htmlFor="tt-room">Salle (optionnel)</label>
              <input id="tt-room" className="lx-input" placeholder="ex. 12, Labo, Salle info" value={room} onChange={(e) => setRoom(e.target.value)} maxLength={40} />
            </div>

            {!slot.existing && (
              <div className="lx-field" style={{ marginBottom: 6 }}>
                <label>Répéter sur d&apos;autres jours à {slot.startTime}</label>
                <div className="tt-days">
                  {DAYS.map((d, i) => {
                    if (i === slot.dayOfWeek) return null;
                    const conflict = dayConflict(i);
                    const on = repeat.includes(i);
                    return (
                      <button
                        key={d}
                        type="button"
                        className={`tt-day${on ? ' on' : ''}`}
                        disabled={conflict}
                        title={conflict ? 'Créneau déjà occupé' : undefined}
                        aria-pressed={on}
                        onClick={() => setRepeat((r) => (r.includes(i) ? r.filter((x) => x !== i) : [...r, i]))}
                      >
                        {d.slice(0, 3)}.
                      </button>
                    );
                  })}
                </div>
                <div className="tt-help">Gagnez du temps pour une matière qui revient plusieurs fois dans la semaine.</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

/** Lets a map callback return two <tr> rows without adding an extra DOM node. */
function FragmentRows({ children }: { children: ReactNode }) {
  return <>{children}</>;
}