'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { updateProfile, type Profile } from '@/lib/api/users';
import { displayMessage } from '@/lib/api/errors';
import { profileSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type Values = z.infer<typeof profileSchema>;

export function ProfileForm({ profile }: { profile: Profile }) {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name,
      phone: profile.phone,
      preferred_language: profile.preferred_language,
      marketing_opt_in: profile.marketing_opt_in,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile(values);
      toast.push('success', 'Profile saved.');
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-md space-y-5">
      <Field label="Full name" error={errors.full_name?.message} required>
        {(p) => (
          <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />
        )}
      </Field>

      <Field label="Phone" error={errors.phone?.message} required>
        {(p) => (
          <input
            {...p}
            {...register('phone')}
            type="tel"
            autoComplete="tel"
            className={inputClass}
          />
        )}
      </Field>

      <div>
        <p className="eyebrow mb-2">Email</p>
        <p className="border border-hairline bg-slab/60 px-4 py-3 text-sm text-steel">
          {profile.email}
        </p>
        <p className="mt-1.5 text-xs text-steel-muted">
          Changing your email needs verification. Contact support to start it.
        </p>
      </div>

      <Field label="Language" error={errors.preferred_language?.message}>
        {(p) => (
          <select {...p} {...register('preferred_language')} className={selectClass}>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="rw">Kinyarwanda</option>
          </select>
        )}
      </Field>

      <label className="flex items-start gap-3 text-sm text-steel">
        <input
          type="checkbox"
          {...register('marketing_opt_in')}
          className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
        />
        Email me when a vehicle matching one of my saved searches is listed.
      </label>

      <Button type="submit" loading={isSubmitting} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
