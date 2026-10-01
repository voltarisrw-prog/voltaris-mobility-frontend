import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { Pagination } from '@/components/Pagination';
import { MarketFeed } from '@/features/market/MarketFeed';
import { MarketShell } from '@/features/market/MarketShell';
import s from '@/features/market/market.module.css';
import { listVehicles } from '@/lib/api/vehicles';
import { displayMessage } from '@/lib/api/errors';
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

/** Buy, Rent and Cars: the shared marketplace frame with one car per stage. */
export async function MarketplacePage({
  searchParams,
  mode,
  basePath = '/cars',
  title,
}: MarketplacePageProps) {
  const filters = parseFilters(await searchParams);
  const marketplaceFilters = mode ? { ...filters, mode } : filters;
  const page = marketplaceFilters.page ?? 1;
  const view: 'sale' | 'rental' =
    (mode ?? marketplaceFilters.mode) === 'rental' ? 'rental' : 'sale';

  let results: Page<VehicleSummary> | null = null;
  let error: string | null = null;
  try {
    results = await listVehicles(marketplaceFilters);
  } catch (cause) {
    error = displayMessage(cause);
  }

  const resolvedTitle =
    title ??
    (view === 'rental' ? 'Electric and hybrid cars to rent' : 'Electric and hybrid cars for sale');
  const trail = [
    { name: 'Home', path: '/' },
    { name: view === 'rental' ? 'Rent' : basePath === '/buy' ? 'Buy' : 'Cars', path: basePath },
  ];

  return (
    <MarketShell title={resolvedTitle} mode={view} current={basePath} total={results?.total}>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      {error ? (
        <div className={s.empty}>
          <h2>Listings did not load</h2>
          <Link className={`${s.btn} ${s.primary}`} href={basePath}>
            Try again
          </Link>
        </div>
      ) : results && results.items.length === 0 ? (
        <div className={s.empty}>
          <h2>{view === 'rental' ? 'No cars to rent here yet' : 'No cars here yet'}</h2>
          <Link className={`${s.btn} ${s.primary}`} href={view === 'rental' ? '/rent' : '/buy'}>
            See every car
          </Link>
        </div>
      ) : results ? (
        <>
          <MarketFeed vehicles={results.items} mode={view} />
          <div className={s.pager}>
            <Pagination
              filters={marketplaceFilters}
              page={page}
              totalPages={results.total_pages}
              basePath={basePath}
            />
          </div>
        </>
      ) : null}
    </MarketShell>
  );
}
