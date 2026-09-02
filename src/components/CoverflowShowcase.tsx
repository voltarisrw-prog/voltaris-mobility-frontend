'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * The mechanics behind every coverflow on the site: center dominant, previous
 * and next receded and rotated on either side, everything beyond that parked
 * out of view as an animation buffer rather than unmounted, manual prev/next,
 * click-a-side-card-to-center-it, arrow-key navigation, and a
 * prefers-reduced-motion opt-out (the site's global reduced-motion rule only
 * targets `animation`, not `transition`, so this needs its own).
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
        className="relative mx-auto flex h-[26rem] max-w-shell items-center justify-center overflow-hidden sm:h-[30rem] lg:h-[36rem]"
        style={{ perspective: '1800px' }}
      >
        {items.map((item, index) => {
          const offset = circularOffset(index, safeCurrent, count);
          const isCenter = offset === 0;
          // Beyond ±1 a card exists only so the next step in either direction
          // has something to animate in from — it is never meant to be seen.
          const hidden = Math.abs(offset) > 1;
          const style: React.CSSProperties = {
            transform: `translateX(${offset * 62}%) scale(${isCenter ? 1 : 0.74}) rotateY(${offset * -22}deg)`,
            opacity: hidden ? 0 : isCenter ? 1 : 0.55,
            zIndex: 20 - Math.abs(offset) * 5,
            pointerEvents: hidden ? 'none' : 'auto',
          };
          const key = getKey(item);

          if (isCenter) {
            return (
              <div
                key={key}
                style={style}
                className={`absolute shrink-0 overflow-hidden border border-hairline bg-abyss shadow-[0_30px_60px_-15px_rgba(0,3,12,0.7)] transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none ${centerSizeClassName}`}
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
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-surface/70 text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt sm:left-4 sm:flex lg:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-surface/70 text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt sm:right-4 sm:flex lg:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Mobile: the hero arrows above are hidden below `sm` (thumb reach on a
          narrow screen makes edge-of-viewport buttons awkward) — swipe the
          side cards or tap one to bring it to center instead. A visible pair
          of on-card controls stands in for the arrows there. */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="inline-flex h-10 w-10 items-center justify-center border border-hairline text-chrome"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="inline-flex h-10 w-10 items-center justify-center border border-hairline text-chrome"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
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
