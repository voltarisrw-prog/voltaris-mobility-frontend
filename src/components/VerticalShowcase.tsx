'use client';

import { useEffect, useRef, useState } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_ADVANCE_MS = 6500;
const RESUME_DELAY_MS = 1800;

export function VerticalShowcase({
  vehicles,
  mode = 'sale',
}: VerticalShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interactionRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const count = vehicles.length;

  useEffect(() => {
    if (!count) return;

    const updateShowcase = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-marketplace-showcase-item]',
        ),
      );

      if (!sections.length) return;

      const viewportCenter = window.innerHeight * 0.5;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);

        /*
         * Progress is measured against the viewport center.
         * The browser remains completely responsible for scrolling.
         */
        const sectionHeight = Math.max(rect.height, 1);
        const rawProgress =
          (viewportCenter - center) / sectionHeight;

        const progress = Math.max(-1.5, Math.min(1.5, rawProgress));

        const absProgress = Math.min(Math.abs(progress), 1);

        /*
         * Aggressive 3D:
         *
         * Entering from below:
         *   rotateX / rotateY / translateZ / translateX
         *
         * Leaving toward above:
         *   opposite rotation.
         */
        const direction = progress > 0 ? 1 : -1;

        const rotateY = progress * -25;
        const rotateX = absProgress * 8 * direction;
        const rotateZ = progress * -2.5;
        const translateX = progress * -4;
        const translateY = progress * 18;
        const translateZ = -absProgress * 110;
        const scale = 1 - absProgress * 0.095;

        const opacity =
          1 - Math.max(0, absProgress - 0.45) * 0.55;

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

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setActiveIndex(closestIndex % count);
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;

      rafRef.current = window.requestAnimationFrame(() => {
        updateShowcase();
        rafRef.current = null;
      });
    };

    updateShowcase();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [count]);

  useEffect(() => {
    if (count < 2 || !autoPlay) return;

    autoTimerRef.current = setInterval(() => {
      if (interactionRef.current) return;

      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-marketplace-showcase-item]',
        ),
      );

      if (!sections.length) return;

      const viewportCenter = window.innerHeight * 0.5;

      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      const nextSection = sections[closestIndex + 1];

      if (nextSection) {
        nextSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [count, autoPlay]);

  useEffect(() => {
    const pauseDuringInteraction = () => {
      interactionRef.current = true;
      setAutoPlay(false);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }

      resumeTimerRef.current = setTimeout(() => {
        interactionRef.current = false;
        setAutoPlay(true);
      }, RESUME_DELAY_MS);
    };

    window.addEventListener('wheel', pauseDuringInteraction, {
      passive: true,
    });

    window.addEventListener('touchstart', pauseDuringInteraction, {
      passive: true,
    });

    window.addEventListener('keydown', pauseDuringInteraction);

    return () => {
      window.removeEventListener('wheel', pauseDuringInteraction);
      window.removeEventListener('touchstart', pauseDuringInteraction);
      window.removeEventListener('keydown', pauseDuringInteraction);

      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, []);

  if (!vehicles.length) return null;

  return (
    <section
      className="marketplace-native-showcase marketplace-3d-showcase"
      aria-label="Vehicle showroom"
    >
      <div className="marketplace-native-showcase-header">
        <div>
          <p className="marketplace-native-showcase-kicker">
            {mode === 'rental' ? 'Available for rent' : 'Available vehicles'}
          </p>

          <p className="marketplace-native-showcase-count">
            {String(activeIndex + 1).padStart(2, '0')} /{' '}
            {String(count).padStart(2, '0')}
          </p>
        </div>
      </div>

      <div className="marketplace-native-showcase-list marketplace-3d-showcase-list">
        {vehicles.map((vehicle, index) => (
          <article
            key={`${vehicle.id}-${index}`}
            data-marketplace-showcase-item
            className={`marketplace-native-showcase-item marketplace-3d-showcase-item ${
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
        ))}
      </div>
    </section>
  );
}

export default VerticalShowcase;
