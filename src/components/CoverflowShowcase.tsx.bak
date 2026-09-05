'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

/** How long each slide stays centered before autoplay advances to the next. */
const AUTOPLAY_INTERVAL_MS = 6000;

/**
 * The mechanics behind every coverflow on the site: center dominant, previous
 * and next receded and rotated on either side, everything beyond that parked
 * out of view as an animation buffer rather than unmounted, manual prev/next,
 * click-a-side-card-to-center-it, arrow-key navigation, and a
 * prefers-reduced-motion opt-out (the site's global reduced-motion rule only
 * targets `animation`, not `transition`, so this needs its own).
 *
 * Also autoplays — advancing on its own every AUTOPLAY_INTERVAL_MS — but
 * only when all of the following hold, so it never fights the person looking
 * at it: `prefers-reduced-motion` is not set (autoplay never starts at all
 * for it, matching the transition opt-out above rather than just slowing
 * down), nobody is hovering or keyboard-focused inside the carousel, and the
 * explicit pause button hasn't been pressed. Any manual navigation (an
 * arrow, a side card) resets the interval rather than stacking on top of it,
 * so acting on the carousel never gets immediately overridden by an
 * autoplay tick a moment later. The pause/play button is not optional
 * polish — WCAG 2.2.2 requires a way to stop anything that auto-updates on
 * a cycle longer than five seconds, and the prev/next arrows don't satisfy
 * that on their own.
 *
 * What differs between the vehicle, blog, and dealer versions is only the
 * card content and its size — supplied by the caller — not the sliding
 * behaviour itself. Extracted here after the second content type needed it,
 * rather than speculatively up front.
 */
export function CoverflowShowcase<T>({
  items,
  getKey,
  ariaLabel,
  peekLabel,
  centerSizeClassName,
  peekSizeClassName,
  renderCenter,
  renderPeek,
}: {
  items: T[];
  getKey: (item: T) => string;
  ariaLabel: string;
  /** Accessible label for a side card's "bring to center" button. */
  peekLabel: (item: T) => string;
  /** Tailwind size classes (h-/w-, responsive) for the center card's box. */
  centerSizeClassName: string;
  /** Tailwind size classes for a side card's box — deliberately separate from
   * the center size (rather than one size scaled down) so each showcase can
   * match its own content's proportions. */
  peekSizeClassName: string;
  /** Full inner content of the center card — image, scrims, and whichever
   * interactive elements make sense for that content type. */
  renderCenter: (item: T) => ReactNode;
  /** Inner content of a side card — a dimmed preview image only; side cards
   * are a single "select" button, not a second set of interactive targets. */
  renderPeek: (item: T) => ReactNode;
}) {
  const [current, setCurrent] = useState(0);
  const count = items.length;

  const go = useCallback(
    (direction: -1 | 1) => {
      if (count === 0) return;
      setCurrent((value) => (value + direction + count) % count);
    },
    [count],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  };

  // Autoplay state — see the component doc comment for exactly what has to
  // be true for it to actually run.
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  // Read once at init (guarded for SSR, where `window` doesn't exist) rather
  // than synchronously in an effect — an effect should only subscribe here,
  // not also perform the initial read; see the change-listener effect below.
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const autoplayActive = count > 1 && !paused && !hovered && !focused && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayActive) return;
    // Depending on `current` restarts this interval on every advance,
    // whether that advance came from autoplay itself or from a manual
    // click — so a manual nudge always buys a full interval before the
    // next automatic one, rather than autoplay ticking again moments later.
    const id = setInterval(() => go(1), AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [autoplayActive, current, go]);

  if (count === 0) return null;

  // Derived, not stored: if a revalidated fetch returns fewer items than the
  // current index, this falls back to a valid one on the next render rather
  // than needing an effect to correct state after the fact.
  const safeCurrent = current % count;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className="relative py-6 sm:py-10"
    >
      <div
        onKeyDown={onKeyDown}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setFocused(false);
          }
        }}
        className="relative mx-auto flex h-[37rem] w-full max-w-shell items-center justify-center overflow-hidden px-1 sm:h-[43rem] sm:px-4 md:h-[49rem] lg:h-[55rem] lg:px-0 [--cylinder-radius:21rem] sm:[--cylinder-radius:28rem] lg:[--cylinder-radius:36rem]"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        {items.map((item, index) => {
          const offset = circularOffset(index, safeCurrent, count);
          const isCenter = offset === 0;
          // Beyond ±1 a card exists only so the next step in either direction
          // has something to animate in from — it is never meant to be seen.
          const hidden = Math.abs(offset) > 2;
          const distance = Math.abs(offset);
          const style: React.CSSProperties = {
            transform: isCenter
              ? 'translateZ(0) scale(1)'
              : `rotateY(${offset * -32}deg) translateZ(var(--cylinder-radius)) scale(${distance === 1 ? 0.84 : 0.68})`,
            opacity: hidden ? 0 : isCenter ? 1 : distance === 1 ? 0.72 : 0.38,
            zIndex: isCenter ? 100 : 30 - distance * 5,
            pointerEvents: hidden ? 'none' : 'auto',
            transformStyle: 'preserve-3d',
          };
          const key = getKey(item);

          if (isCenter) {
            return (
              <div
                key={key}
                style={style}
                className={`absolute isolate z-[100] shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-abyss shadow-[0_40px_100px_-25px_rgba(0,0,0,0.85)] sm:rounded-[1.75rem] lg:rounded-[2rem] transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${centerSizeClassName}`}
              >
                {renderCenter(item)}
              </div>
            );
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => setCurrent(index)}
              aria-label={peekLabel(item)}
              tabIndex={hidden ? -1 : 0}
              style={style}
              className={`absolute shrink-0 overflow-hidden border border-hairline/60 bg-abyss transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${peekSizeClassName}`}
            >
              {renderPeek(item)}
              <div className="absolute inset-0 bg-surface/45" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {count > 1 && (
        <div className="pointer-events-none absolute inset-x-2 top-1/2 z-40 hidden -translate-y-1/2 items-center justify-between md:flex lg:inset-x-6">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous vehicle"
            className="pointer-events-auto group inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface/85 px-4 py-2.5 font-data text-[0.6rem] uppercase tracking-[0.14em] text-steel backdrop-blur-md transition-colors hover:border-volt hover:text-volt"
          >
            <ChevronLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden="true"
            />
            <span>Previous</span>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next vehicle"
            className="pointer-events-auto group inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface/85 px-4 py-2.5 font-data text-[0.6rem] uppercase tracking-[0.14em] text-steel backdrop-blur-md transition-colors hover:border-volt hover:text-volt"
          >
            <span>Next</span>
            <ChevronRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Mobile: the hero arrows above are hidden below `sm` (thumb reach on a
          narrow screen makes edge-of-viewport buttons awkward) — swipe the
          side cards or tap one to bring it to center instead. A visible pair
          of on-card controls stands in for the arrows there. */}
      {count > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-hairline pt-4 md:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous vehicle"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-data text-[0.6rem] uppercase tracking-[0.14em] text-steel transition-colors hover:text-chrome"
          >
            <ChevronLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            Previous
          </button>
          <span className="font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
            Swipe or select
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next vehicle"
            className="group inline-flex min-h-11 items-center gap-2 rounded-full px-2 font-data text-[0.6rem] uppercase tracking-[0.14em] text-steel transition-colors hover:text-chrome"
          >
            Next
            <ChevronRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Always rendered (not just on desktop, unlike the arrows above) —
          the one control here that has to be reachable on every breakpoint
          whenever autoplay is actually running. Not shown at all once
          reduced-motion has taken autoplay off the table, since there is
          nothing left for it to stop. */}
      {count > 1 && !prefersReducedMotion && (
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Play showcase' : 'Pause showcase'}
          aria-pressed={paused}
          className="absolute right-2 top-2 z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface/85 text-steel backdrop-blur-md transition-colors hover:border-volt hover:text-volt sm:right-4 sm:top-4 sm:h-10 sm:w-10 lg:right-6"
        >
          {paused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      )}
    </section>
  );
}

/** Shortest signed distance around the loop — e.g. for 5 items, -2..2. */
function circularOffset(index: number, current: number, length: number): number {
  let diff = (index - current) % length;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}
