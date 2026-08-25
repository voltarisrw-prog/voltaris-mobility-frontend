'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingSkeleton } from '@/components/ui';
import { googleCallback } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';
import { safeNext } from './safeNext';

export function GoogleCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const [exchangeError, setExchangeError] = useState<string | null>(null);
  // React 18 mounts effects twice in development. The authorization code is
  // single-use, so a second exchange would fail and show a spurious error.
  const started = useRef(false);

  const code = params.get('code');
  const state = params.get('state');
  const denied = params.get('error');

  // The two failure cases that are knowable from the URL alone are derived during
  // render, not written into state by an effect — an effect that only exists to
  // setState immediately is a wasted render pass.
  const upfrontError = denied
    ? 'Sign-in was cancelled.'
    : !code || !state
      ? 'That link is incomplete. Start again from the sign-in page.'
      : null;

  useEffect(() => {
    if (started.current || upfrontError || !code || !state) return;
    started.current = true;

    googleCallback(code, state)
      .then(() => {
        const stored = document.cookie
          .split('; ')
          .find((c) => c.startsWith('voltaris_next='))
          ?.split('=')[1];
        document.cookie = 'voltaris_next=; path=/; max-age=0';
        // Session cookies were set on the callback response; refresh so Server
        // Components re-render as signed in.
        router.replace(safeNext(stored ? decodeURIComponent(stored) : null));
        router.refresh();
      })
      .catch((cause: unknown) => setExchangeError(displayMessage(cause)));
  }, [code, state, upfrontError, router]);

  const error = upfrontError ?? exchangeError;

  if (error) {
    return (
      <div role="alert">
        <h1 className="font-display text-headline">Sign-in did not complete</h1>
        <p className="mt-3 text-sm text-steel">{error}</p>
        <Link
          href="/login"
          className="mt-6 inline-block font-data text-eyebrow uppercase text-volt hover:underline"
        >
          Back to sign in →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-headline">Signing you in…</h1>
      <div className="mt-6">
        <LoadingSkeleton lines={3} />
      </div>
    </div>
  );
}
