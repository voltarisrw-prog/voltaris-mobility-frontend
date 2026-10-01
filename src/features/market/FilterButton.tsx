'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { VehicleFacets } from '@/lib/api/vehicles';
import { activeFilterCount, SORT_OPTIONS, type VehicleFilters } from '@/lib/vehicles/filters';
import { heavy } from './fonts';
import s from './market.module.css';

const BODIES = [
  { value: 'suv', label: 'SUV' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
];

function Chip({
  name,
  value,
  label,
  count,
  checked,
  type = 'checkbox',
}: {
  name: string;
  value: string;
  label: string;
  count?: number;
  checked: boolean;
  type?: 'checkbox' | 'radio';
}) {
  return (
    <label className={s.chip}>
      <input type={type} name={name} value={value} defaultChecked={checked} />
      <span>
        {label}
        {typeof count === 'number' && <small>{count}</small>}
      </span>
    </label>
  );
}

/**
 * One button that holds every way to narrow the list. The form is a plain GET
 * to the page itself, so the filters live in the URL (shareable, back-button
 * correct) and it works before JavaScript loads.
 */
export function FilterButton({
  action,
  mode,
  filters,
  facets,
}: {
  action: string;
  mode: 'sale' | 'rental';
  filters: VehicleFilters;
  facets: VehicleFacets | null;
}) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const count = activeFilterCount({ ...filters, mode: undefined });

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const trigger = button.current;
    panel.current?.querySelector<HTMLElement>('button, input')?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      trigger?.focus();
    };
  }, [open]);

  // Facet labels can arrive as raw slugs; show them the way people write them.
  const nice = (v: string) =>
    v
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .replace(/ Benz\b/, '-Benz');
  const makes = (facets?.makes ?? []).map((m) => ({ ...m, label: nice(m.label) }));
  const bodies = facets?.bodies?.length
    ? facets.bodies.map((b) => ({
        ...b,
        label: BODIES.find((x) => x.value === b.value)?.label ?? nice(b.label),
      }))
    : BODIES.map((b) => ({ ...b, count: undefined as number | undefined }));
  const locations = (facets?.locations ?? []).map((l) => ({ ...l, label: nice(l.label) }));

  return (
    <>
      <button
        ref={button}
        type="button"
        className={s.filterBtn}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal strokeWidth={2} aria-hidden="true" />
        Filter
        {count > 0 && <em>{count}</em>}
      </button>

      {open &&
        createPortal(
          <div className={`${s.portal} ${heavy.variable}`}>
            <div className={s.scrim} onClick={() => setOpen(false)} aria-hidden="true" />
            <div
              ref={panel}
              className={`${s.panel} ${s.fpanel}`}
              role="dialog"
              aria-modal="true"
              aria-label="Filter cars"
            >
              <form
                action={action}
                method="get"
                style={{ display: 'contents' }}
                onSubmit={(e) => {
                  // Keep the URL clean: leave out anything not chosen.
                  for (const el of Array.from(e.currentTarget.elements)) {
                    const f = el as HTMLInputElement;
                    if (!f.name) continue;
                    if (f.value === '' || (f.name === 'sort' && f.value === 'relevance'))
                      f.disabled = true;
                  }
                }}
              >
                <div className={s.fhead}>
                  <h2>Filter</h2>
                  <button
                    type="button"
                    className={s.close}
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                  >
                    <X aria-hidden="true" />
                  </button>
                </div>
                <div className={s.fbody}>
                  {action === '/cars' && <input type="hidden" name="mode" value={mode} />}

                  <div className={s.group}>
                    <label className={s.field}>
                      <span className={s.glabel}>Search</span>
                      <input
                        type="search"
                        name="q"
                        defaultValue={filters.q ?? ''}
                        placeholder="Make, model or keyword"
                        enterKeyHint="search"
                      />
                    </label>
                  </div>

                  {makes.length > 0 && (
                    <fieldset className={s.group}>
                      <legend>Make</legend>
                      <div className={s.chips}>
                        {makes.map((m) => (
                          <Chip
                            key={m.value}
                            name="make"
                            value={m.value}
                            label={m.label}
                            count={m.count}
                            checked={filters.make?.includes(m.value) ?? false}
                          />
                        ))}
                      </div>
                    </fieldset>
                  )}

                  <fieldset className={s.group}>
                    <legend>Body</legend>
                    <div className={s.chips}>
                      {bodies.map((b) => (
                        <Chip
                          key={b.value}
                          name="body"
                          value={b.value}
                          label={b.label}
                          count={b.count}
                          checked={filters.body?.includes(b.value as never) ?? false}
                        />
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={s.group}>
                    <legend>Powertrain</legend>
                    <div className={s.chips}>
                      <Chip type="radio" name="fuel" value="" label="Any" checked={!filters.fuel} />
                      <Chip
                        type="radio"
                        name="fuel"
                        value="electric"
                        label="Full electric"
                        checked={filters.fuel === 'electric'}
                      />
                      <Chip
                        type="radio"
                        name="fuel"
                        value="hybrid"
                        label="Hybrid"
                        checked={filters.fuel === 'hybrid'}
                      />
                    </div>
                  </fieldset>

                  <fieldset className={s.group}>
                    <legend>Condition</legend>
                    <div className={s.chips}>
                      <Chip
                        type="radio"
                        name="condition"
                        value=""
                        label="Any"
                        checked={!filters.condition}
                      />
                      <Chip
                        type="radio"
                        name="condition"
                        value="new"
                        label="New"
                        checked={filters.condition === 'new'}
                      />
                      <Chip
                        type="radio"
                        name="condition"
                        value="used"
                        label="Used"
                        checked={filters.condition === 'used'}
                      />
                      <Chip
                        type="radio"
                        name="condition"
                        value="certified"
                        label="Certified"
                        checked={filters.condition === 'certified'}
                      />
                    </div>
                  </fieldset>

                  {locations.length > 0 && (
                    <div className={s.group}>
                      <label className={s.field}>
                        <span className={s.glabel}>Location</span>
                        <select name="location" defaultValue={filters.location ?? ''}>
                          <option value="">Anywhere in Rwanda</option>
                          {locations.map((l) => (
                            <option key={l.value} value={l.value}>
                              {l.label} ({l.count})
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}

                  <fieldset className={s.group}>
                    <legend>{mode === 'rental' ? 'Price (RWF)' : 'Price (RWF)'}</legend>
                    <div className={s.pair}>
                      <label className={s.field}>
                        From
                        <input
                          type="number"
                          inputMode="numeric"
                          name="minPrice"
                          min={0}
                          step={100000}
                          defaultValue={filters.minPrice ?? ''}
                        />
                      </label>
                      <label className={s.field}>
                        To
                        <input
                          type="number"
                          inputMode="numeric"
                          name="maxPrice"
                          min={0}
                          step={100000}
                          defaultValue={filters.maxPrice ?? ''}
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className={s.group}>
                    <legend>Year</legend>
                    <div className={s.pair}>
                      <label className={s.field}>
                        From
                        <input
                          type="number"
                          inputMode="numeric"
                          name="minYear"
                          min={1990}
                          max={2100}
                          defaultValue={filters.minYear ?? ''}
                        />
                      </label>
                      <label className={s.field}>
                        To
                        <input
                          type="number"
                          inputMode="numeric"
                          name="maxYear"
                          min={1990}
                          max={2100}
                          defaultValue={filters.maxYear ?? ''}
                        />
                      </label>
                    </div>
                  </fieldset>

                  <fieldset className={s.group}>
                    <legend>Range, battery and mileage</legend>
                    <div className={s.pair}>
                      <label className={s.field}>
                        Range at least (km)
                        <input
                          type="number"
                          inputMode="numeric"
                          name="minRange"
                          min={0}
                          max={1500}
                          step={50}
                          defaultValue={filters.minRange ?? ''}
                        />
                      </label>
                      <label className={s.field}>
                        Battery at least (kWh)
                        <input
                          type="number"
                          inputMode="numeric"
                          name="minBattery"
                          min={0}
                          max={400}
                          step={10}
                          defaultValue={filters.minBattery ?? ''}
                        />
                      </label>
                      <label className={s.field}>
                        Mileage up to (km)
                        <input
                          type="number"
                          inputMode="numeric"
                          name="maxMileage"
                          min={0}
                          step={5000}
                          defaultValue={filters.maxMileage ?? ''}
                        />
                      </label>
                    </div>
                  </fieldset>

                  {mode === 'rental' && (
                    <fieldset className={s.group}>
                      <legend>Pick-up and return</legend>
                      <div className={s.pair}>
                        <label className={s.field}>
                          Pick-up
                          <input
                            type="datetime-local"
                            name="rentalStart"
                            defaultValue={filters.rentalStart ?? ''}
                          />
                        </label>
                        <label className={s.field}>
                          Return
                          <input
                            type="datetime-local"
                            name="rentalEnd"
                            defaultValue={filters.rentalEnd ?? ''}
                          />
                        </label>
                        <label className={s.field}>
                          Pick-up place
                          <input
                            type="text"
                            name="rentalLocation"
                            placeholder="e.g. kigali"
                            defaultValue={filters.rentalLocation ?? ''}
                          />
                        </label>
                      </div>
                    </fieldset>
                  )}

                  <fieldset className={s.group}>
                    <legend>Trust</legend>
                    <div className={s.chips}>
                      <Chip
                        name="verified"
                        value="true"
                        label="Verified sellers only"
                        checked={filters.verified === true}
                      />
                    </div>
                  </fieldset>

                  <div className={s.group}>
                    <label className={s.field}>
                      <span className={s.glabel}>Sort by</span>
                      <select name="sort" defaultValue={filters.sort ?? 'relevance'}>
                        {SORT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <div className={s.ffoot}>
                  <Link
                    className={s.reset}
                    href={action === '/cars' ? `/cars?mode=${mode}` : action}
                    onClick={() => setOpen(false)}
                  >
                    Clear all
                  </Link>
                  <button type="submit" className={s.apply}>
                    Show cars
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
