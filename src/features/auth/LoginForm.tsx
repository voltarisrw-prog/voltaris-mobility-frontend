'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Button, Field, inputClass } from '@/components/ui';
import { login } from '@/lib/api/auth';
import { ApiError, displayMessage } from '@/lib/api/errors';
import { loginSchema } from '@/lib/validation/schemas';
import { safeNext } from './safeNext';
import { features } from '@/config/features';
import type { z } from 'zod';

type Values = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await login(values);

      // Authentication is cookie-based.
      // Never persist access_token or refresh_token in browser storage.
      if (!result.user) {
        throw new Error('Authentication succeeded but no user session was returned.');
      }

      router.replace(safeNext(searchParams.get('next')));
      router.refresh();
    } catch (cause) {
      if (cause instanceof ApiError && cause.code === 'MFA_REQUIRED') {
        setMfaRequired(true);
        setFormError('Enter the 6-digit code from your authenticator app.');
        return;
      }
      // Deliberately the same message for a wrong password and an unknown email —
      // distinguishing them turns the login form into an account enumeration oracle.
      setFormError(
        cause instanceof ApiError && cause.status === 401
          ? 'That email and password combination did not work.'
          : displayMessage(cause),
      );
    }
  });

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

      <Field label="Email" error={errors.email?.message} required>
        {(p) => (
          <input
            {...p}
            {...register('email')}
            type="email"
            autoComplete="email"
            className={inputClass}
          />
        )}
      </Field>

      <Field label="Password" error={errors.password?.message} required>
        {(p) => (
          <input
            {...p}
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className={inputClass}
          />
        )}
      </Field>

      {mfaRequired && (
        <Field label="Authentication code" error={errors.otp?.message} required>
          {(p) => (
            <input
              {...p}
              {...register('otp')}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className={`${inputClass} font-data tracking-[0.4em]`}
            />
          )}
        </Field>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Sign in
      </Button>

      <div className="flex justify-between font-data text-eyebrow uppercase">
        {features.passwordReset ? (
          <Link href="/forgot-password" className="text-volt hover:underline">
            Forgot password
          </Link>
        ) : (
          <span className="text-steel-muted">Locked out? Contact support</span>
        )}
        <Link href="/register" className="text-volt hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}
