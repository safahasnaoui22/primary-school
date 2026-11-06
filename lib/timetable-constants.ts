// File: lib/timetable-constants.ts
//
// Shared between the school-owner editor and the read-only views (teacher,
// parent) so the grid shape can never drift between them.
// Lives at project-root lib/, next to lib/prisma.ts — imported everywhere
// as `@/lib/timetable-constants`.

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'] as const;

// One entry per hour slot. Edit this array to change school hours —
// everything else (grid rows, validation) derives from it.
export const HOUR_SLOTS: { start: string; end: string }[] = [
  { start: '08:00', end: '09:00' },
  { start: '09:00', end: '10:00' },
  { start: '10:00', end: '11:00' },
  { start: '11:00', end: '12:00' },
  { start: '13:00', end: '14:00' },
  { start: '14:00', end: '15:00' },
  { start: '15:00', end: '16:00' },
  { start: '16:00', end: '17:00' },
];

export interface TimetableEntryDTO {
  id: string;
  classId: string;
  className: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string | null;
}

/* ------------------------------------------------------------------ */
/* Shared helpers (used by the editor and the read-only views)         */
/* ------------------------------------------------------------------ */

export interface SubjectTint { bg: string; accent: string; fg: string; }

const SUBJECT_TINTS: SubjectTint[] = [
  { bg: '#FFF4D6', accent: '#F5A300', fg: '#7A5200' },
  { bg: '#E5F5EC', accent: '#2FA06C', fg: '#1B6B47' },
  { bg: '#E7ECFB', accent: '#3B63D0', fg: '#1E3A8A' },
  { bg: '#FDECEF', accent: '#E5548A', fg: '#9B2150' },
  { bg: '#E3F5F8', accent: '#2BA8D0', fg: '#0B6A8A' },
  { bg: '#F1E8FC', accent: '#9B5DE5', fg: '#5B2A99' },
];

/** Same subject → same colour everywhere (editor, teacher, parent). */
export function subjectTint(subject: string): SubjectTint {
  let h = 0;
  const key = subject.trim().toLowerCase();
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return SUBJECT_TINTS[h % SUBJECT_TINTS.length];
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function entryHours(entries: { startTime: string; endTime: string }[]): number {
  const minutes = entries.reduce((n, e) => n + Math.max(0, toMinutes(e.endTime) - toMinutes(e.startTime)), 0);
  return Math.round((minutes / 60) * 10) / 10;
}

/** JS getDay() is Sunday-first; the timetable is Monday-first (0 = Lundi). Returns null on Sunday. */
export function todayIndex(d: Date = new Date()): number | null {
  const i = (d.getDay() + 6) % 7;
  return i < DAYS.length ? i : null;
}

export const SUBJECT_SUGGESTIONS = [
  'Mathématiques', 'Français', 'Arabe', 'Anglais', 'Éveil scientifique', 'Histoire-Géographie',
  'Éducation islamique', 'Éducation civique', 'Éducation physique', 'Arts plastiques',
  'Musique', 'Informatique',
];