import type { Metadata } from 'next';
import { ChargingMap } from '@/features/charging/ChargingMap';
import { listChargingLocations, type ChargingLocation } from '@/lib/api/charging';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'EV charging stations in Rwanda',
  description:
    'Where to charge an electric vehicle in Rwanda: public charging locations, connector types, power ratings, and access, updated as the network grows.',
  path: '/charging',
});

export default async function ChargingPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const { district } = await searchParams;

  let locations: ChargingLocation[] = [];
  let failed = false;
  try {
    locations = (await listChargingLocations(district ? { district } : {})).items;
  } catch {
    failed = true;
  }

  return (
    <div className="shell py-10">

      <h1 className="mt-6 font-display text-headline">Where to charge in Rwanda</h1>

      <div className="mt-10">
        {!failed && locations.length > 0 && (
          <ChargingMap locations={locations} />
        )}
      </div>

    </div>
  );
}
