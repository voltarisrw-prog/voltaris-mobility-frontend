'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { createInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { inquirySchema, type InquiryForm as Values } from '@/lib/validation/schemas';

export function InquiryForm({
  vehicleId,
  vehicleTitle,
}: {
  vehicleId: string;
  vehicleTitle: string;
}) {
  const toast = useToast();
  const [reference, setReference] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { vehicle_id: vehicleId, preferred_channel: 'whatsapp' },
  });

  if (reference) {
    return (
      <div className="border border-volt/25 bg-volt-wash p-6">
        <h2 className="font-display text-xl tracking-tight">Your enquiry is with the seller</h2>
        <p className="mt-3 text-sm text-steel">
          Reference <span className="font-data text-chrome">{reference}</span>. Most sellers reply
          within a working day. We will email you when they do.
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createInquiry({
        vehicle_id: values.vehicle_id,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        preferred_channel: values.preferred_channel,
      });
      // Only the non-identifying fields reach analytics.
      track('inquiry_created', {
        vehicle_id: vehicleId,
        preferred_channel: values.preferred_channel,
      });
      setReference(result.reference);
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <input type="hidden" {...register('vehicle_id')} />

      <Field label="Your name" error={errors.full_name?.message} required>
        {(props) => (
          <input {...props} {...register('full_name')} autoComplete="name" className={inputClass} />
        )}
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message} required>
          {(props) => (
            <input
              {...props}
              {...register('email')}
              type="email"
              autoComplete="email"
              className={inputClass}
            />
          )}
        </Field>
        <Field
          label="Phone"
          hint="Rwandan mobile, e.g. 0788 123 456"
          error={errors.phone?.message}
          required
        >
          {(props) => (
            <input
              {...props}
              {...register('phone')}
              type="tel"
              autoComplete="tel"
              className={inputClass}
            />
          )}
        </Field>
      </div>

      <Field label="How should the seller reach you?" error={errors.preferred_channel?.message}>
        {(props) => (
          <select {...props} {...register('preferred_channel')} className={selectClass}>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone call</option>
            <option value="email">Email</option>
          </select>
        )}
      </Field>

      <Field
        label="Your question"
        hint={`About the ${vehicleTitle}`}
        error={errors.message?.message}
        required
      >
        {(props) => (
          <textarea
            {...props}
            {...register('message')}
            rows={5}
            placeholder="Is the battery report available? Can I see it this weekend in Kigali?"
            className={inputClass}
          />
        )}
      </Field>

      <Field label="" error={errors.consent?.message}>
        {(props) => (
          <label className="flex items-start gap-3 text-sm text-steel">
            <input
              {...props}
              {...register('consent')}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
            />
            Share my name and contact details with this seller so they can reply.
          </label>
        )}
      </Field>

      <Button type="submit" loading={isSubmitting}>
        Send enquiry
      </Button>
    </form>
  );
}
