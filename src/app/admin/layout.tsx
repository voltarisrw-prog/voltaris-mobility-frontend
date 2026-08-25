import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { STAFF_ROLES, getSession } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/errors';
import { SignOutButton } from '@/features/auth/SignOutButton';

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/vehicles', label: 'Vehicles' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await getSession();
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) redirect('/login?next=/admin');
    throw cause;
  }

  const isStaff = session.user.roles.some((role) => STAFF_ROLES.includes(role));
  // 404 rather than 403: a signed-in customer should not learn that /admin exists.
  // This hides the surface. It does not protect it — every /admin API call is
  // authorized by the backend against the session, independently of this check.
  if (!isStaff) notFound();

  return (
    <div className="shell py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-chrome pb-4">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-lg font-bold tracking-tight">Voltaris admin</span>
          <span className="font-data text-eyebrow uppercase text-steel-muted">
            {session.user.email}
          </span>
        </div>
        <SignOutButton />
      </header>

      <nav aria-label="Admin" className="mt-4 flex flex-wrap gap-5 border-b border-hairline/60 pb-4">
        {NAV.map((item) => (
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
