'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Home, Plus, Scale, Search, User } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { nav } from '@/content/home';
import { cn } from '@/lib/format';
import { useCompareIds } from '@/lib/compare/useCompare';

const MOBILE_ICONS = { home: Home, search: Search, scale: Scale, plus: Plus, heart: Heart, user: User };

export function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
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
            ? 'border-hairline bg-surface/88 backdrop-blur-xl'
            : isHome
              ? 'border-white/10 bg-[#0C0906]/95 backdrop-blur-xl'
              : 'border-white/10 bg-[#0C0906]/95 backdrop-blur-xl',
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
            <VoltarisLogo className={cn('transition-all duration-300 ease-out', compact ? 'h-7' : 'h-9')} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
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
                    'relative font-data text-[0.72rem] uppercase tracking-[0.12em] transition-colors duration-150',
                    active ? 'text-chrome' : 'text-chrome/90 hover:text-volt',
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
              className="inline-flex h-10 w-10 items-center justify-center text-steel transition-colors hover:text-chrome lg:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/account"
              aria-label="Your account"
              className="hidden h-10 w-10 items-center justify-center text-steel transition-colors hover:text-chrome sm:inline-flex"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/sell"
              className="hidden bg-volt px-4 py-2.5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright sm:inline-block"
            >
              Sell your car
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom bar. Thumb reach beats a hamburger for the five things people
          actually do, and it keeps Sell one tap away on every page. */}
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur-xl lg:hidden"
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
              <li key={item.href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    // min-h stays the same 44px+ touch target; horizontal padding tightens
                    // slightly at six items so labels don't wrap on a 360px viewport.
                    'relative flex min-h-[3.5rem] flex-col items-center justify-center gap-1 px-0.5 transition-colors',
                    active ? 'text-volt' : 'text-steel-muted',
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
                  <span className="font-data text-[0.56rem] uppercase leading-none tracking-wider">
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
