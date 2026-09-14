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

  const count = vehicles.length;

  useEffect(() => {
    if (count < 2 || !autoPlay) return;

    const updateActiveVehicle = () => {
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

      setActiveIndex(closestIndex % count);
    };

    let ticking = false;

    const onScroll = () => {
      if (ticking) return;

      ticking = true;

      window.requestAnimationFrame(() => {
        updateActiveVehicle();
        ticking = false;
      });
    };

    updateActiveVehicle();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [count, autoPlay]);

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

      let closestSection: HTMLElement | null = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height * 0.5;
        const distance = Math.abs(center - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      });

      if (!closestSection) return;

      const currentIndex = sections.indexOf(closestSection);
      const nextSection = sections[currentIndex + 1];

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

  if (!vehicles.length) {
    return null;
  }

  return (
    <section
      className="marketplace-native-showcase"
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

      <div className="marketplace-native-showcase-list">
        {vehicles.map((vehicle, index) => (
          <article
            key={`${vehicle.id}-${index}`}
            data-marketplace-showcase-item
            className={`marketplace-native-showcase-item ${
              index === activeIndex
                ? 'marketplace-native-showcase-item-active'
                : ''
            }`}
          >
            <MarketplaceVehicleCard
              vehicle={vehicle}
              featured
              mode={mode}
            />
          </article>
        ))}
      </div>
    </section>
  );
}

export default VerticalShowcase;
