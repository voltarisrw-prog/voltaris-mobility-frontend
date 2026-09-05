'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { buildHref, parseFilters, type VehicleFilters } from '@/lib/vehicles/filters';

export function RentalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => parseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const next: VehicleFilters = {
      ...filters,
      mode: 'rental',
      rentalLocation: String(formData.get('rentalLocation') || '') || undefined,
      rentalStart: String(formData.get('rentalStart') || '') || undefined,
      rentalEnd: String(formData.get('rentalEnd') || '') || undefined,
      page: undefined,
    };

    startTransition(() => {
      router.push(buildHref(next, '/rent'), { scroll: false });
    });
  };

  return (
    <form
      onSubmit={submit}
      className="border border-hairline bg-slab/60 p-4 sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="rental-location" className="eyebrow mb-2 block">
            Pickup location
          </label>
          <input
            id="rental-location"
            type="text"
            name="rentalLocation"
            defaultValue={filters.rentalLocation ?? ''}
            placeholder="Kigali"
            className="w-full border border-hairline panel-field px-3 py-3 text-sm focus:border-volt"
          />
        </div>

        <div>
          <label htmlFor="rental-start" className="eyebrow mb-2 block">
            Start date
          </label>
          <input
            id="rental-start"
            type="date"
            name="rentalStart"
            defaultValue={filters.rentalStart ?? ''}
            className="w-full border border-hairline panel-field px-3 py-3 text-sm focus:border-volt"
          />
        </div>

        <div>
          <label htmlFor="rental-end" className="eyebrow mb-2 block">
            End date
          </label>
          <input
            id="rental-end"
            type="date"
            name="rentalEnd"
            defaultValue={filters.rentalEnd ?? ''}
            min={filters.rentalStart ?? undefined}
            className="w-full border border-hairline panel-field px-3 py-3 text-sm focus:border-volt"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright disabled:opacity-60"
        >
          {isPending ? 'Searching…' : 'Search rentals'}
        </button>
        <p className="font-data text-xs text-steel-muted">
          {filters.rentalStart && filters.rentalEnd
            ? 'Availability and rental pricing will update automatically.'
            : 'Choose your dates to see rental availability.'}
        </p>

      </div>
    </form>
  );
}
