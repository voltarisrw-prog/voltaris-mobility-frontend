import { cache } from 'react';
import { notFound, redirect } from 'next/navigation';
import { can, getSession, type Session } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';

/** One /auth/session call per request, however many layouts and pages ask. */
export const currentSession = cache(async (next: string): Promise<Session> => {
  try {
    return await getSession();
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) redirect(`/login?next=${next}`);
    throw cause;
  }
});

/**
 * Page-level guard for /admin pages. Returns null while the admin layout is showing
 * the two-step sign-in screen (the page must render nothing); 404 for anyone
 * without one of `permissions`.
 */
export async function requirePermission(
  next: string,
  ...permissions: string[]
): Promise<Session | null> {
  const session = await currentSession(next);
  if (session.user.mfa_required && !session.user.mfa_verified) return null;
  if (permissions.length > 0 && !can(session.user, ...permissions)) notFound();
  return session;
}
