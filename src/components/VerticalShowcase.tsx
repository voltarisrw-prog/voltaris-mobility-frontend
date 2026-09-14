'use client';

import { useEffect, useRef, useState } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_SPEED = 0.35;
const MAX_DELTA_MS = 32;
const RESUME_DELAY_MS = 1200;

export function VerticalShowcase({
  vehicles,
  mode = 'sale',
}: VerticalShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = vehicles.length;

  /*
   * Continuous vertical carousel.
   *
   * The track is duplicated so it can travel continuously without
   * reaching a visual dead-end. Once the first copy has completely
   * passed, the offset is seamlessly wrapped back to the beginning.
   */
  useEffect(() => {
    if (count < 2) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    let running = true;
    let last = performance.now();

    const getLoopHeight = () => {
      const children = Array.from(track.children) as HTMLElement[];

      if (children.length < count * 2) return 0;

      let height = 0;

      for (let i = 0; i < count; i += 1) {
        const child = children[i];

        if (!child) continue;

        const style = window.getComputedStyle(child);
        const marginBottom = parseFloat(style.marginBottom || '0');

        height += child.offsetHeight + marginBottom;
      }

      const list = track.parentElement;

      if (list) {
        const listStyle = window.getComputedStyle(list);
        const gap = parseFloat(listStyle.rowGap || listStyle.gap || '0');

        height += gap * count;
      }

      return height;
    };

    const animate = (now: number) => {
      if (!running) return;

      const elapsed = Math.min(
        now - last,
        MAX_DELTA_MS,
      );

      last = now;

      if (!pausedRef.current) {
        const movement =
          AUTO_SPEED * (elapsed / 16.67);

        offsetRef.current += movement;

        const loopHeight = getLoopHeight();

        if (loopHeight > 0 && offsetRef.current >= loopHeight) {
          offsetRef.current -= loopHeight;
        }

        track.style.transform = `translate3d(0, -${offsetRef.current}px, 0)`;

        /*
         * Determine the currently visible vehicle from the moving
         * track instead of relying on document scrolling.
         */
        const children = Array.from(
          track.children,
        ) as HTMLElement[];

        const viewportRect = viewport.getBoundingClientRect();
        const viewportCenter =
          viewportRect.top + viewportRect.height / 2;

        let closestIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        children.slice(0, count).forEach((child, index) => {
          const rect = child.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = Math.abs(center - viewportCenter);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        setActiveIndex(closestIndex);
      }

      animationRef.current =
        window.requestAnimationFrame(animate);
    };

    animationRef.current =
      window.requestAnimationFrame(animate);

    return () => {
      running = false;

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [count]);

  /*
   * Pause briefly when the user interacts with the page.
   * Autoplay resumes automatically after the interaction stops.
   */
  useEffect(() => {
    if (count < 2) return;

    const pauseBriefly = () => {
      pausedRef.current = true;

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
        lastTimeRef.current = performance.now();
      }, RESUME_DELAY_MS);
    };

    window.addEventListener(
      'wheel',
      pauseBriefly,
      { passive: true },
    );

    window.addEventListener(
      'touchstart',
      pauseBriefly,
      { passive: true },
    );

    window.addEventListener(
      'pointerdown',
      pauseBriefly,
      { passive: true },
    );

    window.addEventListener(
      'keydown',
      pauseBriefly,
    );

    return () => {
      window.removeEventListener(
        'wheel',
        pauseBriefly,
      );

      window.removeEventListener(
        'touchstart',
        pauseBriefly,
      );

      window.removeEventListener(
        'pointerdown',
        pauseBriefly,
      );

      window.removeEventListener(
        'keydown',
        pauseBriefly,
      );

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [count]);

  if (!vehicles.length) return null;

  const renderVehicle = (
    vehicle: VehicleSummary,
    index: number,
    copy: string,
  ) => (
    <article
      key={`${copy}-${vehicle.id}-${index}`}
      data-marketplace-showcase-item
      className={`marketplace-native-showcase-item marketplace-3d-showcase-item ${
        copy === 'original' && index === activeIndex
          ? 'marketplace-native-showcase-item-active'
          : ''
      }`}
    >
      <div className="marketplace-3d-showcase-stage">
        <MarketplaceVehicleCard
          vehicle={vehicle}
          featured
          mode={mode}
        />
      </div>
    </article>
  );

  return (
    <section
      className="marketplace-native-showcase marketplace-3d-showcase marketplace-continuous-showcase"
      aria-label="Vehicle showroom"
    >
      <div className="marketplace-native-showcase-header">
        <div>
          <p className="marketplace-native-showcase-kicker">
            {mode === 'rental'
              ? 'Available for rent'
              : 'Available vehicles'}
          </p>

          <p className="marketplace-native-showcase-count">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(count).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div
        ref={viewportRef}
        className="marketplace-continuous-showcase-viewport"
      >
        <div
          ref={trackRef}
          className="marketplace-native-showcase-list marketplace-3d-showcase-list marketplace-continuous-showcase-track"
        >
          {vehicles.map((vehicle, index) =>
            renderVehicle(vehicle, index, 'original'),
          )}

          {vehicles.map((vehicle, index) =>
            renderVehicle(vehicle, index, 'duplicate'),
          )}
        </div>
      </div>
    </section>
  );
}

export default VerticalShowcase;
