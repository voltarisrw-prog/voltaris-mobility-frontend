'use client';

import { useState } from 'react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';

export function RentalCheckoutPanel({
  vehicleId,
}: {
  vehicleId: string;
}) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      action="/checkout/start"
      method="get"
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
              Start
            </span>
            <input
              required
              min={today}
              type="date"
              name="rentalStart"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>

          <label className="block">
            <span className="eyebrow mb-2 block">End</span>
            <input
              required
              min={start || today}
              type="date"
              name="rentalEnd"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="w-full border border-hairline bg-surface px-3 py-3 text-sm text-chrome outline-none transition-colors focus:border-volt"
            />
          </label>
        </div>
      </div>

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
