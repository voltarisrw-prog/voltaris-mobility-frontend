import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TeamPanel } from '@/features/business/TeamPanel';
import { OrgVehiclesPanel } from '@/features/business/OrgVehiclesPanel';
import { OrgLeadsPanel } from '@/features/business/OrgLeadsPanel';
import { ORG_SECTIONS } from '@/lib/access/sections';
import { orgHome, orgLeads, orgMembers, orgVehicles } from '@/lib/api/orgs';
import { ApiError } from '@/lib/api/errors';

export const dynamic = 'force-dynamic';

export default async function OrgConsole({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { orgId } = await params;
  const { tab } = await searchParams;
  let home;
  try {
    home = await orgHome(orgId);
  } catch (cause) {
    if (cause instanceof ApiError && (cause.status === 404 || cause.status === 403)) notFound();
    throw cause;
  }
  const has = (perms: readonly string[]) => perms.some((p) => home.permissions.includes(p));
  const sections = ORG_SECTIONS.filter((s) => has(s.anyOf));
  const active = sections.find((s) => s.key === tab) ?? sections[0];

  return (
    <section>
      <p className="eyebrow">{home.role_label}</p>
      <h1 className="mt-2 font-display text-headline">{home.name}</h1>

      <nav
        aria-label="Company"
        className="mt-6 flex flex-wrap gap-5 border-b border-hairline/60 pb-4"
      >
        {sections.map((s) => (
          <Link
            key={s.key}
            href={`/business/${orgId}?tab=${s.key}`}
            aria-current={s.key === active?.key ? 'page' : undefined}
            className={`font-data text-eyebrow uppercase ${s.key === active?.key ? 'text-chrome underline underline-offset-8' : 'text-steel hover:text-chrome'}`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {!active && (
          <p className="text-sm text-steel">Your role here has no console sections yet.</p>
        )}
        {active?.key === 'team' && (
          <TeamPanel
            org={orgId}
            members={(await orgMembers(orgId)).items}
            assignable={home.assignable_roles}
          />
        )}
        {active?.key === 'vehicles' && (
          <OrgVehiclesPanel
            org={orgId}
            vehicles={(await orgVehicles(orgId)).items}
            canChangeStatus={home.permissions.includes('org.vehicles.status')}
          />
        )}
        {active?.key === 'leads' && (
          <OrgLeadsPanel
            org={orgId}
            leads={(await orgLeads(orgId)).items}
            team={
              home.permissions.includes('org.leads.assign') ? (await orgMembers(orgId)).items : []
            }
            onlyMine={!home.permissions.includes('org.leads.read_all')}
          />
        )}
      </div>
    </section>
  );
}
