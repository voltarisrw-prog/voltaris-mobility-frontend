import { notFound } from 'next/navigation';
import { AppShell, type ShellNavItem } from '@/features/dashboard/AppShell';
import { currentSession } from '@/lib/access/server';
import { ORG_SECTIONS } from '@/lib/access/sections';
import { orgHome } from '@/lib/api/orgs';
import { ApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

const ICON: Record<string, string> = { team: 'people', vehicles: 'vehicles', leads: 'leads' };

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await currentSession(`/business/${orgId}`);
  let home;
  try {
    home = await orgHome(orgId);
  } catch (cause) {
    if (cause instanceof ApiError && (cause.status === 404 || cause.status === 403)) notFound();
    throw cause;
  }
  const nav: ShellNavItem[] = [
    { href: `/business/${orgId}`, label: 'Overview', icon: 'overview', exact: true },
    ...ORG_SECTIONS.filter((s) => s.anyOf.some((p) => home.permissions.includes(p))).map((s) => ({
      href: `/business/${orgId}?tab=${s.key}`,
      label: s.label,
      icon: ICON[s.key] ?? 'overview',
    })),
  ];
  if ((session.memberships ?? []).length > 1)
    nav.push({ href: '/business', label: 'Switch company', icon: 'companies', exact: true });
  if (session.user.mfa_required) nav.push({ href: '/admin', label: 'Admin', icon: 'security' });
  nav.push({ href: '/account', label: 'My account', icon: 'people' });

  return (
    <AppShell
      context={home.name}
      nav={nav}
      user={{ name: session.user.full_name, email: session.user.email, role: home.role_label }}
    >
      {children}
    </AppShell>
  );
}
