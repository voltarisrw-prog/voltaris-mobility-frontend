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
const SCROLL_SETTLE_MS = 1800;

export function MarketplaceEditorialMotion({
  vehicles,
  mode,
}: Props) {
  const sourceVehicles = useMemo(
    () => vehicles.slice(0, Math.min(8, vehicles.length)),
    [vehicles],
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const autoTimerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [line, setLine] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(true);

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vehiclePosition =
    progress * Math.max(sourceVehicles.length - 1, 0);

  const activeIndex = Math.min(
    Math.max(Math.round(vehiclePosition), 0),
    Math.max(sourceVehicles.length - 1, 0),
  );

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const section = sectionRef.current;

      if (!section) return;

      const rect = section.getBoundingClientRect();

      const scrollDistance = Math.max(
        section.offsetHeight - window.innerHeight,
        1,
      );

      const nextProgress = Math.min(
        Math.max(-rect.top / scrollDistance, 0),
        1,
      );

      setProgress(nextProgress);
    };

    const onScroll = () => {
      setAutoPlaying(false);

      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = window.setTimeout(() => {
        setAutoPlaying(true);
      }, SCROLL_SETTLE_MS);

      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };

    const onResize = () => update();

    update();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setLine((current) => (current + 1) % editorialLines.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const moveToVehicle = useCallback(
    (index: number) => {
      const section = sectionRef.current;

      if (!section || sourceVehicles.length < 2) return;

      const safeIndex = Math.min(
        Math.max(index, 0),
        sourceVehicles.length - 1,
      );

      const scrollDistance = Math.max(
        section.offsetHeight - window.innerHeight,
        1,
      );

      const targetTop =
        section.getBoundingClientRect().top +
        window.scrollY +
        scrollDistance *
          (safeIndex / (sourceVehicles.length - 1));

      setAutoPlaying(false);

      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = window.setTimeout(() => {
        setAutoPlaying(true);
      }, AUTO_ADVANCE_MS);

      window.scrollTo({
        top: targetTop,
        behavior: reducedMotion ? 'auto' : 'smooth',
      });
    },
    [reducedMotion, sourceVehicles.length],
  );

  useEffect(() => {
    if (
      reducedMotion ||
      !autoPlaying ||
      sourceVehicles.length < 2
    ) {
      return;
    }

    autoTimerRef.current = window.setInterval(() => {
      const currentIndex = Math.min(
        Math.round(
          progress * (sourceVehicles.length - 1),
        ),
        sourceVehicles.length - 1,
      );

      const nextIndex =
        currentIndex >= sourceVehicles.length - 1
          ? 0
          : currentIndex + 1;

      moveToVehicle(nextIndex);
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoTimerRef.current) {
        window.clearInterval(autoTimerRef.current);
      }
    };
  }, [
    autoPlaying,
    reducedMotion,
    sourceVehicles.length,
    progress,
    moveToVehicle,
  ]);

  if (!sourceVehicles.length) return null;

  return (
    <section
      ref={sectionRef}
      className="marketplace-editorial-showroom"
      aria-label={
        mode === 'rental'
          ? 'Featured rental vehicles'
          : 'Featured vehicles'
      }
      style={{
        ['--marketplace-stock-count' as string]:
          sourceVehicles.length,
      }}
    >
      <div className="marketplace-editorial-showroom-sticky">
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
        </div>

        <div className="marketplace-editorial-stage">
          {sourceVehicles.map((vehicle, index) => {
            const distance = index - vehiclePosition;
            const absoluteDistance = Math.abs(distance);

            const isActive = absoluteDistance < 0.5;
            const isPrevious = distance < -0.5;
            const isNext = distance > 0.5;

            const scale = isActive
              ? 1
              : Math.max(
                  0.7,
                  1 - absoluteDistance * 0.16,
                );

            const opacity = isActive
              ? 1
              : Math.max(
                  0.16,
                  0.78 - absoluteDistance * 0.16,
                );

            const blur = isActive
              ? 0
              : Math.min(
                  3.5,
                  absoluteDistance * 1.15,
                );

            const translateY = isActive
              ? 0
              : isNext
                ? 66 + absoluteDistance * 18
                : -66 - absoluteDistance * 18;

            const translateX = isActive
              ? 0
              : isNext
                ? 1.5
                : -1.5;

            const zIndex = isActive
              ? 100
              : isNext
                ? 70 - Math.round(absoluteDistance * 5)
                : 60 - Math.round(absoluteDistance * 5);

            return (
              <article
                key={vehicle.id}
                className={[
                  'marketplace-editorial-showroom-card',
                  isActive
                    ? 'marketplace-editorial-showroom-card-active'
                    : isNext
                      ? 'marketplace-editorial-showroom-card-next'
                      : isPrevious
                        ? 'marketplace-editorial-showroom-card-previous'
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
                  priority={index < 2}
                  featured
                  mode={mode}
                />
              </article>
            );
          })}

        </div>

        {sourceVehicles.length > 1 ? (
          <div className="marketplace-editorial-showroom-controls">
            <button
              type="button"
              onClick={() => moveToVehicle(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Previous vehicle"
              className="marketplace-editorial-showroom-control marketplace-editorial-showroom-control-previous"
            >
              <ArrowUp
                className="h-4 w-4"
                aria-hidden="true"
              />

              <span>Previous</span>
            </button>

            <button
              type="button"
              onClick={() =>
                moveToVehicle(
                  activeIndex >= sourceVehicles.length - 1
                    ? 0
                    : activeIndex + 1,
                )
              }
              aria-label="Next vehicle"
              className="marketplace-editorial-showroom-control marketplace-editorial-showroom-control-next"
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
