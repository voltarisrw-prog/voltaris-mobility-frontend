'use client';

import { useState } from 'react';
import { Button, useToast } from '@/components/ui';
import { logout } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';

export function SignOutButton() {
  const toast = useToast();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="ghost"
      loading={pending}
      onClick={async () => {
        setPending(true);
        try {
          // Only the backend can clear an httpOnly cookie, so sign-out is a request.
          await logout();
          window.location.assign('/');
        } catch (cause) {
          toast.push('error', displayMessage(cause));
          setPending(false);
        }
      }}
    >
      Sign out
    </Button>
  );
}
