'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

interface MarketplaceEditorialMotionProps {
  vehicles: VehicleSummary[];
  mode: 'sale' | 'rental';
}

type Direction = -1 | 1;

export function MarketplaceEditorialMotion({
  vehicles,
  mode,
}: MarketplaceEditorialMotionProps) {
  const sourceVehicles = useMemo(
    () => vehicles.slice(0, Math.min(8, vehicles.length)),
    [vehicles],
  );

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const wheelLock = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = sourceVehicles.length;

  const keepInteractionAlive = useCallback(() => {
    setIsInteracting(true);

    if (resumeTimer.current) {
      clearTimeout(resumeTimer.current);
    }

    resumeTimer.current = setTimeout(() => {
      setIsInteracting(false);
    }, 15000);
  }, []);

  const move = useCallback(
    (direction: Direction) => {
      if (count <= 1) return;

      setActiveIndex((current) => {
        const next = current + direction;

        if (next < 0) return count - 1;
        if (next >= count) return 0;

        return next;
      });

      keepInteractionAlive();
    },
    [count, keepInteractionAlive],
  );

  const goTo = useCallback(
    (index: number) => {
      if (count <= 1) return;

      setActiveIndex(((index % count) + count) % count);
      keepInteractionAlive();
    },
    [count, keepInteractionAlive],
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener('change', update);

    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (count <= 1 || reducedMotion || isInteracting) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, 11000);

    return () => window.clearInterval(timer);
  }, [count, reducedMotion, isInteracting]);

  useEffect(() => {
    return () => {
      if (resumeTimer.current) {
        clearTimeout(resumeTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        move(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        move(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    /*
     * Desktop keeps the cinematic showroom.
     * Trackpads/mouse wheels get a deliberate lock so one gesture
     * does not skip several vehicles.
     */
    if (window.innerWidth < 1200 || wheelLock.current) return;

    const threshold = 22;

    if (Math.abs(event.deltaY) < threshold) return;

    wheelLock.current = true;

    move(event.deltaY > 0 ? 1 : -1);

    window.setTimeout(() => {
      wheelLock.current = false;
    }, 650);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];

    if (!touch) {
      keepInteractionAlive();
      return;
    }

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;

    keepInteractionAlive();
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const touch = event.changedTouches[0];

    touchStartX.current = null;
    touchStartY.current = null;

    if (startX === null || startY === null || !touch) {
      keepInteractionAlive();
      return;
    }

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    /*
     * Horizontal gestures navigate the vehicles.
     * Predominantly vertical gestures remain normal page scrolling.
     */
    if (
      Math.abs(deltaX) > 48 &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.2
    ) {
      move(deltaX < 0 ? 1 : -1);
    }

    keepInteractionAlive();
  };

  if (count === 0) return null;

  return (
    <section
      className="marketplace-infinite-showroom"
      aria-roledescription="carousel"
      aria-label="Featured vehicles"
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="marketplace-infinite-showroom-sticky">
        <div className="marketplace-infinite-showroom-heading shell">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-steel-muted">
                {mode === 'rental' ? 'READY TO RENT' : 'THE COLLECTION'}
              </p>

              <h2 className="mt-2 font-display text-2xl tracking-tight text-chrome sm:text-3xl lg:text-4xl">
                Move differently.
              </h2>
            </div>

            <div
              className="hidden font-data text-[0.62rem] uppercase tracking-[0.16em] text-steel-muted sm:block"
              aria-live="polite"
            >
              {String(activeIndex + 1).padStart(2, '0')} /{' '}
              {String(count).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div
          className="marketplace-infinite-showroom-stage"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              move(-1);
            }

            if (event.key === 'ArrowRight') {
              event.preventDefault();
              move(1);
            }
          }}
        >
          {sourceVehicles.map((vehicle, index) => {
            let relative = index - activeIndex;

            if (relative > count / 2) relative -= count;
            if (relative < -count / 2) relative += count;

            const isActive = relative === 0;
            const isPrevious = relative === -1;
            const isNext = relative === 1;
            const distance = Math.abs(relative);

            const scale = isActive
              ? 1
              : distance === 1
                ? 0.88
                : distance === 2
                  ? 0.76
                  : 0.68;

            const opacity = isActive
              ? 1
              : distance === 1
                ? 0.58
                : distance === 2
                  ? 0.24
                  : 0;

            const blur = isActive
              ? 0
              : distance === 1
                ? 1
                : distance === 2
                  ? 3
                  : 7;

            const translateX = isActive
              ? 0
              : relative < 0
                ? -20
                : 20;

            const translateY = isActive ? 0 : distance === 1 ? 3 : 7;

            return (
              <article
                key={vehicle.id}
                className={[
                  'marketplace-infinite-showroom-card',
                  isActive
                    ? 'marketplace-infinite-showroom-card-active'
                    : '',
                  isPrevious
                    ? 'marketplace-infinite-showroom-card-previous'
                    : '',
                  isNext ? 'marketplace-infinite-showroom-card-next' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  transform: `translate3d(${translateX}%, ${translateY}%, 0) scale(${scale})`,
                  opacity,
                  filter: `blur(${blur}px)`,
                  zIndex: 100 - distance,
                }}
                aria-hidden={!isActive}
              >
                <MarketplaceVehicleCard
                  vehicle={vehicle}
                  priority={index === 0}
                  featured
                  mode={mode}
                />
              </article>
            );
          })}
        </div>

        <div className="marketplace-infinite-showroom-toolbar shell">
          <div className="marketplace-infinite-showroom-position sm:hidden">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(count).padStart(2, '0')}
          </div>

          <div className="marketplace-infinite-showroom-controls">
            <button
              type="button"
              className="marketplace-infinite-showroom-control"
              onClick={() => move(-1)}
              aria-label="Previous vehicle"
            >
              <span aria-hidden="true">←</span>
              <span>Previous</span>
            </button>

            <div className="marketplace-infinite-showroom-dots">
              {sourceVehicles.map((vehicle, index) => (
                <button
                  key={vehicle.id}
                  type="button"
                  aria-label={`Show vehicle ${index + 1}`}
                  aria-current={index === activeIndex}
                  onClick={() => goTo(index)}
                  className={
                    index === activeIndex
                      ? 'marketplace-infinite-showroom-dot marketplace-infinite-showroom-dot-active'
                      : 'marketplace-infinite-showroom-dot'
                  }
                />
              ))}
            </div>

            <button
              type="button"
              className="marketplace-infinite-showroom-control"
              onClick={() => move(1)}
              aria-label="Next vehicle"
            >
              <span>Next</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p className="marketplace-infinite-showroom-hint">
            <span className="hidden sm:inline">
              Scroll, swipe or use the arrows
            </span>
            <span className="sm:hidden">Swipe to explore</span>
          </p>
        </div>
      </div>
    </section>
  );
}
