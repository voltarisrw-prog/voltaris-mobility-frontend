import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/vehicles/MarketplacePage';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Electric Vehicles for Sale in Rwanda',
  description:
    'Browse electric vehicles for sale in Rwanda from verified dealers and private owners. Compare range, battery, price, and condition, then book a test drive through Voltaris.',
  path: '/buy',
});

type SearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

export default function BuyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <MarketplacePage
      searchParams={searchParams}
      mode="sale"
      basePath="/buy"
      title="Electric Vehicles for Sale in Rwanda"
      description="Browse electric vehicles for sale in Rwanda from verified dealers and private owners. Compare range, battery, price, and condition, then book a test drive through Voltaris."
    />
  );
}
