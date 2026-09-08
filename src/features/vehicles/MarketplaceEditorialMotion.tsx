'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const AUTO_ADVANCE_MS = 11000;
const RESUME_AFTER_INTERACTION_MS = 15000;

export function MarketplaceEditorialMotion({
  vehicles,
  mode,
}: Props) {
  const sourceVehicles = useMemo(
    () => vehicles.slice(0, Math.min(8, vehicles.length)),
    [vehicles],
  );

  const [virtualIndex, setVirtualIndex] = useState(0);
  const [line, setLine] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(true);

  const resumeTimerRef = useRef<number | null>(null);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stockCount = sourceVehicles.length;

  const activeIndex =
    stockCount > 0
      ? ((virtualIndex % stockCount) + stockCount) % stockCount
      : 0;

  const scheduleResume = useCallback(() => {
    setAutoPlaying(false);

    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current);
    }

    resumeTimerRef.current = window.setTimeout(() => {
      setAutoPlaying(true);
    }, RESUME_AFTER_INTERACTION_MS);
  }, []);

  const moveBy = useCallback(
    (delta: number) => {
      if (stockCount < 2) return;

      scheduleResume();

      setVirtualIndex((current) => current + delta);
    },
    [scheduleResume, stockCount],
  );

  useEffect(() => {
    if (reducedMotion || !autoPlaying || stockCount < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setVirtualIndex((current) => current + 1);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [autoPlaying, reducedMotion, stockCount]);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setLine((current) => (current + 1) % editorialLines.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  if (!sourceVehicles.length) return null;

  return (
    <section
      className="marketplace-infinite-showroom"
      aria-label={
        mode === 'rental'
          ? 'Featured rental vehicles'
          : 'Featured vehicles'
      }
      onWheel={(event) => {
        if (Math.abs(event.deltaY) < 12) return;

        moveBy(event.deltaY > 0 ? 1 : -1);
      }}
    >
      <div className="marketplace-infinite-showroom-sticky">
        <div className="marketplace-infinite-showroom-heading">
          <div>
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
        </div>

        <div className="marketplace-infinite-showroom-stage">
          {sourceVehicles.map((vehicle, index) => {
            let relative = index - activeIndex;

            if (relative > stockCount / 2) {
              relative -= stockCount;
            }

            if (relative < -stockCount / 2) {
              relative += stockCount;
            }

            const distance = Math.abs(relative);
            const isActive = relative === 0;
            const isNext = relative > 0;
            const isPrevious = relative < 0;

            const scale = isActive
              ? 1
              : Math.max(
                  0.68,
                  0.94 - distance * 0.12,
                );

            const opacity = isActive
              ? 1
              : Math.max(
                  0.12,
                  0.72 - distance * 0.16,
                );

            const blur = isActive
              ? 0
              : Math.min(
                  4,
                  distance * 1.1,
                );

            const translateY = isActive
              ? 0
              : relative > 0
                ? 64 + distance * 22
                : -64 - distance * 22;

            const translateX = isActive
              ? 0
              : isNext
                ? 1.2
                : -1.2;

            const zIndex = isActive
              ? 100
              : Math.max(
                  10,
                  80 - distance * 10,
                );

            return (
              <article
                key={vehicle.id}
                className={[
                  'marketplace-infinite-showroom-card',
                  isActive
                    ? 'marketplace-infinite-showroom-card-active'
                    : '',
                  isNext
                    ? 'marketplace-infinite-showroom-card-next'
                    : '',
                  isPrevious
                    ? 'marketplace-infinite-showroom-card-previous'
                    : '',
                ].join(' ')}
                aria-hidden={!isActive}
                style={{
                  transform: `translate3d(${translateX}%, ${translateY}%, 0) scale(${scale})`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <MarketplaceVehicleCard
                  vehicle={vehicle}
                  priority={distance <= 1}
                  featured
                  mode={mode}
                />
              </article>
            );
          })}
        </div>

        {stockCount > 1 ? (
          <div className="marketplace-infinite-showroom-controls">
            <button
              type="button"
              onClick={() => moveBy(-1)}
              aria-label="Previous vehicle"
              className="marketplace-infinite-showroom-control marketplace-infinite-showroom-control-previous"
            >
              <ArrowUp
                className="h-4 w-4"
                aria-hidden="true"
              />
              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() => moveBy(1)}
              aria-label="Next vehicle"
              className="marketplace-infinite-showroom-control marketplace-infinite-showroom-control-next"
            >
              <span>Next</span>
              <ArrowDown
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
