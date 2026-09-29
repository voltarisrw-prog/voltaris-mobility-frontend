'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Check, ArrowLeft } from 'lucide-react';
import { Button, Field, inputClass, useToast } from '@/components/ui';
import { ConfirmationCard } from '@/components/ConfirmationCard';
import { Reveal } from '@/components/motion/Reveal';

import { garagePartners, garageServices, garageSlots, type GarageServiceId } from '@/config/garage';
import { requestGarageBooking } from './api';
import { displayMessage } from '@/lib/api/errors';
import { cn } from '@/lib/format';
import { garageBookingSchema, type GarageBookingForm as Values } from './schema';

const GarageMap = dynamic(() => import('./GarageMap').then((m) => m.GarageMap), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-slab" aria-hidden="true" />,
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
  service: 'M4 12h16M4 6h16M4 18h16',
  inspection: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  'charger-install': 'M13 2L3 14h7l-1 8 10-12h-7l1-8z',
  tyres: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 6a4 4 0 100 8 4 4 0 000-8z',
  detailing: 'M12 3l1.8 5.5H19l-4.5 3.3 1.7 5.4L12 14l-4.2 3.2 1.7-5.4L5 8.5h5.2z',
  diagnostics: 'M3 12h4l3-8 4 16 3-8h4',
};

function isoToday(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function GarageBookingFlow({ initialService }: { initialService?: GarageServiceId }) {
  const toast = useToast();
  const [step, setStep] = useState<StepIndex>(initialService ? 1 : 0);
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
      preferred_slot: '10:00',
      preferred_date: isoToday(1),
    },
  });

  const service = watch('service');
  const garageSlug = watch('garage_slug');
  const values = watch();

  const eligible = useMemo(
    () => garagePartners.filter((p) => !service || p.services.includes(service)),
    [service],
  );
  const chosenService = garageServices.find((s) => s.id === service);
  const chosenGarage = garagePartners.find((p) => p.slug === garageSlug);

  async function next() {
    const ok = await trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!ok) return;
    setStep((s) => Math.min(4, s + 1) as StepIndex);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1) as StepIndex);
  }

  const onSubmit = handleSubmit(async (v) => {
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
  });

  if (result) {
    return (
      <ConfirmationCard
        eyebrow="Booking requested"
        title={`${chosenService?.label ?? 'Garage'} at ${chosenGarage?.name ?? 'a partner garage'}.`}
        reference={result.reference}
        steps={['The garage confirms the slot by phone or WhatsApp, usually the same day.', `Bring the logbook${values.vehicle_plate ? ` for ${values.vehicle_plate}` : ''} and your charging cable if the job touches the battery.`, chosenGarage ? `${chosenGarage.address}. ${chosenGarage.hours}.` : 'Address and hours are in your confirmation.']}
        event={{ title: `${chosenService?.label ?? 'Garage'} — ${chosenGarage?.name ?? 'Voltaris'}`, start: `${values.preferred_date}T${values.preferred_slot}:00`, durationMinutes: 120, ...(chosenGarage ? { location: chosenGarage.address } : {}) }}
        whatsappText={`Hello Voltaris, about garage booking ${result.reference}.`}
        links={[{ label: 'Back to the showroom', href: '/cars' }]}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Progress */}
      <ol className="flex items-center gap-2 font-data text-xs uppercase tracking-[0.1em]" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={i === step ? 'step' : undefined}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full border',
                i < step ? 'border-chrome bg-chrome text-surface' : i === step ? 'border-chrome text-chrome' : 'border-hairline text-steel-muted',
              )}
            >
              {i < step ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : i + 1}
            </span>
            <span className={cn('hidden sm:inline', i === step ? 'text-chrome' : 'text-steel-muted')}>{label}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-4 bg-hairline sm:w-8" aria-hidden="true" />}
          </li>
        ))}
      </ol>

      <Reveal key={step} variant="fade" threshold={0} className="mt-10 min-h-[24rem]">
        {/* ---------------------------------------------------- 0 Service */}
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-display text-chrome">What does the car need?</legend>
            {errors.service && <p className="mt-2 text-sm text-red-600">{errors.service.message}</p>}
            <Reveal stagger={70} className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
              {garageServices.map((s) => {
                const on = service === s.id;
                return (
                  <label key={s.id} className={cn('group cursor-pointer bg-surface p-6 transition-colors', on && 'bg-abyss')}>
                    <input type="radio" value={s.id} {...register('service')} className="sr-only" onChange={() => { setValue('service', s.id, { shouldValidate: true }); setValue('garage_slug', ''); }} />
                    <span className={cn('flex h-11 w-11 items-center justify-center border', on ? 'border-chrome bg-chrome text-surface' : 'border-hairline text-chrome')}>
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={ICONS[s.id]} />
                      </svg>
                    </span>
                    <span className="mt-5 block font-display text-lg text-chrome">{s.label}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-steel">{s.line}</span>
                    <span className="mt-3 block font-data text-xs text-steel-muted">{s.duration}</span>
                  </label>
                );
              })}
            </Reveal>
          </fieldset>
        )}

        {/* ---------------------------------------------------- 1 Garage */}
        {step === 1 && (
          <fieldset>
            <legend className="font-display text-display text-chrome">Where?</legend>
            {errors.garage_slug && <p className="mt-2 text-sm text-red-600">{errors.garage_slug.message}</p>}
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
              <ul className="divide-y divide-hairline border-y border-hairline">
                {eligible.map((p) => {
                  const on = garageSlug === p.slug;
                  return (
                    <li key={p.slug}>
                      <label className={cn('flex cursor-pointer gap-4 p-5 transition-colors', on && 'bg-abyss')}>
                        <input type="radio" value={p.slug} {...register('garage_slug')} className="sr-only" onChange={() => setValue('garage_slug', p.slug, { shouldValidate: true })} />
                        <span className={cn('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', on ? 'border-chrome bg-chrome' : 'border-hairline')} aria-hidden="true">
                          {on && <Check className="h-3 w-3 text-surface" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-3">
                            <span className="font-display text-lg text-chrome">{p.name}</span>
                            <span className="font-data text-xs uppercase tracking-[0.1em] text-steel-muted">{p.area}</span>
                          </span>
                          <span className="mt-1 block text-sm text-steel">{p.address}</span>
                          <span className="mt-2 block text-xs leading-relaxed text-steel-muted">{p.note}</span>
                          <span className="mt-2 block font-data text-xs text-steel-muted">{p.hours}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              <div className="h-[22rem] overflow-hidden border border-hairline lg:h-auto lg:min-h-[26rem]">
                <GarageMap partners={eligible} selected={garageSlug || null} onSelect={(slug) => setValue('garage_slug', slug, { shouldValidate: true })} />
              </div>
            </div>
          </fieldset>
        )}

        {/* ---------------------------------------------------- 2 When */}
        {step === 2 && (
          <fieldset>
            <legend className="font-display text-display text-chrome">When suits you?</legend>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <Field label="Date" error={errors.preferred_date?.message} required>
                {(p) => <input {...p} {...register('preferred_date')} type="date" min={isoToday()} className={inputClass} />}
              </Field>
              <div>
                <p className="eyebrow">Arrival time</p>
                {errors.preferred_slot && <p className="mt-1 text-sm text-red-600">{errors.preferred_slot.message}</p>}
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {garageSlots.map((slot) => {
                    const on = values.preferred_slot === slot.value;
                    return (
                      <label key={slot.value} className={cn('flex min-h-12 cursor-pointer items-center justify-center border font-data text-sm', on ? 'border-chrome bg-chrome text-surface' : 'border-hairline text-steel hover:border-chrome')}>
                        <input type="radio" value={slot.value} {...register('preferred_slot')} className="sr-only" />
                        {slot.label}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-steel-muted">{chosenGarage?.hours}. {chosenService?.duration} in the workshop.</p>
              </div>
            </div>
          </fieldset>
        )}

        {/* ---------------------------------------------------- 3 Car + you */}
        {step === 3 && (
          <fieldset>
            <legend className="font-display text-display text-chrome">Your car, and how to reach you</legend>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field label="Make" error={errors.vehicle_make?.message} required>
                {(p) => <input {...p} {...register('vehicle_make')} placeholder="BYD" className={inputClass} />}
              </Field>
              <Field label="Model" error={errors.vehicle_model?.message} required>
                {(p) => <input {...p} {...register('vehicle_model')} placeholder="Atto 3" className={inputClass} />}
              </Field>
              <Field label="Number plate" hint="Optional" error={errors.vehicle_plate?.message}>
                {(p) => <input {...p} {...register('vehicle_plate')} placeholder="RAD 123 A" className={cn(inputClass, 'uppercase')} />}
              </Field>
              <div className="hidden sm:block" />
              <Field label="Your name" error={errors.full_name?.message} required>
                {(p) => <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />}
              </Field>
              <Field label="Phone" hint="The garage confirms on this number" error={errors.phone?.message} required>
                {(p) => <input {...p} {...register('phone')} type="tel" autoComplete="tel" className={inputClass} />}
              </Field>
              <Field label="Email" error={errors.email?.message} required>
                {(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className={inputClass} />}
              </Field>
              <Field label="Anything the technician should know" hint="Optional" error={errors.notes?.message}>
                {(p) => <textarea {...p} {...register('notes')} rows={3} className={inputClass} />}
              </Field>
            </div>
            <p className="mt-4 text-xs text-steel-muted">
              Signed in? Your saved vehicles will appear here once the account garage is live.
            </p>
          </fieldset>
        )}

        {/* ---------------------------------------------------- 4 Confirm */}
        {step === 4 && (
          <fieldset>
            <legend className="font-display text-display text-chrome">Check and confirm</legend>
            <dl className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
              {[
                ['Service', chosenService?.label],
                ['Garage', `${chosenGarage?.name} — ${chosenGarage?.address}`],
                ['When', `${values.preferred_date} at ${values.preferred_slot}`],
                ['Vehicle', `${values.vehicle_make} ${values.vehicle_model}${values.vehicle_plate ? ` · ${values.vehicle_plate}` : ''}`],
                ['Name', values.full_name],
                ['Phone', values.phone],
              ].map(([k, v]) => (
                <div key={k} className="bg-surface p-5">
                  <dt className="eyebrow">{k}</dt>
                  <dd className="mt-2 text-sm text-chrome">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6">
              <Field label="" error={errors.consent?.message}>
                {(p) => (
                  <label className="flex items-start gap-3 text-sm text-steel">
                    <input {...p} {...register('consent')} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-volt" />
                    Share my details with Voltaris and {chosenGarage?.name ?? 'the garage'} to confirm this booking.
                  </label>
                )}
              </Field>
            </div>
          </fieldset>
        )}
      </Reveal>

      <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex min-h-11 items-center gap-2 font-data text-eyebrow uppercase text-steel disabled:opacity-30 hover:text-chrome"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
        </button>
        {step < 4 ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={isSubmitting}>
            Confirm booking
          </Button>
        )}
      </div>
    </form>
  );
}
