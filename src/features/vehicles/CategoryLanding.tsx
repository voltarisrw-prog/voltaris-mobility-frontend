import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { FilterButton } from '@/features/market/FilterButton';
import { MarketFeed } from '@/features/market/MarketFeed';
import { MarketShell } from '@/features/market/MarketShell';
import s from '@/features/market/market.module.css';
import { getFacets, listVehicles, type VehicleFacets } from '@/lib/api/vehicles';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import type { LandingPage } from '@/config/landing';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * Every Explore page (Kigali, Rwanda, SUVs, sedans, used): the same marketplace
 * frame and feed as Buy and Rent, filtered by config/landing.ts. The page title
 * stays for search engines; the chips say where you are.
 */
export async function CategoryLanding({ page }: { page: LandingPage }) {
  let vehicles: VehicleSummary[] = [];
  let total = 0;
  let failed = false;
  let facets: VehicleFacets | null = null;

  const [list, facetResult] = await Promise.allSettled([
    listVehicles({ ...page.filters, mode: 'sale', sort: 'newest' }),
    getFacets(),
  ]);
  if (list.status === 'fulfilled') {
    vehicles = list.value.items;
    total = list.value.total;
  } else failed = true;
  if (facetResult.status === 'fulfilled') facets = facetResult.value;

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric vehicles', path: '/cars' },
    { name: page.h1, path: `/${page.slug}` },
  ];

  return (
    <MarketShell
      title={page.h1}
      mode="sale"
      current={`/${page.slug}`}
      total={total}
      tools={<FilterButton action="/buy" mode="sale" filters={page.filters} facets={facets} />}
    >
      <JsonLd data={breadcrumbJsonLd(trail)} />
      {failed || vehicles.length === 0 ? (
        <div className={s.empty}>
          <h2>{failed ? 'Listings did not load' : 'Nothing here yet'}</h2>
          <Link className={`${s.btn} ${s.primary}`} href="/cars">
            See every car
          </Link>
        </div>
      ) : (
        <MarketFeed vehicles={vehicles} mode="sale" />
      )}
    </MarketShell>
  );
}
