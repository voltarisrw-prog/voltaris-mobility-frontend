'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DataTable, selectClass, useToast, type Column } from '@/components/ui';
import { setOrgVehicleStatus, type OrgVehicle } from '@/lib/api/orgs';
import { displayMessage } from '@/lib/api/errors';
import { formatPrice } from '@/lib/format';

const STATUSES: OrgVehicle['status'][] = ['available', 'reserved', 'sold', 'unavailable'];

export function OrgVehiclesPanel({
  org,
  vehicles,
  canChangeStatus,
}: {
  org: string;
  vehicles: OrgVehicle[];
  canChangeStatus: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const columns: Column<OrgVehicle>[] = [
    {
      key: 'title',
      header: 'Vehicle',
      render: (v) => (
        <Link href={`/cars/${v.slug}`} className="font-semibold hover:text-volt">
          {v.title}
        </Link>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      align: 'right',
      render: (v) => (
        <span className="font-data tabular-nums">
          {v.price !== null
            ? formatPrice(v.price, v.currency)
            : v.rental_price_per_day !== null
              ? `${formatPrice(v.rental_price_per_day, v.currency)} / day`
              : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) =>
        canChangeStatus ? (
          <select
            aria-label={`Status of ${v.title}`}
            value={v.status}
            disabled={busy === v.id}
            className={`${selectClass} h-10 w-40`}
            onChange={async (e) => {
              setBusy(v.id);
              try {
                await setOrgVehicleStatus(org, v.id, e.target.value as OrgVehicle['status']);
                toast.push('success', `${v.title}: ${e.target.value}.`);
                router.refresh();
              } catch (cause) {
                toast.push('error', displayMessage(cause));
              } finally {
                setBusy(null);
              }
            }}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-data text-eyebrow uppercase text-steel">{v.status}</span>
        ),
    },
  ];
  return (
    <DataTable
      caption="Company vehicles"
      columns={columns}
      rows={vehicles}
      getRowKey={(v) => v.id}
      empty="No vehicles linked to this company yet. Voltaris links your showroom profile when you're onboarded."
    />
  );
}
