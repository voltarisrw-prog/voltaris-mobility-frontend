import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { DealerCard } from '@/components/DealerCard';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { DealerShowcase, type DealerShowcaseItem } from '@/features/dealers/DealerShowcase';
import { getDealer, listDealers } from '@/lib/api/dealers';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import type { DealerDetail, DealerSummary } from '@/types/dealer';

export const metadata: Metadata = buildMetadata({
  title: 'Electric vehicle dealers in Rwanda',
  description:
    'Every dealer and mobility partner listing electric vehicles on Voltaris, with verification status and current inventory.',
  path: '/dealers',
});

/**
 * The dealer directory (`/dealers`, `DealerSummary`) only carries a small
 * square `logo_url` — fine at 56px in `DealerCard`, not at coverflow scale.
 * The photographic cover photo lives on `DealerDetail`, a separate request
 * per dealer, so a hero showcase here means fetching a handful of details
 * up front rather than the whole directory. Capped at 5 verified dealers and
 * run in parallel; any dealer whose detail fetch fails or who has no cover
 * photo on file is just left out of the showcase — the directory grid below
 * still lists every dealer regardless.
 */
async function loadShowcaseDealers(dealers: DealerSummary[]): Promise<DealerShowcaseItem[]> {
  const candidates = dealers.filter((dealer) => dealer.verified).slice(0, 5);
  const details = await Promise.all(
    candidates.map((dealer) => getDealer(dealer.slug).catch(() => null)),
  );

  return details
    .filter((detail): detail is DealerDetail => detail !== null && detail.cover_image_url !== null)
    .map((detail) => ({
      slug: detail.slug,
      name: detail.name,
      city: detail.city,
      verified: detail.verified,
      vehicleCount: detail.vehicle_count,
      coverImageUrl: detail.cover_image_url as string,
      ...(detail.whatsapp ? { whatsapp: detail.whatsapp } : {}),
      ...(detail.phone ? { phone: detail.phone } : {}),
    }));
}

export default async function DealersPage() {
  let dealers: DealerSummary[] = [];
  let failed = false;
  try {
    dealers = (await listDealers()).items;
  } catch {
    failed = true;
  }

  const showcaseDealers = dealers.length > 0 ? await loadShowcaseDealers(dealers) : [];

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

      {showcaseDealers.length > 1 && <DealerShowcase dealers={showcaseDealers} />}

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
