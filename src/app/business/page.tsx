import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/access/server';
import { AppShell } from '@/features/dashboard/AppShell';

const KINDS = {
  dealer: 'Dealership',
  rental: 'Rental company',
  business: 'Business customer',
} as const;

export default async function BusinessHome() {
  const { user, memberships = [] } = await currentSession('/business');
  const only = memberships.length === 1 ? memberships[0] : undefined;
  if (only && only.status === 'active') redirect(`/business/${only.org_id}`);
  return (
    <AppShell
      context="Companies"
      nav={[
        { href: '/business', label: 'Your companies', icon: 'companies', exact: true },
        { href: '/account', label: 'My account', icon: 'people' },
      ]}
      user={{ name: user.full_name, email: user.email, role: 'Company member' }}
    >
      <section>
        <h1 className="font-display text-headline">Your companies</h1>
        {memberships.length === 0 ? (
          <p className="mt-4 text-sm text-steel">
            You&apos;re not part of a company on Voltaris. A company owner can add you with the
            email you use here.
          </p>
        ) : (
          <ul className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {memberships.map((m) => (
              <li key={m.org_id} className="panel p-6">
                <p className="eyebrow">{KINDS[m.kind]}</p>
                {m.status === 'active' ? (
                  <Link
                    href={`/business/${m.org_id}`}
                    className="mt-2 block font-display text-xl hover:text-volt"
                  >
                    {m.name}
                  </Link>
                ) : (
                  <p className="mt-2 font-display text-xl text-steel">{m.name} · suspended</p>
                )}
                <p className="mt-1 text-sm text-steel">{m.role_label}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
