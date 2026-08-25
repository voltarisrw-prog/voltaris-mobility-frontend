import Link from 'next/link';
import { EmptyState } from '@/components/EmptyState';
import { PaymentStatus } from '@/features/payments/PaymentStatus';
import { listOrders } from '@/lib/api/orders';
import { formatPrice } from '@/lib/format';

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight">Orders</h2>
      <div className="mt-8">
        {orders.items.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="Orders appear here once you start a purchase or a rental through Voltaris."
            action={{ label: 'Browse electric vehicles', href: '/cars' }}
          />
        ) : (
          <ul className="divide-y divide-hairline/60 border-y border-hairline/60">
            {orders.items.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-5">
                <div>
                  <Link
                    href={`/cars/${order.vehicle.slug}`}
                    className="font-display text-sm font-semibold tracking-tight hover:text-volt"
                  >
                    {order.vehicle.title}
                  </Link>
                  <p className="mt-1 font-data text-xs text-steel-muted">
                    {order.reference} · {formatPrice(order.total, order.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <PaymentStatus state={order.payment_state} />
                  <Link
                    href={`/checkout/${order.id}`}
                    className="font-data text-eyebrow uppercase text-volt hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
