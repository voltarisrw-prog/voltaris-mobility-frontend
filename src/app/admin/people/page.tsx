import { PeopleTable } from '@/features/admin/PeopleTable';
import { getRoleCatalogue, listAdminUsers } from '@/lib/api/admin';
import { can } from '@/lib/api/auth';
import { requirePermission } from '@/lib/access/server';

export const dynamic = 'force-dynamic';

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}) {
  const session = await requirePermission('/admin/people', 'users.read', 'roles.assign');
  if (!session) return null;
  const { q, role, page } = await searchParams;
  const [result, catalogue] = await Promise.all([
    listAdminUsers({ q, role, page: page ? Number(page) : undefined }),
    getRoleCatalogue(),
  ]);
  const user = session.user;

  return (
    <section>
      <h1 className="font-display text-headline">People</h1>
      <p className="mt-2 text-sm text-steel">
        Customers, sellers and staff. {result.total} account{result.total === 1 ? '' : 's'}.
      </p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/people">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email"
          aria-label="Search name or email"
          className="h-11 w-72 border border-hairline bg-surface px-3 text-sm"
        />
        <select
          name="role"
          defaultValue={role ?? ''}
          aria-label="Filter by role"
          className="h-11 border border-hairline bg-surface px-3 text-sm"
        >
          <option value="">All roles</option>
          {catalogue.platform.map((r) => (
            <option key={r.role} value={r.role}>
              {r.label}
            </option>
          ))}
        </select>
        <button type="submit" className="vds-button vds-button-secondary">
          Search
        </button>
      </form>

      <div className="mt-8">
        <PeopleTable
          rows={result.items}
          me={user.id}
          roles={catalogue.platform.map(({ role, label, group }) => ({ role, label, group }))}
          allow={{
            roles: can(user, 'roles.assign'),
            suspend: can(user, 'users.suspend'),
            sessions: can(user, 'security.sessions'),
            mfa: can(user, 'security.mfa_reset'),
            staff: user.roles.includes('SUPER_ADMIN'),
          }}
        />
      </div>
    </section>
  );
}
