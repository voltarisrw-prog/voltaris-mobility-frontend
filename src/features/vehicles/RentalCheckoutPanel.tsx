'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { getRentalLocations, getRentalQuote } from '@/lib/api/rentals';
import { formatPrice } from '@/lib/format';
import type { RentalLocation, RentalQuote } from '@/types/rental';

const pad = (value: number) => String(value).padStart(2, '0');

const getLocalDateTime = () => {
  const now = new Date();

  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
};

export function RentalCheckoutPanel({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [locations, setLocations] = useState<RentalLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [error, setError] = useState('');
  const [quote, setQuote] = useState<RentalQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [today, setToday] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setLocationsLoading(true);
      setLocationError('');

      try {
        const nextLocations = await getRentalLocations();

        if (!cancelled) {
          setLocations(nextLocations);

          const firstLocation = nextLocations[0];

          if (firstLocation && nextLocations.length === 1) {
            setLocation(firstLocation.id);
          }
        }
      } catch {
        if (!cancelled) {
          setLocations([]);
          setLocationError('Rental pickup locations could not be loaded.');
        }
      } finally {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = getLocalDateTime();
      setToday(now.date);
      setCurrentTime(now.time);
    };

    updateClock();

    const interval = window.setInterval(updateClock, 30_000);

    return () => window.clearInterval(interval);
  }, []);

  const startTimeMin = startDate === today ? currentTime : undefined;
  const endTimeMin = endDate === startDate ? startTime || undefined : undefined;

  const start = startDate && startTime ? `${startDate}T${startTime}` : '';
  const end = endDate && endTime ? `${endDate}T${endTime}` : '';

  useEffect(() => {
    if (!location.trim() || !start || !end || end <= start) {
      return;
    }

    let cancelled = false;

    const loadQuote = async () => {
      setQuoteLoading(true);

      try {
        const nextQuote = await getRentalQuote(vehicleId, {
          location: location.trim(),
          start,
          end,
        });

        if (!cancelled) {
          setQuote(nextQuote);
        }
      } catch {
        if (!cancelled) {
          setQuote(null);
        }
      } finally {
        if (!cancelled) {
          setQuoteLoading(false);
        }
      }
    };

    loadQuote();

    return () => {
      cancelled = true;
    };
  }, [vehicleId, location, start, end]);

  const quoteMatches =
    quote !== null &&
    quote.location_id === location.trim() &&
    quote.start_date === start &&
    quote.end_date === end;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!startDate || !startTime || !endDate || !endTime) {
      setError('Choose a pickup date and time, and a return date and time.');
      return;
    }

    if (startDate < today) {
      setError('Pickup date cannot be in the past.');
      return;
    }

    if (startDate === today && startTime < currentTime) {
      setError('Pickup time cannot be in the past.');
      return;
    }

    const rentalStart = `${startDate}T${startTime}`;
    const rentalEnd = `${endDate}T${endTime}`;

    if (rentalEnd <= rentalStart) {
      setError('Return must be after the pickup date and time.');
      return;
    }

    if (!location.trim()) {
      setError('Choose a pickup location.');
      return;
    }

    if (quoteLoading) {
      setError('Checking rental availability. Please wait a moment.');
      return;
    }

    if (!quoteMatches) {
      setError('We could not confirm this rental window. Check the details and try again.');
      return;
    }

    if (!quote.available) {
      setError(quote.unavailable_reason || 'This vehicle is not available for the selected dates.');
      return;
    }

    const params = new URLSearchParams({
      vehicle: vehicleId,
      kind: 'rental',
      rentalLocation: location.trim(),
      rentalStart,
      rentalEnd,
    });

    window.location.assign(`/checkout/start?${params.toString()}`);
  };

  return (
    <form
      onSubmit={submit}
      className="mt-4 border border-hairline bg-slab/40 p-4"
    >
      <input type="hidden" name="vehicle" value={vehicleId} />
      <input type="hidden" name="kind" value="rental" />

      <div className="mb-4">
        <p className="eyebrow">Rental details</p>
        <p className="mt-1 text-xs leading-relaxed text-steel-muted">
          Choose where and when you want the vehicle. We&apos;ll check availability and show
          your estimated rental due before checkout.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="eyebrow mb-2 flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            Pickup location
          </span>

          <select
            required
            name="rentalLocation"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            disabled={locationsLoading || locations.length === 0}
            className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="">
              {locationsLoading ? 'Loading locations…' : 'Choose a pickup location'}
            </option>

            {locations.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {item.city}
              </option>
            ))}
          </select>

          {locationError ? (
            <p className="mt-2 text-xs leading-relaxed text-red-600">
              {locationError}
            </p>
          ) : null}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow mb-2 flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
              Pickup date
            </span>
            <input
              required
              min={today || undefined}
              type="date"
              value={startDate}
              onChange={(event) => {
                const value = event.target.value;
                setStartDate(value);

                if (value === today) {
                  const now = getLocalDateTime();
                  setCurrentTime(now.time);

                  if (startTime && startTime < now.time) {
                    setStartTime('');
                  }
                }
              }}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>

          <label className="block">
            <span className="eyebrow mb-2 flex items-center gap-2">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
              Pickup time
            </span>
            <input
              required
              type="time"
              min={startTimeMin}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="eyebrow mb-2 flex items-center gap-2">
              <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
              Return date
            </span>
            <input
              required
              min={startDate || today || undefined}
              type="date"
              value={endDate}
              onChange={(event) => {
                const value = event.target.value;
                setEndDate(value);

                if (value !== startDate) {
                  setEndTime('');
                } else if (startTime && endTime && endTime <= startTime) {
                  setEndTime('');
                }
              }}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>

          <label className="block">
            <span className="eyebrow mb-2 flex items-center gap-2">
              <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
              Return time
            </span>
            <input
              required
              type="time"
              min={endTimeMin}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>
        </div>
      </div>

      {quoteLoading ? (
        <div className="mt-4 border border-hairline bg-surface p-4">
          <p className="font-data text-[0.625rem] uppercase tracking-[0.14em] text-steel-muted">
            Checking availability…
          </p>
        </div>
      ) : quoteMatches ? (
        <div className="mt-4 border border-hairline bg-surface p-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Rental estimate</p>
              <p className="mt-1 text-sm text-chrome">
                {formatPrice(quote.daily_rate, quote.currency)} / day
              </p>
            </div>

            <div className="text-right">
              <p className="font-data text-[0.625rem] uppercase tracking-[0.14em] text-steel-muted">
                {quote.nights} rental day{quote.nights === 1 ? '' : 's'}
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-tight text-chrome">
                {formatPrice(quote.total, quote.currency)}
              </p>
            </div>
          </div>

          {quote.available ? (
            <p className="mt-3 border-t border-hairline pt-3 font-data text-[0.625rem] uppercase tracking-[0.12em] text-volt">
              Available for this rental window
            </p>
          ) : (
            <p className="mt-3 border-t border-hairline pt-3 text-xs leading-relaxed text-red-600">
              {quote.unavailable_reason || 'This vehicle is unavailable for the selected window.'}
            </p>
          )}
        </div>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 font-data text-xs uppercase tracking-wide text-red-600"
        >
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={
          locationsLoading ||
          quoteLoading ||
          !quoteMatches ||
          !quote.available
        }
        className="mt-4 flex w-full items-center justify-center gap-2 bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright disabled:cursor-not-allowed disabled:opacity-45"
      >
        Continue to rental
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </button>

      <p className="mt-3 text-center font-data text-[0.625rem] uppercase tracking-[0.12em] text-steel-muted">
        Secure checkout · Mobile Money · Card
      </p>
    </form>
  );
}
