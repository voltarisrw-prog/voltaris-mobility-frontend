import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TestDriveForm } from '@/features/leads/TestDriveForm';
import { ApiError } from '@/lib/api/errors';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Book an EV test drive in Rwanda',
  description:
    'Request a test drive of any electric vehicle listed on Voltaris. Choose a date, a time, and a district — we confirm the slot with the seller.',
  path: '/test-drive',
});

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicle?: string }>;
}) {
  const { vehicle: vehicleId } = await searchParams;

  // The id may arrive from a listing page; resolve it only to show what is being driven.
  let vehicleTitle: string | undefined;
  if (vehicleId) {
    try {
      const found = await getVehicleBySlug(vehicleId);
      vehicleTitle = `${found.year} ${found.make} ${found.model}`;
    } catch (cause) {
      if (!(cause instanceof ApiError)) throw cause;
    }
  }

  return (
    <div className="shell max-w-2xl py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Test drive', path: '/test-drive' },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">Drive it before you decide</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        Range on paper and range on the Nyabugogo climb are different numbers. Pick a slot and a
        district, and Voltaris arranges the drive with the seller.
      </p>
      <div className="mt-8">
        <TestDriveForm
          {...(vehicleId ? { vehicleId } : {})}
          {...(vehicleTitle ? { vehicleTitle } : {})}
        />
      </div>
    </div>
  );
}
