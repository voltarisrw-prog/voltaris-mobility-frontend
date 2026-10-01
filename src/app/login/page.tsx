import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/LoginForm';
import { LoadingSkeleton } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { AuthShell } from '@/features/auth/AuthShell';
import { buildMetadata } from '@/lib/seo/metadata';
import { envFlag } from '@/lib/env';

export const metadata: Metadata = buildMetadata({
  title: 'Sign in',
  description: 'Sign in to your Voltaris account.',
  path: '/login',
  noindex: true,
});

export default async function LoginPage() {
  // Dynamic import keeps lib/mock out of the bundle unless demo mode is on.
  const demoCredentials = envFlag(process.env.NEXT_PUBLIC_DEMO_DATA)
    ? await import('@/lib/mock/fixtures').then((m) => ({
        email: m.DEMO_USER.email,
        password: m.DEMO_PASSWORD,
      }))
    : null;

  return (
    <AuthShell
      active="login"
      title="Welcome back"
      subtitle="Saved vehicles, enquiries, and test drives in one place."
    >
      {demoCredentials && (
        <div className="auth-demo">
          <b>Demo mode.</b> Sign in with <b>{demoCredentials.email}</b> / <b>{demoCredentials.password}</b>
        </div>
      )}
      <Suspense fallback={<LoadingSkeleton lines={4} />}>
        <div className="auth-google">
          <GoogleButton />
        </div>
        <div className="auth-or">or</div>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
