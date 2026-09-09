import type { Metadata } from 'next';
import { MarketplacePage } from '@/features/vehicles/MarketplacePage';
import {
  isIndexable,
  parseFilters,
  canonicalPath,
  type RawSearchParams,
} from '@/lib/vehicles/filters';
import { buildMetadata } from '@/lib/seo/metadata';

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
  if (make) {
    parts.push(make.replace(/\b\w/g, (c: string) => c.toUpperCase()));
  }

  parts.push(
    filters.body?.[0]
      ? `electric and hybrid ${filters.body[0]}s`
      : 'electric and hybrid cars',
  );

  const where = filters.location
    ? filters.location.replace(/\b\w/g, (c: string) => c.toUpperCase())
    : 'Rwanda';

  const hasFilters =
    filters.condition ||
    filters.make?.[0] ||
    filters.body?.[0] ||
    filters.location;

  const title = hasFilters
    ? `${parts.join(' ')} for sale in ${where}`
    : 'Find what moves you';

  return {
    title,
    description: hasFilters
      ? 'Explore electric and hybrid cars available through Voltaris.'
      : 'Explore electric and hybrid cars through Voltaris',
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
    noindex: !isIndexable(filters),
    follow: true,
  });
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const filters = parseFilters(await searchParams);
  const { title, description } = describe(filters);
  const mode = filters.mode === 'rental' ? 'rental' : 'sale';

  return (
    <MarketplacePage
      searchParams={searchParams}
      mode={mode}
      basePath="/cars"
      title={title}
      description={description}
    />
  );
}
