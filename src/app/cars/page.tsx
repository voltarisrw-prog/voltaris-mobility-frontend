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
      ? `electric ${filters.body[0]}s`
      : 'electric vehicles',
  );

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

  return (
    <MarketplacePage
      searchParams={searchParams}
      basePath="/cars"
      title={title}
      description={description}
    />
  );
}
