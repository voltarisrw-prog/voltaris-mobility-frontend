'use client';

import Image from 'next/image';
import { Check, Link2, X } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, LoadingSkeleton, useToast } from '@/components/ui';
import './vehicle-comparison.css';
import { compareVehicles } from '@/lib/api/vehicles';
import { displayMessage } from '@/lib/api/errors';
import { formatKm, formatKwh, formatPrice } from '@/lib/format';
import { track } from '@/lib/analytics';
import { getCompareMode, syncCompareFromUrl } from '@/lib/compare/store';
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
  const [diffOnly, setDiffOnly] = useState(false);
  const [copied, setCopied] = useState(false);
  const ids = (searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, MAX);
  const modeParam = searchParams.get('mode');
  const mode = modeParam === 'rental' ? 'rental' : 'sale';
  const storedMode = ids[0] ? getCompareMode(ids[0]) : null;
  const modeMismatch = storedMode !== null && storedMode !== mode;

  const key = ids.join(',');

  // The basket that fed vehicles in from cards and detail pages hands off to this
  // page's URL, and from here the URL is what's authoritative — including when
  // someone removes a vehicle below. Folding it back keeps the two from disagreeing
  // if the person browses back to the marketplace afterwards.
  useEffect(() => {
    syncCompareFromUrl(ids, mode);
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
    router.replace(
      next.length > 0
        ? `/compare?ids=${next.join(',')}&mode=${mode}`
        : '/compare',
    );
  }

  if (modeMismatch) {
    return (
      <div className="border border-dashed border-hairline px-6 py-16 text-center">
        <h2 className="font-display text-headline">Comparison mode mismatch</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-steel">
          Buy vehicles can only be compared with other vehicles for sale, and rental vehicles can
          only be compared with other rental vehicles. Return to the marketplace and start a new
          comparison.
        </p>
        <Link
          href={mode === 'rental' ? '/cars?mode=rental' : '/cars'}
          className="mt-6 inline-block bg-volt px-5 py-2.5 font-data text-eyebrow uppercase text-surface hover:bg-volt-bright"
        >
          Browse {mode === 'rental' ? 'rental' : 'vehicles for sale'}
        </Link>
      </div>
    );
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
  const COLORS = ['#5CC8FF', '#12d6b0', '#8b9cff', '#ffb84d'];
  const maxRange = Math.max(...vehicles.map((v) => v.range_km));
  const shortName = (v: VehicleDetail) => `${v.make} ${v.model}`;

  // Scoreboard. A row only counts as won when the numbers actually differ, so a tie
  // (both cars are 2024) no longer marks everything as "best".
  const wins = vehicles.map(() => 0);
  let ties = 0;
  let measurable = 0;
  const results = new Map<
    string,
    { values: string[]; numbers: (number | null)[]; best: number | null; same: boolean }
  >();
  for (const row of ROWS) {
    const numbers = row.numeric ? vehicles.map(row.numeric) : [];
    const valid = numbers.filter((n): n is number => n !== null);
    const values = vehicles.map((v) => row.value(v));
    const decisive = Boolean(row.better) && valid.length > 1 && new Set(valid).size > 1;
    const best = decisive
      ? row.better === 'higher'
        ? Math.max(...valid)
        : Math.min(...valid)
      : null;
    if (row.better && valid.length > 1) {
      measurable += 1;
      if (best === null) ties += 1;
      else
        numbers.forEach((n, i) => {
          if (n === best) wins[i] = (wins[i] ?? 0) + 1;
        });
    }
    results.set(row.label, {
      values,
      numbers,
      best,
      same: values.every((x) => x === values[0]),
    });
  }
  const topWins = Math.max(...wins);
  const leaders = vehicles.filter((_, i) => wins[i] === topWins);
  const leader = leaders.length === 1 ? leaders[0] : undefined;
  const verdict =
    topWins === 0
      ? 'Nothing separates these vehicles yet'
      : leader
        ? `${shortName(leader)} leads on ${topWins} of ${measurable} measurable rows`
        : `Neck and neck across ${measurable} measurable rows`;

  return (
    <div className="vc">
      <div className="vc-board">
        <div className="vc-top">
          <strong>Your shortlist</strong>
          <span>
            {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
          </span>
        </div>

        <div className="vc-scroller" data-n={vehicles.length}>
          <div
            className="vc-table"
            role="table"
            aria-label={`Side-by-side comparison of ${vehicles.length} electric and hybrid vehicles`}
            style={{ '--n': vehicles.length } as CSSProperties}
          >
            <div className="vc-r" role="row">
              <div className="vc-lab" role="columnheader">
                <span>Compare</span>
                <small>Side by side, best value marked</small>
              </div>
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="vc-car" role="columnheader">
                  <Link
                    href={`/cars/${vehicle.slug}`}
                    className="vc-photo"
                    aria-label={`View details for ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  >
                    {vehicle.primary_image ? (
                      <Image
                        src={vehicle.primary_image.detail ?? vehicle.primary_image.card}
                        alt={
                          vehicle.primary_image.alt ||
                          `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                        }
                        fill
                        sizes="(min-width: 1024px) 24rem, 50vw"
                        className="object-cover"
                        {...(vehicle.primary_image.blur_data_url
                          ? {
                              placeholder: 'blur' as const,
                              blurDataURL: vehicle.primary_image.blur_data_url,
                            }
                          : {})}
                      />
                    ) : (
                      <span className="vc-nophoto">Photos coming soon</span>
                    )}
                  </Link>
                  <Link href={`/cars/${vehicle.slug}`} className="vc-name">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </Link>
                  <div className="vc-price">{formatPrice(vehicle.price, vehicle.currency)}</div>
                  <div className="vc-rng">
                    <span>Range</span>
                    <b>{vehicle.range_km} km</b>
                  </div>
                  <div className="vc-meter">
                    <i style={{ width: `${(vehicle.range_km / maxRange) * 100}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(vehicle.id)}
                    className="vc-rm"
                    aria-label={`Remove ${vehicle.year} ${vehicle.make} ${vehicle.model} from the comparison`}
                  >
                    <span className="vc-rm-x" aria-hidden="true">
                      <X size={12} strokeWidth={2.75} />
                    </span>
                    Remove vehicle
                  </button>
                </div>
              ))}
            </div>

            {vehicles.length > 1 && measurable > 0 && (
              <div className="vc-verdict">
                <p>{verdict}</p>
                <div className="vc-vbar" role="img" aria-label="Head-to-head results">
                  {vehicles.map((v, i) =>
                    wins[i] ? (
                      <i key={v.id} style={{ flex: wins[i], background: COLORS[i] }} />
                    ) : null,
                  )}
                  {ties > 0 && <i style={{ flex: ties, background: 'var(--vc-line)' }} />}
                </div>
                <div className="vc-vkey">
                  {vehicles.map((v, i) => (
                    <span key={v.id} style={{ '--c': COLORS[i] } as CSSProperties}>
                      {shortName(v)} {wins[i]}
                    </span>
                  ))}
                  {ties > 0 && (
                    <span style={{ '--c': 'var(--vc-line)' } as CSSProperties}>Equal {ties}</span>
                  )}
                </div>
              </div>
            )}

            {vehicles.length > 1 && (
              <label className="vc-tools">
                <span>Show differences only</span>
                <input
                  type="checkbox"
                  className="vc-tg"
                  checked={diffOnly}
                  onChange={(e) => setDiffOnly(e.target.checked)}
                />
              </label>
            )}

            <div className="vc-r" aria-hidden="true">
              <div className="vc-ch vc-ch-lab" />
              {vehicles.map((v, i) => (
                <div key={v.id} className="vc-ch" style={{ '--c': COLORS[i] } as CSSProperties}>
                  <span className="vc-dot" />
                  {shortName(v)}
                </div>
              ))}
            </div>

            {groups.map((group) => (
              <div key={group} className="vc-g">
                <div className="vc-gh" role="row">
                  <div role="columnheader">{group}</div>
                </div>
                {ROWS.filter((row) => row.group === group).map((row) => {
                  const r = results.get(row.label);
                  if (!r) return null;
                  return (
                    <div key={row.label} role="row" className="vc-r" hidden={diffOnly && r.same}>
                      <div role="rowheader" className="vc-l">
                        {row.label}
                        {row.note && <small>{row.note}</small>}
                      </div>
                      {vehicles.map((vehicle, i) => {
                        const isBest = r.best !== null && r.numbers[i] === r.best;
                        return (
                          <div
                            key={vehicle.id}
                            role="cell"
                            className={isBest ? 'vc-c is-best' : 'vc-c'}
                          >
                            <span>{r.values[i]}</span>
                            {isBest && (
                              <>
                                <span className="vc-best" aria-hidden="true">
                                  Best
                                </span>
                                <span className="sr-only"> (best of the compared vehicles)</span>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="vc-next" aria-label="Choose your next step">
        <h2>Choose what happens next</h2>
        <p>
          Compare the numbers, then order your preferred car or book a free demo drive before you
          decide.
        </p>
        <div className="vc-picks">
          {vehicles.map((vehicle) => {
            const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            return (
              <article key={vehicle.id} className="vc-pick">
                <div>
                  <span>{vehicle.make}</span>
                  <strong>{vehicleTitle}</strong>
                </div>
                <div className="vc-btns">
                  <Link
                    href={`/checkout/start?vehicle=${encodeURIComponent(vehicle.id)}`}
                    className="vc-btn"
                  >
                    Order this car
                  </Link>
                  <Link
                    href={`/test-drive?vehicle=${encodeURIComponent(vehicle.id)}`}
                    className="vc-btn vc-ghost"
                  >
                    Free demo drive
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <p className="vc-fine">
        Charging times are calculated from battery size and the vehicle’s stated charge rate, so
        they are an upper bound — real sessions taper near full. Range figures are manufacturer
        claims; expect less on Rwandan hills with a full car. Ask us for the battery health report
        before you commit to a used EV.
      </p>

      <button
        type="button"
        className="vc-copy"
        data-copied={copied}
        onClick={() => {
          toast.push(
            'success',
            'Comparison link copied. Anyone you send it to sees the same table.',
          );
          void navigator.clipboard?.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2200);
        }}
      >
        {copied ? <Check size={16} strokeWidth={2.5} /> : <Link2 size={16} strokeWidth={2.25} />}
        {copied ? 'Link copied' : 'Copy comparison link'}
      </button>
    </div>
  );
}
