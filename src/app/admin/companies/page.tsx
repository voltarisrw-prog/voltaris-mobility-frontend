import { CompaniesPanel } from '@/features/admin/CompaniesPanel';
import { listAdminOrgs, listDealerProfiles } from '@/lib/api/admin';
import { can } from '@/lib/api/auth';
import { requirePermission } from '@/lib/access/server';

export const dynamic = 'force-dynamic';

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const session = await requirePermission('/admin/companies', 'orgs.read', 'orgs.manage');
  if (!session) return null;
  const { kind } = await searchParams;
  const manage = can(session.user, 'orgs.manage');
  const [orgs, profiles] = await Promise.all([
    listAdminOrgs(kind ? { kind } : {}),
    manage ? listDealerProfiles() : Promise.resolve({ items: [] }),
  ]);
  return (
    <section>
      <h1 className="font-display text-headline">Companies</h1>
      <p className="mt-2 text-sm text-steel">
        Dealerships, rental companies and business customers. Each company&apos;s owner builds their
        own team; staff there only ever see that company.
      </p>
      <div className="mt-8">
        <CompaniesPanel rows={orgs.items} profiles={profiles.items} manage={manage} />
      </div>
    </section>
  );
}
