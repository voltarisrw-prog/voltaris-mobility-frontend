'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, User, X } from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { siteNav, isGroup, type NavGroup } from '@/content/nav';
import { cn } from '@/lib/format';
import { useCompareIds, useCompareMode } from '@/lib/compare/useCompare';

/**
 * The header. One tree (content/nav.ts), three renderings:
 *
 *  ≥1024  logo · centred nav with disclosure panels · account.
 *         Panels open on hover (with intent delay) and on click/Enter, close
 *         on Escape, on click outside, when focus leaves, and on navigation.
 *  <1024  logo · account · menu. The menu is a full-screen sheet: groups are
 *         accordions in display type, plain links sit beside them, the
 *         account link closes the sheet. Body scroll is locked, Escape closes,
 *         focus lands on Close and returns to the trigger.
 *
 * Fixed over the home hero (the hero reserves the space), sticky elsewhere;
 * compacts after 24px of scroll.
 */

const HOVER_OPEN_MS = 70;
const HOVER_CLOSE_MS = 140;

function isActive(pathname: string, match?: string[]): boolean {
  if (!match) return false;
  return match.some((m) => (m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(m + '/')));
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [compact, setCompact] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetGroup, setSheetGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const compareIds = useCompareIds();
  const compareMode = useCompareMode();
  const compareHref =
    compareIds.length > 0 ? `/compare?ids=${compareIds.join(',')}&mode=${compareMode ?? 'sale'}` : '/compare';

  // Compact after a little scroll; rAF-gated so it never competes with input.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setCompact(window.scrollY > 24);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Everything closes on navigation — adjust-state-during-render, keyed on the
  // pathname, rather than an effect that would paint the open menu once first.
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpenGroup(null);
    setSheetOpen(false);
    setSheetGroup(null);
  }

  // Desktop panels: Escape, click outside, focus leaving the header.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null);
        (headerRef.current?.querySelector(`[data-group="${openGroup}"]`) as HTMLElement | null)?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [openGroup]);

  // Sheet: scroll lock, Escape, focus management.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const trigger = menuButtonRef.current;
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [sheetOpen]);

  const clearHover = () => {
    if (hoverTimer.current) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };
  const hoverOpen = useCallback((label: string) => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(label), HOVER_OPEN_MS);
  }, []);
  const hoverClose = useCallback(() => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(null), HOVER_CLOSE_MS);
  }, []);

  const headerHeight = compact ? 'h-14 lg:h-16' : 'h-16 lg:h-[4.75rem]';
  // Over the home hero the bar is transparent with white type until scrolled.
  const onHero = isHome && !compact;

  return (
    <header
      ref={headerRef}
      className={cn(
        'z-40 border-b border-hairline/80 transition-[background-color,box-shadow,border-color] duration-300 ease-out',
        isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0',
        onHero ? 'border-transparent bg-transparent' : 'bg-surface',
      )}
      onBlur={(e) => {
        // Focus left the header entirely (keyboard users tabbing past): close panels.
        if (!headerRef.current?.contains(e.relatedTarget as Node | null)) setOpenGroup(null);
      }}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:bg-chrome focus:px-4 focus:py-2 focus:font-data focus:text-eyebrow focus:uppercase focus:text-surface"
      >
        Skip to content
      </a>

      <div className={cn('shell grid items-center transition-[height] duration-300 ease-out', headerHeight, 'grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr]')}>
        {/* Brand */}
        <Link
          href="/"
          aria-label="Voltaris Mobility, home"
          className="inline-flex min-h-11 w-fit items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <span className={cn(onHero && 'logo-on-dark')}>
            <VoltarisLogo className={cn('transition-[height] duration-300 ease-out', compact ? 'h-6 lg:h-7' : 'h-7 lg:h-8')} />
          </span>
        </Link>

        {/* Desktop nav, centred */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {siteNav.map((entry) => {
              const active = isActive(pathname, entry.match);
              if (!isGroup(entry)) {
                const href = entry.href === '/compare' ? compareHref : entry.href;
                return (
                  <li key={entry.label}>
                    <Link
                      href={href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'group relative inline-flex h-10 items-center gap-1.5 px-3 font-data text-[0.8125rem] font-medium uppercase tracking-[0.1em] transition-colors duration-150',
                        onHero ? (active ? 'text-white' : 'text-white/80 hover:text-white') : active ? 'text-chrome' : 'text-steel hover:text-chrome',
                      )}
                    >
                      {entry.label}
                      {entry.href === '/compare' && compareIds.length > 0 && (
                        <span className="inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-chrome px-1 font-data text-[0.6rem] text-surface">
                          {compareIds.length}
                        </span>
                      )}
                      <span
                        aria-hidden="true"
                        className={cn(
                          'absolute inset-x-3 bottom-1 h-px origin-left transition-transform duration-300 ease-out',
                          onHero ? 'bg-white' : 'bg-volt',
                          active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                        )}
                      />
                    </Link>
                  </li>
                );
              }
              return (
                <DesktopGroup
                  key={entry.label}
                  group={entry}
                  active={active}
                  onHero={onHero}
                  open={openGroup === entry.label}
                  onOpen={() => {
                    clearHover();
                    setOpenGroup(entry.label);
                  }}
                  onToggle={() => {
                    clearHover();
                    setOpenGroup((g) => (g === entry.label ? null : entry.label));
                  }}
                  onHoverIn={() => hoverOpen(entry.label)}
                  onHoverOut={hoverClose}
                />
              );
            })}
          </ul>
        </nav>

        {/* Right: account (all sizes), menu (<1024) */}
        <div className="flex items-center justify-end gap-1">
          <Link
            href="/account"
            aria-label="Your account"
            className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt', onHero ? 'text-white hover:bg-white/10' : 'text-steel hover:bg-slab hover:text-chrome')}
          >
            <User className="h-[19px] w-[19px]" strokeWidth={1.75} aria-hidden="true" />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={sheetOpen}
            aria-controls="site-menu"
            onClick={() => setSheetOpen(true)}
            className={cn('inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt lg:hidden', onHero ? 'text-white hover:bg-white/10' : 'text-chrome hover:bg-slab')}
          >
            <Menu className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Phone / tablet sheet */}
      {sheetOpen && (
        <div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[90] flex h-[100dvh] flex-col bg-surface animate-backdrop-in lg:hidden"
        >
          <div className="shell flex h-16 shrink-0 items-center justify-between border-b border-hairline">
            <Link href="/" aria-label="Voltaris Mobility, home" onClick={() => setSheetOpen(false)} className="inline-flex min-h-11 items-center">
              <VoltarisLogo className="h-7" />
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setSheetOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-chrome transition-colors hover:bg-slab focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt"
            >
              <X className="h-[22px] w-[22px]" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="shell flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain pb-8 pt-2">
            <ul className="divide-y divide-hairline">
              {siteNav.map((entry, i) => {
                const active = isActive(pathname, entry.match);
                const delay = { animationDelay: `${60 + i * 45}ms` };
                if (!isGroup(entry)) {
                  const href = entry.href === '/compare' ? compareHref : entry.href;
                  return (
                    <li key={entry.label} className="animate-rise-in" style={delay}>
                      <Link
                        href={href}
                        onClick={() => setSheetOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-[3.75rem] items-center justify-between font-display text-[1.375rem] font-semibold tracking-[-0.02em]',
                          active ? 'text-chrome' : 'text-chrome/85',
                        )}
                      >
                        <span className="flex items-center gap-3">
                          {entry.label}
                          {entry.href === '/compare' && compareIds.length > 0 && (
                            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-chrome px-1.5 font-data text-[0.65rem] text-surface">
                              {compareIds.length}
                            </span>
                          )}
                        </span>
                        <ArrowUpRight className="h-5 w-5 text-steel-muted" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                }
                const expanded = sheetGroup === entry.label;
                const panelId = `sheet-${entry.label.toLowerCase()}`;
                return (
                  <li key={entry.label} className="animate-rise-in" style={delay}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      onClick={() => setSheetGroup(expanded ? null : entry.label)}
                      className={cn(
                        'flex min-h-[3.75rem] w-full items-center justify-between text-left font-display text-[1.375rem] font-semibold tracking-[-0.02em]',
                        active || expanded ? 'text-chrome' : 'text-chrome/85',
                      )}
                    >
                      {entry.label}
                      <ChevronDown
                        className={cn('h-5 w-5 text-steel-muted transition-transform duration-300 ease-out', expanded && 'rotate-180')}
                        aria-hidden="true"
                      />
                    </button>
                    <div
                      id={panelId}
                      className={cn('grid transition-[grid-template-rows] duration-300 ease-out', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                    >
                      <ul className="min-h-0 overflow-hidden">
                        {entry.items.map((item) => {
                          const itemActive = pathname === item.href;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setSheetOpen(false)}
                                aria-current={itemActive ? 'page' : undefined}
                                className="flex min-h-12 flex-col justify-center py-2.5 pl-4"
                              >
                                <span className={cn('text-base font-medium', itemActive ? 'text-volt-deep' : 'text-chrome')}>{item.label}</span>
                                {item.description && <span className="mt-0.5 text-sm text-steel-muted">{item.description}</span>}
                              </Link>
                            </li>
                          );
                        })}
                        <li aria-hidden="true" className="h-3" />
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-auto pt-8 animate-rise-in" style={{ animationDelay: '320ms' }}>
              <Link
                href="/account"
                onClick={() => setSheetOpen(false)}
                className="vds-button vds-button-secondary w-full justify-between"
              >
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" /> Sign in or create an account
                </span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-5 font-data text-[0.62rem] uppercase tracking-[0.16em] text-steel-muted">Kigali · Rwanda</p>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function DesktopGroup({
  group,
  active,
  onHero,
  open,
  onOpen,
  onToggle,
  onHoverIn,
  onHoverOut,
}: {
  group: NavGroup;
  active: boolean;
  onHero: boolean;
  open: boolean;
  onOpen: () => void;
  onToggle: () => void;
  onHoverIn: () => void;
  onHoverOut: () => void;
}) {
  const id = useId();
  const pathname = usePathname();
  const wide = group.items.length > 3;
  return (
    <li className="relative" onPointerEnter={onHoverIn} onPointerLeave={onHoverOut}>
      <button
        type="button"
        data-group={group.label}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            onOpen();
            requestAnimationFrame(() => {
              (document.getElementById(id)?.querySelector('a') as HTMLElement | null)?.focus();
            });
          }
        }}
        className={cn(
          'group relative inline-flex h-10 items-center gap-1 px-3 font-data text-[0.8125rem] font-medium uppercase tracking-[0.1em] transition-colors duration-150',
          onHero ? (active || open ? 'text-white' : 'text-white/80 hover:text-white') : active || open ? 'text-chrome' : 'text-steel hover:text-chrome',
        )}
      >
        {group.label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-300 ease-out', onHero ? 'text-white/70' : 'text-steel-muted', open && (onHero ? 'rotate-180 text-white' : 'rotate-180 text-chrome'))}
          aria-hidden="true"
        />
        <span
          aria-hidden="true"
          className={cn(
            'absolute inset-x-3 bottom-1 h-px origin-left transition-transform duration-300 ease-out',
            onHero ? 'bg-white' : 'bg-volt',
            active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
          )}
        />
      </button>

      {/* Panel. The invisible bridge keeps the hover alive across the gap. */}
      <div
        id={id}
        hidden={!open}
        className={cn(
          'absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3',
          open && 'animate-panel-in',
        )}
      >
        <div
          className={cn(
            'border border-chrome bg-surface p-2',
            wide ? 'grid w-[38rem] grid-cols-2 gap-1' : 'w-[22rem]',
          )}
        >
          {group.items.map((item) => {
            const itemActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={itemActive ? 'page' : undefined}
                className="group/item flex items-start justify-between gap-4 px-3 py-3 transition-colors duration-150 hover:bg-slab focus-visible:bg-slab focus-visible:outline-none"
              >
                <span className="min-w-0">
                  <span className={cn('block text-[0.9375rem] font-medium leading-tight', itemActive ? 'text-volt-deep' : 'text-chrome')}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="mt-1 block text-[0.8125rem] leading-snug text-steel-muted">{item.description}</span>
                  )}
                </span>
                <ArrowUpRight
                  className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 translate-y-1 text-steel-muted opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:translate-y-0 group-hover/item:opacity-100 group-focus-visible/item:opacity-100"
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </li>
  );
}
