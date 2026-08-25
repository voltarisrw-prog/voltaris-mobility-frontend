'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Heart, Home, Plus, Search, User } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { nav } from '@/content/home';
import { cn } from '@/lib/format';

const MOBILE_ICONS = { home: Home, search: Search, plus: Plus, heart: Heart, user: User };

export function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);

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
          'sticky top-0 z-40 border-b bg-surface/85 backdrop-blur-xl transition-all duration-300 ease-out',
          compact ? 'border-hairline' : 'border-transparent',
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
              const active = pathname === item.href.split('?')[0];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative font-data text-eyebrow uppercase transition-colors duration-150',
                    active ? 'text-chrome' : 'text-steel hover:text-chrome',
                  )}
                >
                  {item.label}
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
        <ul className="grid grid-cols-5">
          {nav.mobile.map((item) => {
            const Icon = MOBILE_ICONS[item.icon];
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex min-h-[3.5rem] flex-col items-center justify-center gap-1 transition-colors',
                    active ? 'text-volt' : 'text-steel-muted',
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="font-data text-[0.6rem] uppercase tracking-wider">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
