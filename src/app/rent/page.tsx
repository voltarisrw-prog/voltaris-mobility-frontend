import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/vehicles/MarketplacePage';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Drive what fits your journey',
  description:
    '',
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
      title="Drive what fits your journey"
      description=""
    />
  );
}
