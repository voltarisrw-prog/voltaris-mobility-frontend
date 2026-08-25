'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
  SORT_OPTIONS,
  activeFilterCount,
  buildHref,
  parseFilters,
  type VehicleFilters as Filters,
} from '@/lib/vehicles/filters';
import type { VehicleFacets } from '@/lib/api/vehicles';
import { track } from '@/lib/analytics';

/**
 * Filters are URL state. This component only translates interactions into a new URL;
 * the server component re-renders the results. Nothing about the result set is held
 * in client memory, so a shared link always reproduces the same page.
 */
export function VehicleFilters({
  facets,
  resultCount,
}: {
  facets: VehicleFacets;
  resultCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const filters = useMemo(
    () => parseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  /**
   * The input holds a draft that the URL is the source of truth for. When the URL's
   * `q` changes underneath us — back button, "clear all", a shared link — the draft
   * has to follow. React's pattern for that is an adjustment during render against a
   * remembered previous value, not a setState inside an effect, which would render
   * once with the stale text before correcting itself.
   */
  const urlQuery = filters.q ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (syncedQuery !== urlQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  const apply = useCallback(
    (patch: Partial<Filters>, meta?: { filter: string; value: string }) => {
      // Any filter change resets pagination — page 4 of the old result set is meaningless.
      const next: Filters = { ...filters, ...patch, page: undefined };
      if (meta) track('filter_used', { ...meta, result_count: resultCount });
      startTransition(() => router.push(buildHref(next), { scroll: false }));
    },
    [filters, resultCount, router],
  );

  // Debounce so typing does not fire a navigation per keystroke.
  useEffect(() => {
    if (query === urlQuery) return;
    const timer = setTimeout(() => {
      apply({ q: query || undefined });
      if (query) track('search', { query, result_count: resultCount });
    }, 350);
    return () => clearTimeout(timer);
  }, [query, urlQuery, apply, resultCount]);

  const count = activeFilterCount(filters);

  return (
    <section aria-label="Filter vehicles" className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="vehicle-search" className="sr-only">
            Search by make, model, or keyword
          </label>
          <input
            id="vehicle-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search BYD, Nissan Leaf, SUV…"
            className="w-full border border-hairline panel-field px-4 py-3 text-sm placeholder:text-steel-muted focus:border-volt"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="vehicle-sort" className="sr-only">
            Sort results
          </label>
          <select
            id="vehicle-sort"
            value={filters.sort ?? 'relevance'}
            onChange={(event) => apply({ sort: event.target.value as Filters['sort'] })}
            className="border border-hairline panel-field px-3 py-3 font-data text-xs uppercase focus:border-volt"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="filter-panel"
            className="border border-chrome px-4 py-3 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
          >
            Filters{count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>

      <div
        id="filter-panel"
        hidden={!open}
        className="grid gap-5 border border-hairline bg-slab/60 p-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Facet
          label="Make"
          options={facets.makes}
          selected={filters.make?.[0]}
          onSelect={(value) =>
            apply({ make: value ? [value] : undefined }, { filter: 'make', value: value ?? 'any' })
          }
        />
        <Facet
          label="Body type"
          options={facets.bodies}
          selected={filters.body?.[0]}
          onSelect={(value) =>
            apply(
              { body: value ? [value as NonNullable<Filters['body']>[number]] : undefined },
              { filter: 'body', value: value ?? 'any' },
            )
          }
        />
        <Facet
          label="Location"
          options={facets.locations}
          selected={filters.location}
          onSelect={(value) =>
            apply({ location: value }, { filter: 'location', value: value ?? 'any' })
          }
        />
        <Facet
          label="Condition"
          options={[
            { value: 'new', label: 'New', count: 0 },
            { value: 'used', label: 'Used', count: 0 },
            { value: 'certified', label: 'Certified', count: 0 },
          ]}
          showCounts={false}
          selected={filters.condition}
          onSelect={(value) =>
            apply(
              { condition: value as Filters['condition'] },
              { filter: 'condition', value: value ?? 'any' },
            )
          }
        />

        <NumberField
          label="Max price (RWF)"
          value={filters.maxPrice}
          onCommit={(value) =>
            apply({ maxPrice: value }, { filter: 'maxPrice', value: String(value ?? 'any') })
          }
        />
        <NumberField
          label="Minimum range (km)"
          value={filters.minRange}
          onCommit={(value) =>
            apply({ minRange: value }, { filter: 'minRange', value: String(value ?? 'any') })
          }
        />
        <NumberField
          label="Max odometer (km)"
          value={filters.maxMileage}
          onCommit={(value) =>
            apply({ maxMileage: value }, { filter: 'maxMileage', value: String(value ?? 'any') })
          }
        />

        <div className="flex flex-col justify-end gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={filters.verified === true}
              onChange={(event) =>
                apply(
                  { verified: event.target.checked ? true : undefined },
                  { filter: 'verified', value: String(event.target.checked) },
                )
              }
              className="h-4 w-4 accent-volt"
            />
            Verified listings only
          </label>
          {count > 0 && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push('/cars'))}
              className="self-start font-data text-eyebrow uppercase text-volt underline underline-offset-4"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <p aria-live="polite" className="font-data text-xs tabular-nums text-steel-muted">
        {isPending ? 'Updating results…' : `${resultCount} vehicles match`}
      </p>
    </section>
  );
}

function Facet({
  label,
  options,
  selected,
  onSelect,
  showCounts = true,
}: {
  label: string;
  options: { value: string; label: string; count: number }[];
  selected: string | undefined;
  onSelect: (value: string | undefined) => void;
  showCounts?: boolean;
}) {
  const id = `facet-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      <select
        id={id}
        value={selected ?? ''}
        onChange={(event) => onSelect(event.target.value || undefined)}
        className="w-full border border-hairline panel-field px-3 py-2.5 text-sm focus:border-volt"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {showCounts && option.count > 0 ? ` (${option.count})` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number | undefined;
  onCommit: (value: number | undefined) => void;
}) {
  const committed = value?.toString() ?? '';
  const [draft, setDraft] = useState(committed);
  const [syncedValue, setSyncedValue] = useState(committed);
  // Same adjustment-during-render pattern as the search box above.
  if (syncedValue !== committed) {
    setSyncedValue(committed);
    setDraft(committed);
  }
  const id = `field-${label.toLowerCase().replace(/[^a-z]+/g, '-')}`;

  return (
    <div>
      <label htmlFor={id} className="eyebrow mb-2 block">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={0}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onCommit(draft === '' ? undefined : Number(draft))}
        className="w-full border border-hairline panel-field px-3 py-2.5 font-data text-sm tabular-nums focus:border-volt"
      />
    </div>
  );
}
