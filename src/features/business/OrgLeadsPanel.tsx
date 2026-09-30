'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable, selectClass, useToast, type Column } from '@/components/ui';
import { assignOrgLead, type OrgLead, type OrgMember } from '@/lib/api/orgs';
import { displayMessage } from '@/lib/api/errors';

export function OrgLeadsPanel({
  org,
  leads,
  team,
  onlyMine,
}: {
  org: string;
  leads: OrgLead[];
  /** Empty when this person may not assign leads. */
  team: OrgMember[];
  onlyMine: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const columns: Column<OrgLead>[] = [
    {
      key: 'when',
      header: 'Received',
      render: (l) =>
        new Date(l.created_at).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' }),
    },
    {
      key: 'who',
      header: 'Customer',
      render: (l) => (
        <div>
          <p className="font-semibold">{l.customer_name}</p>
          <p className="text-steel">
            {l.phone} · {l.email}
          </p>
        </div>
      ),
    },
    { key: 'vehicle', header: 'Vehicle', render: (l) => l.vehicle_title },
    {
      key: 'kind',
      header: 'Type',
      render: (l) => (l.kind === 'test_drive' ? 'Test drive' : 'Enquiry'),
    },
  ];
  if (team.length > 0) {
    columns.push({
      key: 'assign',
      header: 'Assigned to',
      render: (l) => (
        <select
          aria-label={`Assign ${l.reference}`}
          value={l.assigned_to ?? ''}
          disabled={busy === l.reference}
          className={`${selectClass} h-10 w-52`}
          onChange={async (e) => {
            setBusy(l.reference);
            try {
              await assignOrgLead(org, l.reference, e.target.value || null);
              toast.push('success', `${l.reference} assigned.`);
              router.refresh();
            } catch (cause) {
              toast.push('error', displayMessage(cause));
            } finally {
              setBusy(null);
            }
          }}
        >
          <option value="">Unassigned</option>
          {team.map((m) => (
            <option key={m.user_id} value={m.user_id}>
              {m.full_name}
            </option>
          ))}
        </select>
      ),
    });
  }
  return (
    <>
      {onlyMine && <p className="mb-4 text-sm text-steel">Showing leads assigned to you.</p>}
      <DataTable
        caption="Leads"
        columns={columns}
        rows={leads}
        getRowKey={(l) => l.reference}
        empty="No leads yet."
      />
    </>
  );
}
