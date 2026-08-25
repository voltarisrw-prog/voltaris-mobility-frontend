import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from '@/features/auth/RegisterForm';
import { GoogleButton } from '@/features/auth/GoogleButton';
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
    <div className="shell max-w-sm py-16">
      <h1 className="font-display text-headline">Create an account</h1>
      <p className="mt-3 text-sm text-steel">
        Already have one?{' '}
        <Link href="/login" className="text-volt underline underline-offset-2">
          Sign in
        </Link>
        .
      </p>
      <div className="mt-8">
        <GoogleButton />

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-hairline" />
          <span className="eyebrow">or</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
