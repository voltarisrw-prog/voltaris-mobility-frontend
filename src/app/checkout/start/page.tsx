import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { ApiError } from '@/lib/api/errors';
import { createOrder } from '@/lib/api/orders';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Starting checkout',
  description: 'Creating your Voltaris order.',
  path: '/checkout/start',
  noindex: true,
  follow: false,
});

export const dynamic = 'force-dynamic';

/**
 * Creates the order server-side and hands off to the checkout page.
 *
 * Note what is *not* sent: no price, no total, no discount. The backend prices the
 * order from the vehicle id. A client that could name its own amount is a client
 * that could name zero.
 */
export default async function StartCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string; kind?: string; days?: string }>;
}) {
  const { vehicle, kind, days } = await searchParams;
  if (!vehicle) notFound();

  const orderKind =
    kind === 'rental' ? 'rental' : kind === 'reservation' ? 'reservation' : 'purchase';

  let order;
  try {
    order = await createOrder({
      vehicle_id: vehicle,
      kind: orderKind,
      ...(orderKind === 'rental' && days ? { rental_days: Number(days) } : {}),
    });
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) {
      redirect(
        `/login?next=${encodeURIComponent(`/checkout/start?vehicle=${vehicle}&kind=${orderKind}`)}`,
      );
    }
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }

  redirect(`/checkout/${order.id}`);
}
