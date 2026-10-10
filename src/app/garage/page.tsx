import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { buildMetadata } from '@/lib/seo/metadata';
import { garageServices, type GarageServiceId } from '@/config/garage';
import { GarageBookingFlow } from '@/features/garage/GarageBookingFlow';
import '@/features/garage/repair.css';

export const metadata: Metadata = buildMetadata({
  title: 'Repair — EV service, inspection, charger install in Kigali',
  description:
    'Book a scheduled service, pre-purchase inspection, home charger installation, tyres, detailing or diagnostics at a Voltaris partner garage. Pick the service, the garage, the time.',
  path: '/garage',
});

const PULSE =
  'M0 70H150l12-8 12 8h56l10-52 16 98 14-70 10 24h130l12-8 12 8h56l10-52 16 98 14-70 10 24h130l12-8 12 8h56l10-52 16 98 14-70 10 24H1200';

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
    <div className="rp-page">
      <div className="rp-ecg" aria-hidden="true">
        <svg viewBox="0 0 1200 140" preserveAspectRatio="none">
          <path className="b" d={PULSE} />
          <path className="p" pathLength={1200} d={PULSE} />
        </svg>
      </div>
      <div className="rp-w">
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Repair', path: '/garage' },
          ]}
        />
        <p className="rp-eb">Book a repair</p>
        <h1 className="rp-h1">
          <span className="rp-ln">Service, inspection, charging.</span>{' '}
          <span className="rp-ln">
            Booked in <em>a minute.</em>
          </span>
        </h1>
        <p className="rp-lead">
          Partner workshops with high-voltage-certified technicians. Pick the job, the place and
          the time; the garage confirms with you the same day.
        </p>
        <GarageBookingFlow initialService={initialService} />
      </div>
    </div>
  );
}
