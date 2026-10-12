'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  MapPin,
  Sun,
  Sunrise,
  Sunset,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { ConfirmationCard } from '@/components/ConfirmationCard';
import { requestTestDrive } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { IntlPhone } from '@/components/IntlPhone';
import { testDriveSchema, type TestDriveForm as Values } from '@/lib/validation/schemas';
import './test-drive.css';

const LOCATIONS = [
  { value: 'kigali-kicukiro', label: 'Kigali — Kicukiro' },
  { value: 'kigali-gasabo', label: 'Kigali — Gasabo' },
  { value: 'kigali-nyarugenge', label: 'Kigali — Nyarugenge' },
  { value: 'musanze', label: 'Musanze' },
  { value: 'rubavu', label: 'Rubavu' },
  { value: 'huye', label: 'Huye' },
];

type Slot = Values['preferred_time_slot'];
const SLOTS: { value: Slot; label: string; range: string; Icon: LucideIcon }[] = [
  { value: 'morning', label: 'Morning', range: '8am–12pm', Icon: Sunrise },
  { value: 'afternoon', label: 'Afternoon', range: '12pm–4pm', Icon: Sun },
  { value: 'evening', label: 'Evening', range: '4pm–6pm', Icon: Sunset },
];

const STEPS: { label: string; fields: (keyof Values)[] }[] = [
  { label: 'Vehicle', fields: ['vehicle_id'] },
  { label: 'When', fields: ['preferred_date', 'preferred_time_slot'] },
  { label: 'Where', fields: ['location_slug', 'notes'] },
  { label: 'You', fields: ['full_name', 'email', 'phone', 'consent'] },
];
const fieldsOf = (k: number) => STEPS[k]?.fields ?? [];

const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const LONG = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const SHORT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function splitLocation(label: string) {
  const parts = label.split(' — ');
  const area = parts[1] ?? parts[0] ?? label;
  return { area, city: parts[1] ? (parts[0] ?? '') : '' };
}

interface Row {
  Icon: LucideIcon;
  label: string;
  value: string;
  empty: string;
  on: boolean;
}

function Ticket({ rows, stamped }: { rows: Row[]; stamped: boolean }) {
  const done = rows.filter((r) => r.on).length;
  return (
    <aside className="td-tk" data-sent={stamped} aria-label="Your test drive summary">
      <div className="td-tkb">
        <div className="td-tkh">
          <div>
            <small>Your</small>
            <h3>Test drive</h3>
          </div>
          <div className="td-rg" aria-label={`${done} of 4 complete`}>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle className="a" cx="26" cy="26" r="22" />
              <circle className="b" cx="26" cy="26" r="22" style={{ strokeDashoffset: 138 * (1 - done / 4) }} />
            </svg>
            <span>{done}/4</span>
          </div>
        </div>
        {rows.map(({ Icon, label, value, empty, on }) => (
          <div key={label} className={`td-rw${on ? ' is-on' : ''}`}>
            <span className="td-ic">
              <Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <small>{label}</small>
              <b key={value || empty} className="td-pop">
                {value || empty}
              </b>
            </div>
          </div>
        ))}
        <div className="td-tkf">
          <p>Voltaris arranges the drive with the seller.</p>
          <div className="td-bar" aria-hidden="true" />
        </div>
        <span className="td-stamp">Requested</span>
      </div>
    </aside>
  );
}

export function TestDriveForm({
  vehicleId,
  vehicleTitle,
}: {
  vehicleId?: string;
  vehicleTitle?: string;
}) {
  const toast = useToast();
  const [result, setResult] = useState<{ reference: string } | null>(null);
  const [step, setStep] = useState(vehicleId ? 1 : 0);
  const [maxStep, setMaxStep] = useState(vehicleId ? 1 : 0);
  const [back, setBack] = useState(false);
  const [days, setDays] = useState<Date[]>([]);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    setFocus,
    getFieldState,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(testDriveSchema),
    mode: 'onTouched',
    defaultValues: {
      vehicle_id: vehicleId ?? '',
      preferred_time_slot: 'morning',
      preferred_date: '',
      location_slug: '',
      full_name: '',
      email: '',
      phone: '',
      notes: '',
    },
  });

  // Custom controls (date strip, slot cards, location chips) write through setValue.
  useEffect(() => {
    register('preferred_date');
    register('preferred_time_slot');
    register('location_slug');
  }, [register]);

  // Dates are built on the client so the server and browser never disagree about "today".
  useEffect(() => {
    const now = new Date();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDays(
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date(now);
        d.setDate(now.getDate() + i);
        return d;
      }),
    );
  }, []);

  const w = watch();
  const slot = SLOTS.find((s) => s.value === w.preferred_time_slot);
  const loc = LOCATIONS.find((l) => l.value === w.location_slug);
  const dateText = w.preferred_date ? SHORT.format(new Date(`${w.preferred_date}T00:00:00`)) : '';
  const vehicleText = vehicleTitle ?? (w.vehicle_id ?? '').trim();
  const rows: Row[] = [
    { Icon: Car, label: 'Vehicle', value: vehicleText, empty: 'Add a vehicle', on: Boolean(vehicleText) },
    {
      Icon: CalendarDays,
      label: 'When',
      value: dateText ? `${dateText}${slot ? ` · ${slot.label}` : ''}` : '',
      empty: 'Pick a date and time',
      on: Boolean(dateText && slot),
    },
    { Icon: MapPin, label: 'Where', value: loc?.label ?? '', empty: 'Choose a location', on: Boolean(loc) },
    {
      Icon: User,
      label: 'You',
      value: (w.full_name ?? '').trim(),
      empty: 'Your details',
      on: Boolean((w.full_name ?? '').trim() && (w.email ?? '').trim() && w.phone && w.consent),
    },
  ];

  if (result) {
    return (
      <div className="td-grid">
        <section className="td-card td-ok">
          <ConfirmationCard
            eyebrow="Demo drive requested"
            title={vehicleTitle ? `${vehicleTitle}, at your pace.` : 'Your drive is requested.'}
            reference={result.reference}
            steps={['Voltaris confirms the slot with the seller and comes back to you.', 'Bring your driving licence. An advisor meets you at the location you chose.', 'No pressure afterwards: reserve, compare, or walk away.']}
            whatsappText={`Hello Voltaris, about test drive ${result.reference}.`}
            links={[{ label: 'Track this request', href: `/test-drive/${result.reference}` }]}
          />
        </section>
        <Ticket rows={rows} stamped />
      </div>
    );
  }

  const pick = (
    name: 'preferred_date' | 'preferred_time_slot' | 'location_slug',
    value: string,
  ) =>
    setValue(name, value as never, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

  async function next() {
    const ok = await trigger(fieldsOf(step));
    if (!ok) {
      const bad = fieldsOf(step).find((f) => getFieldState(f).error);
      if (bad) setFocus(bad);
      return;
    }
    setBack(false);
    setStep(step + 1);
    setMaxStep(Math.max(maxStep, step + 1));
  }

  function go(k: number) {
    if (k === step || k > maxStep) return;
    setBack(k < step);
    setStep(k);
  }

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const response = await requestTestDrive({
          vehicle_id: values.vehicle_id,
          full_name: values.full_name,
          email: values.email,
          phone: values.phone,
          preferred_date: values.preferred_date,
          preferred_time_slot: values.preferred_time_slot,
          location_slug: values.location_slug,
          ...(values.notes ? { notes: values.notes } : {}),
        });
        track('test_drive_submitted', {
          vehicle_id: values.vehicle_id,
          location_slug: values.location_slug,
        });
        setResult({ reference: response.reference });
      } catch (cause) {
        toast.push('error', displayMessage(cause));
      }
    },
    (errs) => {
      // If something in an earlier step is invalid, take the person back to it.
      const k = STEPS.findIndex((s) => s.fields.some((f) => errs[f]));
      if (k >= 0 && k !== step) {
        setBack(k < step);
        setStep(k);
      }
    },
  );

  const phoneReg = register('phone');
  const todayIso = days[0] ? iso(days[0]) : undefined;
  const lastStep = step === 3;

  return (
    <div className="td-grid">
      <section className="td-card" aria-label="Request a test drive">
        <div className="td-stp" role="group" aria-label="Steps">
          {STEPS.map((s, k) => {
            const isDone = k < step && !fieldsOf(k).some((f) => errors[f]);
            return (
              <button
                key={s.label}
                type="button"
                className={`td-sb${k === step ? ' is-on' : ''}${isDone ? ' is-done' : ''}`}
                aria-current={k === step ? 'step' : undefined}
                disabled={k > maxStep}
                onClick={() => go(k)}
              >
                <i>{isDone ? <Check size={14} strokeWidth={3} /> : k + 1}</i>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <form
          noValidate
          className={`td-form${back ? ' is-back' : ''}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (lastStep) void onSubmit(e);
            else void next();
          }}
          onKeyDown={(e) => {
            const t = e.target as HTMLElement;
            if (e.key === 'Enter' && t.tagName !== 'TEXTAREA' && t.tagName !== 'BUTTON') {
              e.preventDefault();
              if (lastStep) void onSubmit();
              else void next();
            }
          }}
        >
          {step === 0 && (
            <div className="td-step">
              <div>
                <p className="td-k">Step 1 of 4</p>
                <h2 className="td-t">Which vehicle?</h2>
              </div>
              {vehicleId ? (
                <>
                  <input type="hidden" {...register('vehicle_id')} />
                  <div className="td-veh">
                    <span className="td-vi">
                      <Car size={22} />
                    </span>
                    <div>
                      <small>Driving the</small>
                      <b>{vehicleTitle ?? 'selected vehicle'}</b>
                    </div>
                    <Check size={20} />
                  </div>
                </>
              ) : (
                <>
                  <div className={`td-f${errors.vehicle_id ? ' is-bad' : ''}`}>
                    <input
                      id="td-vehicle"
                      placeholder=" "
                      autoComplete="off"
                      aria-invalid={Boolean(errors.vehicle_id)}
                      {...register('vehicle_id')}
                    />
                    <label htmlFor="td-vehicle">
                      Vehicle<i>*</i>
                    </label>
                  </div>
                  <p className="td-hint">Paste the listing reference, or start from a vehicle page</p>
                  <Link href="/cars" className="td-lnk">
                    Browse electric and hybrid cars <ArrowRight size={16} />
                  </Link>
                </>
              )}
              <p className="td-er" role="alert">
                {errors.vehicle_id?.message}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="td-step">
              <div>
                <p className="td-k">Step 2 of 4</p>
                <h2 className="td-t">Pick a slot</h2>
              </div>
              <div>
                <span className="td-lb">
                  Preferred date<i>*</i>
                </span>
                <div className="td-dts" role="radiogroup" aria-label="Preferred date">
                  {days.map((d, i) => {
                    const v = iso(d);
                    const on = w.preferred_date === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={LONG.format(d)}
                        className={`td-dc${on ? ' is-on' : ''}`}
                        onClick={() => pick('preferred_date', v)}
                      >
                        <small>{i === 0 ? 'Today' : WEEKDAY.format(d)}</small>
                        <b>{d.getDate()}</b>
                        <small>{MONTH.format(d)}</small>
                      </button>
                    );
                  })}
                </div>
                <label className="td-od">
                  Other date
                  <input
                    type="date"
                    min={todayIso}
                    value={w.preferred_date ?? ''}
                    onChange={(e) => pick('preferred_date', e.target.value)}
                  />
                </label>
                <p className="td-er" role="alert">
                  {errors.preferred_date?.message}
                </p>
              </div>
              <div>
                <span className="td-lb">
                  Time of day<i>*</i>
                </span>
                <div className="td-tms" role="radiogroup" aria-label="Time of day">
                  {SLOTS.map(({ value, label, range, Icon }) => {
                    const on = w.preferred_time_slot === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`td-tm${on ? ' is-on' : ''}`}
                        onClick={() => pick('preferred_time_slot', value)}
                      >
                        <Icon size={26} strokeWidth={1.8} />
                        <span>
                          <b>{label}</b>
                          <small>{range}</small>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="td-er" role="alert">
                  {errors.preferred_time_slot?.message}
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="td-step">
              <div>
                <p className="td-k">Step 3 of 4</p>
                <h2 className="td-t">Where should we meet?</h2>
              </div>
              <div>
                <span className="td-lb">
                  Where<i>*</i>
                </span>
                <div className="td-chips" role="radiogroup" aria-label="Where">
                  {LOCATIONS.map((l) => {
                    const { area, city } = splitLocation(l.label);
                    const on = w.location_slug === l.value;
                    return (
                      <button
                        key={l.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`td-cp${on ? ' is-on' : ''}`}
                        onClick={() => pick('location_slug', l.value)}
                      >
                        <span>
                          <b>{area}</b>
                          {city && <small>{city}</small>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="td-er" role="alert">
                  {errors.location_slug?.message}
                </p>
              </div>
              <div className={`td-f${errors.notes ? ' is-bad' : ''}`}>
                <textarea id="td-notes" rows={3} placeholder=" " {...register('notes')} />
                <label htmlFor="td-notes">Anything else (optional)</label>
              </div>
              <p className="td-er" role="alert">
                {errors.notes?.message}
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="td-step">
              <div>
                <p className="td-k">Step 4 of 4</p>
                <h2 className="td-t">Your details</h2>
              </div>
              <div className={`td-f${errors.full_name ? ' is-bad' : ''}`}>
                <input id="td-name" placeholder=" " autoComplete="name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
                <label htmlFor="td-name">
                  Your name<i>*</i>
                </label>
              </div>
              <p className="td-er" role="alert">
                {errors.full_name?.message}
              </p>
              <div className="td-r2">
                <div>
                  <div className={`td-f${errors.email ? ' is-bad' : ''}`}>
                    <input id="td-email" type="email" placeholder=" " autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
                    <label htmlFor="td-email">
                      Email<i>*</i>
                    </label>
                  </div>
                  <p className="td-er" role="alert">
                    {errors.email?.message}
                  </p>
                </div>
                <div>
                  <div className={`td-f td-ip${errors.phone ? ' is-bad' : ''}`}>
                    <IntlPhone bare id="td-phone" placeholder="788 123 456" aria-invalid={Boolean(errors.phone)} {...phoneReg} />
                    <label htmlFor="td-phone">
                      Phone<i>*</i>
                    </label>
                  </div>
                  <p className="td-er" role="alert">
                    {errors.phone?.message}
                  </p>
                </div>
              </div>
              <label className={`td-ck${errors.consent ? ' is-bad' : ''}`}>
                <input type="checkbox" className="td-cb" {...register('consent')} />
                <span className="td-box">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span>Share my details with Voltaris and the seller to arrange this drive.</span>
              </label>
              <p className="td-er" role="alert">
                {errors.consent?.message}
              </p>
            </div>
          )}

          <div className="td-act">
            {step > 0 && !(vehicleId && step === 1) && (
              <button type="button" className="td-btn td-gh" onClick={() => go(step - 1)}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            <button
              type="button"
              className="td-btn td-next"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={() => (lastStep ? void onSubmit() : void next())}
            >
              {lastStep ? (isSubmitting ? 'Sending…' : 'Request this test drive') : 'Continue'}
              {!lastStep && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </section>
      <Ticket rows={rows} stamped={false} />
    </div>
  );
}
