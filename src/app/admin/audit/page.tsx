import { DataTableServer } from '@/features/admin/DataTableServer';
import { listAuditLogs } from '@/lib/api/admin';

export const dynamic = 'force-dynamic';

export default async function AdminAuditPage() {
  const result = await listAuditLogs();
  return (
    <section>
      <h1 className="font-display text-headline">Audit log</h1>
      <p className="mt-2 text-sm text-steel">
        Every staff action against a listing, lead, or order. Written by the backend and read-only
        here.
      </p>
      <div className="mt-8">
        <DataTableServer
          caption="Staff actions recorded by the backend"
          headers={['When', 'Who', 'Action', 'Entity']}
          rows={result.items.map((row) => ({
            key: row.id,
            cells: [
              new Date(row.created_at).toLocaleString('en-RW', {
                dateStyle: 'medium',
                timeStyle: 'short',
              }),
              row.actor,
              row.action,
              row.entity,
            ],
          }))}
          empty="No recorded actions."
        />
      </div>
    </section>
  );
}
