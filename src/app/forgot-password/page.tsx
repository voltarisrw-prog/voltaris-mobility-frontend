import type { Metadata } from 'next';
import { ForgotPasswordForm } from '@/features/auth/PasswordForms';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Reset your password',
  description: 'Request a Voltaris password reset link.',
  path: '/forgot-password',
  noindex: true,
});

export default function ForgotPasswordPage() {
  return (
    <div className="shell max-w-sm py-16">
      <h1 className="font-display text-headline">Reset your password</h1>
      <p className="mt-3 text-sm text-steel">We will email you a link to set a new one.</p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
