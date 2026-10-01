'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, DataTable, useToast, type Column } from '@/components/ui';
import {
  newEnrolmentCode,
  resetUserMfa,
  restoreUser,
  revokeUserSessions,
  setUserRoles,
  suspendUser,
  type AdminUserRow,
} from '@/lib/api/admin';
import { displayMessage } from '@/lib/api/errors';

interface Allow {
  roles: boolean;
  suspend: boolean;
  sessions: boolean;
  mfa: boolean;
  /** Two-step sign-in is switched on platform-wide. */
  twoStep: boolean;
  /** Super admin: may act on staff accounts too. */
  staff: boolean;
}

/**
 * Buttons appear only for actions this person may take on this account. The
 * backend enforces the same rules (and more: last super admin, verified email).
 */
export function PeopleTable({
  rows,
  me,
  roles,
  allow,
}: {
  rows: AdminUserRow[];
  me: string;
  roles: { role: string; label: string; group: string }[];
  allow: Allow;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [issued, setIssued] = useState<{ email: string; code: string } | null>(null);
  const label = (role: string) => roles.find((r) => r.role === role)?.label ?? role;

  async function act(id: string, what: () => Promise<unknown>, done: string) {
    setBusy(id);
    try {
      const result = (await what()) as { enrolment_code?: string | null } | undefined;
      // A staff role or an MFA reset comes back with a one-time setup code: show it once.
      if (result?.enrolment_code) {
        setIssued({
          email: rows.find((r) => r.id === id)?.email ?? '',
          code: result.enrolment_code,
        });
      }
      toast.push('success', done);
      setEditing(null);
      router.refresh();
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    } finally {
      setBusy(null);
    }
  }

  const groups = [...new Set(roles.map((r) => r.group))];

  const columns: Column<AdminUserRow>[] = [
    {
      key: 'person',
      header: 'Person',
      render: (row) => (
        <div>
          <p className="font-semibold">{row.full_name}</p>
          <p className="text-steel">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      render: (row) =>
        editing === row.id ? (
          <select
            autoFocus
            aria-label={`New role for ${row.email}`}
            defaultValue={row.roles[0]}
            disabled={busy === row.id}
            className="h-10 border border-hairline bg-surface px-2 text-sm"
            onChange={(e) =>
              act(
                row.id,
                () => setUserRoles(row.id, [e.target.value]),
                `${row.email} is now ${label(e.target.value)}.`,
              )
            }
          >
            {groups.map((g) => (
              <optgroup key={g} label={g}>
                {roles
                  .filter((r) => r.group === g)
                  .map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.label}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        ) : (
          <span>{row.roles.map(label).join(', ')}</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="font-data text-eyebrow uppercase text-steel">
          {row.suspended ? 'Suspended' : 'Active'}
          {allow.twoStep && row.staff && (row.mfa_enabled ? ' · 2-step on' : ' · 2-step off')}
        </span>
      ),
    },
  ];

  const anyAction = allow.roles || allow.suspend || allow.sessions || allow.mfa;
  if (anyAction) {
    columns.push({
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => {
        if (row.id === me) return <span className="text-steel-muted">You</span>;
        const mayTouch = !row.staff || allow.staff;
        if (!mayTouch) return <span className="text-steel-muted">Staff</span>;
        return (
          <div className="flex flex-wrap justify-end gap-2">
            {allow.roles && editing !== row.id && (
              <Button
                variant="secondary"
                className="px-3 py-1.5"
                onClick={() => setEditing(row.id)}
              >
                Change role
              </Button>
            )}
            {allow.suspend &&
              !row.roles.includes('SUPER_ADMIN') &&
              (row.suspended ? (
                <Button
                  variant="secondary"
                  className="px-3 py-1.5"
                  loading={busy === row.id}
                  onClick={() => act(row.id, () => restoreUser(row.id), `${row.email} restored.`)}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  variant="danger"
                  className="px-3 py-1.5"
                  loading={busy === row.id}
                  onClick={() => {
                    const reason = window.prompt(
                      `Why suspend ${row.email}? (kept in the audit log)`,
                    );
                    if (reason && reason.trim().length >= 3) {
                      act(
                        row.id,
                        () => suspendUser(row.id, reason.trim()),
                        `${row.email} suspended.`,
                      );
                    }
                  }}
                >
                  Suspend
                </Button>
              ))}
            {allow.sessions && (
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                loading={busy === row.id}
                onClick={() =>
                  act(
                    row.id,
                    () => revokeUserSessions(row.id),
                    `${row.email} signed out everywhere.`,
                  )
                }
              >
                Sign out everywhere
              </Button>
            )}
            {allow.twoStep && allow.roles && row.staff && !row.mfa_enabled && (
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                loading={busy === row.id}
                onClick={() =>
                  act(row.id, () => newEnrolmentCode(row.id), 'New setup code issued.')
                }
              >
                New setup code
              </Button>
            )}
            {allow.mfa && row.mfa_enabled && (
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                loading={busy === row.id}
                onClick={() => {
                  if (
                    window.confirm(
                      `Reset two-step sign-in for ${row.email}? They'll set it up again.`,
                    )
                  ) {
                    act(
                      row.id,
                      () => resetUserMfa(row.id),
                      `Two-step sign-in reset for ${row.email}.`,
                    );
                  }
                }}
              >
                Reset 2-step
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return (
    <>
      {issued && (
        <div role="status" className="mb-6 border border-chrome p-5">
          <p className="eyebrow">Setup code for {issued.email}</p>
          <p className="mt-2 font-data text-2xl tracking-widest">{issued.code}</p>
          <p className="mt-2 max-w-xl text-sm text-steel">
            Give it to them in person or by phone, not by email. It works once, for 72 hours, and
            won&apos;t be shown again. They enter it when they set up their authenticator.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => setIssued(null)}>
            Done
          </Button>
        </div>
      )}
      <DataTable
        caption="Accounts"
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        empty="No accounts match."
      />
    </>
  );
}
