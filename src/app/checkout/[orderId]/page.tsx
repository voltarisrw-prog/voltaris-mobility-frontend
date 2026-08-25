import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { CheckoutClient } from '@/features/payments/PaymentStatus';
import { ApiError } from '@/lib/api/errors';
import { getOrder } from '@/lib/api/orders';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Checkout',
  description: 'Complete your Voltaris order.',
  path: '/checkout',
  noindex: true,
  follow: false,
});

// Order state changes; never serve it from a cache.
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;

  let order;
  try {
    order = await getOrder(orderId);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) {
      redirect(`/login?next=/checkout/${orderId}`);
    }
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }

  return (
    <div className="shell py-10">
      <CheckoutClient order={order} />
    </div>
  );
}
