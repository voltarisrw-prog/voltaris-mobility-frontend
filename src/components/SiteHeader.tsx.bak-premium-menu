'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Home, Menu, Plus, Scale, Search, User, X } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { nav } from '@/content/home';
import { cn } from '@/lib/format';
import { useCompareIds } from '@/lib/compare/useCompare';

const MOBILE_ICONS = { home: Home, search: Search, scale: Scale, plus: Plus, heart: Heart, user: User };

export function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const compareIds = useCompareIds();
  const isHome = pathname === '/';
  // The nav's own Compare entry is the only static thing about it: the moment a
  // vehicle is queued, it should lead straight into that comparison rather than to
  // the empty state — that's the whole point of making this a real on-ramp.
  const compareHref = compareIds.length > 0 ? `/compare?ids=${compareIds.join(',')}` : '/compare';

  useEffect(() => {
    // Passive listener behind a rAF gate — scroll handlers are a classic INP regression.
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setCompact(window.scrollY > 24);
        frame = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <header
        className={cn(
          'z-40 border-b transition-all duration-300 ease-out',
          isHome
            ? 'fixed inset-x-0 top-0'
            : 'sticky top-0',
          compact
            ? 'border-[color:var(--vds-border)] bg-[color:var(--vds-bg)]/88 backdrop-blur-xl'
            : isHome
              ? 'border-[color:var(--vds-border)] vds-site-header'
              : 'border-[color:var(--vds-border)] vds-site-header',
        )}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-chrome focus:px-4 focus:py-2 focus:font-data focus:text-eyebrow focus:uppercase focus:text-surface"
        >
          Skip to content
        </a>

        <div
          className={cn(
            'shell flex items-center justify-between gap-8 transition-all duration-300 ease-out',
            compact ? 'h-14' : 'h-20',
          )}
        >
          <Link href="/" aria-label="Voltaris Mobility, home">
            <VoltarisLogo
              className={cn(
                'transition-all duration-300 ease-out',
                compact ? 'h-6 sm:h-7' : 'h-7 sm:h-8 lg:h-9',
              )}
            />
          </Link>

          <button
        type="button"
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-hairline bg-surface/70 text-chrome backdrop-blur-md transition-colors hover:border-volt hover:text-volt lg:hidden"
      >
        {mobileOpen ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Menu className="h-5 w-5" aria-hidden="true" />
        )}
      </button>

      <nav aria-label="Main" className="hidden items-center gap-6 xl:gap-8 lg:flex">
            {nav.primary.map((item) => {
              const isCompare = item.href.split('?')[0] === '/compare';
              const href = isCompare ? compareHref : item.href;
              const active = pathname === item.href.split('?')[0];
              return (
                <Link
                  key={item.href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative font-data text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors duration-150 xl:text-[15px]',
                    active ? 'text-[color:var(--vds-text)]' : 'text-[color:var(--vds-text)] hover:text-[color:var(--vds-brand-secondary)]',
                  )}
                >
                  {item.label}
                  {isCompare && compareIds.length > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-volt px-1 font-data text-[0.6rem] text-surface">
                      {compareIds.length}
                    </span>
                  )}
                  {active && <span className="absolute -bottom-2 left-0 h-px w-full bg-volt" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/cars"
              aria-label="Search vehicles"
              className="inline-flex h-10 w-10 items-center justify-center text-[color:var(--vds-text-secondary)] transition-colors hover:text-[color:var(--vds-text)] lg:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/account"
              aria-label="Your account"
              className="hidden h-10 w-10 items-center justify-center text-[color:var(--vds-text-secondary)] transition-colors hover:text-[color:var(--vds-text)] sm:inline-flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/sell"
              className="hidden bg-volt px-4 py-2.5 font-data text-eyebrow uppercase text-surface transition-colors hover:vds-button-primary sm:inline-block"
            >
              Sell your car
            </Link>
          </div>
        </div>
      
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-abyss lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex min-h-dvh flex-col">
            <div className="shell flex h-20 shrink-0 items-center justify-between border-b border-hairline">
              <VoltarisLogo className="h-7" />

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-chrome transition-colors hover:border-volt hover:text-volt"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="shell flex flex-1 flex-col justify-center py-10">
              <p className="eyebrow mb-8">Voltaris Mobility</p>

              <nav aria-label="Mobile main">
                <ul className="space-y-1">
                  {nav.primary.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="group flex min-h-14 items-center justify-between border-b border-hairline py-3 font-display text-2xl font-medium tracking-[-0.025em] text-chrome transition-colors hover:text-volt"
                      >
                        <span>{item.label}</span>
                        <span
                          className="font-data text-[0.55rem] uppercase tracking-[0.16em] text-steel-muted transition-colors group-hover:text-volt"
                          aria-hidden="true"
                        >
                          Open
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-10 border-t border-hairline pt-6">
                <p className="max-w-xs font-data text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-steel-muted">
                  Mobility, selected with intention.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
</header>

      {/* Mobile bottom bar. Thumb reach beats a hamburger for the five things people
          actually do, and it keeps Sell one tap away on every page. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--vds-border)] bg-[color:var(--vds-bg)]/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <ul className="grid grid-cols-6">
          {nav.mobile.map((item) => {
            const Icon = MOBILE_ICONS[item.icon];
            const isCompare = item.href === '/compare';
            const href = isCompare ? compareHref : item.href;
            // Compare is URL-driven (/compare?ids=...) — treat any path under /compare as active,
            // not just an exact match, so the tab lights up once vehicles are queued.
            const active = isCompare ? pathname.startsWith('/compare') : pathname === item.href;
            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    // min-h stays the same 44px+ touch target; horizontal padding tightens
                    // slightly at six items so labels don't wrap on a 360px viewport.
                    'relative flex min-h-[3.5rem] min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-colors',
                    active ? 'text-[color:var(--vds-brand-secondary)]' : 'text-[color:var(--vds-text-muted)]',
                  )}
                >
                  <span className="relative">
                    <Icon className="h-[18px] w-[18px]" />
                    {isCompare && compareIds.length > 0 && (
                      <span
                        aria-hidden="true"
                        className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-[0.875rem] items-center justify-center rounded-full bg-volt px-0.5 font-data text-[0.5rem] text-surface"
                      >
                        {compareIds.length}
                      </span>
                    )}
                  </span>
                  <span className="max-w-full truncate px-0.5 font-data text-[9px] font-semibold uppercase leading-none tracking-[0.04em] min-[360px]:text-[10px] min-[400px]:text-[11px]">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
