'use client';

import { useEffect, useRef } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

export function VerticalShowcase({
  vehicles,
  mode,
}: VerticalShowcaseProps) {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const container = showcaseRef.current;

    if (!container) {
      return;
    }

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>(
        '.marketplace-vertical-showcase-item'
      )
    );

    if (!sections.length) {
      return;
    }

    let frame = 0;

    const updateComposition = () => {
      frame = 0;

      const viewportHeight = window.innerHeight || 1;
      const viewportCenter = viewportHeight * 0.5;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height * 0.5;

        /*
         * Progress:
         * 0 = vehicle is outside the active cinematic zone
         * 1 = vehicle is centered in the viewport
         */
        const distance = Math.abs(sectionCenter - viewportCenter);
        const range = Math.max(viewportHeight * 0.72, 1);

        const rawProgress = 1 - distance / range;
        const progress = Math.max(0, Math.min(1, rawProgress));

        /*
         * Direction tells CSS whether the vehicle is entering
         * from below or leaving toward the top.
         */
        const direction =
          sectionCenter < viewportCenter ? -1 : 1;

        section.style.setProperty(
          '--vehicle-progress',
          progress.toFixed(4)
        );

        section.style.setProperty(
          '--vehicle-direction',
          String(direction)
        );

        section.style.setProperty(
          '--vehicle-index',
          String(index)
        );
      });
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateComposition);
      }
    };

    updateComposition();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);

      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [vehicles.length]);

  useEffect(() => {
    const container = showcaseRef.current;

    if (!container || vehicles.length < 2) {
      return;
    }

    const pause = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const start = () => {
      pause();

      timerRef.current = setInterval(() => {
        const sections = Array.from(
          container.querySelectorAll<HTMLElement>(
            '.marketplace-vertical-showcase-item'
          )
        );

        if (sections.length < 2) {
          return;
        }

        let currentIndex = 0;
        let closestDistance = Number.POSITIVE_INFINITY;

        sections.forEach((section, index) => {
          const rect = section.getBoundingClientRect();
          const distance = Math.abs(
            rect.top + rect.height * 0.5 -
              (window.innerHeight || 1) * 0.5
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            currentIndex = index;
          }
        });

        const nextIndex = (currentIndex + 1) % sections.length;
        const nextSection = sections[nextIndex];

        if (!nextSection) {
          return;
        }

        nextSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 6500);
    };

    const resume = () => {
      pause();

      window.setTimeout(() => {
        start();
      }, 1800);
    };

    start();

    container.addEventListener('mouseenter', pause);
    container.addEventListener('mouseleave', resume);

    container.addEventListener('touchstart', pause, {
      passive: true,
    });

    container.addEventListener('touchend', resume, {
      passive: true,
    });

    return () => {
      pause();

      container.removeEventListener('mouseenter', pause);
      container.removeEventListener('mouseleave', resume);
      container.removeEventListener('touchstart', pause);
      container.removeEventListener('touchend', resume);
    };
  }, [vehicles.length]);

  return (
    <div
      ref={showcaseRef}
      className="marketplace-vertical-showcase"
    >
      {vehicles.map((vehicle, index) => (
        <section
          key={vehicle.id}
          className="marketplace-vertical-showcase-item"
          aria-label={`Vehicle ${index + 1}`}
        >
          <MarketplaceVehicleCard
            vehicle={vehicle}
            priority={index === 0}
            featured={true}
            mode={mode}
          />
        </section>
      ))}
    </div>
  );
}
