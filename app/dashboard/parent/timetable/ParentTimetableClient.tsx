'use client';

// File: app/dashboard/parent/timetable/ParentTimetableClient.tsx

import { useState } from 'react';
import WeeklyTimetable from '@/app/components/WeeklyTimetable';
import { TimetableEntryDTO, entryHours } from '@/lib/timetable-constants';

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
    return (
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid #E8ECF3', color: '#5A6A7A', fontSize: 14, textAlign: 'center' }}>
        Aucun enfant n&apos;est encore lié à votre compte.
      </div>
    );
  }

  return (
    <div>
      {children.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {children.map((c) => {
            const on = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveId(c.id)}
                style={{
                  border: `1px solid ${on ? '#071B4A' : '#E2E7F0'}`,
                  background: on ? '#071B4A' : '#fff',
                  color: on ? '#fff' : '#4A5A70',
                  padding: '9px 18px',
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <div style={{ background: '#fff', borderRadius: 20, padding: 22, boxShadow: '0 6px 24px rgba(7,27,74,0.06)', border: '1px solid #E8ECF3' }}>
          {!active.className ? (
            <p style={{ color: '#5A6A7A', fontSize: 14, textAlign: 'center', padding: 24 }}>
              {active.name} n&apos;est pas encore assigné(e) à une classe.
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16, fontSize: 13, color: '#6B7A90' }}>
                <span><b style={{ color: '#071B4A' }}>{active.name}</b></span>
                <span>·</span>
                <span>{active.entries.length} cours / semaine</span>
                <span>·</span>
                <span>{entryHours(active.entries)} h</span>
              </div>
              <WeeklyTimetable entries={active.entries} variant="parent" title={`Classe ${active.className}`} />
            </>
          )}
        </div>
      )}
    </div>
  );
}