import Link from 'next/link';
import { SignOutButton } from '@/features/auth/SignOutButton';
import { currentSession } from '@/lib/access/server';

export const dynamic = 'force-dynamic';

export default async function BusinessLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession('/business');
  return (
    <div className="shell py-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-chrome pb-4">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-lg font-bold tracking-tight">Company console</span>
          <span className="font-data text-eyebrow uppercase text-steel-muted">
            {session.user.email}
          </span>
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
      <div className="mt-8">{children}</div>
    </div>
  );
}
