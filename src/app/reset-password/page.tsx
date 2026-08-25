import type { Metadata } from 'next';
import Link from 'next/link';
import { ResetPasswordForm } from '@/features/auth/PasswordForms';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Set a new password',
  description: 'Set a new password for your Voltaris account.',
  path: '/reset-password',
  noindex: true,
  follow: false,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="shell max-w-sm py-16">
        <h1 className="font-display text-headline">This link is incomplete</h1>
        <p className="mt-3 text-sm text-steel">
          Open the link straight from the email, or request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-block font-data text-eyebrow uppercase text-volt hover:underline"
        >
          Request a new link →
        </Link>
      </div>
    );
  }

  return (
    <div className="shell max-w-sm py-16">
      <h1 className="font-display text-headline">Set a new password</h1>
      <div className="mt-8">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  );
}
