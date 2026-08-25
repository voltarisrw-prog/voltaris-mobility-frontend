'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ErrorState';
import { displayMessage } from '@/lib/api/errors';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to the error tracker here. The raw message is never rendered.
    console.error('[voltaris] render error', error.digest);
  }, [error]);

  return (
    <div className="shell py-24">
      <ErrorState body={displayMessage(error)} onRetry={reset} />
    </div>
  );
}
