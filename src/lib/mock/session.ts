const COOKIE_NAME = 'voltaris_demo_session';

const isServer = typeof window === 'undefined';

/**
 * A demo-only session, deliberately not named or shaped like the real
 * `voltaris_session`/`voltaris_refresh`/`voltaris_csrf` cookies described in
 * lib/api/auth.ts, so it can never be confused with or interfere with real
 * cookie-based auth once a backend exists. It's a plain, JS-readable cookie
 * rather than httpOnly — there is no real session to protect here, only a
 * flag saying "the demo login form was submitted."
 *
 * Login/register/logout only ever run from inside a 'use client' form, so
 * setDemoSession/clearDemoSession only need to handle the browser. Reading
 * the session, on the other hand, happens from Server Components too (e.g.
 * account/layout.tsx calling getSession() during SSR) — readDemoSessionUserId
 * covers both.
 */

export async function readDemoSessionUserId(): Promise<string | undefined> {
  if (isServer) {
    try {
      const { cookies } = await import('next/headers');
      const store = await cookies();
      return store.get(COOKIE_NAME)?.value || undefined;
    } catch {
      // `cookies()` only works inside an active Next.js request — anywhere
      // else (a unit test, a script) there is no session to read, which is
      // the same as "not signed in," not an error worth surfacing.
      return undefined;
    }
  }
  const entry = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : undefined;
}

export function setDemoSession(userId: string): void {
  if (isServer) return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(userId)}; path=/; max-age=2592000; samesite=lax`;
}

export function clearDemoSession(): void {
  if (isServer) return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
}
