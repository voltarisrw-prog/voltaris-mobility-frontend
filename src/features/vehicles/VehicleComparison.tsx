'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, LoadingSkeleton, useToast } from '@/components/ui';
import { RangeMeter } from '@/components/RangeMeter';
import { compareVehicles } from '@/lib/api/vehicles';
import { displayMessage } from '@/lib/api/errors';
import { formatKm, formatKwh, formatPrice } from '@/lib/format';
import { track } from '@/lib/analytics';
import { syncCompareFromUrl } from '@/lib/compare/store';
import type { VehicleDetail } from '@/types/vehicle';

const MAX = 4;

/**
 * A comparison that just prints database columns makes the reader do the work. Each
 * row here either answers a question a buyer actually has ("how long to charge?",
 * "what does a year of this cost?") or derives a figure they would otherwise compute
 * on their phone. `better` marks which direction wins so the table can highlight it.
 */
interface Row {
  label: string;
  group: string;
  value: (v: VehicleDetail) => string;
  numeric?: (v: VehicleDetail) => number | null;
  better?: 'higher' | 'lower';
  note?: string;
}

const ROWS: Row[] = [
  {
    group: 'Money',
    label: 'Price',
    value: (v) => formatPrice(v.price, v.currency),
    numeric: (v) => v.price,
    better: 'lower',
  },
  {
    group: 'Money',
    label: 'Cost per km of range',
    note: 'Price divided by range — what each kilometre of capability costs you up front.',
    value: (v) =>
      v.price === null ? '—' : formatPrice(Math.round(v.price / v.range_km), v.currency),
    numeric: (v) => (v.price === null ? null : Math.round(v.price / v.range_km)),
    better: 'lower',
  },
  {
    group: 'Money',
    label: 'Warranty on the battery',
    value: (v) =>
      v.warranty?.battery_months
        ? `${Math.round(v.warranty.battery_months / 12)} years${v.warranty.battery_km ? ` / ${formatKm(v.warranty.battery_km)}` : ''}`
        : 'Not stated',
  },
  {
    group: 'Range and battery',
    label: 'Driving range',
    value: (v) => `${v.range_km} km`,
    numeric: (v) => v.range_km,
    better: 'higher',
  },
  {
    group: 'Range and battery',
    label: 'Battery',
    value: (v) => formatKwh(v.battery_kwh),
    numeric: (v) => v.battery_kwh,
    better: 'higher',
  },
  {
    group: 'Range and battery',
    label: 'Efficiency',
    note: 'kWh per 100 km. Lower means cheaper to run and less time on a charger.',
    value: (v) => `${((v.battery_kwh / v.range_km) * 100).toFixed(1)} kWh/100km`,
    numeric: (v) => Number(((v.battery_kwh / v.range_km) * 100).toFixed(1)),
    better: 'lower',
  },
  {
    group: 'Charging',
    label: 'Full charge on a home socket',
    note: 'At the vehicle’s AC rate, which is what most Rwandan owners will actually use overnight.',
    value: (v) => `${(v.battery_kwh / v.charging.ac_kw).toFixed(1)} hours`,
    numeric: (v) => Number((v.battery_kwh / v.charging.ac_kw).toFixed(1)),
    better: 'lower',
  },
  {
    group: 'Charging',
    label: '10–80% on a DC charger',
    value: (v) =>
      v.charging.dc_10_80_minutes ? `${v.charging.dc_10_80_minutes} min` : 'No DC charging',
    numeric: (v) => v.charging.dc_10_80_minutes,
    better: 'lower',
  },
  { group: 'Charging', label: 'Charge port', value: (v) => v.charging.port_type },
  {
    group: 'The car',
    label: 'Year',
    value: (v) => String(v.year),
    numeric: (v) => v.year,
    better: 'higher',
  },
  {
    group: 'The car',
    label: 'Odometer',
    value: (v) => formatKm(v.mileage_km),
    numeric: (v) => v.mileage_km,
    better: 'lower',
  },
  {
    group: 'The car',
    label: 'Power',
    value: (v) => `${v.power_kw} kW`,
    numeric: (v) => v.power_kw,
    better: 'higher',
  },
  { group: 'The car', label: 'Drivetrain', value: (v) => v.drivetrain.toUpperCase() },
  { group: 'The car', label: 'Seats', value: (v) => String(v.seats) },
  {
    group: 'The car',
    label: 'Boot space',
    value: (v) => (v.dimensions?.boot_litres ? `${v.dimensions.boot_litres} L` : 'Not stated'),
    numeric: (v) => v.dimensions?.boot_litres ?? null,
    better: 'higher',
  },
  { group: 'Ownership', label: 'Condition', value: (v) => v.condition },
  { group: 'Ownership', label: 'Where it is', value: (v) => v.location.city },
  {
    group: 'Ownership',
    label: 'Verified by Voltaris',
    value: (v) => (v.verified ? 'Yes' : 'Not yet'),
  },
  {
    group: 'Ownership',
    label: 'Sold by',
    value: (v) => (v.seller.type === 'dealer' ? 'Dealer' : 'Private owner'),
  },
];

export function VehicleComparison() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, MAX);

  const key = ids.join(',');

  // The basket that fed vehicles in from cards and detail pages hands off to this
  // page's URL, and from here the URL is what's authoritative — including when
  // someone removes a vehicle below. Folding it back keeps the two from disagreeing
  // if the person browses back to the marketplace afterwards.
  useEffect(() => {
    syncCompareFromUrl(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /**
   * The result is stamped with the id set that produced it. Loading is then derived
   * — `result.key !== key` means the URL moved on and what we hold is stale — rather
   * than being tracked in a second state that has to be reset inside the effect.
   * That reset was a synchronous setState in an effect body, which cascades renders.
   */
  const [result, setResult] = useState<
    { key: string; vehicles: VehicleDetail[] } | { key: string; error: string } | null
  >(null);

  useEffect(() => {
    if (key === '') return;
    let cancelled = false;
    const requested = key.split(',');

    compareVehicles(requested)
      .then((vehicles) => {
        if (cancelled) return;
        setResult({ key, vehicles });
        track('compare_vehicle', { vehicle_ids: requested, count: requested.length });
      })
      .catch((cause: unknown) => {
        if (!cancelled) setResult({ key, error: displayMessage(cause) });
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  const current = result?.key === key ? result : null;
  const error = current && 'error' in current ? current.error : null;
  const vehicles = current && 'vehicles' in current ? current.vehicles : null;

  function remove(id: string) {
    const next = ids.filter((value) => value !== id);
    router.replace(next.length > 0 ? `/compare?ids=${next.join(',')}` : '/compare');
  }

  if (ids.length === 0) {
    return (
      <div className="border border-dashed border-hairline px-6 py-16 text-center">
        <h2 className="font-display text-headline">Nothing to compare yet</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-steel">
          Add vehicles from the marketplace and they line up here side by side, with charging times
          and cost per kilometre worked out for you.
        </p>
        <Link
          href="/cars"
          className="mt-6 inline-block bg-volt px-5 py-2.5 font-data text-eyebrow uppercase text-surface hover:bg-volt-bright"
        >
          Browse electric and hybrid cars
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-danger/25 bg-danger/5 p-8 text-center">
        <p className="text-sm text-steel">{error}</p>
        <Button variant="secondary" className="mt-5" onClick={() => router.refresh()}>
          Try again
        </Button>
      </div>
    );
  }

  if (!vehicles) return <LoadingSkeleton lines={10} />;

  const groups = [...new Set(ROWS.map((row) => row.group))];

  return (
    <div className="voltaris-comparison">
      <div className="voltaris-comparison-stage">
        <div className="voltaris-comparison-stage-kicker">
          <span className="eyebrow">YOUR SHORTLIST</span>
          <span className="font-data text-[0.6rem] uppercase tracking-[0.16em] text-steel-muted">
            {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="voltaris-comparison-table w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              Side-by-side comparison of {vehicles.length} electric and hybrid vehicles
            </caption>
            <thead>
              <tr>
                <th scope="col" className="voltaris-comparison-label-head">
                  <span className="eyebrow">COMPARE</span>
                </th>
                {vehicles.map((vehicle, index) => (
                  <th
                    key={vehicle.id}
                    scope="col"
                    className="voltaris-comparison-vehicle-head"
                  >
                    <Link
                      href={`/cars/${vehicle.slug}`}
                      className="voltaris-comparison-vehicle-image"
                      aria-label={`View details for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    >
                      {vehicle.primary_image ? (
                        <Image
                          src={
                            vehicle.primary_image.detail ??
                            vehicle.primary_image.card
                          }
                          alt={
                            vehicle.primary_image.alt ||
                            `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                          }
                          fill
                          sizes="(min-width: 1024px) 14rem, 12.5rem"
                          className="object-cover transition-transform duration-700 ease-out hover:scale-[1.035]"
                          {...(vehicle.primary_image.blur_data_url
                            ? {
                                placeholder: 'blur' as const,
                                blurDataURL:
                                  vehicle.primary_image.blur_data_url,
                              }
                            : {})}
                        />
                      ) : (
                        <span className="font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
                          Photos coming soon
                        </span>
                      )}
                    </Link>

                    <div className="voltaris-comparison-index">
                      0{index + 1}
                    </div>

                    <Link
                      href={`/cars/${vehicle.slug}`}
                      className="voltaris-comparison-vehicle-name"
                    >
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Link>

                    <div className="voltaris-comparison-range">
                      <span className="font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
                        RANGE
                      </span>
                      <span className="font-data text-sm tabular-nums text-chrome">
                        {vehicle.range_km} km
                      </span>
                    </div>

                    <RangeMeter rangeKm={vehicle.range_km} showLabel={false} />

                    <button
                      type="button"
                      onClick={() => remove(vehicle.id)}
                      className="voltaris-comparison-remove"
                    >
                      Remove vehicle
                    </button>
                  </th>
                ))}
              </tr>
            </thead>

            {groups.map((group) => {
              const rows = ROWS.filter((row) => row.group === group);
              return (
            <tbody key={group} className="voltaris-comparison-group">
              <tr>
                <th
                  colSpan={vehicles.length + 1}
                  scope="colgroup"
                  className="voltaris-comparison-group-head"
                >
                  <span className="voltaris-comparison-group-number">
                    {String(groups.indexOf(group) + 1).padStart(2, '0')}
                  </span>
                  <span className="eyebrow">{group}</span>
                </th>
              </tr>
              {rows.map((row) => {
                const numbers = row.numeric ? vehicles.map(row.numeric) : [];
                const valid = numbers.filter((n): n is number => n !== null);
                const best =
                  row.better && valid.length > 1
                    ? row.better === 'higher'
                      ? Math.max(...valid)
                      : Math.min(...valid)
                    : null;

                return (
                  <tr key={row.label} className="voltaris-comparison-row">
                    <th scope="row" className="voltaris-comparison-row-label">
                      <span className="text-steel">{row.label}</span>
                      {row.note && (
                        <span className="voltaris-comparison-row-note">{row.note}</span>
                      )}
                    </th>
                    {vehicles.map((vehicle, index) => {
                      const isBest = best !== null && numbers[index] === best;
                      return (
                        <td
                          key={vehicle.id}
                          className={isBest ? 'voltaris-comparison-value is-best' : 'voltaris-comparison-value'}
                        >
                          <span className="font-data text-sm tabular-nums">
                            {row.value(vehicle)}
                          </span>
                          {isBest && (
                            <>
                              <span className="voltaris-comparison-best-mark" aria-hidden="true">
                                BEST
                              </span>
                              <span className="sr-only"> (best of the compared vehicles)</span>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          );
            })}
          </table>
        </div>
      </div>

      <p className="mt-8 max-w-prose text-xs leading-relaxed text-steel-muted">
        Charging times are calculated from battery size and the vehicle’s stated charge rate, so
        they are an upper bound — real sessions taper near full. Range figures are manufacturer
        claims; expect less on Rwandan hills with a full car. Ask us for the battery health report
        before you commit to a used EV.
      </p>

      <Button
        variant="ghost"
        className="mt-6"
        onClick={() => {
          toast.push(
            'success',
            'Comparison link copied. Anyone you send it to sees the same table.',
          );
          void navigator.clipboard?.writeText(window.location.href);
        }}
      >
        Copy comparison link
      </Button>
    </div>
  );
}
