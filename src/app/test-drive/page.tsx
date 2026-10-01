import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { FormShell } from '@/features/forms/FormShell';
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
    <FormShell
      breadcrumb={
        <Breadcrumbs
          trail={[
            { name: 'Home', path: '/' },
            { name: 'Test drive', path: '/test-drive' },
          ]}
        />
      }
      title="Drive it before you decide"
      intro="Range on paper and range on the Nyabugogo climb are different numbers. Pick a slot and a district, and Voltaris arranges the drive with the seller."
      tagline="Drive electric, effortlessly."
      taglineBody="Compare vehicles, book test drives and track your enquiries in one place."
      chips={['Saved vehicles', 'Test drives', 'Enquiries']}
    >
      <TestDriveForm
        {...(vehicleId ? { vehicleId } : {})}
        {...(vehicleTitle ? { vehicleTitle } : {})}
      />
    </FormShell>
  );
}
