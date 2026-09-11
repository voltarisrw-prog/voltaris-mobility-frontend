import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/vehicles/MarketplacePage';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Electric & Hybrid Cars for Sale',
  description:
    '',
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
      title="Electric & Hybrid Cars for Sale"
      description=""
    />
  );
}
