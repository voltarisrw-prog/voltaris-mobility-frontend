'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Activity,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  Car,
  ClipboardCheck,
  Code2,
  CreditCard,
  FileText,
  Gauge,
  Heart,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Search,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { VoltarisMark } from '@/components/VoltarisLogo';
import { logout } from '@/lib/api/auth';
import { cn } from '@/lib/format';

const ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard,
  vehicles: Car,
  leads: Inbox,
  people: Users,
  companies: Building2,
  roles: KeyRound,
  audit: ClipboardCheck,
  security: ShieldCheck,
  finance: CreditCard,
  analytics: BarChart3,
  content: FileText,
  marketing: Megaphone,
  developer: Code2,
  verification: BadgeCheck,
  fleet: Wrench,
  saved: Heart,
  orders: ShoppingBag,
  activity: Activity,
  notifications: Bell,
  search: Search,
  gauge: Gauge,
};

export interface ShellNavItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS | string;
  /** Exact match only (for an index route like /admin). */
  exact?: boolean;
}

/**
 * The app frame for every signed-in workspace: admin, company console, account.
 * Desktop: a fixed black sidebar. Phone and tablet: a black top bar and a
 * slide-in menu. The public site's header and footer step aside while it's
 * mounted (see `[data-app-shell]` in globals.css).
 */
export function AppShell({
  context,
  nav,
  user,
  theme = 'dark',
  search,
  children,
}: {
  /** Shown under the wordmark: "Admin", a company name, "Your account". */
  context: string;
  nav: ShellNavItem[];
  user: { name: string; email: string; role: string };
  /** Each role has its look (from the design reference): dark or light. */
  theme?: 'dark' | 'light';
  /** Where the top-bar search goes. */
  search?: { action: string; name: string; placeholder: string };
  children: React.ReactNode;
}) {
  const initials = user.name
    .split(/[\s_.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (item: ShellNavItem) => {
    const [path, query] = item.href.split('?');
    const tab = new URLSearchParams(query ?? '').get('tab');
    if (tab || item.exact) return pathname === path && (params.get('tab') ?? null) === tab;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navList = (
    <nav aria-label={context} className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {nav.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const active = isActive(item);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch={false}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-[var(--d-accent-soft)] font-medium text-[var(--d-accent)]'
                    : 'text-[var(--d-muted)] hover:bg-[var(--d-card-2)] hover:text-[var(--d-text)]',
                )}
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const footer = (
    <div className="m-3 rounded-[12px] border border-[var(--d-line)] bg-[var(--d-card)] p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--d-accent)] text-xs font-semibold text-[var(--d-accent-ink)]">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--d-text)]">{user.name}</p>
          <p className="truncate text-xs text-[var(--d-muted)]">{user.role}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <Link href="/" className="text-[var(--d-muted)] hover:text-[var(--d-text)]">
          View site
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[var(--d-muted)] hover:text-[var(--d-text)]"
          onClick={async () => {
            try {
              await logout();
            } finally {
              window.location.assign('/');
            }
          }}
        >
          <LogOut aria-hidden className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );

  const brand = (
    <Link
      href="/"
      className="flex items-center gap-2.5 text-[var(--d-text)]"
      aria-label="Voltaris home"
    >
      <VoltarisMark className="h-7 w-auto" />
      <span className="leading-none">
        <span className="block text-[0.95rem] font-semibold tracking-[0.18em]">VOLTARIS</span>
        <span className="mt-1 block max-w-[10rem] truncate text-[0.65rem] uppercase tracking-[0.14em] text-[var(--d-muted)]">
          {context}
        </span>
      </span>
    </Link>
  );

  return (
    <div
      data-app-shell
      data-theme={theme}
      className="min-h-[100dvh] bg-[var(--d-bg)] font-sans text-[var(--d-text)] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col border-r border-[var(--d-line)] bg-[var(--d-side)] lg:flex">
        <div className="px-5 pb-2 pt-6">{brand}</div>
        {navList}
        {footer}
      </aside>

      {/* Phone / tablet top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--d-line)] bg-[var(--d-side)] px-4 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-[10px] text-[var(--d-text)] hover:bg-[var(--d-card-2)]"
        >
          <Menu aria-hidden className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/40 animate-backdrop-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-[var(--d-side)]">
            <div className="flex h-14 items-center justify-between px-4">
              {brand}
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-[10px] text-[var(--d-text)]"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            {navList}
            {footer}
          </div>
        </div>
      )}

      <div className="min-w-0">
        {/* Top bar: search, alerts, who's signed in */}
        <div className="sticky top-14 z-30 flex h-16 items-center gap-3 border-b border-[var(--d-line)] bg-[color-mix(in_srgb,var(--d-bg)_88%,transparent)] px-4 backdrop-blur sm:px-6 lg:top-0 lg:px-10">
          {search ? (
            <form action={search.action} className="relative min-w-0 max-w-md flex-1" role="search">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--d-muted)]"
              />
              <input
                name={search.name}
                type="search"
                placeholder={search.placeholder}
                aria-label={search.placeholder}
                className="h-10 w-full rounded-[10px] border border-[var(--d-line)] bg-[var(--d-card)] pl-9 pr-3 text-sm text-[var(--d-text)] placeholder:text-[var(--d-muted)]"
              />
            </form>
          ) : (
            <div className="flex-1" />
          )}
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/account/notifications"
              prefetch={false}
              aria-label="Notifications"
              className="grid h-10 w-10 place-items-center rounded-[10px] border border-[var(--d-line)] bg-[var(--d-card)] text-[var(--d-muted)] hover:text-[var(--d-text)]"
            >
              <Bell aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/account/profile"
              prefetch={false}
              aria-label={`${user.name} — profile`}
              className="hidden items-center gap-2.5 rounded-[10px] border border-[var(--d-line)] bg-[var(--d-card)] py-1 pl-1 pr-3 sm:flex"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--d-accent)] text-xs font-semibold text-[var(--d-accent-ink)]">
                {initials}
              </span>
              <span className="max-w-[10rem] truncate text-sm text-[var(--d-text)]">
                {user.name}
              </span>
            </Link>
          </div>
        </div>
        <div className="px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-8">{children}</div>
      </div>
    </div>
  );
}
