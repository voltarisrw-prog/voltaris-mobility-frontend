import Link from 'next/link';
import { cn } from '@/lib/format';

/*
 * Dashboard building blocks. Squarespace system: square, flat, hairline borders,
 * Inter, ink on white. Server components — no client JS unless a part needs it.
 */

export function DashHead({
  eyebrow,
  title,
  lead,
  actions,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 pb-8">
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-display text-headline">{title}</h1>
        {lead && <p className="mt-2 max-w-2xl text-sm text-steel">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export interface Kpi {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}

/** The headline numbers. 2 across on phones, 4 on desktop. */
export function Kpis({ items, preview = false }: { items: Kpi[]; preview?: boolean }) {
  return (
    <div className="relative">
      {preview && <PreviewBadge className="absolute -top-3 right-3 z-10" />}
      <dl className="grid grid-cols-2 gap-px border border-hairline bg-hairline lg:grid-cols-4">
        {items.map((k) => {
          const body = (
            <>
              <dt className="eyebrow">{k.label}</dt>
              <dd className="mt-3 font-display text-[clamp(1.5rem,1.2rem+1.2vw,2.25rem)] font-medium tabular-nums leading-none tracking-tight">
                {k.value}
              </dd>
              {k.hint && <dd className="mt-2 text-xs text-steel-muted">{k.hint}</dd>}
            </>
          );
          return (
            <div key={k.label} className="bg-surface">
              {k.href ? (
                <Link
                  href={k.href}
                  prefetch={false}
                  className="block p-4 transition-colors hover:bg-abyss sm:p-5"
                >
                  {body}
                </Link>
              ) : (
                <div className="p-4 sm:p-5">{body}</div>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** A titled block. `span` sets how many of the 12 desktop columns it takes. */
export function Panel({
  title,
  action,
  children,
  span = 6,
  preview = false,
  flush = false,
}: {
  title: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
  span?: 4 | 5 | 6 | 7 | 8 | 12;
  preview?: boolean;
  flush?: boolean;
}) {
  // Tablet: halves and fulls. Desktop: the 12-column layout as designed.
  const spans = {
    4: 'md:col-span-6 lg:col-span-4',
    5: 'md:col-span-6 lg:col-span-5',
    6: 'md:col-span-6 lg:col-span-6',
    7: 'md:col-span-12 lg:col-span-7',
    8: 'md:col-span-12 lg:col-span-8',
    12: 'md:col-span-12 lg:col-span-12',
  } as const;
  return (
    <section className={cn('min-w-0 border border-hairline bg-surface', spans[span])}>
      <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
        <h2 className="text-sm font-medium">{title}</h2>
        <div className="flex items-center gap-3">
          {preview && <PreviewBadge />}
          {action && (
            <Link
              href={action.href}
              prefetch={false}
              className="font-data text-eyebrow uppercase text-steel hover:text-chrome"
            >
              {action.label} →
            </Link>
          )}
        </div>
      </div>
      <div className={flush ? '' : 'p-4 sm:p-5'}>{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 grid gap-4 sm:gap-6 md:grid-cols-12">{children}</div>;
}

/** Marks screens whose module isn't built yet, so sample figures are never mistaken for real ones. */
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <span
      title="This module isn't switched on yet. The figures are sample data to show the layout."
      className={cn(
        'inline-flex items-center gap-1.5 border border-chrome bg-surface px-2 py-1 font-data text-[0.65rem] uppercase tracking-[0.08em] text-chrome',
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 bg-chrome" />
      <span className="sm:hidden">Preview</span>
      <span className="hidden whitespace-nowrap sm:inline">Preview · sample data</span>
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-steel-muted">{children}</p>;
}

/** Plain table that scrolls sideways on small screens instead of squashing. */
export function MiniTable({
  head,
  rows,
  empty = 'Nothing yet.',
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  return (
    <div className="-mx-4 overflow-x-auto sm:-mx-5">
      <table className="w-full min-w-[32rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-hairline">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-left font-data text-[0.7rem] font-medium uppercase tracking-[0.06em] text-steel-muted sm:px-5',
                  i === head.length - 1 && 'text-right',
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, r) => (
            <tr key={r} className="border-b border-hairline/70 last:border-0">
              {cells.map((c, i) => (
                <td
                  key={i}
                  className={cn(
                    'px-4 py-3 align-middle sm:px-5',
                    i === cells.length - 1 && 'text-right',
                  )}
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Status words stay text; the square only reinforces them. */
export function Status({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'ok' | 'warn' | 'bad';
}) {
  const dot = {
    neutral: 'bg-steel-muted',
    ok: 'bg-chrome',
    warn: 'border border-chrome bg-surface',
    bad: 'bg-danger',
  }[tone];
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap font-data text-[0.7rem] uppercase tracking-[0.06em] text-steel">
      <span aria-hidden className={cn('h-2 w-2', dot)} />
      {children}
    </span>
  );
}

/** Part-of-whole as one bar plus labelled values. Reads better than a donut at this size. */
export function Split({
  parts,
  unit = '',
}: {
  parts: { label: string; value: number }[];
  unit?: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const shades = ['bg-chrome', 'bg-steel', 'bg-steel-muted', 'bg-hairline'];
  return (
    <div>
      <div
        className="flex h-3 w-full gap-[2px] bg-surface"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}
      >
        {total === 0 ? (
          <div className="h-full w-full bg-slab" />
        ) : (
          parts.map((p, i) =>
            p.value > 0 ? (
              <div
                key={p.label}
                className={shades[i % shades.length]}
                style={{ width: `${(p.value / total) * 100}%` }}
              />
            ) : null,
          )
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-steel">
              <span aria-hidden className={cn('h-2.5 w-2.5', shades[i % shades.length])} />
              {p.label}
            </span>
            <span className="tabular-nums">
              {p.value.toLocaleString('en-RW')}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Ranked list with inline bars — "top makes", "busiest branches". */
export function Ranked({
  items,
  empty = 'No data yet.',
}: {
  items: { label: string; value: number }[];
  empty?: string;
}) {
  if (items.length === 0) return <Empty>{empty}</Empty>;
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="truncate capitalize">{i.label.replace(/_/g, ' ')}</span>
            <span className="tabular-nums text-steel">{i.value.toLocaleString('en-RW')}</span>
          </div>
          <div className="mt-1.5 h-1.5 bg-slab">
            <div className="h-full bg-chrome" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Feed({
  items,
  empty = 'Nothing yet.',
}: {
  items: { title: string; meta: string; when?: string }[];
  empty?: string;
}) {
  if (items.length === 0) return <Empty>{empty}</Empty>;
  return (
    <ol className="space-y-4">
      {items.map((i, n) => (
        <li key={n} className="flex gap-3">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-chrome" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm">{i.title}</p>
            <p className="truncate text-xs text-steel-muted">
              {i.meta}
              {i.when && ` · ${i.when}`}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export interface TileVehicle {
  id: string;
  slug: string;
  title: string;
  image_url?: string | null;
  line?: string;
  status?: string;
}

/** Vehicle photos in a grid: 2 across on phones, up to 4 on desktop. */
export function VehicleTiles({
  items,
  empty = 'No vehicles yet.',
}: {
  items: TileVehicle[];
  empty?: string;
}) {
  if (items.length === 0) return <Empty>{empty}</Empty>;
  return (
    <ul className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4 xl:grid-cols-4">
      {items.map((v) => (
        <li key={v.id} className="border border-hairline bg-surface">
          <Link href={`/cars/${v.slug}`} prefetch={false} className="group block">
            <div className="aspect-[4/3] overflow-hidden bg-slab">
              {v.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- remote listing photos, sized by CSS
                <img
                  src={v.image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium">{v.title}</p>
              <p className="mt-0.5 truncate text-xs text-steel-muted">{v.line}</p>
              {v.status && (
                <p className="mt-1 truncate font-data text-[0.65rem] uppercase tracking-[0.06em] text-steel-muted">
                  {v.status}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** A few labelled progress rows — utilisation, completion, readiness. */
export function Meters({ items }: { items: { label: string; value: number; note?: string }[] }) {
  return (
    <ul className="space-y-4">
      {items.map((m) => (
        <li key={m.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{m.label}</span>
            <span className="tabular-nums text-steel">{m.note ?? `${Math.round(m.value)}%`}</span>
          </div>
          <div
            className="mt-1.5 h-1.5 bg-slab"
            role="meter"
            aria-valuenow={Math.round(m.value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={m.label}
          >
            <div
              className="h-full bg-chrome"
              style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export const rwf = (n: number) =>
  n >= 1_000_000
    ? `RWF ${(n / 1_000_000).toLocaleString('en-RW', { maximumFractionDigits: 1 })}M`
    : `RWF ${n.toLocaleString('en-RW')}`;

export const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(iso).toLocaleDateString('en-RW', { day: 'numeric', month: 'short' });
};
