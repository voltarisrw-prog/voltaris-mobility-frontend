'use client';

export function VehicleFilters({
  resultCount,
}: {
  facets: unknown;
  resultCount: number;
  basePath?: string;
}) {
  return (
    <section aria-label="Vehicle results" className="space-y-4">
      <p
        aria-live="polite"
        className="font-data text-xs tabular-nums text-steel-muted"
      >
        {resultCount} vehicles available
      </p>
    </section>
  );
}
