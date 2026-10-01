import { getRoleCatalogue } from '@/lib/api/admin';
import { requirePermission } from '@/lib/access/server';

export const dynamic = 'force-dynamic';

/** Read-only: what every role may do. Changing this is a code change, reviewed like any other. */
export default async function AdminRolesPage() {
  if (!(await requirePermission('/admin/roles', 'users.read', 'roles.assign', 'audit.read')))
    return null;
  const catalogue = await getRoleCatalogue();
  const groups = [...new Set(catalogue.platform.map((r) => r.group))];
  const describe = (p: string) => catalogue.permissions[p] ?? p;
  const kinds = {
    dealer: 'Dealerships',
    rental: 'Rental companies',
    business: 'Business customers',
  } as const;

  return (
    <section>
      <h1 className="font-display text-headline">Roles and permissions</h1>
      <p className="mt-2 max-w-2xl text-sm text-steel">
        Every role on Voltaris and exactly what it allows. Company roles apply inside one company
        only.
      </p>

      {groups.map((group) => (
        <div key={group} className="mt-12">
          <h2 className="section-heading">{group}</h2>
          <div className="mt-4 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            {catalogue.platform
              .filter((r) => r.group === group)
              .map((r) => (
                <details key={r.role} className="panel p-5">
                  <summary className="cursor-pointer font-semibold">
                    {r.label}{' '}
                    <span className="text-steel">· {r.permissions.length} permissions</span>
                  </summary>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-steel">
                    {r.permissions.map((p) => (
                      <li key={p}>{describe(p)}</li>
                    ))}
                  </ul>
                </details>
              ))}
          </div>
        </div>
      ))}

      {(Object.keys(kinds) as (keyof typeof kinds)[]).map((kind) => (
        <div key={kind} className="mt-12">
          <h2 className="section-heading">{kinds[kind]}</h2>
          <div className="mt-4 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
            {catalogue.company
              .filter((r) => r.kind === kind)
              .map((r) => (
                <details key={r.role} className="panel p-5">
                  <summary className="cursor-pointer font-semibold">{r.label}</summary>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-steel">
                    {r.permissions.map((p) => (
                      <li key={p}>{describe(p)}</li>
                    ))}
                  </ul>
                </details>
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}
