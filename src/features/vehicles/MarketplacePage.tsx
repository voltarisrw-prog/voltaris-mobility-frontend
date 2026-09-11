'use client';

import { useEffect, useRef } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import { VehicleFilters as FilterPanel } from '@/components/VehicleFilters';
import { RentalSearch } from '@/features/vehicles/RentalSearch';
import { getFacets, listVehicles, type VehicleFacets } from '@/lib/api/vehicles';
import { ApiError, displayMessage } from '@/lib/api/errors';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { parseFilters, type RawSearchParams } from '@/lib/vehicles/filters';
import type { Page } from '@/types/api';
import type { VehicleSummary } from '@/types/vehicle';

type SearchParams = Promise<RawSearchParams>;

export interface MarketplacePageProps {
  searchParams: SearchParams;
  mode?: 'sale' | 'rental';
  basePath?: string;
  title?: string;
  description?: string;
}

export async function MarketplacePage({
  searchParams,
  mode,
  basePath = '/cars',
  title,
  description,
}: MarketplacePageProps) {
  const filters = parseFilters(await searchParams);

  const marketplaceFilters = mode
    ? { ...filters, mode }
    : filters;

  const page = marketplaceFilters.page ?? 1;

  let results: Page<VehicleSummary> | null = null;
  let facets: VehicleFacets | null = null;
  let error: string | null = null;

  try {
    [results, facets] = await Promise.all([
      listVehicles(marketplaceFilters),
      getFacets(),
    ]);
  } catch (cause) {
    error = displayMessage(cause);
    if (cause instanceof ApiError && !cause.isRetryable) {
      error = displayMessage(cause);
    }
  }

  const resolvedTitle =
    title ??
    (mode === 'rental'
      ? 'Electric and hybrid cars, ready when you are'
      : mode === 'sale'
        ? 'Electric and hybrid cars, ready for the road'
        : 'Find what moves you');

  const resolvedDescription =
    description ??
    (mode === 'rental'
      ? 'Explore electric and hybrid cars available to rent through Voltaris.'
      : mode === 'sale'
        ? ''
        : 'Explore electric and hybrid cars through Voltaris');

  const trail = [
    { name: 'Home', path: '/' },
    {
      name: mode === 'rental' ? 'Rent' : mode === 'sale' ? 'Buy' : 'Cars',
      path: basePath,
    },
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-2xl">
        <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-steel-muted">
          ELECTRIC + HYBRID
        </p>
        <h1 className="mt-2 font-display text-headline">{resolvedTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel">
          {resolvedDescription}
        </p>
      </header>

      {mode === 'rental' ? (
        <div className="mt-8">
          <RentalSearch />
        </div>
      ) : null}

      <div className="mt-8">
        {facets && results ? (
          <FilterPanel
            facets={facets}
            resultCount={results.total}
            basePath={basePath}
          />
        ) : (
          <div className="h-14 animate-pulse bg-slab" aria-hidden="true" />
        )}
      </div>

      {error ? (
        <div className="mt-8">
          <EmptyState
            title="Listings did not load"
            body={error}
            action={{
              label: 'Reload the marketplace',
              href: basePath,
            }}
          />
        </div>
      ) : results && results.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title={
              mode === 'rental'
                ? 'No rental vehicles match these filters'
                : 'No vehicles match these filters'
            }
            body="Widen the price range, drop the minimum range, or clear a filter to see more vehicles."
            action={{
              label: 'Clear all filters',
              href: basePath,
            }}
          />
        </div>
      ) : results ? (
        (() => {
          const loadedResults = results;


  const verticalShowcaseRef = useRef<HTMLDivElement | null>(null);
  const verticalShowcaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const container = verticalShowcaseRef.current;
    if (!container || loadedResults.items.length < 2) return;

    const startAutoSlide = () => {
      if (verticalShowcaseTimer.current) {
        clearInterval(verticalShowcaseTimer.current);
      }

      verticalShowcaseTimer.current = setInterval(() => {
        const sections = Array.from(
          container.querySelectorAll<HTMLElement>(
            '.marketplace-vertical-showcase-item'
          )
        );

        if (sections.length < 2) return;

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

        if (!nextSection) return;

        nextSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 6500);
    };

    const pauseAutoSlide = () => {
      if (verticalShowcaseTimer.current) {
        clearInterval(verticalShowcaseTimer.current);
        verticalShowcaseTimer.current = null;
      }
    };

    const resumeAutoSlide = () => {
      pauseAutoSlide();

      window.setTimeout(() => {
        startAutoSlide();
      }, 1800);
    };

    startAutoSlide();

    container.addEventListener('mouseenter', pauseAutoSlide);
    container.addEventListener('mouseleave', resumeAutoSlide);
    container.addEventListener('touchstart', pauseAutoSlide, { passive: true });
    container.addEventListener('touchend', resumeAutoSlide, { passive: true });

    return () => {
      pauseAutoSlide();

      container.removeEventListener('mouseenter', pauseAutoSlide);
      container.removeEventListener('mouseleave', resumeAutoSlide);
      container.removeEventListener('touchstart', pauseAutoSlide);
      container.removeEventListener('touchend', resumeAutoSlide);
    };
  }, [loadedResults.items.length]);

          return (
            <>
              <div ref={verticalShowcaseRef} className="marketplace-vertical-showcase">
                {loadedResults.items.map((vehicle, index) => (
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

              <div className="mt-10">
                <Pagination
                  filters={marketplaceFilters}
                  page={page}
                  totalPages={loadedResults.total_pages}
                  basePath={basePath}
                />
              </div>
            </>
          );
        })()
      ) : null}
    </div>
  );
}
