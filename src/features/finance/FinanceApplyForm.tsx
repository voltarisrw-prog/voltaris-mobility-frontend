'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button, Field, inputClass, useToast } from '@/components/ui';
import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { generalInquirySchema, type GeneralInquiryForm } from '@/lib/validation/schemas';

/**
 * The "apply through Voltaris" form. Self-contained so the finance page adds no
 * behaviour to the shared homepage form: it posts a general enquiry with the
 * calculator's numbers pre-filled in the message.
 */
export function FinanceApplyForm({ summary, source }: { summary: string; source: string }) {
  const toast = useToast();
  const [reference, setReference] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<GeneralInquiryForm>({
    resolver: zodResolver(generalInquirySchema),
    defaultValues: { topic: 'buying', message: summary },
  });

  const consent = watch('consent');

  if (reference) {
    return (
      <div className="border border-volt/25 bg-abyss p-8">
        <h3 className="font-display text-headline text-chrome">Application received</h3>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-steel">
          Reference <span className="font-data text-chrome">{reference}</span>. An advisor calls you
          within one working day to confirm the vehicle and take the application to the bank.
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
        topic: 'buying',
        message: values.message,
        source,
      });
      setReference(result.reference);
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <input type="hidden" {...register('topic')} value="buying" />
      <Field label="Your name" error={errors.full_name?.message} required>
        {(p) => <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone" hint="Rwandan mobile, e.g. 0788 123 456" error={errors.phone?.message} required>
          {(p) => <input {...p} {...register('phone')} type="tel" autoComplete="tel" className={inputClass} />}
        </Field>
        <Field label="Email" error={errors.email?.message} required>
          {(p) => <input {...p} {...register('email')} type="email" autoComplete="email" className={inputClass} />}
        </Field>
      </div>
      <Field label="Your figures" hint="Edit if anything is wrong" error={errors.message?.message} required>
        {(p) => <textarea {...p} {...register('message')} rows={7} className={`${inputClass} font-data text-xs`} />}
      </Field>
      <Field label="" error={errors.consent?.message}>
        {(p) => (
          <label className="flex items-start gap-3 text-sm text-steel">
            <input {...p} {...register('consent')} type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-volt" />
            Share my details with Voltaris and the lender I chose so they can contact me about this application.
          </label>
        )}
      </Field>
      <Button type="submit" loading={isSubmitting} disabled={!consent || isSubmitting}>
        Send application
      </Button>
      {!consent ? (
        <p className="text-center text-xs text-steel">Tick the box above to send your application.</p>
      ) : null}
    </form>
  );
}
