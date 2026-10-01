'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookmarkCheck,
  BookOpen,
  Calculator,
  CalendarClock,
  CarFront,
  Info,
  KeyRound,
  MessageCircle,
  Newspaper,
  Tag,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { VoltarisLogo } from './VoltarisLogo';
import { siteNav, isGroup, type NavGroup } from '@/content/nav';
import { useCompareIds, useCompareMode } from '@/lib/compare/useCompare';
import s from './site-header.module.css';

/**
 * The header: a floating glass bar. One tree (content/nav.ts), three renderings —
 * see site-header.module.css for the layout at each size.
 *
 * Panels open on hover (with intent delay) and on click/Enter/ArrowDown, close on
 * Escape, click outside, focus leaving, and navigation. The phone/tablet sheet
 * locks scroll, closes on Escape, and returns focus to the menu button.
 * Fixed over the home hero (the hero reserves the space), sticky elsewhere.
 */

const HOVER_OPEN_MS = 70;
const HOVER_CLOSE_MS = 160;

/** Icons for every destination; labels say the rest. */
const ICONS: Record<string, LucideIcon> = {
  '/buy': KeyRound,
  '/rent': CalendarClock,
  '/sell': Tag,
  '/test-drive': CarFront,
  '/cars': BookmarkCheck,
  '/garage': Wrench,
  '/finance': Calculator,
  '/about': Info,
  '/contact': MessageCircle,
  '/guides': BookOpen,
  '/blog': Newspaper,
};
const TRIO_KEYS: Record<string, string> = { '/buy': 'buy', '/rent': 'rent', '/sell': 'sell' };

function isActive(pathname: string, match?: string[]): boolean {
  if (!match) return false;
  return match.some((m) =>
    m === '/' ? pathname === '/' : pathname === m || pathname.startsWith(m + '/'),
  );
}

function Chev({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M2 4.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const marketplace = siteNav.find(
  (e): e is NavGroup => isGroup(e) && e.items.some((i) => i.href === '/buy'),
);
const trio = (marketplace?.items ?? []).filter((i) => TRIO_KEYS[i.href]);

/** Buy · Rent · Sell — the three big tiles (desktop panel and the phone sheet). */
function TrioTiles({ pathname, onGo }: { pathname: string; onGo?: () => void }) {
  return (
    <>
      {trio.map((item, i) => {
        const Icon = ICONS[item.href] ?? ArrowUpRight;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onGo}
            className={s.tile}
            data-k={TRIO_KEYS[item.href]}
            style={{ '--i': i } as React.CSSProperties}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <span className={s.tileTop}>
              <span className={s.glyph}>
                <Icon strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className={s.go}>
                <ArrowUpRight strokeWidth={2} aria-hidden="true" />
              </span>
            </span>
            <span className={s.word}>{item.label}</span>
            <Icon aria-hidden="true" />
          </Link>
        );
      })}
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [compact, setCompact] = useState(false);
  const [dockAway, setDockAway] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetGroup, setSheetGroup] = useState<string | null>(null);
  const [glide, setGlide] = useState<{ x: number; w: number; on: boolean }>({
    x: 0,
    w: 0,
    on: false,
  });
  const rootRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const chargeRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const panelId = useId();
  const compareIds = useCompareIds();
  const compareMode = useCompareMode();
  const compareHref =
    compareIds.length > 0
      ? `/compare?ids=${compareIds.join(',')}&mode=${compareMode ?? 'sale'}`
      : '/compare';

  // Scroll: compact bar, battery fill, dock away while scrolling down.
  useEffect(() => {
    let frame = 0;
    let lastY = window.scrollY;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        setCompact(y > 24);
        if (Math.abs(y - lastY) > 6) {
          setDockAway(y > lastY && y > 140);
          lastY = y;
        }
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const p = max > 0 ? y / max : 0;
        chargeRef.current?.querySelectorAll('s').forEach((cell, i) => {
          cell.style.setProperty('--f', String(Math.max(0, Math.min(1, p * 10 - i))));
        });
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Everything closes on navigation (adjust state during render, keyed on the path).
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setOpenGroup(null);
    setSheetOpen(false);
    setSheetGroup(null);
  }

  // The gliding highlight: rests on the current section, follows the pointer.
  const restGlide = useCallback(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[data-active], [aria-current="page"]');
    if (el) setGlide({ x: el.offsetLeft, w: el.offsetWidth, on: true });
    else setGlide((g) => ({ ...g, on: false }));
  }, []);
  const moveGlide = (el: HTMLElement) =>
    setGlide({ x: el.offsetLeft, w: el.offsetWidth, on: true });
  useLayoutEffect(() => {
    restGlide();
  }, [pathname, compareIds.length, restGlide]);
  useEffect(() => {
    const ro = new ResizeObserver(() => restGlide());
    if (navRef.current) ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [restGlide]);

  // Desktop panels: Escape, click outside.
  useEffect(() => {
    if (!openGroup) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenGroup(null);
        rootRef.current?.querySelector<HTMLElement>(`[data-group="${openGroup}"]`)?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpenGroup(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [openGroup]);

  // Sheet: scroll lock, Escape, focus in and back out.
  useEffect(() => {
    if (!sheetOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const trigger = menuButtonRef.current;
    const t = window.setTimeout(
      () => sheetRef.current?.querySelector<HTMLElement>('a')?.focus(),
      350,
    );
    return () => {
      window.clearTimeout(t);
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
  const hoverOpen = (label: string) => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(label), HOVER_OPEN_MS);
  };
  const hoverClose = () => {
    clearHover();
    hoverTimer.current = window.setTimeout(() => setOpenGroup(null), HOVER_CLOSE_MS);
  };

  const toggleSheet = () => {
    // The sheet grows out of the menu button.
    const r = menuButtonRef.current?.getBoundingClientRect();
    if (r && rootRef.current) {
      rootRef.current.style.setProperty('--ox', `${r.left + r.width / 2}px`);
      rootRef.current.style.setProperty('--oy', `${r.top + r.height / 2}px`);
    }
    setSheetOpen((o) => !o);
  };

  const onHero = isHome && !compact && !sheetOpen;
  const darkLogo = onHero || sheetOpen;
  const open = openGroup
    ? (siteNav.find((e): e is NavGroup => isGroup(e) && e.label === openGroup) ?? null)
    : null;

  const rootClass = [
    s.root,
    'z-40',
    isHome ? s.fixed : s.sticky,
    compact && s.compact,
    onHero && s.hero,
    sheetOpen && s.open,
    dockAway && s.dockAway,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header
      ref={rootRef}
      className={rootClass}
      data-site-header=""
      style={sheetOpen ? { zIndex: 60 } : undefined}
      onBlur={(e) => {
        if (!rootRef.current?.contains(e.relatedTarget as Node | null)) setOpenGroup(null);
      }}
    >
      <a href="#main" className={s.skip}>
        Skip to content
      </a>

      <div className={s.bar}>
        <Link
          href="/"
          aria-label="Voltaris Mobility, home"
          className={s.logo}
          onClick={() => setSheetOpen(false)}
        >
          <span className={darkLogo ? 'logo-on-dark' : undefined}>
            <VoltarisLogo className={s.logoMark} />
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          ref={navRef}
          aria-label="Main"
          className={s.nav}
          onPointerLeave={() => {
            restGlide();
            hoverClose();
          }}
        >
          <span
            className={s.glide}
            aria-hidden="true"
            style={{
              transform: `translateX(${glide.x}px)`,
              width: glide.w,
              opacity: glide.on ? 1 : 0,
            }}
          />
          <ul>
            {siteNav.map((entry) => {
              const active = isActive(pathname, entry.match);
              if (!isGroup(entry)) {
                const href = entry.href === '/compare' ? compareHref : entry.href;
                return (
                  <li key={entry.label}>
                    <Link
                      href={href}
                      className={s.link}
                      aria-current={active ? 'page' : undefined}
                      onPointerEnter={(e) => {
                        moveGlide(e.currentTarget);
                        hoverClose();
                      }}
                      onFocus={(e) => moveGlide(e.currentTarget)}
                    >
                      {entry.label}
                      {entry.href === '/compare' && compareIds.length > 0 && (
                        <span className={s.badge}>{compareIds.length}</span>
                      )}
                    </Link>
                  </li>
                );
              }
              const isOpen = openGroup === entry.label;
              return (
                <li key={entry.label}>
                  <button
                    type="button"
                    className={s.link}
                    data-group={entry.label}
                    data-active={active ? '' : undefined}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onPointerEnter={(e) => {
                      moveGlide(e.currentTarget);
                      hoverOpen(entry.label);
                    }}
                    onFocus={(e) => moveGlide(e.currentTarget)}
                    onClick={() => {
                      clearHover();
                      setOpenGroup((g) => (g === entry.label ? null : entry.label));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        clearHover();
                        setOpenGroup(entry.label);
                        requestAnimationFrame(() =>
                          document
                            .getElementById(panelId)
                            ?.querySelector<HTMLElement>('a')
                            ?.focus(),
                        );
                      }
                    }}
                  >
                    {entry.label}
                    <Chev className={s.chev} />
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <Link
          href="/account"
          prefetch={false}
          aria-label="Your account"
          className={`${s.icon} ${s.account}`}
        >
          <User strokeWidth={1.7} aria-hidden="true" />
        </Link>
        <Link href="/test-drive" className={s.cta}>
          <span>Book a test drive</span>
          <i>
            <ArrowUpRight strokeWidth={2.2} aria-hidden="true" />
          </i>
        </Link>
        <button
          ref={menuButtonRef}
          type="button"
          className={`${s.icon} ${s.burger}`}
          aria-label={sheetOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={sheetOpen}
          aria-controls="site-menu"
          onClick={toggleSheet}
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path className={s.l1} d="M3 7h14" />
            <path className={s.l2} d="M3 13h14" />
          </svg>
        </button>

        <div ref={chargeRef} className={s.charge} aria-hidden="true">
          {Array.from({ length: 10 }, (_, i) => (
            <s key={i} />
          ))}
        </div>

        {/* Desktop panel */}
        <div
          className={s.panelWrap}
          onPointerEnter={clearHover}
          onPointerLeave={() => {
            restGlide();
            hoverClose();
          }}
        >
          <div id={panelId} className={s.panel} hidden={!open} key={open?.label}>
            {open && open === marketplace ? (
              <div className={s.trio}>
                <TrioTiles pathname={pathname} />
              </div>
            ) : open ? (
              <div className={s.quad}>
                {open.items.map((item, i) => {
                  const Icon = ICONS[item.href] ?? ArrowUpRight;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={s.chip}
                      style={{ '--i': i } as React.CSSProperties}
                      aria-current={pathname === item.href ? 'page' : undefined}
                    >
                      <span className={s.chipIcon}>
                        <Icon strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <b>{item.label}</b>
                      <ArrowUpRight strokeWidth={2} aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Phone / tablet sheet */}
      <div
        ref={sheetRef}
        id="site-menu"
        className={s.sheet}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        aria-hidden={!sheetOpen}
        inert={!sheetOpen}
      >
        <div className={s.sheetScroll}>
          <div className={s.sheetTrio}>
            <TrioTiles pathname={pathname} onGo={() => setSheetOpen(false)} />
          </div>
          {siteNav
            .filter((entry) => entry !== marketplace)
            .map((entry, i) => {
              const active = isActive(pathname, entry.match);
              const style = { '--i': i } as React.CSSProperties;
              if (!isGroup(entry)) {
                const href = entry.href === '/compare' ? compareHref : entry.href;
                return (
                  <div key={entry.label} className={s.row} style={style}>
                    <Link
                      href={href}
                      onClick={() => setSheetOpen(false)}
                      aria-current={active ? 'page' : undefined}
                    >
                      {entry.label}
                      {entry.href === '/compare' && compareIds.length > 0 && (
                        <span className={s.badge}>{compareIds.length}</span>
                      )}
                      <ArrowUpRight strokeWidth={1.8} aria-hidden="true" />
                    </Link>
                  </div>
                );
              }
              const expanded = sheetGroup === entry.label;
              const subId = `sheet-${entry.label.toLowerCase()}`;
              return (
                <div key={entry.label} className={s.row} style={style}>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={subId}
                    data-active={active ? '' : undefined}
                    onClick={() => setSheetGroup(expanded ? null : entry.label)}
                  >
                    {entry.label}
                    <Chev className={s.chev} />
                  </button>
                  <div id={subId} className={s.sub} data-open={expanded ? '' : undefined}>
                    <div>
                      {entry.items.map((item) => {
                        const Icon = ICONS[item.href] ?? ArrowUpRight;
                        return (
                          <Link
                            key={item.label}
                            href={item.href}
                            onClick={() => setSheetOpen(false)}
                            aria-current={pathname === item.href ? 'page' : undefined}
                            tabIndex={expanded ? undefined : -1}
                          >
                            <span>
                              <Icon strokeWidth={1.8} aria-hidden="true" />
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        <Link
          href="/account"
          prefetch={false}
          className={s.signin}
          onClick={() => setSheetOpen(false)}
        >
          <User strokeWidth={1.8} aria-hidden="true" />
          Sign in or create an account
        </Link>
        <p className={s.where}>Kigali · Rwanda</p>
      </div>

      {/* Phone dock: Buy · Rent · Sell */}
      <nav className={s.dock} aria-label="Buy, rent or sell">
        {trio.map((item) => {
          const Icon = ICONS[item.href] ?? ArrowUpRight;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              <Icon strokeWidth={1.9} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
