'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { buildHref, parseFilters, type VehicleFilters } from '@/lib/vehicles/filters';

const pad = (value: number) => String(value).padStart(2, '0');

const getLocalDateTime = () => {
  const now = new Date();

  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}`,
  };
};

export function RentalSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filters = useMemo(
    () => parseFilters(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const initialStart = filters.rentalStart ?? '';
  const initialEnd = filters.rentalEnd ?? '';

  const [startDate, setStartDate] = useState(initialStart.split('T')[0] ?? '');
  const [startTime, setStartTime] = useState(initialStart.split('T')[1] ?? '');
  const [endDate, setEndDate] = useState(initialEnd.split('T')[0] ?? '');
  const [endTime, setEndTime] = useState(initialEnd.split('T')[1] ?? '');
  const [error, setError] = useState('');

  const [today, setToday] = useState('');
  const [currentTime, setCurrentTime] = useState('');

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

  const effectiveStart = startDate
    ? `${startDate}${startTime ? `T${startTime}` : ''}`
    : '';

  const effectiveEnd = endDate
    ? `${endDate}${endTime ? `T${endTime}` : ''}`
    : '';

  const startTimeMin = startDate === today ? currentTime : undefined;
  const endTimeMin = endDate === startDate ? startTime || undefined : undefined;

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

    if (effectiveEnd <= effectiveStart) {
      setError('Return must be after the pickup date and time.');
      return;
    }

    const formData = new FormData(event.currentTarget);

    const next: VehicleFilters = {
      ...filters,
      mode: 'rental',
      rentalLocation: String(formData.get('rentalLocation') || '') || undefined,
      rentalStart: effectiveStart,
      rentalEnd: effectiveEnd,
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
      <div className="voltaris-rental-journey">
        <div className="voltaris-rental-location">
          <label htmlFor="rental-location" className="voltaris-rental-label">
            PICKUP
          </label>

          <input
            id="rental-location"
            type="text"
            name="rentalLocation"
            defaultValue={filters.rentalLocation ?? ''}
            placeholder="Kigali"
            className="voltaris-rental-location-input"
          />
        </div>

        <div className="voltaris-rental-date">
          <label htmlFor="rental-start-date" className="voltaris-rental-label">
            FROM
          </label>

          <input
            id="rental-start-date"
            type="date"
            value={startDate}
            min={today || undefined}
            onChange={(event) => {
              setStartDate(event.target.value);

              if (event.target.value === today) {
                const now = getLocalDateTime();
                setCurrentTime(now.time);

                if (startTime && startTime < now.time) {
                  setStartTime('');
                }
              }
            }}
            className="voltaris-rental-date-input"
          />

          <input
            id="rental-start-time"
            type="time"
            value={startTime}
            min={startTimeMin}
            onChange={(event) => setStartTime(event.target.value)}
            className="voltaris-rental-date-input mt-2"
          />
        </div>

        <div className="voltaris-rental-route" aria-hidden="true">
          <span />
          <span className="voltaris-rental-route-arrow">→</span>
          <span />
        </div>

        <div className="voltaris-rental-date voltaris-rental-date-return">
          <label htmlFor="rental-end-date" className="voltaris-rental-label">
            RETURN
          </label>

          <input
            id="rental-end-date"
            type="date"
            value={endDate}
            min={startDate || today || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);

              if (event.target.value !== startDate) {
                setEndTime('');
              } else if (startTime && endTime && endTime <= startTime) {
                setEndTime('');
              }
            }}
            className="voltaris-rental-date-input"
          />

          <input
            id="rental-end-time"
            type="time"
            value={endTime}
            min={endTimeMin}
            onChange={(event) => setEndTime(event.target.value)}
            className="voltaris-rental-date-input mt-2"
          />
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 font-data text-xs uppercase tracking-wide text-red-600"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={isPending}
          className="bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright disabled:opacity-60"
        >
          {isPending ? 'Searching…' : 'Search rentals'}
        </button>

        <p className="font-data text-xs text-steel-muted">
          {startDate && endDate
            ? 'Availability and rental pricing will update automatically.'
            : 'Choose your dates and times to see rental availability.'}
        </p>
      </div>
    </form>
  );
}
