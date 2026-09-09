'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, User, X } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { nav } from '@/content/home';
import { cn } from '@/lib/format';
import { useCompareIds, useCompareMode } from '@/lib/compare/useCompare';

export function SiteHeader() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const compareIds = useCompareIds();
  const compareMode = useCompareMode();
  const isHome = pathname === '/';
  // The nav's own Compare entry is the only static thing about it: the moment a
  // vehicle is queued, it should lead straight into that comparison rather than to
  // the empty state — that's the whole point of making this a real on-ramp.
  const compareHref =
    compareIds.length > 0
      ? `/compare?ids=${compareIds.join(',')}&mode=${compareMode ?? 'sale'}`
      : '/compare';

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

          <nav aria-label="Main" className="hidden items-center gap-4 xl:gap-6 lg:flex">
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
          className={cn(
            'fixed inset-0 z-[90] bg-abyss lg:hidden transition-[opacity,visibility] duration-500',
            mobileOpen
              ? 'visible opacity-100'
              : 'invisible pointer-events-none opacity-0',
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          aria-hidden={!mobileOpen}
        >
          <div
            className={cn(
              'flex min-h-dvh flex-col origin-top transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
              mobileOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-6 scale-[0.985] opacity-0',
            )}
          >
            <div className="shell flex h-20 shrink-0 items-center justify-between border-b border-hairline">
              <Link
                href="/"
                aria-label="Voltaris Mobility home"
                onClick={() => setMobileOpen(false)}
                className="group inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
              >
                <VoltarisLogo className="h-7 transition-transform duration-300 group-hover:scale-[1.03]" />
              </Link>

              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileOpen(false)}
                className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-hairline text-chrome transition-all duration-300 hover:border-volt hover:text-volt hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt/60"
              >
                <X
                  className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="shell flex flex-1 flex-col justify-start overflow-y-auto py-12 sm:py-16">
              <div className="mb-10 sm:mb-12">
                <p className="eyebrow">Voltaris Mobility</p>
                <p className="mt-2 max-w-xs font-data text-[0.58rem] uppercase tracking-[0.12em] text-steel-muted">
                  Move with intention.
                </p>
              </div>

              <nav aria-label="Mobile main">
                <ul className="divide-y divide-hairline border-y border-hairline">
                  {nav.primary.map((item, index) => {
                    const isCompare = item.href.split('?')[0] === '/compare';
                    const href = isCompare ? compareHref : item.href;
                    const active = pathname === item.href.split('?')[0];

                    return (
                      <li
                        key={item.href}
                        className={cn(
                          'transition-all duration-500',
                          mobileOpen
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-5 opacity-0',
                        )}
                        style={{
                          transitionDelay: mobileOpen
                            ? `${140 + index * 45}ms`
                            : '0ms',
                        }}
                      >
                        <Link
                          href={href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={active ? 'page' : undefined}
                          className={cn(
                            'group flex min-h-14 items-center justify-between py-3 px-1 sm:min-h-16 sm:py-4',
                            'font-display text-[1.35rem] font-medium tracking-[-0.025em] sm:text-2xl',
                            'transition-colors duration-300',
                            active
                              ? 'text-volt'
                              : 'text-chrome hover:text-volt',
                          )}
                        >
                          <span>{item.label}</span>

                          <span
                            className={cn(
                              'font-data text-base leading-none',
                              'transition-all duration-300',
                              active
                                ? 'translate-x-0 text-volt opacity-100'
                                : 'translate-x-1 text-steel-muted opacity-50 group-hover:translate-x-0 group-hover:text-volt group-hover:opacity-100',
                            )}
                            aria-hidden="true"
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-12 flex items-end justify-between gap-6 border-t border-hairline pt-6 sm:mt-14">
                <p className="max-w-xs font-data text-[0.58rem] uppercase leading-relaxed tracking-[0.14em] text-steel-muted">
                  Mobility, selected with intention.
                </p>

                <Link
                  href="/cars"
                  onClick={() => setMobileOpen(false)}
                  className="shrink-0 font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted transition-colors duration-300 hover:text-volt"
                >
                  Explore
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
</header>


    </>
  );
}
