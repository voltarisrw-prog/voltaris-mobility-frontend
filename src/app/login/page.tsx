import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoadingSkeleton } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { buildMetadata } from '@/lib/seo/metadata';
import { envFlag } from '@/lib/env';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to your Voltaris account.',
  path: '/login',
  noindex: true,
});

export default async function LoginPage() {
  // Dynamic, not static — same reasoning as request()'s demo-mode gate in
  // lib/api/client.ts: this keeps lib/mock (and everything it takes to
  // build the fixtures) out of this page's bundle and out of module
  // evaluation entirely when demo mode is off, rather than importing
  // DEMO_USER/DEMO_PASSWORD unconditionally just in case they're shown.
  const demoCredentials = envFlag(process.env.NEXT_PUBLIC_DEMO_DATA)
    ? await import('@/lib/mock/fixtures').then((m) => ({
        email: m.DEMO_USER.email,
        password: m.DEMO_PASSWORD,
      }))
    : null;

  return (
    <div className="shell max-w-sm py-16">
      <h1 className="font-display text-headline">Sign in</h1>
      <p className="mt-3 text-sm text-steel">
        Saved vehicles, enquiries, and test drives in one place.
      </p>
      {demoCredentials && (
        <div className="mt-6 border border-volt/25 bg-volt-wash px-4 py-3 text-sm">
          <p className="font-data text-eyebrow uppercase text-volt">Demo mode</p>
          <p className="mt-1 text-steel">
            Sign in with <span className="font-medium text-chrome">{demoCredentials.email}</span>{' '}
            / <span className="font-medium text-chrome">{demoCredentials.password}</span>
          </p>
        </div>
      )}
      <div className="mt-8">
        <Suspense fallback={<LoadingSkeleton lines={4} />}>
          <GoogleButton />

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-hairline" />
          <span className="eyebrow">or</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
