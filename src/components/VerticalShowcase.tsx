'use client';

import { useEffect, useRef, useState } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_SPEED = 0.32;
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
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = vehicles.length;

  /*
   * Continuous autoplay + original 3D positioning.
   *
   * The track moves continuously, while every individual card still
   * receives the original 3D rotation, depth, scale and opacity based
   * on its distance from the showcase viewport center.
   */
  useEffect(() => {
    if (count < 2) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track) return;

    let running = true;
    let lastTime = performance.now();

    const getLoopHeight = () => {
      const children = Array.from(
        track.children,
      ) as HTMLElement[];

      const secondCopy = children[count];

      if (!secondCopy) return 0;

      /*
       * offsetTop gives the exact distance from the first copy to the
       * second copy, including the flex gap. This makes the wrap seamless.
       */
      return secondCopy.offsetTop;
    };

    const update3D = () => {
      const sections = Array.from(
        track.querySelectorAll<HTMLElement>(
          '[data-marketplace-showcase-item]',
        ),
      );

      if (!sections.length) return;

      const viewportRect = viewport.getBoundingClientRect();
      const viewportCenter =
        viewportRect.top + viewportRect.height * 0.5;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);

        /*
         * ORIGINAL 3D SHOWCASE MATH
         *
         * This is deliberately kept from the previous 3D implementation.
         */
        const sectionHeight = Math.max(rect.height, 1);

        const rawProgress =
          (viewportCenter - center) / sectionHeight;

        const progress = Math.max(
          -1.5,
          Math.min(1.5, rawProgress),
        );

        const absProgress = Math.min(
          Math.abs(progress),
          1,
        );

        const direction = progress > 0 ? 1 : -1;

        const rotateY = progress * -25;
        const rotateX = absProgress * 8 * direction;
        const rotateZ = progress * -2.5;
        const translateX = progress * -4;
        const translateY = progress * 18;
        const translateZ = -absProgress * 110;

        const scale =
          1 - absProgress * 0.095;

        const opacity =
          1 -
          Math.max(0, absProgress - 0.45) *
            0.55;

        section.style.setProperty(
          '--showcase-rotate-y',
          `${rotateY}deg`,
        );

        section.style.setProperty(
          '--showcase-rotate-x',
          `${rotateX}deg`,
        );

        section.style.setProperty(
          '--showcase-rotate-z',
          `${rotateZ}deg`,
        );

        section.style.setProperty(
          '--showcase-translate-x',
          `${translateX}%`,
        );

        section.style.setProperty(
          '--showcase-translate-y',
          `${translateY}px`,
        );

        section.style.setProperty(
          '--showcase-translate-z',
          `${translateZ}px`,
        );

        section.style.setProperty(
          '--showcase-scale',
          `${scale}`,
        );

        section.style.setProperty(
          '--showcase-opacity',
          `${opacity}`,
        );

        /*
         * Only the first copy controls the visible counter.
         */
        if (
          index < count &&
          distance < closestDistance
        ) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex % count);
    };

    const animate = (now: number) => {
      if (!running) return;

      const elapsed = Math.min(
        now - lastTime,
        MAX_DELTA_MS,
      );

      lastTime = now;

      if (!pausedRef.current) {
        const movement =
          AUTO_SPEED * (elapsed / 16.67);

        offsetRef.current += movement;

        const loopHeight = getLoopHeight();

        if (
          loopHeight > 0 &&
          offsetRef.current >= loopHeight
        ) {
          offsetRef.current -= loopHeight;
        }

        /*
         * Move the duplicated track continuously.
         * The individual cards retain their own 3D transforms.
         */
        track.style.transform =
          `translate3d(0, -${offsetRef.current}px, 0)`;
      }

      /*
       * Recalculate the original 3D effect every frame.
       * This is what keeps the showcase dimensional while moving.
       */
      update3D();

      animationRef.current =
        window.requestAnimationFrame(animate);
    };

    update3D();

    animationRef.current =
      window.requestAnimationFrame(animate);

    return () => {
      running = false;

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(
          animationRef.current,
        );

        animationRef.current = null;
      }
    };
  }, [count]);

  /*
   * Briefly pause autoplay when the user interacts.
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
    copy: 'original' | 'duplicate',
  ) => (
    <article
      key={`${copy}-${vehicle.id}-${index}`}
      data-marketplace-showcase-item
      className={`marketplace-native-showcase-item marketplace-3d-showcase-item ${
        copy === 'original' &&
        index === activeIndex
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
            renderVehicle(
              vehicle,
              index,
              'original',
            ),
          )}

          {vehicles.map((vehicle, index) =>
            renderVehicle(
              vehicle,
              index,
              'duplicate',
            ),
          )}
        </div>
      </div>
    </section>
  );
}

export default VerticalShowcase;
