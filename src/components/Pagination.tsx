import Link from 'next/link';
import { buildHref, type VehicleFilters } from '@/lib/vehicles/filters';

/**
 * Real anchors, so crawlers can walk the result set and people can open pages in a
 * new tab. `rel=prev/next` is no longer a ranking signal but remains a correct
 * relationship declaration.
 */
export function Pagination({
  filters,
  page,
  totalPages,
  basePath = '/cars',
}: {
  filters: VehicleFilters;
  page: number;
  totalPages: number;
  basePath?: string;
}) {
  if (totalPages <= 1) return null;
  const hrefFor = (target: number) =>
    buildHref({ ...filters, page: target === 1 ? undefined : target }, basePath);

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-hairline/60 pt-6"
    >
      {page > 1 ? (
        <Link
          rel="prev"
          href={hrefFor(page - 1)}
          className="font-data text-eyebrow uppercase hover:text-volt"
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="font-data text-xs tabular-nums text-steel-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          rel="next"
          href={hrefFor(page + 1)}
          className="font-data text-eyebrow uppercase hover:text-volt"
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
