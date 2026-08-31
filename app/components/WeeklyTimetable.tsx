'use client';

// File: app/components/WeeklyTimetable.tsx
//
// Read-only weekly grid. Used by:
//   - app/dashboard/teacher/timetable/page.tsx  (variant="teacher")
//   - app/dashboard/parent/timetable/page.tsx   (variant="parent")
//
// "variant" only controls which extra label shows on each session card —
// the class name (so a teacher knows which group they're seeing) or the
// teacher name (so a parent knows who's teaching their child).

import { DAYS, HOUR_SLOTS, TimetableEntryDTO } from '../lib/timetable-constants';

type Variant = 'teacher' | 'parent';

interface Props {
  entries: TimetableEntryDTO[];
  variant: Variant;
  /** Optional heading shown above the grid, e.g. a child's name for the parent view. */
  title?: string;
}

const SUBJECT_PALETTE = ['#FFF3D6', '#EAF3DE', '#E7ECFB', '#FAECE7', '#E5F6F3', '#F3E8FB'];

function colorFor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = (hash * 31 + subject.charCodeAt(i)) >>> 0;
  return SUBJECT_PALETTE[hash % SUBJECT_PALETTE.length];
}

export default function WeeklyTimetable({ entries, variant, title }: Props) {
  const findEntry = (dayIndex: number, startTime: string) =>
    entries.find((e) => e.dayOfWeek === dayIndex && e.startTime === startTime);

  const hasAnyEntries = entries.length > 0;

  return (
    <div>
      {title && (
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 700, color: '#071B4A', margin: '0 0 12px' }}>
          {title}
        </h3>
      )}

      {!hasAnyEntries ? (
        <p style={{ fontSize: 14, color: '#5A6A7A' }}>Aucun emploi du temps publié pour le moment.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 6, minWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: 74 }} />
                {DAYS.map((d) => (
                  <th
                    key={d}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#5A6A7A',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      padding: '4px 0',
                    }}
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOUR_SLOTS.map((slot) => (
                <tr key={slot.start}>
                  <td style={{ fontSize: 11, color: '#5A6A7A', fontFamily: "'IBM Plex Mono', monospace", whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: 10 }}>
                    {slot.start}
                  </td>
                  {DAYS.map((_, dayIndex) => {
                    const entry = findEntry(dayIndex, slot.start);
                    return (
                      <td key={dayIndex} style={{ minWidth: 110 }}>
                        {entry ? (
                          <div
                            style={{
                              background: colorFor(entry.subject),
                              borderRadius: 10,
                              padding: '8px 10px',
                              minHeight: 52,
                            }}
                          >
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: '#071B4A' }}>{entry.subject}</div>
                            <div style={{ fontSize: 11, color: '#5A6A7A', marginTop: 2 }}>
                              {variant === 'teacher' ? entry.className : entry.teacherName}
                            </div>
                            {entry.room && <div style={{ fontSize: 10.5, color: '#5A6A7A' }}>Salle {entry.room}</div>}
                          </div>
                        ) : (
                          <div style={{ minHeight: 52 }} />
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
    </div>
  );
}