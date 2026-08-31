'use client';

// File: app/dashboard/parent/timetable/ParentTimetableClient.tsx

import { useState } from 'react';
import WeeklyTimetable from '@/app/components/WeeklyTimetable';
import { TimetableEntryDTO } from '@/lib/timetable-constants';

interface ChildTimetable {
  id: string;
  name: string;
  className: string | null;
  entries: TimetableEntryDTO[];
}

export default function ParentTimetableClient({ children }: { children: ChildTimetable[] }) {
  const [activeId, setActiveId] = useState(children[0]?.id ?? '');
  const active = children.find((c) => c.id === activeId) ?? children[0] ?? null;

  if (children.length === 0) {
    return <p style={{ color: '#5A6A7A', fontSize: 14 }}>Aucun enfant n'est encore lié à votre compte.</p>;
  }

  return (
    <div>
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                border: '1px solid #DCE1E8',
                background: c.id === activeId ? '#071B4A' : '#fff',
                color: c.id === activeId ? '#fff' : '#5A6A7A',
                borderColor: c.id === activeId ? '#071B4A' : '#DCE1E8',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 18px rgba(7,27,74,0.06)', border: '1px solid #EEF1F6' }}>
          {!active.className ? (
            <p style={{ color: '#5A6A7A', fontSize: 14 }}>Cet enfant n'est pas encore assigné à une classe.</p>
          ) : (
            <WeeklyTimetable entries={active.entries} variant="parent" title={active.className} />
          )}
        </div>
      )}
    </div>
  );
}