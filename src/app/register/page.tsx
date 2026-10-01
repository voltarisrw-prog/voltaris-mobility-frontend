import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { AuthShell } from '@/features/auth/AuthShell';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Create an account',
  description:
    'Create a Voltaris account to save vehicles, track enquiries, and manage test drives.',
  path: '/register',
  noindex: true,
});

export default function RegisterPage() {
  return (
    <AuthShell
      active="register"
      title="Create your account"
      subtitle={
        <>
          Already have one? <Link href="/login">Sign in</Link>.
        </>
      }
    >
      <div className="auth-google">
        <GoogleButton />
      </div>
      <div className="auth-or">or</div>
      <RegisterForm />
    </AuthShell>
  );
}
