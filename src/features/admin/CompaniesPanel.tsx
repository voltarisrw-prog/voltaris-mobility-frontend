'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  DataTable,
  Field,
  inputClass,
  selectClass,
  useToast,
  type Column,
} from '@/components/ui';
import { createOrg, setOrgStatus, type AdminOrgRow } from '@/lib/api/admin';
import { displayMessage } from '@/lib/api/errors';

const KINDS = {
  dealer: 'Dealership',
  rental: 'Rental company',
  business: 'Business customer',
} as const;

export function CompaniesPanel({
  rows,
  profiles,
  manage,
}: {
  rows: AdminOrgRow[];
  profiles: { id: string; name: string }[];
  manage: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [form, setForm] = useState({
    kind: 'dealer' as AdminOrgRow['kind'],
    name: '',
    owner_email: '',
    dealer_id: '',
  });

  async function act(key: string, what: () => Promise<unknown>, done: string) {
    setBusy(key);
    try {
      await what();
      toast.push('success', done);
      router.refresh();
      return true;
    } catch (cause) {
      toast.push('error', displayMessage(cause));
      return false;
    } finally {
      setBusy(null);
    }
  }

  const columns: Column<AdminOrgRow>[] = [
    {
      key: 'name',
      header: 'Company',
      render: (r) => <span className="font-semibold">{r.name}</span>,
    },
    { key: 'kind', header: 'Type', render: (r) => KINDS[r.kind] },
    {
      key: 'owner',
      header: 'Owner',
      render: (r) => <span className="text-steel">{r.owner_email ?? '—'}</span>,
    },
    { key: 'members', header: 'Team', align: 'right', render: (r) => r.members },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className="font-data text-eyebrow uppercase text-steel">{r.status}</span>
      ),
    },
  ];
  if (manage) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (r) => (
        <Button
          variant={r.status === 'active' ? 'danger' : 'secondary'}
          className="px-3 py-1.5"
          loading={busy === r.id}
          onClick={() =>
            act(
              r.id,
              () => setOrgStatus(r.id, r.status === 'active' ? 'suspended' : 'active'),
              `${r.name} ${r.status === 'active' ? 'suspended' : 'restored'}.`,
            )
          }
        >
          {r.status === 'active' ? 'Suspend' : 'Restore'}
        </Button>
      ),
    });
  }

  return (
    <>
      {manage && (
        <form
          className="mb-10 grid gap-4 border border-hairline p-6 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await act(
              'new',
              () => createOrg({ ...form, dealer_id: form.dealer_id || null }),
              `${form.name} created. ${form.owner_email} is its owner.`,
            );
            if (ok) setForm({ ...form, name: '', owner_email: '', dealer_id: '' });
          }}
        >
          <p className="eyebrow sm:col-span-2 lg:col-span-4">Onboard a company</p>
          <Field label="Type" required>
            {(p) => (
              <select
                {...p}
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value as AdminOrgRow['kind'] })}
                className={selectClass}
              >
                {Object.entries(KINDS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Company name" required>
            {(p) => (
              <input
                {...p}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            )}
          </Field>
          <Field label="Owner's account email" required>
            {(p) => (
              <input
                {...p}
                type="email"
                value={form.owner_email}
                onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
                className={inputClass}
              />
            )}
          </Field>
          {form.kind !== 'business' && (
            <Field label="Showroom profile">
              {(p) => (
                <select
                  {...p}
                  value={form.dealer_id}
                  onChange={(e) => setForm({ ...form, dealer_id: e.target.value })}
                  className={selectClass}
                >
                  <option value="">None yet</option>
                  {profiles.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          )}
          <div className="sm:col-span-2 lg:col-span-4">
            <Button
              type="submit"
              loading={busy === 'new'}
              disabled={!form.name || !form.owner_email}
            >
              Create company
            </Button>
          </div>
        </form>
      )}
      <DataTable
        caption="Companies"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        empty="No companies yet."
      />
    </>
  );
}
