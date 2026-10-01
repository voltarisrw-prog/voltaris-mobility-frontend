import Link from 'next/link';
import { cn } from '@/lib/format';

/*
 * Dashboard building blocks, drawn with the dashboard theme variables
 * (--d-bg, --d-card, --d-line, --d-text, --d-muted, --d-accent) so the same
 * component renders dark or light by role. Rounded cards, one green accent.
 */

const card =
  'rounded-[14px] border border-[var(--d-line)] bg-[var(--d-card)] shadow-[var(--d-shadow)]';

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
    <header className="flex flex-wrap items-end justify-between gap-4 pb-6">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--d-accent)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[clamp(1.5rem,1.2rem+1.4vw,2.25rem)] font-semibold leading-tight tracking-tight text-[var(--d-text)]">
          {title}
        </h1>
        {lead && <p className="mt-1.5 max-w-2xl text-sm text-[var(--d-muted)]">{lead}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

/** Primary / secondary actions in the dashboard style. */
export function DashButton({
  href,
  children,
  variant = 'primary',
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        'inline-flex h-10 items-center rounded-[10px] px-4 text-sm font-medium transition',
        variant === 'primary'
          ? 'bg-[var(--d-accent)] text-[var(--d-accent-ink)] hover:brightness-110'
          : 'border border-[var(--d-line)] bg-[var(--d-card)] text-[var(--d-text)] hover:border-[var(--d-accent)]',
      )}
    >
      {children}
    </Link>
  );
}

export interface Kpi {
  label: string;
  value: string | number;
  hint?: string;
  href?: string;
}

/** The headline numbers: separate rounded cards, 2 across on phones, 4 on desktop. */
export function Kpis({ items, preview = false }: { items: Kpi[]; preview?: boolean }) {
  return (
    <div>
      {preview && (
        <div className="mb-2 flex justify-end">
          <PreviewBadge />
        </div>
      )}
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((k) => {
          const body = (
            <>
              <dt className="text-xs font-medium text-[var(--d-muted)]">{k.label}</dt>
              <dd className="mt-2 text-[clamp(1.4rem,1.15rem+1vw,2rem)] font-semibold tabular-nums leading-none tracking-tight text-[var(--d-text)]">
                {k.value}
              </dd>
              {k.hint && (
                <dd className="mt-2 text-xs font-medium text-[var(--d-accent)]">{k.hint}</dd>
              )}
            </>
          );
          return (
            <div key={k.label} className={cn(card, 'relative overflow-hidden')}>
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-[3px] bg-[var(--d-accent)] opacity-80"
              />
              {k.href ? (
                <Link
                  href={k.href}
                  prefetch={false}
                  className="block p-4 transition-colors hover:bg-[var(--d-card-2)] sm:p-5"
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

/** A titled card. `span` sets how many of the 12 desktop columns it takes. */
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
    <section className={cn('min-w-0 overflow-hidden', card, spans[span])}>
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-5">
        <h2 className="text-sm font-semibold text-[var(--d-text)]">{title}</h2>
        <div className="flex items-center gap-3">
          {preview && <PreviewBadge />}
          {action && (
            <Link
              href={action.href}
              prefetch={false}
              className="whitespace-nowrap text-xs font-medium text-[var(--d-accent)] hover:underline"
            >
              {action.label} →
            </Link>
          )}
        </div>
      </div>
      <div className={flush ? 'pt-3' : 'p-4 pt-3 sm:p-5 sm:pt-3'}>{children}</div>
    </section>
  );
}

export function Grid({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4 md:grid-cols-12">{children}</div>;
}

/** Marks screens whose module isn't built yet, so sample figures are never mistaken for real ones. */
export function PreviewBadge({ className }: { className?: string }) {
  return (
    <span
      title="This module isn't switched on yet. The figures are sample data to show the layout."
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--d-warn)_40%,transparent)] bg-[color-mix(in_srgb,var(--d-warn)_10%,transparent)] px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-[var(--d-warn)]',
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--d-warn)]" />
      <span className="sm:hidden">Preview</span>
      <span className="hidden whitespace-nowrap sm:inline">Preview · sample data</span>
    </span>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-[var(--d-muted)]">{children}</p>;
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
      <table className="w-full min-w-[32rem] border-collapse text-sm text-[var(--d-text)]">
        <thead>
          <tr className="border-b border-[var(--d-line)]">
            {head.map((h, i) => (
              <th
                key={h}
                scope="col"
                className={cn(
                  'whitespace-nowrap px-4 py-2.5 text-left text-[0.7rem] font-medium uppercase tracking-[0.06em] text-[var(--d-muted)] sm:px-5',
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
            <tr
              key={r}
              className="border-b border-[var(--d-line)] last:border-0 hover:bg-[var(--d-card-2)]"
            >
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

/** Coloured status chip; the word carries the meaning, the colour reinforces it. */
export function Status({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'ok' | 'warn' | 'bad';
}) {
  const c = {
    neutral: 'text-[var(--d-muted)] bg-[var(--d-card-2)] border-[var(--d-line)]',
    ok: 'text-[var(--d-accent)] bg-[var(--d-accent-soft)] border-transparent',
    warn: 'text-[var(--d-warn)] bg-[color-mix(in_srgb,var(--d-warn)_12%,transparent)] border-transparent',
    bad: 'text-[var(--d-bad)] bg-[color-mix(in_srgb,var(--d-bad)_12%,transparent)] border-transparent',
  }[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize',
        c,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

const SHADES = [
  'var(--d-accent)',
  'color-mix(in srgb, var(--d-accent) 55%, var(--d-card))',
  'var(--d-muted)',
  'var(--d-line)',
];

/** Part-of-whole as one rounded bar plus labelled values. */
export function Split({
  parts,
  unit = '',
}: {
  parts: { label: string; value: number }[];
  unit?: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  return (
    <div>
      <div
        className="flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full bg-[var(--d-card-2)]"
        role="img"
        aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}
      >
        {total > 0 &&
          parts.map((p, i) =>
            p.value > 0 ? (
              <div
                key={p.label}
                style={{
                  width: `${(p.value / total) * 100}%`,
                  background: SHADES[i % SHADES.length],
                }}
              />
            ) : null,
          )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        {parts.map((p, i) => (
          <li key={p.label} className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-[var(--d-muted)]">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: SHADES[i % SHADES.length] }}
              />
              {p.label}
            </span>
            <span className="font-medium tabular-nums text-[var(--d-text)]">
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
            <span className="truncate capitalize text-[var(--d-text)]">
              {i.label.replace(/_/g, ' ')}
            </span>
            <span className="tabular-nums text-[var(--d-muted)]">
              {i.value.toLocaleString('en-RW')}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--d-card-2)]">
            <div
              className="h-full rounded-full bg-[var(--d-accent)]"
              style={{ width: `${(i.value / max) * 100}%` }}
            />
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
    <ol className="space-y-3.5">
      {items.map((i, n) => (
        <li key={n} className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--d-accent-soft)] text-[0.65rem] font-semibold uppercase text-[var(--d-accent)]"
          >
            {i.title.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-[var(--d-text)] first-letter:uppercase">
              {i.title}
            </p>
            <p className="truncate text-xs text-[var(--d-muted)]">
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

/** Vehicle photos as rounded cards: 2 across on phones, up to 4 on desktop. */
export function VehicleTiles({
  items,
  empty = 'No vehicles yet.',
}: {
  items: TileVehicle[];
  empty?: string;
}) {
  if (items.length === 0) return <Empty>{empty}</Empty>;
  return (
    <ul className="grid grid-cols-2 gap-3 p-4 pt-1 sm:grid-cols-3 sm:p-5 sm:pt-1 xl:grid-cols-4">
      {items.map((v) => (
        <li
          key={v.id}
          className="overflow-hidden rounded-[12px] border border-[var(--d-line)] bg-[var(--d-card-2)]"
        >
          <Link href={`/cars/${v.slug}`} prefetch={false} className="group block">
            <div className="aspect-[4/3] overflow-hidden bg-[var(--d-card)]">
              {v.image_url && (
                // eslint-disable-next-line @next/next/no-img-element -- remote listing photos, sized by CSS
                <img
                  src={v.image_url}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-medium text-[var(--d-text)]">{v.title}</p>
              <p className="mt-0.5 truncate text-xs font-medium text-[var(--d-accent)]">{v.line}</p>
              {v.status && (
                <p className="mt-1 truncate text-[0.7rem] capitalize text-[var(--d-muted)]">
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
            <span className="text-[var(--d-text)]">{m.label}</span>
            <span className="tabular-nums text-[var(--d-muted)]">
              {m.note ?? `${Math.round(m.value)}%`}
            </span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--d-card-2)]"
            role="meter"
            aria-valuenow={Math.round(m.value)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={m.label}
          >
            <div
              className="h-full rounded-full bg-[var(--d-accent)]"
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
