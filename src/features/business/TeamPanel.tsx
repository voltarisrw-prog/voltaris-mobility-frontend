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
import { addOrgMember, removeOrgMember, type OrgMember } from '@/lib/api/orgs';
import { displayMessage } from '@/lib/api/errors';

/** Add / remove only shows for roles this person may give; the backend enforces the same. */
export function TeamPanel({
  org,
  members,
  assignable,
}: {
  org: string;
  members: OrgMember[];
  assignable: { role: string; label: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(assignable[assignable.length - 1]?.role ?? '');
  const mayManage = (r: string) => assignable.some((a) => a.role === r);

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

  const columns: Column<OrgMember>[] = [
    {
      key: 'who',
      header: 'Person',
      render: (m) => (
        <div>
          <p className="font-semibold">{m.full_name}</p>
          <p className="text-steel">{m.email}</p>
        </div>
      ),
    },
    { key: 'role', header: 'Role', render: (m) => m.role_label },
  ];
  if (assignable.length > 0) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (m) =>
        mayManage(m.role) ? (
          <Button
            variant="ghost"
            className="px-3 py-1.5"
            loading={busy === m.user_id}
            onClick={() =>
              act(m.user_id, () => removeOrgMember(org, m.user_id), `${m.email} removed.`)
            }
          >
            Remove
          </Button>
        ) : null,
    });
  }

  return (
    <>
      {assignable.length > 0 && (
        <form
          className="mb-8 flex flex-wrap items-end gap-4 border border-hairline p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await act('add', () => addOrgMember(org, email, role), `${email} added.`))
              setEmail('');
          }}
        >
          <div className="w-72">
            <Field label="Their Voltaris account email" required>
              {(p) => (
                <input
                  {...p}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <div className="w-64">
            <Field label="Role" required>
              {(p) => (
                <select
                  {...p}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={selectClass}
                >
                  {assignable.map((a) => (
                    <option key={a.role} value={a.role}>
                      {a.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <Button type="submit" loading={busy === 'add'} disabled={!email}>
            Add to team
          </Button>
        </form>
      )}
      <DataTable
        caption="Team"
        columns={columns}
        rows={members}
        getRowKey={(m) => m.user_id}
        empty="No one yet."
      />
    </>
  );
}
