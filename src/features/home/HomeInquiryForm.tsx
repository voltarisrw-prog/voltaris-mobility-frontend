'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { generalInquirySchema, type GeneralInquiryForm } from '@/lib/validation/schemas';

const TOPICS = [
  { value: 'buying', label: 'I want to buy a vehicle' },
  { value: 'selling', label: 'I have a vehicle to sell' },
  { value: 'renting', label: 'I want to rent' },
  { value: 'partnership', label: 'Dealer or partnership enquiry' },
  { value: 'other', label: 'Something else' },
] as const;

export function HomeInquiryForm() {
  const toast = useToast();
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GeneralInquiryForm>({
    resolver: zodResolver(generalInquirySchema),
    defaultValues: { topic: 'buying' },
  });

  if (reference) {
    return (
      <div className="border border-volt/25 bg-volt-wash p-8">
        <h3 className="font-display text-headline">We have it</h3>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-[color:var(--vds-text-secondary)]">
          Reference <span className="font-data text-[color:var(--vds-text)]">{reference}</span>. Someone from the
          Voltaris team will reply within one working day, on whichever channel you gave us.
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createGeneralInquiry({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        topic: values.topic,
        message: values.message,
        source: 'homepage',
      });
      // Only the non-identifying fields go to analytics; the runtime filter in
      // lib/analytics would strip the rest anyway.
      track('inquiry_created', { vehicle_id: 'none', preferred_channel: values.topic });
      setReference(result.reference);
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/*
        Honeypot. Hidden from sight and from screen readers, and skipped by the
        tab order, so no real person can fill it — but most naive bots will. The
        backend rejects any submission where it is non-empty. This is not a
        substitute for server-side rate limiting; it is the cheap first filter.
      */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company-website">Leave this empty</label>
        <input id="company-website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <Field label="What is this about" error={errors.topic?.message} required>
        {(p) => (
          <select {...p} {...register('topic')} className={selectClass}>
            {TOPICS.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Your name" error={errors.full_name?.message} required>
        {(p) => <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message} required>
          {(p) => (
            <input {...p} {...register('email')} type="email" autoComplete="email" className={inputClass} />
          )}
        </Field>
        <Field
          label="Phone"
          hint="Rwandan mobile, e.g. 0788 123 456"
          error={errors.phone?.message}
          required
        >
          {(p) => <input {...p} {...register('phone')} type="tel" autoComplete="tel" className={inputClass} />}
        </Field>
      </div>

      <Field label="Your message" error={errors.message?.message} required>
        {(p) => (
          <textarea
            {...p}
            {...register('message')}
            rows={5}
            placeholder="I am looking for an electric SUV under 40M with enough range for Kigali to Musanze and back."
            className={inputClass}
          />
        )}
      </Field>

      <Field label="" error={errors.consent?.message}>
        {(p) => (
          <label className="flex items-start gap-3 text-sm text-[color:var(--vds-text-secondary)]">
            <input
              {...p}
              {...register('consent')}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 vds-checkbox"
            />
            Voltaris may use my details to reply to this enquiry.
          </label>
        )}
      </Field>

      <Button type="submit" loading={isSubmitting}>
        Send enquiry
      </Button>
    </form>
  );
}
