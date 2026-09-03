import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { getMyTestDrives } from '@/lib/api/users';

export default async function TestDrivesPage() {
  const drives = await getMyTestDrives();
  return (
    <section>
      <h2 className="section-heading">Test drives</h2>
      <div className="mt-8">
        {drives.length === 0 ? (
          <EmptyState
            title="No test drives booked"
            body="Range on paper and range on a Kigali hill are different numbers. Book a drive from any listing."
            action={{ label: 'Book a test drive', href: '/test-drive' }}
          />
        ) : (
          <ul className="divide-y divide-hairline/60 border-y border-hairline/60">
            {drives.map((drive) => (
              <li
                key={drive.reference}
                className="flex flex-wrap items-baseline justify-between gap-3 py-4"
              >
                <div>
                  <Link
                    href={`/cars/${drive.vehicle.slug}`}
                    className="font-display text-sm font-semibold tracking-tight hover:text-volt"
                  >
                    {drive.vehicle.year} {drive.vehicle.make} {drive.vehicle.model}
                  </Link>
                  <p className="mt-1 font-data text-xs text-steel-muted">
                    {drive.location}
                    {drive.scheduled_for
                      ? ` · ${new Date(drive.scheduled_for).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' })}`
                      : ' · slot not confirmed yet'}
                  </p>
                </div>
                <Link
                  href={`/test-drive/${drive.reference}`}
                  className="font-data text-eyebrow uppercase text-volt hover:underline"
                >
                  {drive.status} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
