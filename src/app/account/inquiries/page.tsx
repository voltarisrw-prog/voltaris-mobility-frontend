import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { getMyInquiries } from '@/lib/api/users';

const STATUS_LABEL: Record<string, string> = {
  received: 'With the seller',
  answered: 'Replied',
  closed: 'Closed',
};

export default async function InquiriesPage() {
  const inquiries = await getMyInquiries();
  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight">Your enquiries</h2>
      <div className="mt-8">
        {inquiries.items.length === 0 ? (
          <EmptyState
            title="No enquiries yet"
            body="When you ask a seller about a vehicle, the conversation is tracked here."
            action={{ label: 'Browse electric vehicles', href: '/cars' }}
          />
        ) : (
          <ul className="divide-y divide-hairline/60 border-y border-hairline/60">
            {inquiries.items.map((inquiry) => (
              <li
                key={inquiry.reference}
                className="flex flex-wrap items-baseline justify-between gap-3 py-4"
              >
                <div>
                  <Link
                    href={`/cars/${inquiry.vehicle.slug}`}
                    className="font-display text-sm font-semibold tracking-tight hover:text-volt"
                  >
                    {inquiry.vehicle.year} {inquiry.vehicle.make} {inquiry.vehicle.model}
                  </Link>
                  <p className="mt-1 font-data text-xs text-steel-muted">
                    {inquiry.reference} ·{' '}
                    {new Date(inquiry.created_at).toLocaleDateString('en-RW', {
                      dateStyle: 'medium',
                    })}
                  </p>
                </div>
                <span className="font-data text-eyebrow uppercase text-volt">
                  {STATUS_LABEL[inquiry.status] ?? inquiry.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
