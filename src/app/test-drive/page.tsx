import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { TestDriveForm } from '@/features/leads/TestDriveForm';
import { ApiError } from '@/lib/api/errors';
import { getVehicleBySlug } from '@/lib/api/vehicles';
import { buildMetadata } from '@/lib/seo/metadata';
import '@/features/leads/test-drive.css';

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
    <div className="td-page">
      <div className="td-w">
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Test drive', path: '/test-drive' },
          ]}
        />
        <h1 className="td-h1">
          Drive it before you <em>decide</em>
        </h1>
        <TestDriveForm
          {...(vehicleId ? { vehicleId } : {})}
          {...(vehicleTitle ? { vehicleTitle } : {})}
        />
      </div>
    </div>
  );
}
