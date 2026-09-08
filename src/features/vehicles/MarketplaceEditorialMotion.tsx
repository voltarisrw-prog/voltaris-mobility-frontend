'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type Props = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const editorialLines = [
  'Electric mobility, curated',
  'A closer look at what moves Rwanda',
  'Designed for the road ahead',
  'Find the vehicle that fits your next move',
];

const AUTO_ADVANCE_MS = 6500;
const TRANSITION_MS = 1000;

export function MarketplaceEditorialMotion({
  vehicles,
  mode,
}: Props) {
  const sourceVehicles = useMemo(
    () => vehicles.slice(0, Math.min(8, vehicles.length)),
    [vehicles],
  );

  const loopVehicles = useMemo(
    () => [...sourceVehicles, ...sourceVehicles.slice(0, 2)],
    [sourceVehicles],
  );

  const [active, setActive] = useState(0);
  const [line, setLine] = useState(0);
  const [paused, setPaused] = useState(false);
  const [transitioning, setTransitioning] = useState(true);
  const resetTimer = useRef<number | null>(null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (
      sourceVehicles.length < 2 ||
      paused ||
      reducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [sourceVehicles.length, paused, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setLine((current) => (current + 1) % editorialLines.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    if (active !== sourceVehicles.length) return;

    resetTimer.current = window.setTimeout(() => {
      setTransitioning(false);
      setActive(0);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(true);
        });
      });
    }, TRANSITION_MS);

    return () => {
      if (resetTimer.current) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, [active, sourceVehicles.length]);

  if (!sourceVehicles.length) return null;

  const previous = () => {
    setTransitioning(true);

    if (active === 0) {
      setTransitioning(false);
      setActive(sourceVehicles.length);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(true);
          setActive(sourceVehicles.length - 1);
        });
      });

      return;
    }

    setActive((current) => current - 1);
  };

  const next = () => {
    setTransitioning(true);
    setActive((current) => current + 1);
  };

  const visibleActiveIndex =
    active >= sourceVehicles.length
      ? 0
      : active;

  return (
    <section
      className="mt-10"
      aria-label={
        mode === 'rental'
          ? 'Featured rental vehicles'
          : 'Featured vehicles'
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="mb-6 flex items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-volt">
            {mode === 'rental'
              ? 'The rental edit'
              : 'The electric edit'}
          </p>

          <div className="mt-2 min-h-[2.2rem] overflow-hidden">
            <p
              key={editorialLines[line]}
              className="marketplace-editorial-text font-display text-xl tracking-tight text-chrome sm:text-2xl"
            >
              {editorialLines[line]}
            </p>
          </div>
        </div>

        {sourceVehicles.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous vehicle"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-chrome shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:border-volt hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
            >
              <ArrowUp
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next vehicle"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-chrome shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:border-volt hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
            >
              <ArrowDown
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden">
        <div
          className={[
            'marketplace-editorial-stock',
            transitioning && !reducedMotion
              ? 'transition-transform duration-1000 ease-[cubic-bezier(.22,.61,.36,1)]'
              : '',
          ].join(' ')}
          style={{
            transform: `translateY(calc(-${active} * (min(68svh, 760px) + 24px)))`,
          }}
        >
          {loopVehicles.map((vehicle, index) => (
            <article
              key={`${vehicle.id}-${index}`}
              className="marketplace-editorial-stock-item"
              aria-hidden={
                index !== active &&
                index !== active + 1
              }
            >
              <div className="relative">
                <MarketplaceVehicleCard
                  vehicle={vehicle}
                  priority={index < 2}
                  featured
                  mode={mode}
                />

              </div>
            </article>
          ))}
        </div>

        {sourceVehicles.length > 1 ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface via-surface/80 to-transparent" />
        ) : null}
      </div>

      {sourceVehicles.length > 1 ? (
        <div className="mt-5 flex items-center justify-between gap-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="h-px w-10 shrink-0 bg-volt" />

            <span className="truncate font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
              More vehicles below
            </span>
          </div>

          <span className="shrink-0 font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
            {String(visibleActiveIndex + 1).padStart(2, '0')}
          </span>
        </div>
      ) : null}
    </section>
  );
}
