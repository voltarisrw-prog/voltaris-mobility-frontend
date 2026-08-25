import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoadingSkeleton } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to your Voltaris account.',
  path: '/login',
  noindex: true,
});

export default function LoginPage() {
  return (
    <div className="shell max-w-sm py-16">
      <h1 className="font-display text-headline">Sign in</h1>
      <p className="mt-3 text-sm text-steel">
        Saved vehicles, enquiries, and test drives in one place.
      </p>
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
