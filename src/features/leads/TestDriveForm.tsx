'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { ConfirmationCard } from '@/components/ConfirmationCard';
import { requestTestDrive } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { testDriveSchema, type TestDriveForm as Values } from '@/lib/validation/schemas';

const LOCATIONS = [
  { value: 'kigali-kicukiro', label: 'Kigali — Kicukiro' },
  { value: 'kigali-gasabo', label: 'Kigali — Gasabo' },
  { value: 'kigali-nyarugenge', label: 'Kigali — Nyarugenge' },
  { value: 'musanze', label: 'Musanze' },
  { value: 'rubavu', label: 'Rubavu' },
  { value: 'huye', label: 'Huye' },
];

export function TestDriveForm({
  vehicleId,
  vehicleTitle,
}: {
  vehicleId?: string;
  vehicleTitle?: string;
}) {
  const toast = useToast();
  const [result, setResult] = useState<{ reference: string } | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(testDriveSchema),
    defaultValues: { vehicle_id: vehicleId ?? '', preferred_time_slot: 'morning' },
  });

  if (result) {
    return (
      <ConfirmationCard
        eyebrow="Demo drive requested"
        title={vehicleTitle ? `${vehicleTitle}, at your pace.` : 'Your drive is requested.'}
        reference={result.reference}
        steps={['Voltaris confirms the slot with the seller and comes back to you.', 'Bring your driving licence. An advisor meets you at the location you chose.', 'No pressure afterwards: reserve, compare, or walk away.']}
        whatsappText={`Hello Voltaris, about test drive ${result.reference}.`}
        links={[{ label: 'Track this request', href: `/test-drive/${result.reference}` }]}
      />
    );
  }

  const onSubmit = handleSubmit(async (values) => {
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
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="border border-black/10 bg-white p-6 text-black transition-all duration-500 hover:border-black/20 sm:p-8">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
      {vehicleId ? (
        <input type="hidden" {...register('vehicle_id')} />
      ) : (
        <Field
          label="Vehicle"
          hint="Paste the listing reference, or start from a vehicle page"
          error={errors.vehicle_id?.message}
          required
        >
          {(props) => <input {...props} {...register('vehicle_id')} className={inputClass} />}
        </Field>
      )}

      {vehicleTitle && (
        <p className="border border-black/10 bg-black/[0.025] px-4 py-3 text-sm text-black">
          Driving the <span className="font-medium">{vehicleTitle}</span>
        </p>
      )}

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
        <Field label="Phone" error={errors.phone?.message} required>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Preferred date" error={errors.preferred_date?.message} required>
          {(props) => (
            <input
              {...props}
              {...register('preferred_date')}
              type="date"
              min={today}
              className={inputClass}
            />
          )}
        </Field>
        <Field label="Time of day" error={errors.preferred_time_slot?.message} required>
          {(props) => (
            <select {...props} {...register('preferred_time_slot')} className={selectClass}>
              <option value="morning">Morning (8am–12pm)</option>
              <option value="afternoon">Afternoon (12pm–4pm)</option>
              <option value="evening">Evening (4pm–6pm)</option>
            </select>
          )}
        </Field>
      </div>

      <Field label="Where" error={errors.location_slug?.message} required>
        {(props) => (
          <select
            {...props}
            {...register('location_slug')}
            className={`${selectClass} !bg-black !text-black`}
          >
            <option value="">Choose a location</option>
            {LOCATIONS.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field label="Anything else" hint="Optional" error={errors.notes?.message}>
        {(props) => <textarea {...props} {...register('notes')} rows={3} className={inputClass} />}
      </Field>

      <Field label="" error={errors.consent?.message}>
        {(props) => (
          <label className="flex items-start gap-3 text-sm text-black/65">
            <input
              {...props}
              {...register('consent')}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
            />
            Share my details with Voltaris and the seller to arrange this drive.
          </label>
        )}
      </Field>

      <Button type="submit" loading={isSubmitting}>
        Request this test drive
      </Button>
      </form>
    </div>
  );
}
