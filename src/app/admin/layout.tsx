import { notFound } from 'next/navigation';
import { MfaPanel } from '@/features/auth/MfaPanel';
import { AppShell } from '@/features/dashboard/AppShell';
import { currentSession } from '@/lib/access/server';
import { visibleSections } from '@/lib/access/sections';
import { getMyAccess } from '@/lib/api/admin';

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

  const verified = Boolean(user.mfa_verified);
  const roleLabel = verified
    ? (await getMyAccess()).roles.map((r) => r.label).join(' · ')
    : 'Staff';
  const nav = verified
    ? visibleSections(user.permissions).map(({ href, label, icon }) => ({
        href,
        label,
        icon,
        exact: href === '/admin',
      }))
    : [];
  if ((session.memberships ?? []).length)
    nav.push({ href: '/business', label: 'Company console', icon: 'companies', exact: false });
  nav.push({ href: '/account', label: 'My account', icon: 'people', exact: false });

  return (
    <AppShell
      context="Admin"
      nav={nav}
      user={{ name: user.full_name, email: user.email, role: roleLabel }}
    >
      {verified ? (
        children
      ) : (
        // Staff powers only apply after an authenticator code in this session.
        <div className="max-w-2xl border border-hairline bg-surface p-6 sm:p-8">
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
      )}
    </AppShell>
  );
}
