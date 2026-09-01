import { Suspense } from 'react';
import { GoogleCallback } from '@/features/auth/GoogleCallback';
import { LoadingSkeleton } from '@/components/ui';

export default function GoogleCallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <Suspense fallback={<LoadingSkeleton lines={3} />}>
        <GoogleCallback />
      </Suspense>
    </main>
  );
}
