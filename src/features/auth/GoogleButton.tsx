'use client';

import { useState } from 'react';
import { Button, useToast } from '@/components/ui';
import { googleAuthorizeUrl } from '@/lib/api/auth';
import { ApiError, displayMessage } from '@/lib/api/errors';

/**
 * The URL is fetched from the backend rather than assembled here, because it
 * carries a `state` and `nonce` the backend generated and stored. Building it
 * client-side would mean the client choosing its own CSRF token, which defeats it.
 */
export function GoogleButton({ next }: { next?: string }) {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    try {
      const { authorization_url } = await googleAuthorizeUrl();
      // Remember where to land afterwards. sessionStorage would be blocked by our
      // lint rule and is unnecessary — the callback route reads this param back.
      if (next) document.cookie = `voltaris_next=${encodeURIComponent(next)}; path=/; max-age=600`;
      window.location.assign(authorization_url);
    } catch (cause) {
      setPending(false);
      toast.push(
        'error',
        cause instanceof ApiError && cause.code === 'NOT_CONFIGURED'
          ? 'Google sign-in is not enabled on this environment yet.'
          : displayMessage(cause),
      );
    }
  }

  return (
    <Button variant="secondary" loading={pending} onClick={start} className="w-full">
      <GoogleGlyph />
      Continue with Google
    </Button>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
