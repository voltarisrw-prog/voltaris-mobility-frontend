import type { Metadata } from 'next';
import Link from 'next/link';
import { buildMetadata } from '@/lib/seo/metadata';
import { garageServices, type GarageServiceId } from '@/config/garage';
import { GarageBookingFlow } from '@/features/garage/GarageBookingFlow';

export const metadata: Metadata = buildMetadata({
  title: 'Book a garage — EV service, inspection, charger install in Kigali',
  description:
    'Book a scheduled service, pre-purchase inspection, home charger installation, tyres, detailing or diagnostics at a Voltaris partner garage. Pick the service, the garage, the time.',
  path: '/garage',
});

export default async function GaragePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const requested = typeof params.service === 'string' ? params.service : undefined;
  const initialService = garageServices.some((s) => s.id === requested)
    ? (requested as GarageServiceId)
    : undefined;

  return (
    <div className="shell py-14 sm:py-20">
      <nav aria-label="Breadcrumb" className="font-data text-xs uppercase tracking-[0.12em] text-steel-muted">
        <Link href="/" className="hover:text-chrome">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-chrome">Garage</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow">Book a garage</p>
        <h1 className="mt-3 font-display text-hero text-chrome">Service, inspection, charging. Booked in a minute.</h1>
        <p className="mt-4 text-base leading-relaxed text-steel">
          Partner workshops with high-voltage-certified technicians. Pick the job, the place and
          the time; the garage confirms with you the same day.
        </p>
      </header>

      <div className="mt-12 sm:mt-16">
        <GarageBookingFlow initialService={initialService} />
      </div>
    </div>
  );
}
