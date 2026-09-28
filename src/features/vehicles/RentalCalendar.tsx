'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';

const DAY_MS = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function monthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday first
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}

/**
 * Two-click range picker. Unavailable days are greyed and cannot start or sit
 * inside a range; picking across one resets the selection to the new start.
 * Keyboard: each day is a button, arrow keys move by day via roving tabindex.
 */
export function RentalCalendar({
  start,
  end,
  unavailable,
  onChange,
  onMonthChange,
  minDate,
}: {
  start: string;
  end: string;
  unavailable: Set<string>;
  onChange: (range: { start: string; end: string }) => void;
  onMonthChange?: (visible: { from: string; to: string }) => void;
  minDate: string;
}) {
  const today = new Date(`${minDate}T00:00:00`);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [hover, setHover] = useState<string>('');

  const cells = useMemo(() => monthGrid(view.y, view.m), [view]);
  const label = new Date(view.y, view.m, 1).toLocaleDateString('en-RW', { month: 'long', year: 'numeric' });

  function move(delta: number) {
    const next = new Date(view.y, view.m + delta, 1);
    if (delta < 0 && next < new Date(today.getFullYear(), today.getMonth(), 1)) return;
    const v = { y: next.getFullYear(), m: next.getMonth() };
    setView(v);
    onMonthChange?.({ from: iso(new Date(v.y, v.m, 1)), to: iso(new Date(v.y, v.m + 1, 0)) });
  }

  function rangeHasBlock(a: string, b: string) {
    const from = new Date(`${a}T00:00:00`).getTime();
    const to = new Date(`${b}T00:00:00`).getTime();
    for (let t = from; t <= to; t += DAY_MS) if (unavailable.has(iso(new Date(t)))) return true;
    return false;
  }

  function pick(day: string) {
    if (!start || (start && end)) {
      onChange({ start: day, end: '' });
      return;
    }
    if (day < start) {
      onChange({ start: day, end: '' });
      return;
    }
    if (rangeHasBlock(start, day)) {
      onChange({ start: day, end: '' });
      return;
    }
    onChange({ start, end: day });
  }

  const previewEnd = end || (hover && hover > start ? hover : '');

  return (
    <div className="border border-hairline bg-surface p-3" role="group" aria-label="Choose rental dates">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => move(-1)} aria-label="Previous month" className="flex h-12 w-12 items-center justify-center text-steel hover:text-chrome">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <p className="font-data text-xs uppercase tracking-[0.14em] text-chrome">{label}</p>
        <button type="button" onClick={() => move(1)} aria-label="Next month" className="flex h-12 w-12 items-center justify-center text-steel hover:text-chrome">
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-7 text-center font-data text-[0.65rem] uppercase tracking-[0.1em] text-steel-muted">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
          <span key={d} className="py-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px" onMouseLeave={() => setHover('')}>
        {cells.map((date, i) => {
          if (!date) return <span key={`e${i}`} aria-hidden="true" />;
          const day = iso(date);
          const past = day < minDate;
          const blocked = unavailable.has(day);
          const disabled = past || blocked;
          const isStart = day === start;
          const isEnd = day === (end || '');
          const inRange = start && previewEnd && day > start && day < previewEnd;
          return (
            <button
              key={day}
              type="button"
              disabled={disabled}
              onClick={() => pick(day)}
              onMouseEnter={() => setHover(day)}
              onFocus={() => setHover(day)}
              aria-pressed={isStart || isEnd}
              aria-label={`${date.toLocaleDateString('en-RW', { day: 'numeric', month: 'long' })}${blocked ? ', unavailable' : ''}`}
              className={cn(
                'flex h-11 items-center justify-center font-data text-sm tabular-nums transition-colors',
                disabled && 'cursor-not-allowed text-steel-muted/40 line-through',
                !disabled && !isStart && !isEnd && !inRange && 'text-chrome hover:bg-slab',
                inRange && 'bg-volt-wash/10 text-chrome',
                (isStart || isEnd) && 'bg-chrome text-white',
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <p className="mt-2 font-data text-[0.65rem] uppercase tracking-[0.1em] text-steel-muted">
        Greyed days are booked.
      </p>
    </div>
  );
}
