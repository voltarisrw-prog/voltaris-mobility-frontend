import type { Metadata } from 'next';
import Link from 'next/link';
import { verifyEmail } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Verify your email',
  description: 'Confirm your Voltaris email address.',
  path: '/verify-email',
  noindex: true,
  follow: false,
});

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  let state: 'missing' | 'verified' | 'failed' = 'missing';
  let message = '';

  if (token) {
    try {
      await verifyEmail(token);
      state = 'verified';
    } catch (cause) {
      state = 'failed';
      message = displayMessage(cause);
    }
  }

  return (
    <div className="shell max-w-sm py-16">
      {state === 'verified' && (
        <>
          <h1 className="font-display text-headline">Email confirmed</h1>
          <p className="mt-3 text-sm text-steel">Your account is active. Sign in to get started.</p>
          <Link
            href="/login"
            className="mt-6 inline-block bg-volt px-5 py-3 font-data text-eyebrow uppercase text-surface hover:bg-volt-bright"
          >
            Sign in
          </Link>
        </>
      )}
      {state === 'failed' && (
        <>
          <h1 className="font-display text-headline">This link did not work</h1>
          <p className="mt-3 text-sm text-steel">
            {message} Verification links expire and work only once.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block font-data text-eyebrow uppercase text-volt hover:underline"
          >
            Sign in to request another →
          </Link>
        </>
      )}
      {state === 'missing' && (
        <>
          <h1 className="font-display text-headline">Nothing to verify</h1>
          <p className="mt-3 text-sm text-steel">Open the verification link from your email.</p>
        </>
      )}
    </div>
  );
}
