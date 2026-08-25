import { NextResponse, type NextRequest } from 'next/server';

/**
 * This proxy is a redirect, not a security control.
 *
 * It checks only that a session cookie is *present*, so an unauthenticated visitor
 * lands on the sign-in page instead of a shell that will fail every request. It does
 * not validate the cookie and it cannot — the signing key lives in the backend, which
 * authorizes every API call regardless of what routed here.
 *
 * Forging the cookie gets you an empty page and a run of 401s. Nothing more.
 */
const PROTECTED = ['/account', '/checkout', '/admin'];
const SESSION_COOKIE = 'voltaris_session';

export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!PROTECTED.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  if (request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  // Relative path only — an absolute `next` would make this an open redirect.
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*'],
};
