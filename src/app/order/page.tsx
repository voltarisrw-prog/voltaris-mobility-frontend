import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { features } from '@/config/features';
import { ApiError } from '@/lib/api/errors';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';
import { OrderFlow } from '@/features/order/OrderFlow';

export const metadata: Metadata = buildMetadata({ title: 'Reserve', description: 'Reserve a vehicle on Voltaris.', path: '/order', noindex: true, follow: false });
export const dynamic = 'force-dynamic';

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ vehicle?: string }> }) {
  const { vehicle: slug } = await searchParams;
  if (!slug) notFound();
  if (!features.checkout) redirect(`/cars/${encodeURIComponent(slug)}/enquire`);
  let vehicle;
  try {
    vehicle = await getVehicleBySlug(slug);
  } catch (cause) {
    if (cause instanceof ApiError && cause.isNotFound) notFound();
    throw cause;
  }
  if (!vehicle.purchase_enabled || vehicle.price === null) redirect(`/cars/${encodeURIComponent(slug)}/enquire`);
  return (
    <div className="shell max-w-4xl py-10 sm:py-16">
      <OrderFlow vehicle={vehicle} />
    </div>
  );
}
