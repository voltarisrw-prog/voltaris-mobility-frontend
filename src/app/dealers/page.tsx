import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { DealersExplorer, type DealerCardData } from '@/features/dealers/DealersExplorer';
import { homeFonts } from '@/features/home/landing/fonts';
import { getDealer, listDealers } from '@/lib/api/dealers';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import type { DealerDetail, DealerSummary } from '@/types/dealer';
import '@/features/dealers/dealers.css';

export const metadata: Metadata = buildMetadata({
  title: 'Electric vehicle dealers in Rwanda',
  description:
    'Every dealer and mobility partner listing electric vehicles on Voltaris, with verification status and current inventory.',
  path: '/dealers',
});

/** How many dealers get their profile fetched for a cover photo and WhatsApp number. */
const DETAIL_LIMIT = 12;

/**
 * The directory only carries a small square logo. The cover photo and contact numbers live on the
 * dealer's own profile, a separate request, so the first few profiles are fetched in parallel
 * (both calls are cached). A dealer whose profile fails or has no photo simply gets a card without
 * one; the directory still lists every dealer.
 */
async function loadDetails(dealers: DealerSummary[]): Promise<Map<string, DealerDetail>> {
  const details = await Promise.all(
    dealers.slice(0, DETAIL_LIMIT).map((dealer) => getDealer(dealer.slug).catch(() => null)),
  );
  return new Map(details.filter((d): d is DealerDetail => d !== null).map((d) => [d.slug, d]));
}

/** A link WhatsApp understands, from either a full link or a phone number. */
function whatsappHref(value?: string): string | null {
  if (!value) return null;
  const text = value.trim();
  if (/^https?:\/\//i.test(text)) return text;
  let digits = text.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('0') && digits.length === 10) digits = `250${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

export default async function DealersPage() {
  let dealers: DealerSummary[] = [];
  let total: unknown;
  let failed = false;
  try {
    const listing = await listDealers();
    dealers = listing.items;
    total = (listing as unknown as { total?: unknown }).total;
  } catch {
    failed = true;
  }

  const details = dealers.length > 0 ? await loadDetails(dealers) : new Map<string, DealerDetail>();

  const cards: DealerCardData[] = dealers.map((d) => {
    const detail = details.get(d.slug);
    return {
      id: d.id,
      slug: d.slug,
      name: d.name,
      city: d.city,
      verified: d.verified,
      vehicleCount: d.vehicle_count,
      logo: d.logo_url,
      cover: detail?.cover_image_url ?? null,
      whatsapp: whatsappHref(detail?.whatsapp),
    };
  });

  // The totals are only honest when every dealer is on this page.
  const showStats = typeof total !== 'number' || total <= dealers.length;

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Dealers', path: '/dealers' },
  ];

  return (
    <div className={`dl-page ${homeFonts}`}>
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <div className="dl-w">
        <Breadcrumbs trail={trail} />
        <h1 className="dl-h1">
          <span className="dl-wd">
            <span className="dl-wi">
              EV dealers and <em>partners</em>
            </span>
          </span>
        </h1>

        <DealersExplorer
          dealers={failed ? [] : cards}
          showStats={showStats}
          empty={
            <EmptyState
              title="No dealers to show yet"
              body="The dealer directory is being populated. In the meantime, every listing on the marketplace names who is selling it."
              action={{ label: 'Browse electric vehicles', href: '/cars' }}
            />
          }
        />
      </div>
    </div>
  );
}
