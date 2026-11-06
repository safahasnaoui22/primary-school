'use client';

// File: app/components/WeeklyTimetable.tsx
// Read-only weekly timetable shared by the teacher and the parent views.

import { CSSProperties, useEffect, useState } from 'react';
import { DAYS, HOUR_SLOTS, TimetableEntryDTO, subjectTint, todayIndex } from '@/lib/timetable-constants';

type Variant = 'teacher' | 'parent';

interface Props {
  entries: TimetableEntryDTO[];
  variant: Variant;
  /** Optional heading shown above the grid, e.g. a class name for the parent view. */
  title?: string;
}

export default function WeeklyTimetable({ entries, variant, title }: Props) {
  const [today, setToday] = useState<number | null>(null);
  const [tab, setTab] = useState(0);

  // Computed after mount so server and client markup always match
  useEffect(() => {
    const t = todayIndex();
    setToday(t);
    if (t !== null) setTab(t);
  }, []);

  const findEntry = (day: number, start: string) => entries.find((e) => e.dayOfWeek === day && e.startTime === start);
  const secondary = (e: TimetableEntryDTO) => (variant === 'teacher' ? e.className : e.teacherName);

  const css = `
    .wt-title { font-family: Fraunces, serif; font-weight: 700; font-size: 20px; color: #071B4A; margin: 0 0 14px; display: flex; align-items: center; gap: 10px; }
    .wt-title::before { content: ''; width: 4px; height: 20px; border-radius: 4px; background: #FFB400; }
    .wt-desktop { overflow-x: auto; }
    .wt-table { width: 100%; min-width: 760px; border-collapse: separate; border-spacing: 6px; table-layout: fixed; font-family: Inter, sans-serif; }
    .wt-th { padding: 8px 4px 12px; text-align: center; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #7A8AA0; position: relative; }
    .wt-th.today { color: #071B4A; }
    .wt-th.today::after { content: ''; position: absolute; left: 22%; right: 22%; bottom: 3px; height: 3px; border-radius: 3px; background: #FFB400; }
    .wt-th small { display: block; font-size: 10px; font-weight: 600; letter-spacing: .04em; color: #B27300; text-transform: none; margin-top: 2px; }
    .wt-time { width: 74px; text-align: right; padding-right: 8px; vertical-align: top; }
    .wt-time b { display: block; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: #071B4A; padding-top: 12px; }
    .wt-time span { font-family: 'IBM Plex Mono', monospace; font-size: 10.5px; color: #98A4B6; }
    .wt-col-today { background: linear-gradient(180deg, rgba(255,180,0,.07), rgba(255,180,0,0) 70%); border-radius: 12px; }
    .wt-empty { min-height: 62px; border-radius: 12px; border: 1.5px dashed #EDF0F6; }
    .wt-cell { min-height: 62px; border-left: 4px solid var(--accent); border-radius: 12px; padding: 9px 11px; display: flex; flex-direction: column; gap: 2px; }
    .wt-cell-s { font-size: 13px; font-weight: 700; line-height: 1.2; }
    .wt-cell-o { font-size: 12px; color: #4A5A70; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .wt-room { align-self: flex-start; margin-top: 3px; font-size: 10.5px; font-weight: 700; background: rgba(255,255,255,.75); color: #4A5A70; padding: 1px 8px; border-radius: 999px; }
    .wt-break td { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: #A6B1C4; background: repeating-linear-gradient(135deg, #F7F9FC 0 8px, #FFFFFF 8px 16px); border-radius: 10px; padding: 7px 0; }

    .wt-mobile { display: none; font-family: Inter, sans-serif; }
    .wt-tabs { display: flex; gap: 6px; margin-bottom: 14px; }
    .wt-tab { flex: 1; border: 1px solid #E2E7F0; background: #fff; color: #4A5A70; font-family: inherit; font-size: 12.5px; font-weight: 700; padding: 9px 0; border-radius: 12px; cursor: pointer; position: relative; }
    .wt-tab.on { background: #071B4A; border-color: #071B4A; color: #fff; }
    .wt-tab.today:not(.on)::after { content: ''; position: absolute; left: 50%; bottom: 4px; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #FFB400; }
    .wt-item { display: flex; gap: 12px; align-items: stretch; margin-bottom: 10px; }
    .wt-item-t { width: 54px; flex-shrink: 0; text-align: right; font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; color: #071B4A; font-weight: 500; padding-top: 12px; }
    .wt-item-t span { display: block; font-size: 10.5px; color: #98A4B6; }
    .wt-item .wt-cell { flex: 1; }
    .wt-none { text-align: center; padding: 28px 10px; color: #7A8AA0; font-size: 13.5px; }

    .wt-blank { text-align: center; padding: 44px 20px; font-family: Inter, sans-serif; }
    .wt-blank-i { width: 64px; height: 64px; border-radius: 20px; background: #EAF0FC; color: #071B4A; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px; }
    .wt-blank h3 { font-family: Fraunces, serif; color: #071B4A; font-size: 20px; margin: 0 0 6px; }
    .wt-blank p { color: #6B7A90; font-size: 14px; margin: 0 auto; max-width: 420px; line-height: 1.55; }

    @media (max-width: 760px) { .wt-desktop { display: none; } .wt-mobile { display: block; } }
  `;

  if (entries.length === 0) {
    return (
      <div className="wt-blank">
        <style>{css}</style>
        {title && <h2 className="wt-title" style={{ justifyContent: 'center' }}>{title}</h2>}
        <div className="wt-blank-i">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>
        </div>
        <h3>Pas encore d&apos;emploi du temps</h3>
        <p>
          {variant === 'teacher'
            ? 'Aucun cours ne vous a encore été attribué. Dès que la direction publie vos horaires, ils apparaîtront ici.'
            : 'L’école n’a pas encore publié l’emploi du temps de cette classe. Il apparaîtra ici dès qu’il sera prêt.'}
        </p>
      </div>
    );
  }

  const tintStyle = (subject: string): CSSProperties => {
    const t = subjectTint(subject);
    return { background: t.bg, color: t.fg, ['--accent' as string]: t.accent } as CSSProperties;
  };

  const dayEntries = HOUR_SLOTS.map((hs) => ({ hs, entry: findEntry(tab, hs.start) })).filter((x) => x.entry);

  return (
    <div>
      <style>{css}</style>
      {title && <h2 className="wt-title">{title}</h2>}

      {/* ---------- Desktop grid ---------- */}
      <div className="wt-desktop">
        <table className="wt-table">
          <thead>
            <tr>
              <th style={{ width: 74 }} />
              {DAYS.map((d, i) => (
                <th key={d} className={`wt-th${today === i ? ' today' : ''}`}>
                  {d}
                  {today === i && <small>Aujourd&apos;hui</small>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOUR_SLOTS.map((hs, idx) => {
              const next = HOUR_SLOTS[idx + 1];
              return [
                <tr key={hs.start}>
                  <td className="wt-time"><b>{hs.start}</b><span>{hs.end}</span></td>
                  {DAYS.map((_, di) => {
                    const e = findEntry(di, hs.start);
                    return (
                      <td key={di} className={today === di ? 'wt-col-today' : undefined}>
                        {e ? (
                          <div className="wt-cell" style={tintStyle(e.subject)}>
                            <span className="wt-cell-s">{e.subject}</span>
                            <span className="wt-cell-o">{secondary(e)}</span>
                            {e.room && <span className="wt-room">Salle {e.room}</span>}
                          </div>
                        ) : (
                          <div className="wt-empty" />
                        )}
                      </td>
                    );
                  })}
                </tr>,
                next && next.start !== hs.end ? (
                  <tr key={`${hs.start}-break`} className="wt-break"><td colSpan={DAYS.length + 1}>Pause · {hs.end} – {next.start}</td></tr>
                ) : null,
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- Mobile: one day at a time ---------- */}
      <div className="wt-mobile">
        <div className="wt-tabs" role="tablist" aria-label="Jour">
          {DAYS.map((d, i) => (
            <button key={d} type="button" role="tab" aria-selected={tab === i} className={`wt-tab${tab === i ? ' on' : ''}${today === i ? ' today' : ''}`} onClick={() => setTab(i)}>
              {d.slice(0, 3)}
            </button>
          ))}
        </div>
        {dayEntries.length === 0 ? (
          <div className="wt-none">Pas de cours ce jour-là.</div>
        ) : (
          dayEntries.map(({ hs, entry }) => (
            <div className="wt-item" key={hs.start}>
              <div className="wt-item-t">{hs.start}<span>{hs.end}</span></div>
              <div className="wt-cell" style={tintStyle(entry!.subject)}>
                <span className="wt-cell-s">{entry!.subject}</span>
                <span className="wt-cell-o">{secondary(entry!)}</span>
                {entry!.room && <span className="wt-room">Salle {entry!.room}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}