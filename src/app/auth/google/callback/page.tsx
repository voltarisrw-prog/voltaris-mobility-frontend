import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingSkeleton } from '@/components/ui';
import { GoogleCallback } from '@/features/auth/GoogleCallback';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Signing you in',
  description: 'Completing Google sign-in.',
  path: '/auth/google/callback',
  noindex: true,
  follow: false,
});

export default function GoogleCallbackPage() {
  return (
    <div className="shell max-w-sm py-24">
      <Suspense fallback={<LoadingSkeleton lines={3} />}>
        <GoogleCallback />
      </Suspense>
    </div>
  );
}
