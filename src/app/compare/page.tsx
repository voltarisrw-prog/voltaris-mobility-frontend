import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { LoadingSkeleton } from '@/components/ui';
import { VehicleComparison } from '@/features/vehicles/VehicleComparison';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Compare electric vehicles',
  description:
    'Put up to four EVs side by side. Voltaris works out cost per kilometre of range, efficiency, and real charging times so the comparison means something.',
  path: '/compare',
});

export default function ComparePage() {
  return (
    <div className="shell py-10">
      <Breadcrumbs
        trail={[
          { name: 'Home', path: '/' },
          { name: 'Compare', path: '/compare' },
        ]}
      />
      <h1 className="mt-6 font-display text-headline">Compare electric vehicles</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        Specifications on their own do not tell you much. This table works out what each kilometre
        of range costs, how long a full charge takes on a home socket, and which car wins each row.
      </p>
      <div className="mt-10">
        <Suspense fallback={<LoadingSkeleton lines={10} />}>
          <VehicleComparison />
        </Suspense>
      </div>
    </div>
  );
}
