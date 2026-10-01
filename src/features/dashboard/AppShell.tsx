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
  children,
}: {
  /** Shown under the wordmark: "Admin", a company name, "Your account". */
  context: string;
  nav: ShellNavItem[];
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const search = useSearchParams();
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
    if (tab || item.exact) return pathname === path && (search.get('tab') ?? null) === tab;
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
                  'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                  active
                    ? 'bg-white text-chrome'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
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
    <div className="border-t border-white/10 p-4">
      <p className="truncate text-sm font-medium text-white">{user.name}</p>
      <p className="truncate text-xs text-white/50">{user.role}</p>
      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.06em]">
        <Link href="/" className="text-white/60 hover:text-white">
          View site
        </Link>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-white/60 hover:text-white"
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
    <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="Voltaris home">
      <VoltarisMark className="h-7 w-auto" />
      <span className="leading-none">
        <span className="block text-[0.95rem] font-semibold tracking-[0.18em]">VOLTARIS</span>
        <span className="mt-1 block max-w-[10rem] truncate text-[0.65rem] uppercase tracking-[0.14em] text-white/50">
          {context}
        </span>
      </span>
    </Link>
  );

  return (
    <div
      data-app-shell
      className="min-h-[100dvh] bg-abyss lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]"
    >
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] flex-col bg-chrome lg:flex">
        <div className="px-5 pb-2 pt-6">{brand}</div>
        {navList}
        {footer}
      </aside>

      {/* Phone / tablet top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-chrome px-4 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center text-white"
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
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-chrome">
            <div className="flex h-14 items-center justify-between px-4">
              {brand}
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center text-white"
              >
                <X aria-hidden className="h-5 w-5" />
              </button>
            </div>
            {navList}
            {footer}
          </div>
        </div>
      )}

      <div className="min-w-0 px-4 pb-16 pt-6 sm:px-6 lg:px-10 lg:pt-10">{children}</div>
    </div>
  );
}
