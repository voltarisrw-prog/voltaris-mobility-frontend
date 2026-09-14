'use client';

import React, { useEffect, useRef, useState } from 'react';


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
  const [transitionProgress, setTransitionProgress] = useState(0);

  useEffect(() => {
    const root = showcaseRef.current;
    if (!root) return;

    let frame = 0;

    const updateProgress = () => {
      frame = 0;

      const rect = root.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const distance = Math.max(rect.height - viewport, 1);
      const travelled = Math.min(Math.max(-rect.top, 0), distance);

      setTransitionProgress(travelled / distance);
    };

    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
          const distance = Math.abs(
            section.getBoundingClientRect().top
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
          block: 'start',
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
      style={{ "--showcase-progress": transitionProgress } as React.CSSProperties}
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
