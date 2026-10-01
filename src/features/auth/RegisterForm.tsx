'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Field, inputClass } from '@/components/ui';
import { PasswordInput } from './PasswordInput';
import { PasswordMeter } from './PasswordMeter';
import { PhoneInput, toRwandaE164 } from './PhoneInput';
import { register as registerAccount } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';
import { registerSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

type Values = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(registerSchema) });
  const password = useWatch({ control, name: 'password' });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await registerAccount({
        full_name: values.full_name,
        email: values.email,
        phone: toRwandaE164(values.phone),
        password: values.password,
      });
      setDone(true);
    } catch (cause) {
      setFormError(displayMessage(cause));
    }
  });

  if (done) {
    return (
      <div className="border border-volt/25 bg-volt-wash p-6">
        <h2 className="font-display text-xl tracking-tight">Check your email</h2>
        <p className="mt-3 text-sm text-steel">
          We sent a verification link. Open it to activate the account, then sign in.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block font-data text-eyebrow uppercase text-volt underline underline-offset-4"
        >
          Go to sign in →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {formError && (
        <p
          role="alert"
          className="border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {formError}
        </p>
      )}

      <Field floating label="Full name" error={errors.full_name?.message} required>
        {(p) => (
          <input {...p} {...register('full_name')} autoComplete="name" placeholder=" " className={inputClass} />
        )}
      </Field>

      <Field floating label="Email" error={errors.email?.message} required>
        {(p) => (
          <input
            {...p}
            {...register('email')}
            type="email"
            autoComplete="email"
            placeholder=" " className={inputClass}
          />
        )}
      </Field>

      <Field floating
        label="Phone"
        hint="Rwandan mobile number, e.g. 788 123 456"
        error={errors.phone?.message}
        required
      >
        {(p) => (
          <PhoneInput {...p} {...register('phone')} autoComplete="tel-national" placeholder=" " className={inputClass} />
        )}
      </Field>

      <Field floating
        label="Password"
        hint="At least 12 characters, with upper and lower case and a number"
        error={errors.password?.message}
        required
      >
        {(p) => (
          <PasswordInput {...p} {...register('password')} autoComplete="new-password" placeholder=" " className={inputClass} />
        )}
      </Field>

      <PasswordMeter value={password ?? ''} />


      <Field floating label="Confirm password" error={errors.confirm_password?.message} required>
        {(p) => (
          <PasswordInput {...p} {...register('confirm_password')} autoComplete="new-password" placeholder=" " className={inputClass} />
        )}
      </Field>

      <Field label="" error={errors.accepts_terms?.message}>
        {(p) => (
          <label className="flex items-start gap-3 text-sm text-steel">
            <input
              {...p}
              {...register('accepts_terms')}
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
            />
            <span>
              I accept the{' '}
              <Link href="/legal/terms" className="text-volt underline underline-offset-2">
                terms
              </Link>{' '}
              and{' '}
              <Link href="/legal/privacy" className="text-volt underline underline-offset-2">
                privacy policy
              </Link>
              .
            </span>
          </label>
        )}
      </Field>

      <Button type="submit" loading={isSubmitting} className="w-full">
        Create account
      </Button>
    </form>
  );
}
