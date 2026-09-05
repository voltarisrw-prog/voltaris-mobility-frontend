import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/vehicles/MarketplacePage';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Electric Vehicles for Rent in Rwanda',
  description:
    'Browse electric vehicles available for rental in Rwanda. Compare range, battery, rental pricing, and availability, then reserve your vehicle through Voltaris.',
  path: '/rent',
});

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default function RentPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <MarketplacePage
      searchParams={searchParams}
      mode="rental"
      basePath="/rent"
      title="Electric Vehicles for Rent in Rwanda"
      description="Browse electric vehicles available for rental in Rwanda. Compare range, battery, rental pricing, and availability, then reserve your vehicle through Voltaris."
    />
  );
}
