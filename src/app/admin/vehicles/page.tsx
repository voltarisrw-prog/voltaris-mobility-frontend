import Link from 'next/link';
import { VehicleReviewTable } from '@/features/admin/VehicleReviewTable';
import { listAdminVehicles } from '@/lib/api/admin';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'pending_review', label: 'Pending review' },
  { value: 'live', label: 'Live' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'sold', label: 'Sold' },
];

export default async function AdminVehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const result = await listAdminVehicles(status ? { status } : {});

  return (
    <section>
      <h1 className="font-display text-headline">Vehicles</h1>

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/vehicles"
          className={
            !status
              ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
              : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
          }
        >
          All
        </Link>
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/vehicles?status=${filter.value}`}
            className={
              status === filter.value
                ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
                : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
            }
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        <VehicleReviewTable rows={result.items} />
      </div>
    </section>
  );
}
