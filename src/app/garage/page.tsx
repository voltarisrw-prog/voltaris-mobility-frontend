import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo/metadata';
import { garageServices, type GarageServiceId } from '@/config/garage';
import { FormWide } from '@/features/forms/FormWide';
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
    <FormWide
      crumb="Garage"
      title="Service, inspection, charging. Booked in a minute."
      intro="Partner workshops with high-voltage-certified technicians. Pick the job, the place and the time; the garage confirms with you the same day."
    >
      <GarageBookingFlow initialService={initialService} />
    </FormWide>
  );
}
