import { PlatformDashboard } from '@/features/dashboard/platform';
import { getAdminStats, getMyAccess } from '@/lib/api/admin';
import { requirePermission } from '@/lib/access/server';

export const dynamic = 'force-dynamic';

/** Each staff role gets its own dashboard; what it may see is decided by the backend. */
export default async function AdminOverview() {
  const session = await requirePermission('/admin');
  if (!session) return null;
  const [stats, access] = await Promise.all([getAdminStats(), getMyAccess()]);
  const role = access.roles[0];

  return (
    <>
      <PlatformDashboard role={role?.role ?? ''} label={role?.label ?? 'Staff'} stats={stats} />
      <details className="mt-10 border border-hairline bg-surface">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium">
          What your role lets you do ({access.permissions.length})
        </summary>
        <ul className="grid gap-px border-t border-hairline bg-hairline sm:grid-cols-2">
          {access.permissions.map((p) => (
            <li key={p.key} className="bg-surface px-5 py-3 text-sm text-steel">
              {p.description}
            </li>
          ))}
        </ul>
      </details>
    </>
  );
}
