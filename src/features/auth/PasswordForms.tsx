'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Field, inputClass } from '@/components/ui';
import { forgotPassword, resetPassword } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';
import { forgotPasswordSchema, resetPasswordSchema } from '@/lib/validation/schemas';
import type { z } from 'zod';

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await forgotPassword(values.email);
    } catch (cause) {
      setFormError(displayMessage(cause));
      return;
    }
    // Shown whether or not the address exists — otherwise this page becomes a way to
    // discover which emails have accounts.
    setSent(true);
  });

  if (sent) {
    return (
      <div className="border border-volt/25 bg-volt-wash p-6">
        <h2 className="font-display text-xl tracking-tight">Check your email</h2>
        <p className="mt-3 text-sm text-steel">
          If an account exists for that address, a reset link is on its way. The link works once and
          expires after an hour.
        </p>
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
      <Button type="submit" loading={isSubmitting} className="w-full">
        Send a reset link
      </Button>
      <Link
        href="/login"
        className="block font-data text-eyebrow uppercase text-volt hover:underline"
      >
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await resetPassword(values.token, values.password);
      router.replace('/login?reset=1');
    } catch (cause) {
      setFormError(displayMessage(cause));
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
      <input type="hidden" {...register('token')} />
      <Field
        label="New password"
        hint="At least 12 characters"
        error={errors.password?.message}
        required
      >
        {(p) => (
          <input
            {...p}
            {...register('password')}
            type="password"
            autoComplete="new-password"
            className={inputClass}
          />
        )}
      </Field>
      <Field label="Confirm new password" error={errors.confirm_password?.message} required>
        {(p) => (
          <input
            {...p}
            {...register('confirm_password')}
            type="password"
            autoComplete="new-password"
            className={inputClass}
          />
        )}
      </Field>
      <Button type="submit" loading={isSubmitting} className="w-full">
        Set the new password
      </Button>
    </form>
  );
}
