import Link from 'next/link';
import { getAdminMetrics } from '@/lib/api/admin';
import { formatPrice } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const metrics = await getAdminMetrics();

  const cards = [
    {
      label: 'Pending review',
      value: String(metrics.listings_pending_review),
      href: '/admin/vehicles?status=pending_review',
      urgent: metrics.listings_pending_review > 0,
    },
    {
      label: 'Live listings',
      value: String(metrics.listings_live),
      href: '/admin/vehicles?status=live',
    },
    { label: 'Leads, last 7 days', value: String(metrics.leads_last_7_days), href: '/admin/leads' },
    {
      label: 'Test drives upcoming',
      value: String(metrics.test_drives_upcoming),
      href: '/admin/leads',
    },
    {
      label: 'Orders awaiting payment',
      value: String(metrics.orders_awaiting_payment),
      href: '/admin/leads',
    },
    {
      label: 'GMV, 30 days',
      value: formatPrice(metrics.gross_merchandise_value_30d, metrics.currency),
    },
  ];

  return (
    <section>
      <h1 className="font-display text-headline">Dashboard</h1>
      <ul className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label} className="panel p-6">
            {card.href ? (
              <Link href={card.href} className="block">
                <p className="eyebrow">{card.label}</p>
                <p
                  className={`mt-3 font-display text-3xl font-semibold tabular-nums ${card.urgent ? 'text-volt' : 'text-chrome'}`}
                >
                  {card.value}
                </p>
              </Link>
            ) : (
              <>
                <p className="eyebrow">{card.label}</p>
                <p className="mt-3 font-display text-3xl font-semibold tabular-nums">
                  {card.value}
                </p>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
