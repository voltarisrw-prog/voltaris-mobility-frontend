'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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

export function MarketplaceEditorialMotion({ vehicles, mode }: Props) {
  const featuredVehicles = useMemo(
    () => vehicles.slice(0, Math.min(5, vehicles.length)),
    [vehicles],
  );

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [line, setLine] = useState(0);

  useEffect(() => {
    if (featuredVehicles.length < 2 || paused) return;

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % featuredVehicles.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [featuredVehicles.length, paused]);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setLine((current) => (current + 1) % editorialLines.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  if (!featuredVehicles.length) return null;

  const previous = () => {
    setActive(
      (current) =>
        (current - 1 + featuredVehicles.length) % featuredVehicles.length,
    );
  };

  const next = () => {
    setActive((current) => (current + 1) % featuredVehicles.length);
  };

  return (
    <section
      className="mt-10"
      aria-label="Featured vehicles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div className="mb-5 flex items-end justify-between gap-6">
        <div>
          <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-volt">
            {mode === 'rental' ? 'The rental edit' : 'The electric edit'}
          </p>

          <div className="mt-2 min-h-[2rem] overflow-hidden">
            <p
              key={editorialLines[line]}
              className="marketplace-editorial-text font-display text-xl tracking-tight text-chrome sm:text-2xl"
              aria-live="polite"
            >
              {editorialLines[line]}
            </p>
          </div>
        </div>

        {featuredVehicles.length > 1 ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={previous}
              aria-label="Previous featured vehicle"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-chrome shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:border-volt hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next featured vehicle"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-surface text-chrome shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5 hover:border-volt hover:text-volt focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-volt"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-[cubic-bezier(.22,.61,.36,1)]"
          style={{
            transform: `translateX(-${active * 100}%)`,
          }}
        >
          {featuredVehicles.map((vehicle, index) => (
            <div
              key={vehicle.id}
              className="w-full shrink-0"
              aria-hidden={index !== active}
            >
              <MarketplaceVehicleCard
                vehicle={vehicle}
                priority={index === 0}
                featured
                mode={mode}
              />
            </div>
          ))}
        </div>
      </div>

      {featuredVehicles.length > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label="Featured vehicle position">
            {featuredVehicles.map((vehicle, index) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show featured vehicle ${index + 1}`}
                aria-current={index === active ? 'true' : undefined}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === active
                    ? 'w-8 bg-volt'
                    : 'w-2 bg-hairline hover:bg-steel-muted'
                }`}
              />
            ))}
          </div>

          <span className="font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
            {String(active + 1).padStart(2, '0')} /{' '}
            {String(featuredVehicles.length).padStart(2, '0')}
          </span>
        </div>
      ) : null}
    </section>
  );
}
