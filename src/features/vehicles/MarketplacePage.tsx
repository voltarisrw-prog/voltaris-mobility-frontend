import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import { VehicleFilters as FilterPanel } from '@/components/VehicleFilters';
import { RentalSearch } from '@/features/vehicles/RentalSearch';
import { MarketplaceEditorialMotion } from '@/features/vehicles/MarketplaceEditorialMotion';
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
      ? 'Electric vehicles for rent in Rwanda'
      : mode === 'sale'
        ? 'Electric vehicles for sale in Rwanda'
        : 'Electric vehicles');

  const resolvedDescription =
    description ??
    (mode === 'rental'
      ? 'Browse electric vehicles available for rental in Rwanda. Compare range, battery, price, and availability, then reserve your vehicle through Voltaris.'
      : mode === 'sale'
        ? 'Browse electric vehicles for sale in Rwanda from verified dealers and private owners. Compare range, battery, price, and condition, then book a test drive through Voltaris.'
        : 'Browse electric vehicles in Rwanda. Compare range, battery, price, condition, and location.');

  const trail = [
    { name: 'Home', path: '/' },
    { name: resolvedTitle, path: basePath },
  ];

  return (
    <div className="shell py-8 sm:py-12">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-2xl">
        <h1 className="font-display text-headline">{resolvedTitle}</h1>
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
        <>
          {true ? (
            <>
              <MarketplaceEditorialMotion
                key={results.items.map((vehicle) => vehicle.id).join('|')}
                vehicles={results.items}
                mode={mode ?? 'sale'}
              />

              {results.items.length > 8 ? (
                <div className="mt-16">
                  <div className="mb-6 flex items-end justify-between gap-6 border-b border-hairline pb-4">
                    <div>
                      <p className="font-data text-[0.6rem] uppercase tracking-[0.2em] text-steel-muted">
                        More from the collection
                      </p>
                      <h2 className="mt-2 font-display text-2xl tracking-tight text-chrome sm:text-3xl">
                        Explore the full edit
                      </h2>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results.items.slice(8).map((vehicle, index) => (
                      <div
                        key={vehicle.id}
                        className="marketplace-editorial-enter"
                        style={{
                          animationDelay: `${Math.min(index, 5) * 90}ms`,
                        }}
                      >
                        <MarketplaceVehicleCard
                          vehicle={vehicle}
                          priority={false}
                          featured={false}
                          mode={mode}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {results.items.map((vehicle, index) => (
                <MarketplaceVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  priority={index < 3}
                  featured={index === 0}
                  mode={mode}
                />
              ))}
            </div>
          )}

          <div className="mt-10">
            <Pagination
              filters={marketplaceFilters}
              page={page}
              totalPages={results.total_pages}
              basePath={basePath}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
