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