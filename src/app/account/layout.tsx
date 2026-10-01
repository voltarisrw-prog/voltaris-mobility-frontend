import { redirect } from 'next/navigation';
import { getSession } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { AppShell, type ShellNavItem } from '@/features/dashboard/AppShell';
import { AccountFrame } from '@/features/dashboard/AccountFrame';
import { themeFor } from '@/lib/access/sections';

const NAV: ShellNavItem[] = [
  { href: '/account', label: 'Overview', icon: 'overview', exact: true },
  { href: '/account/profile', label: 'Profile', icon: 'people' },
  { href: '/account/saved', label: 'Saved vehicles', icon: 'saved' },
  { href: '/account/searches', label: 'Saved searches', icon: 'search' },
  { href: '/account/inquiries', label: 'Enquiries', icon: 'leads' },
  { href: '/account/test-drives', label: 'Test drives', icon: 'vehicles' },
  { href: '/account/orders', label: 'Orders', icon: 'orders' },
  { href: '/account/notifications', label: 'Notifications', icon: 'notifications' },
  { href: '/account/security', label: 'Security', icon: 'security' },
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
  const user = session.user;
  const nav = [...NAV];
  if ((session.memberships ?? []).length > 0)
    nav.push({ href: '/business', label: 'Company console', icon: 'companies' });
  if (user.mfa_required) nav.push({ href: '/admin', label: 'Admin dashboard', icon: 'gauge' });

  return (
    <AppShell
      context="Your account"
      theme={themeFor(user.roles.includes('SELLER') ? 'SELLER' : 'CUSTOMER')}
      search={{ action: '/buy', name: 'make', placeholder: 'Search cars by make' }}
      nav={nav}
      user={{
        name: user.full_name,
        email: user.email,
        role: user.roles.includes('SELLER') ? 'Individual Seller' : 'Registered Customer',
      }}
    >
      {!user.email_verified && (
        <p className="mb-6 border border-chrome bg-surface px-4 py-3 text-sm">
          Your email is not confirmed yet. Some features stay locked until it is — check your inbox
          for the verification link.
        </p>
      )}
      <AccountFrame>{children}</AccountFrame>
    </AppShell>
  );
}
