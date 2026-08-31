'use client';

// File: app/dashboard/school-owner/timetable/TimetableClient.tsx

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import ActionToast, { ToastData } from '@/app/components/ActionToast';
import { DAYS, HOUR_SLOTS, TimetableEntryDTO } from '@/app/lib/timetable-constants';

interface ClassOption { id: string; name: string; }
interface TeacherOption { id: string; username: string; }

interface Props {
  classes: ClassOption[];
  teachers: TeacherOption[];
  entries: TimetableEntryDTO[];
}

type Mode = 'class' | 'teacher';

interface SlotSelection {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  existing: TimetableEntryDTO | null;
}

const SUBJECT_PALETTE = ['#FFF3D6', '#EAF3DE', '#E7ECFB', '#FAECE7', '#E5F6F3', '#F3E8FB'];
function colorFor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
}

export default function TimetableClient({ classes, teachers, entries }: Props) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastData | null>(null);

  const [mode, setMode] = useState<Mode>('class');
  const [selectedId, setSelectedId] = useState<string>(classes[0]?.id ?? '');
  const [slot, setSlot] = useState<SlotSelection | null>(null);

  // Form fields inside the modal
  const [subject, setSubject] = useState('');
  const [otherPartyId, setOtherPartyId] = useState(''); // teacherId if mode=class, classId if mode=teacher
  const [room, setRoom] = useState('');
  const [saving, setSaving] = useState(false);

  const options = mode === 'class' ? classes : teachers.map((t) => ({ id: t.id, name: t.username }));

  const visibleEntries = useMemo(() => {
    if (!selectedId) return [];
    return entries.filter((e) => (mode === 'class' ? e.classId === selectedId : e.teacherId === selectedId));
  }, [entries, mode, selectedId]);

  const findEntry = (dayOfWeek: number, startTime: string) =>
    visibleEntries.find((e) => e.dayOfWeek === dayOfWeek && e.startTime === startTime);

  const openSlot = (dayOfWeek: number, startTime: string, endTime: string) => {
    const existing = findEntry(dayOfWeek, startTime) ?? null;
    setSlot({ dayOfWeek, startTime, endTime, existing });
    setSubject(existing?.subject ?? '');
    setOtherPartyId(existing ? (mode === 'class' ? existing.teacherId : existing.classId) : '');
    setRoom(existing?.room ?? '');
  };

  const closeModal = () => setSlot(null);

  const handleSave = async () => {
    if (!slot || !selectedId || !subject || !otherPartyId) {
      setToast({ title: 'Champs manquants', message: 'Matière et ' + (mode === 'class' ? 'enseignant' : 'classe') + ' sont requis.', emoji: '⚠️', tone: 'error' });
      return;
    }
    const classId = mode === 'class' ? selectedId : otherPartyId;
    const teacherId = mode === 'class' ? otherPartyId : selectedId;

    setSaving(true);
    const res = await fetch('/api/school-owner/timetable', {
      method: slot.existing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: slot.existing?.id,
        classId,
        teacherId,
        subject,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        room: room || null,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setToast({ title: slot.existing ? 'Créneau mis à jour' : 'Créneau ajouté', message: `${subject} — ${DAYS[slot.dayOfWeek]} ${slot.startTime}`, emoji: '🗓️', tone: 'success' });
      closeModal();
      router.refresh();
    } else {
      setToast({ title: 'Échec', message: data.error ?? 'Une erreur est survenue.', emoji: '⚠️', tone: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!slot?.existing) return;
    setSaving(true);
    const res = await fetch(`/api/school-owner/timetable?id=${slot.existing.id}`, { method: 'DELETE' });
    setSaving(false);
    if (res.ok) {
      setToast({ title: 'Créneau supprimé', message: `${slot.existing.subject} retiré de l'emploi du temps.`, emoji: '🗑️', tone: 'success' });
      closeModal();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setToast({ title: 'Échec', message: data.error ?? 'Une erreur est survenue.', emoji: '⚠️', tone: 'error' });
    }
  };

  return (
    <div>
      <ActionToast toast={toast} onClose={() => setToast(null)} />

      <style>{`
        .tt-mode-btn { border: 1px solid #DCE1E8; background: #fff; color: #5A6A7A; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .tt-mode-btn.active { background: #071B4A; color: #fff; border-color: #071B4A; }
        .tt-select { padding: 9px 14px; border-radius: 10px; border: 1px solid #DCE1E8; font-size: 13.5px; font-family: 'Inter', sans-serif; min-width: 220px; }
        .tt-cell-btn { width: 100%; min-height: 56px; border-radius: 10px; border: 1.5px dashed #DCE1E8; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #B8C1CC; font-size: 18px; transition: border-color .15s ease, background .15s ease; }
        .tt-cell-btn:hover { border-color: #FFB400; background: #FFFAEE; }
        .tt-cell-filled { width: 100%; min-height: 56px; border-radius: 10px; padding: 8px 10px; cursor: pointer; text-align: left; border: none; }
        .tt-modal-overlay { position: fixed; inset: 0; background: rgba(7,27,74,0.45); z-index: 1300; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .tt-modal { background: #fff; border-radius: 16px; padding: 24px; max-width: 420px; width: 100%; }
        .tt-input { padding: 9px 12px; border-radius: 8px; border: 1px solid #DCE1E8; font-size: 13px; outline: none; width: 100%; font-family: 'Inter', sans-serif; }
        .tt-btn { background: #FFB400; color: #071B4A; border: none; border-radius: 20px; padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; }
        .tt-btn-secondary { background: none; border: 1px solid #DCE1E8; color: #5A6A7A; border-radius: 20px; padding: 9px 18px; font-size: 13px; font-weight: 600; cursor: pointer; }
        .tt-btn-danger { background: #FAECE7; color: #C0392B; border: none; border-radius: 20px; padding: 9px 18px; font-size: 13px; font-weight: 700; cursor: pointer; }
        @media (max-width: 700px) {
          .tt-table-wrap { overflow-x: auto; }
        }
      `}</style>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`tt-mode-btn ${mode === 'class' ? 'active' : ''}`} onClick={() => { setMode('class'); setSelectedId(classes[0]?.id ?? ''); }}>
          Par classe
        </button>
        <button className={`tt-mode-btn ${mode === 'teacher' ? 'active' : ''}`} onClick={() => { setMode('teacher'); setSelectedId(teachers[0]?.id ?? ''); }}>
          Par enseignant
        </button>

        <select className="tt-select" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {options.length === 0 && <option value="">Aucune option disponible</option>}
          {options.map((o) => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <p style={{ color: '#5A6A7A', fontSize: 14 }}>
          {mode === 'class' ? "Ajoutez d'abord une classe pour construire son emploi du temps." : "Ajoutez d'abord un enseignant."}
        </p>
      ) : (
        <div className="tt-table-wrap">
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 8, minWidth: 720 }}>
            <thead>
              <tr>
                <th style={{ width: 74 }} />
                {DAYS.map((d) => (
                  <th key={d} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: '#5A6A7A', textTransform: 'uppercase', letterSpacing: 0.5, padding: '4px 0' }}>
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOUR_SLOTS.map((hs) => (
                <tr key={hs.start}>
                  <td style={{ fontSize: 11, color: '#5A6A7A', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: 14 }}>
                    {hs.start}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const entry = findEntry(dayIndex, hs.start);
                    return (
                      <td key={dayIndex} style={{ minWidth: 120 }}>
                        {entry ? (
                          <button className="tt-cell-filled" style={{ background: colorFor(entry.subject) }} onClick={() => openSlot(dayIndex, hs.start, hs.end)}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#071B4A' }}>{entry.subject}</div>
                            <div style={{ fontSize: 11, color: '#5A6A7A', marginTop: 2 }}>
                              {mode === 'class' ? entry.teacherName : entry.className}
                            </div>
                            {entry.room && <div style={{ fontSize: 10.5, color: '#5A6A7A' }}>Salle {entry.room}</div>}
                          </button>
                        ) : (
                          <button className="tt-cell-btn" onClick={() => openSlot(dayIndex, hs.start, hs.end)} aria-label="Ajouter un cours">
                            +
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slot && (
        <div className="tt-modal-overlay" onClick={closeModal}>
          <div className="tt-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 17, fontWeight: 700, color: '#071B4A', margin: '0 0 4px' }}>
              {DAYS[slot.dayOfWeek]} · {slot.startTime}–{slot.endTime}
            </h3>
            <p style={{ fontSize: 12.5, color: '#5A6A7A', margin: '0 0 16px' }}>
              {mode === 'class' ? options.find((o) => o.id === selectedId)?.name : options.find((o) => o.id === selectedId)?.name}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input className="tt-input" placeholder="Matière (ex. Mathématiques)" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <select className="tt-input" value={otherPartyId} onChange={(e) => setOtherPartyId(e.target.value)}>
                <option value="">{mode === 'class' ? 'Choisir un enseignant' : 'Choisir une classe'}</option>
                {(mode === 'class' ? teachers.map((t) => ({ id: t.id, name: t.username })) : classes).map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
              <input className="tt-input" placeholder="Salle (optionnel)" value={room} onChange={(e) => setRoom(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 10 }}>
              <div>
                {slot.existing && (
                  <button className="tt-btn-danger" onClick={handleDelete} disabled={saving}>
                    Supprimer
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="tt-btn-secondary" onClick={closeModal} disabled={saving}>Annuler</button>
                <button className="tt-btn" onClick={handleSave} disabled={saving}>{saving ? '...' : 'Enregistrer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}