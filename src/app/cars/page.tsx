import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { VehicleCard } from '@/components/VehicleCard';
import { VehicleFilters as FilterPanel } from '@/components/VehicleFilters';
import { getFacets, listVehicles, type VehicleFacets } from '@/lib/api/vehicles';
import { ApiError, displayMessage } from '@/lib/api/errors';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import {
  canonicalPath,
  isIndexable,
  parseFilters,
  type RawSearchParams,
} from '@/lib/vehicles/filters';
import type { Page } from '@/types/api';
import type { VehicleSummary } from '@/types/vehicle';

type SearchParams = Promise<RawSearchParams>;

/** Titles describe the filtered set so each indexable facet reads as its own page. */
function describe(filters: ReturnType<typeof parseFilters>): {
  title: string;
  description: string;
} {
  const parts: string[] = [];
  if (filters.condition === 'used') parts.push('Used');
  if (filters.condition === 'new') parts.push('New');
  const make = filters.make?.[0];
  if (make) parts.push(make.replace(/\b\w/g, (c: string) => c.toUpperCase()));
  parts.push(filters.body?.[0] ? `electric ${filters.body[0]}s` : 'electric vehicles');
  const where = filters.location
    ? filters.location.replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Rwanda';

  const title = `${parts.join(' ')} for sale in ${where}`;
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: `Browse ${title.toLowerCase()} from verified dealers and private owners. Compare range, battery, price, and condition, then book a test drive through Voltaris.`,
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const filters = parseFilters(await searchParams);
  const { title, description } = describe(filters);
  return buildMetadata({
    title,
    description,
    path: canonicalPath(filters),
    // Non-indexable filter states stay crawlable so listings are still discovered.
    noindex: !isIndexable(filters),
    follow: true,
  });
}

export default async function CarsPage({ searchParams }: { searchParams: SearchParams }) {
  const filters = parseFilters(await searchParams);
  const page = filters.page ?? 1;
  const { title } = describe(filters);

  let results: Page<VehicleSummary> | null = null;
  let facets: VehicleFacets | null = null;
  let error: string | null = null;

  try {
    [results, facets] = await Promise.all([listVehicles(filters), getFacets()]);
  } catch (cause) {
    error = displayMessage(cause);
    if (cause instanceof ApiError && !cause.isRetryable) error = displayMessage(cause);
  }

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric vehicles', path: '/cars' },
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-headline">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-steel">
          Every listing shows real driving range against the market ceiling, so you can compare on
          the number that decides whether a car fits your week.
        </p>
      </header>

      <div className="mt-8">
        {facets && results ? (
          <FilterPanel facets={facets} resultCount={results.total} />
        ) : (
          <div className="h-14 animate-pulse bg-slab" aria-hidden="true" />
        )}
      </div>

      {error ? (
        <div className="mt-8">
          <EmptyState
            title="Listings did not load"
            body={error}
            action={{ label: 'Reload the marketplace', href: '/cars' }}
          />
        </div>
      ) : results && results.items.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No vehicles match these filters"
            body="Widen the price range, drop the minimum range, or clear a filter to see more of what is listed right now."
            action={{ label: 'Clear all filters', href: '/cars' }}
          />
        </div>
      ) : results ? (
        <>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.items.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                // Only the first row is eager — everything else lazy-loads.
                priority={index < 3}
              />
            ))}
          </div>
          <div className="mt-10">
            <Pagination filters={filters} page={page} totalPages={results.total_pages} />
          </div>
        </>
      ) : null}
    </div>
  );
}
