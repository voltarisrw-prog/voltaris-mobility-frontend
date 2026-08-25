import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DealerCard } from '@/components/DealerCard';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { listDealers } from '@/lib/api/dealers';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import type { DealerSummary } from '@/types/dealer';

export const metadata: Metadata = buildMetadata({
  title: 'Electric vehicle dealers in Rwanda',
  description:
    'Every dealer and mobility partner listing electric vehicles on Voltaris, with verification status and current inventory.',
  path: '/dealers',
});

export default async function DealersPage() {
  let dealers: DealerSummary[] = [];
  let failed = false;
  try {
    dealers = (await listDealers()).items;
  } catch {
    failed = true;
  }

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Dealers', path: '/dealers' },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <Breadcrumbs trail={trail} />
      <h1 className="mt-6 font-display text-headline">EV dealers and partners</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        Voltaris does not own these vehicles. These are the businesses that do — each one checked
        before it can carry a verified mark.
      </p>

      <div className="mt-10">
        {failed || dealers.length === 0 ? (
          <EmptyState
            title="No dealers to show yet"
            body="The dealer directory is being populated. In the meantime, every listing on the marketplace names who is selling it."
            action={{ label: 'Browse electric vehicles', href: '/cars' }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dealers.map((dealer) => (
              <DealerCard key={dealer.id} dealer={dealer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
