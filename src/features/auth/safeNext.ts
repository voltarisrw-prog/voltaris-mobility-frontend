/**
 * Only same-origin, path-relative redirects are permitted after sign-in. Anything
 * else — protocol-relative `//evil.com`, absolute URLs, backslash tricks — falls back
 * to the account page. This is the open-redirect guard.
 */
export function safeNext(value: string | null | undefined, fallback = '/account'): string {
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback;
  return value;
}
