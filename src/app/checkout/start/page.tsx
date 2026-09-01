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
  searchParams: Promise<{
    vehicle?: string;
    kind?: string;
    rentalLocation?: string;
    rentalStart?: string;
    rentalEnd?: string;
  }>;
}) {
  const { vehicle, kind, rentalLocation, rentalStart, rentalEnd } = await searchParams;
  if (!vehicle) notFound();

  const orderKind =
    kind === 'rental' ? 'rental' : kind === 'reservation' ? 'reservation' : 'purchase';

  const rental =
    orderKind === 'rental' && rentalLocation && rentalStart && rentalEnd
      ? { location_id: rentalLocation, start_date: rentalStart, end_date: rentalEnd }
      : undefined;

  // A rental checkout without a complete window has nothing to price — send the
  // person back to choose one rather than letting the backend guess or reject it
  // with an opaque error deeper in the flow.
  if (orderKind === 'rental' && !rental) {
    redirect(`/cars/${encodeURIComponent(vehicle)}`);
  }

  let order;
  try {
    order = await createOrder({
      vehicle_id: vehicle,
      kind: orderKind,
      ...(rental ? { rental } : {}),
    });
  } catch (cause) {
    if (cause instanceof ApiError && cause.isUnauthorized) {
      const query = new URLSearchParams({ vehicle, kind: orderKind });
      if (rentalLocation) query.set('rentalLocation', rentalLocation);
      if (rentalStart) query.set('rentalStart', rentalStart);
      if (rentalEnd) query.set('rentalEnd', rentalEnd);
      redirect(`/login?next=${encodeURIComponent(`/checkout/start?${query.toString()}`)}`);
    }
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }

  redirect(`/checkout/${order.id}`);
}
