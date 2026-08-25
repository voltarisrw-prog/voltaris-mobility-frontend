'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { VehicleCard } from '@/components/VehicleCard';
import { cn } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * An aisle: a titled, horizontally scrolling run of vehicles.
 *
 * The scroller is native overflow with scroll-snap, so touch swipe, trackpad, and
 * keyboard arrows all work without a carousel library and without shipping animation
 * JS. The desktop arrows only nudge `scrollLeft`; if the JS never loads, the rail is
 * still fully usable by dragging.
 */
export function AisleRail({
  title,
  line,
  href,
  vehicles,
  priority = false,
}: {
  title: string;
  line: string;
  href: string;
  vehicles: VehicleSummary[];
  priority?: boolean;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const node = rail.current;
    if (!node) return;
    setAtStart(node.scrollLeft < 8);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 8);
  }, []);

  const nudge = (direction: -1 | 1) => {
    const node = rail.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.8, behavior: 'smooth' });
  };

  if (vehicles.length === 0) return null;

  return (
    <section aria-labelledby={`aisle-${title.replace(/\s+/g, '-').toLowerCase()}`} className="py-10">
      <div className="shell flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id={`aisle-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="font-display text-headline"
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-steel">{line}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={href}
            className="font-data text-eyebrow uppercase text-volt transition-opacity hover:opacity-70"
          >
            View all
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            <button
              type="button"
              onClick={() => nudge(-1)}
              disabled={atStart}
              aria-label={`Scroll ${title} left`}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center border border-hairline transition-colors',
                atStart ? 'text-steel-muted opacity-40' : 'text-chrome hover:border-volt hover:text-volt',
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => nudge(1)}
              disabled={atEnd}
              aria-label={`Scroll ${title} right`}
              className={cn(
                'inline-flex h-9 w-9 items-center justify-center border border-hairline transition-colors',
                atEnd ? 'text-steel-muted opacity-40' : 'text-chrome hover:border-volt hover:text-volt',
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/*
        The rail bleeds to the viewport edge on mobile so a partially visible next card
        signals "there is more here" — the single most effective affordance for a
        horizontal scroller, and cheaper than any hint animation.
      */}
      <ul
        ref={rail}
        onScroll={sync}
        tabIndex={0}
        aria-label={`${title} vehicles`}
        className="rail mt-8 px-5 sm:px-8 [scroll-padding-inline:1.25rem] lg:mx-auto lg:max-w-shell"
      >
        {vehicles.map((vehicle, index) => (
          <li key={vehicle.id} className="w-[16.5rem] shrink-0 sm:w-[19rem]">
            <VehicleCard vehicle={vehicle} priority={priority && index < 2} />
          </li>
        ))}
      </ul>
    </section>
  );
}
