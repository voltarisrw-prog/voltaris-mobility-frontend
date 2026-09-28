'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Clock3, MapPin } from 'lucide-react';
import { getRentalAvailability, getRentalLocations, getRentalQuote } from '@/lib/api/rentals';
import { formatPrice } from '@/lib/format';
import type { RentalLocation, RentalQuote } from '@/types/rental';
import { RentalCalendar, iso } from './RentalCalendar';

const pad = (value: number) => String(value).padStart(2, '0');
const nowParts = () => {
  const now = new Date();
  return { date: iso(now), time: `${pad(now.getHours())}:${pad(now.getMinutes())}` };
};

/**
 * Dates + pickup on the vehicle page itself. Calendar first (booked days
 * greyed), then times and pickup point, then the priced quote from the
 * backend — per day and total — then deposit and terms in one collapsible
 * line, then Reserve. The frontend never sends a price; `/checkout/start`
 * creates the order and the backend prices it.
 */
export function RentalCheckoutPanel({
  vehicleId,
  dailyRate,
  currency,
}: {
  vehicleId: string;
  dailyRate?: number | null;
  currency?: string;
}) {
  const [range, setRange] = useState({ start: '', end: '' });
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<RentalLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [quote, setQuote] = useState<RentalQuote | null>(null);
  const [quoteFailedFor, setQuoteFailedFor] = useState('');
  const [error, setError] = useState('');
  const today = nowParts().date;

  useEffect(() => {
    let cancelled = false;
    getRentalLocations()
      .then((list) => {
        if (cancelled) return;
        setLocations(list);
        if (list.length === 1) setLocation(list[0]!.id);
      })
      .catch(() => !cancelled && setLocations([]))
      .finally(() => !cancelled && setLocationsLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const loadAvailability = (window: { from: string; to: string }) => {
    getRentalAvailability(vehicleId, window)
      .then((days) => setUnavailable((prev) => new Set([...prev, ...days])))
      .catch(() => undefined);
  };
  useEffect(() => {
    const first = new Date(); first.setDate(1);
    const last = new Date(first.getFullYear(), first.getMonth() + 2, 0);
    loadAvailability({ from: iso(first), to: iso(last) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  const start = range.start ? `${range.start}T${startTime}` : '';
  const end = range.end ? `${range.end}T${endTime}` : '';

  const quoteKey = location && start && end && end > start ? `${location}|${start}|${end}` : '';
  useEffect(() => {
    if (!quoteKey) return;
    let cancelled = false;
    getRentalQuote(vehicleId, { location, start, end })
      .then((q) => !cancelled && setQuote(q))
      .catch(() => !cancelled && setQuoteFailedFor(quoteKey));
    return () => {
      cancelled = true;
    };
  }, [vehicleId, location, start, end, quoteKey]);

  const quoteMatches =
    quote !== null && quote.location_id === location && quote.start_date === start && quote.end_date === end;
  // "Loading" is derived: a window is chosen, no matching quote yet, and it has not failed.
  const quoteLoading = Boolean(quoteKey) && !quoteMatches && quoteFailedFor !== quoteKey;

  const days = useMemo(() => {
    if (!range.start || !range.end) return 0;
    return Math.max(1, Math.round((new Date(range.end).getTime() - new Date(range.start).getTime()) / 86_400_000));
  }, [range]);

  const perDay = quoteMatches ? quote.daily_rate : dailyRate ?? null;
  const estTotal = quoteMatches ? quote.total : perDay && days ? perDay * days : null;
  const cur = quoteMatches ? quote.currency : currency;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!range.start || !range.end) return setError('Pick a pickup day and a return day on the calendar.');
    if (range.start === today && startTime < nowParts().time) return setError('Pickup time cannot be in the past.');
    if (end <= start) return setError('Return must be after pickup.');
    if (!location) return setError('Choose a pickup point.');
    if (quoteLoading) return setError('Checking availability — one moment.');
    if (!quoteMatches) return setError('We could not confirm these dates. Try again.');
    if (!quote.available) return setError(quote.unavailable_reason || 'Not available for these dates.');
    const params = new URLSearchParams({ vehicle: vehicleId, kind: 'rental', rentalLocation: location, rentalStart: start, rentalEnd: end });
    window.location.assign(`/checkout/start?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <RentalCalendar
        start={range.start}
        end={range.end}
        unavailable={unavailable}
        minDate={today}
        onChange={setRange}
        onMonthChange={loadAvailability}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="eyebrow mb-2 flex items-center gap-2"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />Pickup time</span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="min-h-12 w-full border border-hairline bg-surface px-3 text-sm text-chrome outline-none focus:border-volt" />
        </label>
        <label className="block">
          <span className="eyebrow mb-2 flex items-center gap-2"><Clock3 aria-hidden="true" className="h-3.5 w-3.5" />Return time</span>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="min-h-12 w-full border border-hairline bg-surface px-3 text-sm text-chrome outline-none focus:border-volt" />
        </label>
      </div>

      <label className="block">
        <span className="eyebrow mb-2 flex items-center gap-2"><MapPin aria-hidden="true" className="h-3.5 w-3.5" />Pickup point</span>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={locationsLoading || locations.length === 0}
          className="min-h-12 w-full border border-hairline bg-surface px-3 text-sm text-chrome outline-none focus:border-volt disabled:opacity-60"
        >
          <option value="">{locationsLoading ? 'Loading…' : locations.length ? 'Choose a pickup point' : 'No pickup points available'}</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name} · {l.city}</option>
          ))}
        </select>
      </label>

      {/* Price: per day and total, as soon as two dates exist. */}
      {(perDay || estTotal) && (
        <div className="border border-hairline bg-surface p-4" aria-live="polite">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">{quoteMatches ? 'Price' : 'Estimate'}</p>
              {perDay && <p className="mt-1 text-sm text-chrome">{formatPrice(perDay, cur)} / day</p>}
            </div>
            <div className="text-right">
              <p className="font-data text-[0.65rem] uppercase tracking-[0.14em] text-steel-muted">
                {quoteLoading ? 'Checking…' : days ? `${days} day${days === 1 ? '' : 's'}` : ''}
              </p>
              {estTotal !== null && (
                <p className="mt-1 font-display text-2xl font-semibold tabular-nums tracking-tight text-chrome">{formatPrice(estTotal, cur)}</p>
              )}
            </div>
          </div>
          {quoteMatches && !quote.available && (
            <p className="mt-3 border-t border-hairline pt-3 text-xs text-red-600">{quote.unavailable_reason || 'Unavailable for these dates.'}</p>
          )}
        </div>
      )}

      <details className="group border-y border-hairline">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between marker:hidden">
          <span className="font-data text-eyebrow uppercase tracking-[0.1em] text-chrome">Deposit &amp; terms</span>
          <ChevronDown aria-hidden="true" className="h-4 w-4 text-steel-muted transition-transform group-open:rotate-180" />
        </summary>
        <dl className="grid gap-2 pb-4 text-sm">
          {quoteMatches && quote.lines.length > 0 ? (
            quote.lines.map((line) => (
              <div key={line.label} className="flex justify-between gap-4">
                <dt className="text-steel">{line.label}</dt>
                <dd className="font-data tabular-nums text-chrome">{formatPrice(line.amount, cur)}</dd>
              </div>
            ))
          ) : (
            <p className="text-steel-muted">Deposit, insurance and mileage terms are itemised once dates are confirmed.</p>
          )}
          <p className="mt-2 text-xs leading-relaxed text-steel-muted">
            Refundable deposit held until return. Condition and charge level recorded at handover and return. Cancel free up to 48 h before pickup.
          </p>
        </dl>
      </details>

      {error && <p role="alert" className="font-data text-xs uppercase tracking-wide text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={locationsLoading || quoteLoading || !quoteMatches || !quote.available}
        className="flex min-h-12 w-full items-center justify-center gap-2 bg-volt px-5 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright disabled:cursor-not-allowed disabled:opacity-45"
      >
        Reserve
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>
    </form>
  );
}
