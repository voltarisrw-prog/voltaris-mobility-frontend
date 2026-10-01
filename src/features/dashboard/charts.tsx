'use client';

import { useId, useState } from 'react';

/*
 * Two chart forms cover every dashboard: bars for counts per day, a line for a
 * running trend. Single series, ink on white, recessive grid, one y-axis.
 * Hover (or tap) shows the exact value; a hidden table carries the same data
 * for screen readers.
 */

export interface Point {
  label: string;
  value: number;
}

/** Server components can't pass functions to client ones, so formats are named. */
export type Unit = 'count' | 'rwf';
const FORMATS: Record<Unit, (n: number) => string> = {
  count: (n) => n.toLocaleString('en-RW'),
  rwf: (n) =>
    n >= 1_000_000
      ? `RWF ${(n / 1_000_000).toLocaleString('en-RW', { maximumFractionDigits: 1 })}M`
      : `RWF ${n.toLocaleString('en-RW')}`,
};

const short = (label: string) => {
  const d = new Date(label);
  return Number.isNaN(d.getTime())
    ? label
    : d.toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
};

function Frame({
  data,
  format,
  height,
  title,
  children,
}: {
  data: Point[];
  format: (n: number) => string;
  height: number;
  title: string;
  children: (
    hover: number | null,
    setHover: (i: number | null) => void,
    max: number,
  ) => React.ReactNode;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);
  const nice = niceMax(max);
  const tableId = useId();
  const h = hover !== null ? data[hover] : null;

  return (
    <figure className="relative" aria-describedby={tableId}>
      <div className="flex items-baseline justify-between text-xs text-[var(--d-muted)]">
        <span className="tabular-nums">{format(nice)}</span>
        <span aria-live="polite" className="tabular-nums font-medium text-[var(--d-accent)]">
          {h ? `${short(h.label)} · ${format(h.value)}` : ''}
        </span>
      </div>
      <div className="relative mt-2" style={{ height }}>
        {children(hover, setHover, nice)}
      </div>
      <div className="mt-2 flex justify-between text-[0.7rem] text-[var(--d-muted)]">
        <span>{data[0] && short(data[0].label)}</span>
        <span>{short(data[Math.floor(data.length / 2)]?.label ?? '')}</span>
        <span>{data.at(-1) && short(data.at(-1)!.label)}</span>
      </div>
      <table id={tableId} className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{short(d.label)}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function niceMax(n: number) {
  if (n <= 5) return 5;
  const p = 10 ** Math.floor(Math.log10(n));
  const m = n / p;
  return (m <= 2 ? 2 : m <= 5 ? 5 : 10) * p;
}

function Grid() {
  return (
    <>
      {[0, 0.5, 1].map((y) => (
        <line
          key={y}
          x1="0"
          x2="100"
          y1={y * 100}
          y2={y * 100}
          style={{ stroke: 'var(--d-line)' }}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </>
  );
}

export function BarChart({
  data,
  title,
  height = 160,
  unit = 'count',
}: {
  data: Point[];
  title: string;
  height?: number;
  unit?: Unit;
}) {
  return (
    <Frame data={data} format={FORMATS[unit]} height={height} title={title}>
      {(hover, setHover, max) => {
        const w = 100 / Math.max(data.length, 1);
        return (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full"
            role="img"
            aria-label={title}
            onPointerLeave={() => setHover(null)}
          >
            <Grid />
            {data.map((d, i) => {
              const bh = (d.value / max) * 100;
              return (
                <g key={d.label} onPointerEnter={() => setHover(i)} onClick={() => setHover(i)}>
                  {/* hit target: the full column, wider than the mark */}
                  <rect x={i * w} y="0" width={w} height="100" fill="transparent" />
                  <rect
                    x={i * w + w * 0.18}
                    y={100 - bh}
                    width={w * 0.64}
                    height={Math.max(bh, d.value > 0 ? 1.5 : 0)}
                    rx="0.6"
                    style={{
                      fill:
                        hover === null || hover === i
                          ? 'var(--d-accent)'
                          : 'color-mix(in srgb, var(--d-accent) 35%, var(--d-card))',
                    }}
                  />
                </g>
              );
            })}
          </svg>
        );
      }}
    </Frame>
  );
}

export function LineChart({
  data,
  title,
  height = 160,
  unit = 'count',
}: {
  data: Point[];
  title: string;
  height?: number;
  unit?: Unit;
}) {
  return (
    <Frame data={data} format={FORMATS[unit]} height={height} title={title}>
      {(hover, setHover, max) => {
        const x = (i: number) => (data.length <= 1 ? 50 : (i / (data.length - 1)) * 100);
        const y = (v: number) => 100 - (v / max) * 100;
        const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i)},${y(d.value)}`).join(' ');
        return (
          <div
            className="relative h-full w-full"
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const i = Math.round(((e.clientX - r.left) / r.width) * (data.length - 1));
              setHover(Math.min(data.length - 1, Math.max(0, i)));
            }}
            onPointerLeave={() => setHover(null)}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label={title}
            >
              <Grid />
              <path
                d={`${path} L100,100 L0,100 Z`}
                style={{ fill: 'var(--d-accent)' }}
                opacity="0.12"
              />
              <path
                d={path}
                fill="none"
                style={{ stroke: 'var(--d-accent)' }}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              {hover !== null && (
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1="0"
                  y2="100"
                  style={{ stroke: 'var(--d-muted)' }}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </svg>
            {hover !== null && (
              <span
                aria-hidden
                className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--d-card)] bg-[var(--d-accent)]"
                style={{ left: `${x(hover)}%`, top: `${y(data[hover]?.value ?? 0)}%` }}
              />
            )}
          </div>
        );
      }}
    </Frame>
  );
}
