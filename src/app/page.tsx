import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { HomeLanding } from '@/features/home/landing/HomeLanding';
import { toCard, type CoverCard } from '@/features/home/landing/cards';
import { listVehicles } from '@/lib/api/vehicles';
import { buildMetadata, absoluteUrl } from '@/lib/seo/metadata';
import { site } from '@/config/site';
import { showcase } from '@/content/home';

export const metadata: Metadata = buildMetadata({
  title: 'Voltaris Mobility — find your next drive',
  description:
    'Buy, rent, or sell a vehicle in Rwanda. Compare range, battery, price, and condition across verified dealers and private owners, then book a test drive in Kigali.',
  path: '/',
});

export const revalidate = 300;

/** WebSite + SearchAction so the search box can surface directly in results. */
function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site.url}#website`,
    url: site.url,
    name: site.name,
    publisher: { '@id': `${site.url}#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: absoluteUrl('/cars?q={search_term_string}') },
      'query-input': 'required name=search_term_string',
    },
  };
}

export default async function HomePage() {
  // A real query, not a hand-picked list; if it fails the section is left out
  // rather than taking the page down with it.
  const cards = await listVehicles({ ...showcase.query })
    .then((page) => page.items.slice(0, 6).map(toCard))
    .catch(() => [] as CoverCard[]);

  return (
    <>
      <JsonLd data={websiteJsonLd()} />
      <HomeLanding cards={cards} />
    </>
  );
}
