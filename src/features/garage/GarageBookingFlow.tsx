'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  Clock,
  MapPin,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { ConfirmationCard } from '@/components/ConfirmationCard';
import { garagePartners, garageServices, garageSlots, type GarageServiceId } from '@/config/garage';
import { requestGarageBooking } from './api';
import { displayMessage } from '@/lib/api/errors';
import { cn } from '@/lib/format';
import { IntlPhone } from '@/components/IntlPhone';
import { garageBookingSchema, type GarageBookingForm as Values } from './schema';
import './repair.css';

const GarageMap = dynamic(() => import('./GarageMap').then((m) => m.GarageMap), {
  ssr: false,
  loading: () => <div className="rp-maploading" aria-hidden="true" />,
});

const STEPS = ['Service', 'Garage', 'When', 'Your car', 'Confirm'] as const;
type StepIndex = 0 | 1 | 2 | 3 | 4;

const STEP_FIELDS: Record<StepIndex, (keyof Values)[]> = {
  0: ['service'],
  1: ['garage_slug'],
  2: ['preferred_date', 'preferred_slot'],
  3: ['vehicle_make', 'vehicle_model', 'vehicle_plate', 'full_name', 'phone', 'email'],
  4: ['consent'],
};

const ICONS: Record<GarageServiceId, string> = {
  service: 'M14.7 6.3a4 4 0 00-5 5L4 17l3 3 5.7-5.7a4 4 0 005-5l-2.4 2.4-2.6-.6-.6-2.6z',
  inspection: 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12.5l3 3 5-6',
  'charger-install': 'M13 2L4 14h7l-1 8 9-12h-7z',
  tyres: 'M12 3a9 9 0 100 18 9 9 0 000-18zm0 5a4 4 0 100 8 4 4 0 000-8z',
  detailing: 'M12 3l2.2 5.6L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.4z',
  diagnostics: 'M3 12h4l2-6 4 12 2-6h6',
};

const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'short' });
const LONG = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const SHORT = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const localIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function isoToday(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

interface Row {
  Icon: LucideIcon;
  label: string;
  value: string;
  empty: string;
  on: boolean;
}

function Ticket({
  rows,
  takes,
  hours,
  stamped,
}: {
  rows: Row[];
  takes?: string | undefined;
  hours?: string | undefined;
  stamped: boolean;
}) {
  const done = rows.filter((r) => r.on).length;
  return (
    <aside className="rp-tk" data-sent={stamped} aria-label="Your booking summary">
      <div className="rp-tkb">
        <div className="rp-tkh">
          <div>
            <small>Your</small>
            <h3>Repair</h3>
          </div>
          <div className="rp-rg" aria-label={`${done} of 5 complete`}>
            <svg viewBox="0 0 52 52" aria-hidden="true">
              <circle className="a" cx="26" cy="26" r="22" />
              <circle className="b" cx="26" cy="26" r="22" style={{ strokeDashoffset: 138 * (1 - done / 5) }} />
            </svg>
            <span>{done}/5</span>
          </div>
        </div>
        {rows.map(({ Icon, label, value, empty, on }) => (
          <div key={label} className={`rp-rw${on ? ' is-on' : ''}`}>
            <span className="rp-ic">
              <Icon size={20} strokeWidth={2} />
            </span>
            <div>
              <small>{label}</small>
              <b key={value || empty} className="rp-pop">
                {value || empty}
              </b>
            </div>
          </div>
        ))}
        <div className="rp-tkf">
          {takes && (
            <p className="rp-tkd">
              <Clock size={18} /> Takes {takes.toLowerCase()}
            </p>
          )}
          {hours && <p className="rp-tkd rp-tkh2">{hours}</p>}
          <p>The garage confirms with you the same day.</p>
          <div className="rp-bar" aria-hidden="true" />
        </div>
        <span className="rp-stamp">Booked</span>
      </div>
    </aside>
  );
}

export function GarageBookingFlow({ initialService }: { initialService?: GarageServiceId }) {
  const toast = useToast();
  const [step, setStep] = useState<StepIndex>(initialService ? 1 : 0);
  const [maxStep, setMaxStep] = useState<StepIndex>(initialService ? 1 : 0);
  const [back, setBack] = useState(false);
  const [days, setDays] = useState<Date[]>([]);
  const [result, setResult] = useState<{ reference: string; fallback: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(garageBookingSchema),
    mode: 'onTouched',
    defaultValues: {
      ...(initialService ? { service: initialService } : {}),
      garage_slug: '',
      preferred_slot: '10:00',
      preferred_date: isoToday(1),
      vehicle_make: '',
      vehicle_model: '',
      vehicle_plate: '',
      full_name: '',
      phone: '',
      email: '',
      notes: '',
    },
  });

  // Custom controls (service cards, garage list, date strip, time chips) write through setValue.
  useEffect(() => {
    register('service');
    register('garage_slug');
    register('preferred_date');
    register('preferred_slot');
  }, [register]);

  // Dates are built on the client so the server and the browser never disagree about "today".
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

  const values = watch();
  const service = values.service;
  const garageSlug = values.garage_slug;

  const eligible = useMemo(
    () => garagePartners.filter((p) => !service || p.services.includes(service)),
    [service],
  );
  const chosenService = garageServices.find((s) => s.id === service);
  const chosenGarage = garagePartners.find((p) => p.slug === garageSlug);

  const dateObj = values.preferred_date ? new Date(`${values.preferred_date}T00:00:00`) : null;
  const whenText = dateObj ? `${SHORT.format(dateObj)}${values.preferred_slot ? ` · ${values.preferred_slot}` : ''}` : '';
  const carText = [values.vehicle_make?.trim(), values.vehicle_model?.trim()].filter(Boolean).join(' ');
  const rows: Row[] = [
    { Icon: Car, label: 'Service', value: chosenService?.label ?? '', empty: 'Choose a service', on: Boolean(chosenService) },
    {
      Icon: MapPin,
      label: 'Garage',
      value: chosenGarage ? `${chosenGarage.name}, ${chosenGarage.area}` : '',
      empty: 'Choose a garage',
      on: Boolean(chosenGarage),
    },
    { Icon: CalendarDays, label: 'When', value: whenText, empty: 'Pick a date and time', on: Boolean(dateObj && values.preferred_slot) },
    { Icon: Car, label: 'Your car', value: carText, empty: 'Tell us about the car', on: Boolean(values.vehicle_make?.trim() && values.vehicle_model?.trim()) },
    {
      Icon: User,
      label: 'You',
      value: (values.full_name ?? '').trim(),
      empty: 'Your details',
      on: Boolean((values.full_name ?? '').trim() && values.phone && (values.email ?? '').trim() && values.consent),
    },
  ];

  if (result) {
    return (
      <div className="rp-grid">
        <section className="rp-card rp-ok">
          <ConfirmationCard
            eyebrow="Booking requested"
            title={`${chosenService?.label ?? 'Garage'} at ${chosenGarage?.name ?? 'a partner garage'}.`}
            reference={result.reference}
            steps={['The garage confirms the slot by phone or WhatsApp, usually the same day.', `Bring the logbook${values.vehicle_plate ? ` for ${values.vehicle_plate}` : ''} and your charging cable if the job touches the battery.`, chosenGarage ? `${chosenGarage.address}. ${chosenGarage.hours}.` : 'Address and hours are in your confirmation.']}
            event={{ title: `${chosenService?.label ?? 'Garage'} — ${chosenGarage?.name ?? 'Voltaris'}`, start: `${values.preferred_date}T${values.preferred_slot}:00`, durationMinutes: 120, ...(chosenGarage ? { location: chosenGarage.address } : {}) }}
            whatsappText={`Hello Voltaris, about garage booking ${result.reference}.`}
            links={[{ label: 'Back to the showroom', href: '/cars' }]}
          />
        </section>
        <Ticket rows={rows} takes={chosenService?.duration} hours={chosenGarage?.hours} stamped />
      </div>
    );
  }

  const setStepTo = (k: number, isBack: boolean) => {
    setBack(isBack);
    setStep(k as StepIndex);
  };

  async function next() {
    const ok = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!ok) {
      requestAnimationFrame(() => {
        document.querySelector('.rp-step .rp-er:not(:empty)')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
      return;
    }
    const n = Math.min(4, step + 1);
    setStepTo(n, false);
    setMaxStep((m) => Math.max(m, n) as StepIndex);
  }

  function go(k: number) {
    if (k === step || k > maxStep) return;
    setStepTo(k, k < step);
  }

  const onSubmit = handleSubmit(
    async (v) => {
      try {
        const response = await requestGarageBooking({
          service: v.service,
          garage_slug: v.garage_slug,
          preferred_date: v.preferred_date,
          preferred_slot: v.preferred_slot,
          vehicle: { make: v.vehicle_make, model: v.vehicle_model, ...(v.vehicle_plate ? { plate: v.vehicle_plate } : {}) },
          full_name: v.full_name,
          phone: v.phone,
          email: v.email,
          ...(v.notes ? { notes: v.notes } : {}),
        });
        setResult({ reference: response.reference, fallback: response.scheduled_for === null && response.status === 'requested' });
      } catch (cause) {
        toast.push('error', displayMessage(cause));
      }
    },
    (errs) => {
      // If something in an earlier step is invalid, take the person back to it.
      const k = (Object.keys(STEP_FIELDS) as unknown as StepIndex[]).find((i) => STEP_FIELDS[Number(i) as StepIndex].some((f) => errs[f]));
      if (k !== undefined && Number(k) !== step) setStepTo(Number(k), Number(k) < step);
    },
  );

  const pickValue = (name: 'preferred_date' | 'preferred_slot' | 'garage_slug', value: string) =>
    setValue(name, value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

  const phoneReg = register('phone');
  const lastStep = step === 4;
  const reviewRows: [string, string, number][] = [
    ['Service', chosenService?.label ?? '—', 0],
    ['Garage', chosenGarage ? `${chosenGarage.name} — ${chosenGarage.address}` : '—', 1],
    ['When', dateObj ? `${LONG.format(dateObj)} at ${values.preferred_slot}` : '—', 2],
    ['Vehicle', carText ? `${carText}${values.vehicle_plate ? ` · ${values.vehicle_plate}` : ''}` : '—', 3],
    ['Name', values.full_name || '—', 3],
    ['Phone', values.phone || '—', 3],
  ];

  return (
    <div className="rp-grid">
      <section className="rp-card" aria-label="Book a repair">
        <div className="rp-stp" role="group" aria-label="Steps">
          {STEPS.map((label, k) => {
            const isDone = k < step && !STEP_FIELDS[k as StepIndex].some((f) => errors[f]);
            return (
              <button
                key={label}
                type="button"
                className={`rp-sb${k === step ? ' is-on' : ''}${isDone ? ' is-done' : ''}`}
                aria-current={k === step ? 'step' : undefined}
                disabled={k > maxStep}
                onClick={() => go(k)}
              >
                <i>{isDone ? <Check size={14} strokeWidth={3} /> : k + 1}</i>
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        <form
          noValidate
          className={`rp-form${back ? ' is-back' : ''}`}
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
          {/* ------------------------------------------------ 0 Service */}
          {step === 0 && (
            <div className="rp-step">
              <div>
                <p className="rp-k">Step 1 of 5</p>
                <h2 className="rp-t">What does the car need?</h2>
              </div>
              <div className="rp-sg" role="radiogroup" aria-label="Service">
                {garageServices.map((s) => {
                  const on = service === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      className={`rp-sv${on ? ' is-on' : ''}`}
                      onPointerMove={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
                        e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
                      }}
                      onClick={() => {
                        setValue('service', s.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
                        setValue('garage_slug', '');
                      }}
                    >
                      <span className="rp-si">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d={ICONS[s.id]} />
                        </svg>
                      </span>
                      <b>{s.label}</b>
                      <small>{s.line}</small>
                      <span className="rp-du">
                        <Clock size={15} /> {s.duration}
                      </span>
                      <span className="rp-tick">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="rp-er" role="alert">
                {errors.service?.message}
              </p>
            </div>
          )}

          {/* ------------------------------------------------ 1 Garage */}
          {step === 1 && (
            <div className="rp-step">
              <div>
                <p className="rp-k">Step 2 of 5</p>
                <h2 className="rp-t">Where?</h2>
              </div>
              {service === 'charger-install' && (
                <p className="rp-note">
                  <MapPin size={20} /> The installation happens at your house. Pick the garage that will carry out the work.
                </p>
              )}
              <div className="rp-gwrap">
                <div className="rp-gl" role="radiogroup" aria-label="Garage">
                  {eligible.map((p) => {
                    const on = garageSlug === p.slug;
                    return (
                      <button
                        key={p.slug}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`rp-gr${on ? ' is-on' : ''}`}
                        onClick={() => pickValue('garage_slug', p.slug)}
                      >
                        <span className="rp-pn">
                          <MapPin size={20} />
                        </span>
                        <span className="rp-gb">
                          <span className="rp-gh2">
                            <b>{p.name}</b>
                            <em>{p.area}</em>
                          </span>
                          <small>{p.address}</small>
                          <small className="rp-gnote">{p.note}</small>
                          <span className="rp-hv">{p.hours}</span>
                        </span>
                        <span className="rp-rd" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
                <div className="rp-map">
                  <GarageMap partners={eligible} selected={garageSlug || null} onSelect={(slug: string) => pickValue('garage_slug', slug)} />
                </div>
              </div>
              <p className="rp-er" role="alert">
                {errors.garage_slug?.message}
              </p>
            </div>
          )}

          {/* ------------------------------------------------ 2 When */}
          {step === 2 && (
            <div className="rp-step">
              <div>
                <p className="rp-k">Step 3 of 5</p>
                <h2 className="rp-t">When suits you?</h2>
              </div>
              {chosenService && (
                <p className="rp-dur">
                  <Clock size={18} /> <span>{chosenService.label} takes about <b>{chosenService.duration.toLowerCase()}</b> in the workshop.</span>
                </p>
              )}
              <div>
                <span className="rp-lb">
                  Date<i>*</i>
                </span>
                <div className="rp-dts" role="radiogroup" aria-label="Date">
                  {days.map((d, i) => {
                    const v = localIso(d);
                    const on = values.preferred_date === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={LONG.format(d)}
                        className={`rp-dc${on ? ' is-on' : ''}`}
                        onClick={() => pickValue('preferred_date', v)}
                      >
                        <small>{i === 0 ? 'Today' : WEEKDAY.format(d)}</small>
                        <b>{d.getDate()}</b>
                        <small>{MONTH.format(d)}</small>
                      </button>
                    );
                  })}
                </div>
                <label className="rp-od">
                  Other date
                  <input type="date" min={isoToday()} value={values.preferred_date ?? ''} onChange={(e) => pickValue('preferred_date', e.target.value)} />
                </label>
                <p className="rp-er" role="alert">
                  {errors.preferred_date?.message}
                </p>
              </div>
              <div>
                <span className="rp-lb">
                  Arrival time<i>*</i>
                </span>
                <div className="rp-slots" role="radiogroup" aria-label="Arrival time">
                  {garageSlots.map((slot) => {
                    const on = values.preferred_slot === slot.value;
                    return (
                      <button
                        key={slot.value}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={`rp-sl${on ? ' is-on' : ''}`}
                        onClick={() => pickValue('preferred_slot', slot.value)}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
                {chosenGarage && <p className="rp-hint">{chosenGarage.name} is open {chosenGarage.hours}.</p>}
                <p className="rp-er" role="alert">
                  {errors.preferred_slot?.message}
                </p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------ 3 Car + you */}
          {step === 3 && (
            <div className="rp-step">
              <div>
                <p className="rp-k">Step 4 of 5</p>
                <h2 className="rp-t">Your car, and how to reach you</h2>
              </div>
              <div className="rp-r3">
                <div>
                  <div className={`rp-f${errors.vehicle_make ? ' is-bad' : ''}`}>
                    <input id="rp-make" placeholder="BYD" autoComplete="off" aria-invalid={Boolean(errors.vehicle_make)} {...register('vehicle_make')} />
                    <label htmlFor="rp-make">
                      Make<i>*</i>
                    </label>
                  </div>
                  <p className="rp-er" role="alert">
                    {errors.vehicle_make?.message}
                  </p>
                </div>
                <div>
                  <div className={`rp-f${errors.vehicle_model ? ' is-bad' : ''}`}>
                    <input id="rp-model" placeholder="Atto 3" autoComplete="off" aria-invalid={Boolean(errors.vehicle_model)} {...register('vehicle_model')} />
                    <label htmlFor="rp-model">
                      Model<i>*</i>
                    </label>
                  </div>
                  <p className="rp-er" role="alert">
                    {errors.vehicle_model?.message}
                  </p>
                </div>
                <div>
                  <div className={`rp-f${errors.vehicle_plate ? ' is-bad' : ''}`}>
                    <input id="rp-plate" placeholder="RAD 123 A" autoComplete="off" style={{ textTransform: 'uppercase' }} aria-invalid={Boolean(errors.vehicle_plate)} {...register('vehicle_plate')} />
                    <label htmlFor="rp-plate">Number plate (optional)</label>
                  </div>
                  <p className="rp-er" role="alert">
                    {errors.vehicle_plate?.message}
                  </p>
                </div>
              </div>
              <div className={`rp-f${errors.full_name ? ' is-bad' : ''}`}>
                <input id="rp-name" placeholder=" " autoComplete="name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
                <label htmlFor="rp-name">
                  Your name<i>*</i>
                </label>
              </div>
              <p className="rp-er" role="alert">
                {errors.full_name?.message}
              </p>
              <div className="rp-r2">
                <div>
                  <div className={`rp-f rp-ip${errors.phone ? ' is-bad' : ''}`}>
                    <IntlPhone bare id="rp-phone" placeholder="788 123 456" aria-invalid={Boolean(errors.phone)} {...phoneReg} />
                    <label htmlFor="rp-phone">
                      Phone<i>*</i>
                    </label>
                  </div>
                  <p className="rp-hint">The garage confirms on this number</p>
                  <p className="rp-er" role="alert">
                    {errors.phone?.message}
                  </p>
                </div>
                <div>
                  <div className={`rp-f${errors.email ? ' is-bad' : ''}`}>
                    <input id="rp-email" type="email" placeholder=" " autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
                    <label htmlFor="rp-email">
                      Email<i>*</i>
                    </label>
                  </div>
                  <p className="rp-er" role="alert">
                    {errors.email?.message}
                  </p>
                </div>
              </div>
              <div className={`rp-f${errors.notes ? ' is-bad' : ''}`}>
                <textarea id="rp-notes" rows={3} placeholder=" " {...register('notes')} />
                <label htmlFor="rp-notes">Anything the technician should know (optional)</label>
              </div>
              <p className="rp-er" role="alert">
                {errors.notes?.message}
              </p>
            </div>
          )}

          {/* ------------------------------------------------ 4 Confirm */}
          {step === 4 && (
            <div className="rp-step">
              <div>
                <p className="rp-k">Step 5 of 5</p>
                <h2 className="rp-t">Check and confirm</h2>
              </div>
              <div className="rp-rvw">
                {reviewRows.map(([k, v, to]) => (
                  <div key={k} className="rp-rr">
                    <div>
                      <small>{k}</small>
                      <b>{v}</b>
                    </div>
                    <button type="button" className="rp-ed" onClick={() => go(to)}>
                      Edit
                    </button>
                  </div>
                ))}
              </div>
              <label className={`rp-ck${errors.consent ? ' is-bad' : ''}`}>
                <input type="checkbox" className="rp-cb" {...register('consent')} />
                <span className="rp-box">
                  <Check size={16} strokeWidth={3} />
                </span>
                <span>Share my details with Voltaris and {chosenGarage?.name ?? 'the garage'} to confirm this booking.</span>
              </label>
              <p className="rp-er" role="alert">
                {errors.consent?.message}
              </p>
            </div>
          )}

          <div className="rp-act">
            {step > 0 && (
              <button type="button" className="rp-btn rp-gh" onClick={() => go(step - 1)}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            <button
              type="button"
              className="rp-btn rp-next"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              onClick={() => (lastStep ? void onSubmit() : void next())}
            >
              {lastStep ? (isSubmitting ? 'Sending…' : 'Confirm booking') : 'Continue'}
              {!lastStep && <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </section>
      <Ticket rows={rows} takes={chosenService?.duration} hours={chosenGarage?.hours} stamped={false} />
    </div>
  );
}
