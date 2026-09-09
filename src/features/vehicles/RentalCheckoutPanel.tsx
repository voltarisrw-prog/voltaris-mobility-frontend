'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';

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

    const start = `${startDate}T${startTime}`;
    const end = `${endDate}T${endTime}`;

    if (end <= start) {
      setError('Return must be after the pickup date and time.');
      return;
    }

    const form = event.currentTarget;

    const location = form.elements.namedItem('rentalLocation');

    if (!(location instanceof HTMLInputElement) || !location.value.trim()) {
      setError('Enter a pickup location.');
      return;
    }

    const params = new URLSearchParams({
      vehicle: vehicleId,
      kind: 'rental',
      rentalLocation: location.value.trim(),
      rentalStart: start,
      rentalEnd: end,
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
          Choose where and when you want the vehicle. Your final rental amount is calculated
          securely when the order is created.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="eyebrow mb-2 flex items-center gap-2">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            Pickup location
          </span>
          <input
            required
            type="text"
            name="rentalLocation"
            placeholder="Kigali"
            className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors placeholder:text-steel-muted focus:border-volt"
          />
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
        className="mt-4 flex w-full items-center justify-center gap-2 bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
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
