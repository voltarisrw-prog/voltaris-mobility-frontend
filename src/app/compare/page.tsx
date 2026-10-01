import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/ui';
import { VehicleComparison } from '@/features/vehicles/VehicleComparison';
import { buildMetadata } from '@/lib/seo/metadata';
import '@/features/vehicles/vehicle-comparison.css';

export const metadata: Metadata = buildMetadata({
  title: 'Compare electric and hybrid cars',
  description:
    'Compare electric and hybrid cars side by side with range, efficiency, charging times, and running costs.',
  path: '/compare',
});

export default function ComparePage() {
  return (
    <div className="vc-page shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">Compare before you choose</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        See how electric and hybrid cars stack up across the details that matter, with the better value marked in every row.
      </p>
      <div className="mt-10">
        <Suspense fallback={<LoadingSkeleton lines={10} />}>
          <VehicleComparison />
        </Suspense>
      </div>
    </div>
  );
}
