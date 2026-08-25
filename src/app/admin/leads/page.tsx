import { DataTableServer } from '@/features/admin/DataTableServer';
import { listAdminLeads } from '@/lib/api/admin';

export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const result = await listAdminLeads();
  return (
    <section>
      <h1 className="font-display text-headline">Leads</h1>
      <p className="mt-2 text-sm text-steel">Enquiries and test drive requests, newest first.</p>
      <div className="mt-8">
        <DataTableServer
          caption="Customer enquiries and test drive requests"
          headers={['Reference', 'Type', 'Customer', 'Vehicle', 'Status', 'Received']}
          rows={result.items.map((lead) => ({
            key: lead.reference,
            cells: [
              lead.reference,
              lead.kind === 'test_drive' ? 'Test drive' : 'Enquiry',
              lead.customer_name,
              lead.vehicle_title,
              lead.status,
              new Date(lead.created_at).toLocaleDateString('en-RW', { dateStyle: 'medium' }),
            ],
          }))}
          empty="No leads yet."
        />
      </div>
    </section>
  );
}
