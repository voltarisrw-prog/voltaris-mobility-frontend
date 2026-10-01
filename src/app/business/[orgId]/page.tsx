import { notFound } from 'next/navigation';
import { TeamPanel } from '@/features/business/TeamPanel';
import { OrgVehiclesPanel } from '@/features/business/OrgVehiclesPanel';
import { OrgLeadsPanel } from '@/features/business/OrgLeadsPanel';
import { ORG_SECTIONS } from '@/lib/access/sections';
import { CompanyDashboard } from '@/features/dashboard/company';
import { DashHead } from '@/features/dashboard/kit';
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
  const active = sections.find((s) => s.key === tab);
  // No tab: the role's own dashboard.
  if (!active) return <CompanyDashboard org={orgId} home={home} />;

  return (
    <section>
      <DashHead eyebrow={`${home.name} · ${home.role_label}`} title={active.label} />

      <div>
        {active.key === 'team' && (
          <TeamPanel
            org={orgId}
            members={(await orgMembers(orgId)).items}
            assignable={home.assignable_roles}
          />
        )}
        {active.key === 'vehicles' && (
          <OrgVehiclesPanel
            org={orgId}
            vehicles={(await orgVehicles(orgId)).items}
            canChangeStatus={home.permissions.includes('org.vehicles.status')}
          />
        )}
        {active.key === 'leads' && (
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
