import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { SignOutButton } from '@/features/auth/SignOutButton';

const NAV = [
  { href: '/account', label: 'Profile' },
  { href: '/account/saved', label: 'Saved vehicles' },
  { href: '/account/searches', label: 'Saved searches' },
  { href: '/account/inquiries', label: 'Enquiries' },
  { href: '/account/test-drives', label: 'Test drives' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/notifications', label: 'Notifications' },
];

/**
 * Never prerendered. Every page in this segment is per-viewer: it reads the
 * session cookie and returns that person's data.
 *
 * Without this, Next tries to statically generate them at build time. It
 * normally discovers they are dynamic when `cookies()` is called — but the API
 * client validates its configuration *before* reading cookies, so a missing
 * NEXT_PUBLIC_API_BASE_URL throws first and the build fails on a page that
 * should never have been prerendered at all.
 *
 * Declaring it removes the guesswork: the build no longer depends on a runtime
 * variable being present, which is the correct relationship between the two.
 */
export const dynamic = 'force-dynamic';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  // The real gate. Middleware only checked that a cookie existed; this asks the
  // backend whether it is actually a session.
  let session;
  try {
    session = await getSession();
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) redirect('/login?next=/account');
    throw cause;
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-hairline/60 pb-6">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="mt-2 font-display text-headline">{session.user.full_name}</h1>
        </div>
        <SignOutButton />
      </header>

      {!session.user.email_verified && (
        <p className="mt-6 border border-volt/25 bg-volt-wash px-4 py-3 text-sm">
          Your email is not confirmed yet. Some features stay locked until it is — check your inbox
          for the verification link.
        </p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label="Account" className="lg:sticky lg:top-24 lg:self-start">
          <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-data text-eyebrow uppercase text-steel transition-colors hover:text-chrome"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
