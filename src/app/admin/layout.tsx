import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SignOutButton } from '@/features/auth/SignOutButton';
import { MfaPanel } from '@/features/auth/MfaPanel';
import { currentSession } from '@/lib/access/server';
import { visibleSections } from '@/lib/access/sections';
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

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession('/admin');
  const user = session.user;

  // 404 rather than 403: a signed-in customer should not learn that /admin exists.
  // This hides the surface. It does not protect it — every /admin API call is
  // authorized by the backend against the session, independently of this check.
  if (!user.mfa_required) notFound();

  const header = (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-chrome pb-4">
      <div className="flex items-baseline gap-4">
        <span className="font-display text-lg font-bold tracking-tight">Voltaris admin</span>
        <span className="font-data text-eyebrow uppercase text-steel-muted">{user.email}</span>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/" className="font-data text-eyebrow uppercase text-steel hover:text-chrome">
          View site
        </Link>
        <Link
          href="/account"
          prefetch={false}
          className="font-data text-eyebrow uppercase text-steel hover:text-chrome"
        >
          My account
        </Link>
        <SignOutButton />
      </div>
    </header>
  );

  // Staff powers only apply after an authenticator code in this session.
  if (!user.mfa_verified) {
    return (
      <div className="shell py-8">
        {header}
        <div className="mt-10">
          <MfaPanel
            mode={user.mfa_enabled ? 'verify' : 'setup'}
            needsSetupCode
            intro={
              user.mfa_enabled
                ? 'Staff tools need your authenticator code once every 12 hours.'
                : 'Every Voltaris staff account uses two-step sign-in. Enter the setup code your Super Administrator gave you, then scan the QR code with your authenticator app.'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-8">
      {header}
      <nav
        aria-label="Admin"
        className="mt-4 flex flex-wrap gap-5 border-b border-hairline/60 pb-4"
      >
        {visibleSections(user.permissions).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="font-data text-eyebrow uppercase text-steel hover:text-chrome"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">{children}</div>
    </div>
  );
}
