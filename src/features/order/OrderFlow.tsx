'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { ArrowLeft, Check } from 'lucide-react';
import { Button, Field, inputClass, useToast } from '@/components/ui';
import { FinanceCalculator } from '@/features/finance/FinanceCalculator';
import { Reveal } from '@/components/motion/Reveal';

import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { cn, formatPrice } from '@/lib/format';
import { emailSchema, fullNameSchema, phoneSchema } from '@/lib/validation/schemas';
import type { VehicleDetail } from '@/types/vehicle';

const STEPS = ['Vehicle', 'Payment', 'Deposit', 'Details', 'Confirm'] as const;
type Step = 0 | 1 | 2 | 3 | 4;

const schema = z.object({
  payment: z.enum(['cash', 'finance']),
  deposit_bps: z.number().int().min(500).max(10_000),
  full_name: fullNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  consent: z.literal(true, { errorMap: () => ({ message: 'Tick this to continue' }) }),
});
type Values = z.infer<typeof schema>;

const DEPOSITS = [1000, 2000, 3000, 5000, 10_000] as const;

/**
 * One question per screen. Choices survive refresh through the URL (step,
 * payment, deposit); personal details are never persisted anywhere — the
 * repo forbids browser storage for a reason. Back always works. The last step
 * hands off to /checkout/start,
 * which creates the order server-side — this flow never sends a price.
 * A finance choice also files the numbers as an enquiry so an advisor takes
 * the application to the bank while the reservation is paid.
 */
export function OrderFlow({ vehicle }: { vehicle: VehicleDetail }) {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const initialStep = Math.min(3, Math.max(0, Number(params.get('step') ?? 0))) as Step;
  const [step, setStep] = useState<Step>(initialStep);
  const heading = useRef<HTMLHeadingElement>(null);
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const price = vehicle.price ?? 0;

  const { register, handleSubmit, setValue, watch, trigger, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      payment: params.get('payment') === 'finance' ? 'finance' : 'cash',
      deposit_bps: DEPOSITS.includes(Number(params.get('deposit')) as never) ? Number(params.get('deposit')) : 2000,
    },
  });
  const v = watch();

  // Mirror the non-personal choices into the URL so a refresh lands on the same step.
  useEffect(() => {
    const q = new URLSearchParams({ vehicle: vehicle.slug, step: String(Math.min(step, 3)), payment: v.payment, deposit: String(v.deposit_bps) });
    window.history.replaceState(null, '', `?${q.toString()}`);
  }, [step, v.payment, v.deposit_bps, vehicle.slug]);

  // Keyboard users land on the new step's heading.
  useEffect(() => { heading.current?.focus(); }, [step]);

  const fields: Record<Step, (keyof Values)[]> = { 0: [], 1: ['payment'], 2: ['deposit_bps'], 3: ['full_name', 'phone', 'email'], 4: ['consent'] };
  async function next() {
    if (await trigger(fields[step], { shouldFocus: true })) setStep((s) => Math.min(4, s + 1) as Step);
  }
  const back = () => setStep((s) => Math.max(0, s - 1) as Step);

  const depositRwf = Math.round((price * v.deposit_bps) / 10_000 / 10_000) * 10_000;

  const onSubmit = handleSubmit(async (values) => {
    try {
      if (values.payment === 'finance') {
        await createGeneralInquiry({
          full_name: values.full_name, email: values.email, phone: values.phone, topic: 'buying',
          source: 'order-finance',
          message: `Finance application with reservation\nVehicle: ${title} (${vehicle.slug})\nPrice: ${formatPrice(price)}\nDeposit: ${formatPrice(depositRwf)} (${values.deposit_bps / 100}%)`,
        });
      }
      const kind = values.payment === 'finance' || values.deposit_bps < 10_000 ? 'reservation' : 'purchase';
      router.push(`/checkout/start?vehicle=${encodeURIComponent(vehicle.id)}&kind=${kind}`);
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  const Choice = ({ on, onClick, title, line }: { on: boolean; onClick: () => void; title: string; line: string }) => (
    <button type="button" onClick={onClick} aria-pressed={on} className={cn('flex min-h-20 w-full items-center gap-4 border p-5 text-left transition-colors', on ? 'border-chrome bg-abyss' : 'border-hairline hover:border-chrome')}>
      <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', on ? 'border-chrome bg-chrome' : 'border-hairline')} aria-hidden="true">{on && <Check className="h-3 w-3 text-white" />}</span>
      <span><span className="block font-display text-lg text-chrome">{title}</span><span className="mt-0.5 block text-sm text-steel">{line}</span></span>
    </button>
  );

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Progress */}
      <div className="h-1 w-full bg-hairline" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={step + 1} aria-label="Order progress">
        <div className="h-full bg-chrome transition-all duration-300" style={{ width: `${((step + 1) / 5) * 100}%` }} />
      </div>
      <p className="mt-3 font-data text-xs uppercase tracking-[0.14em] text-steel-muted">Step {step + 1} of 5 · {STEPS[step]}</p>

      <Reveal key={step} variant="fade" threshold={0} className="mt-8 min-h-[22rem]">
        {step === 0 && (
          <section>
            <h1 ref={heading} tabIndex={-1} className="font-display text-display text-chrome outline-none">This one?</h1>
            <div className="mt-6 grid gap-6 sm:grid-cols-[16rem_1fr]">
              {vehicle.primary_image && (
                <div className="relative aspect-[4/3] bg-black"><Image src={vehicle.primary_image.card} alt={vehicle.primary_image.alt} fill sizes="16rem" className="object-cover" /></div>
              )}
              <div>
                <p className="font-display text-2xl text-chrome">{title}</p>
                <p className="mt-2 font-display text-3xl tabular-nums text-chrome">{formatPrice(vehicle.price)}</p>
                <p className="mt-2 text-sm text-steel">{vehicle.location.city} · {vehicle.range_km} km range · {vehicle.seats} seats</p>
              </div>
            </div>
          </section>
        )}

        {step === 1 && (
          <section>
            <h1 ref={heading} tabIndex={-1} className="font-display text-display text-chrome outline-none">Cash or finance?</h1>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Choice on={v.payment === 'cash'} onClick={() => setValue('payment', 'cash', { shouldValidate: true })} title="Cash" line="Pay the full amount, or reserve with a deposit now." />
              <Choice on={v.payment === 'finance'} onClick={() => setValue('payment', 'finance', { shouldValidate: true })} title="Finance" line="Monthly payments with a partner bank. Application goes in with your reservation." />
            </div>
            {v.payment === 'finance' && (
              <div className="mt-10 border-t border-hairline pt-8">
                <FinanceCalculator initialPrice={price} vehicleLabel={title} vehicleSlug={vehicle.slug} />
              </div>
            )}
          </section>
        )}

        {step === 2 && (
          <section>
            <h1 ref={heading} tabIndex={-1} className="font-display text-display text-chrome outline-none">How much now?</h1>
            <p className="mt-3 text-sm text-steel">A deposit holds the car. The balance is due at handover{v.payment === 'finance' ? ', or through the bank' : ''}.</p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {DEPOSITS.filter((d) => v.payment === 'cash' || d < 10_000).map((bps) => {
                const on = v.deposit_bps === bps;
                return (
                  <button key={bps} type="button" aria-pressed={on} onClick={() => setValue('deposit_bps', bps, { shouldValidate: true })} className={cn('min-h-16 border p-3 text-left', on ? 'border-chrome bg-chrome text-white' : 'border-hairline text-chrome hover:border-chrome')}>
                    <span className="block font-display text-xl">{bps === 10_000 ? 'Full' : `${bps / 100}%`}</span>
                    <span className={cn('mt-1 block font-data text-xs tabular-nums', on ? 'text-white/70' : 'text-steel-muted')}>{formatPrice(Math.round((price * bps) / 10_000 / 10_000) * 10_000)}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-steel-muted">The exact amount is set by Voltaris when the order is created; this page never sends a price.</p>
          </section>
        )}

        {step === 3 && (
          <section>
            <h1 ref={heading} tabIndex={-1} className="font-display text-display text-chrome outline-none">How do we reach you?</h1>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Your name" error={errors.full_name?.message} required>{(p) => <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />}</Field>
              <Field label="Phone" error={errors.phone?.message} required>{(p) => <input {...p} {...register('phone')} type="tel" autoComplete="tel" className={inputClass} />}</Field>
              <Field label="Email" error={errors.email?.message} required>{(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className={inputClass} />}</Field>
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h1 ref={heading} tabIndex={-1} className="font-display text-display text-chrome outline-none">Confirm</h1>
            <dl className="mt-6 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
              {[['Vehicle', title], ['Price', formatPrice(vehicle.price)], ['Payment', v.payment === 'cash' ? 'Cash' : 'Finance (partner bank)'], ['Now', v.deposit_bps === 10_000 ? 'Full amount' : `${v.deposit_bps / 100}% deposit · ${formatPrice(depositRwf)}`], ['Name', v.full_name], ['Phone', v.phone]].map(([k, val]) => (
                <div key={k} className="bg-white p-5"><dt className="eyebrow">{k}</dt><dd className="mt-2 text-sm text-chrome">{val}</dd></div>
              ))}
            </dl>
            <div className="mt-6">
              <Field label="" error={errors.consent?.message}>{(p) => (
                <label className="flex items-start gap-3 text-sm text-steel"><input {...p} {...register('consent')} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-volt" />I understand payment is taken on the next screen and the deposit is refundable if the vehicle fails inspection.</label>
              )}</Field>
            </div>
          </section>
        )}
      </Reveal>

      <div className="mt-10 flex items-center justify-between border-t border-hairline pt-6">
        <button type="button" onClick={back} disabled={step === 0} className="inline-flex min-h-12 items-center gap-2 font-data text-eyebrow uppercase text-steel disabled:opacity-30 hover:text-chrome"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back</button>
        {step < 4 ? <Button type="button" onClick={next}>Continue</Button> : <Button type="submit" loading={isSubmitting}>Continue to payment</Button>}
      </div>
    </form>
  );
}
