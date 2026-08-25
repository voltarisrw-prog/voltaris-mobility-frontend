'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, DataTable, useToast, type Column } from '@/components/ui';
import { setVehicleStatus, type AdminVehicleRow } from '@/lib/api/admin';
import { displayMessage } from '@/lib/api/errors';
import { formatPrice } from '@/lib/format';

/**
 * Approve and reject buttons are shown to anyone who reached this page. They are not
 * a permission check — the backend rejects the PATCH from an account that lacks the
 * right, and this table surfaces that rejection as an error.
 */
export function VehicleReviewTable({ rows }: { rows: AdminVehicleRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  async function change(row: AdminVehicleRow, status: 'live' | 'rejected' | 'unpublished') {
    setBusy(row.id);
    try {
      await setVehicleStatus(row.id, status);
      toast.push('success', `${row.title} is now ${status.replace('_', ' ')}.`);
      router.refresh();
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    } finally {
      setBusy(null);
    }
  }

  const columns: Column<AdminVehicleRow>[] = [
    {
      key: 'title',
      header: 'Vehicle',
      render: (row) => (
        <Link
          href={`/cars/${row.slug}`}
          className="font-display font-semibold tracking-tight hover:text-volt"
        >
          {row.title}
        </Link>
      ),
    },
    {
      key: 'seller',
      header: 'Seller',
      render: (row) => <span className="text-steel">{row.seller_name}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (row) => (
        <span className="font-data tabular-nums">{formatPrice(row.price, row.currency)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="font-data text-eyebrow uppercase text-steel">
          {row.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          {row.status === 'pending_review' && (
            <>
              <Button
                className="px-3 py-1.5"
                loading={busy === row.id}
                onClick={() => change(row, 'live')}
              >
                Publish
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1.5"
                loading={busy === row.id}
                onClick={() => change(row, 'rejected')}
              >
                Reject
              </Button>
            </>
          )}
          {row.status === 'live' && (
            <Button
              variant="ghost"
              className="px-3 py-1.5"
              loading={busy === row.id}
              onClick={() => change(row, 'unpublished')}
            >
              Unpublish
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      rows={rows}
      columns={columns}
      caption="Vehicle listings awaiting review or currently live"
      getRowKey={(row) => row.id}
      empty="No listings in this state."
    />
  );
}
