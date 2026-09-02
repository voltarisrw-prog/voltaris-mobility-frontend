import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { listChargingLocations, type ChargingLocation } from '@/lib/api/charging';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'EV charging stations in Rwanda',
  description:
    'Where to charge an electric vehicle in Rwanda: public charging locations, connector types, power ratings, and access, updated as the network grows.',
  path: '/charging',
});

const FAQS = [
  {
    question: 'How many public EV chargers are there in Rwanda?',
    answer:
      'The public network is small and concentrated in Kigali. It is growing, but most owners charge at home overnight and treat public charging as a top-up rather than a primary source.',
  },
  {
    question: 'What connector do electric cars in Rwanda use?',
    answer:
      'Type 2 for AC charging and CCS2 for DC fast charging are the most common on vehicles imported here, though Chinese-market imports may use GB/T. Check the connector on the listing before buying a charger.',
  },
  {
    question: 'How much does it cost to charge an EV in Rwanda?',
    answer:
      'Charging at home is billed at the domestic electricity tariff. A typical EV uses about 17 kWh per 100 km, which makes the per-kilometre cost a fraction of petrol for a comparable vehicle.',
  },
];

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

  const districts = [...new Set(locations.map((l) => l.district))].sort();
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Charging', path: '/charging' },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(FAQS)} />
      <Breadcrumbs trail={trail} />

      <h1 className="mt-6 font-display text-headline">Where to charge in Rwanda</h1>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-steel">
        Rwanda’s public charging network is small and moving quickly. This directory tracks what is
        actually installed and working — including who operates it and whether you need to be a
        customer to use it, which the maps tend to leave out.
      </p>

      {districts.length > 1 && (
        <nav aria-label="Filter by district" className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/charging"
            className={
              !district
                ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
                : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
            }
          >
            Everywhere
          </Link>
          {districts.map((name) => (
            <Link
              key={name}
              href={`/charging?district=${encodeURIComponent(name)}`}
              className={
                district === name
                  ? 'bg-chrome px-3 py-2 font-data text-eyebrow uppercase text-surface'
                  : 'border border-hairline px-3 py-2 font-data text-eyebrow uppercase hover:border-chrome'
              }
            >
              {name}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-10">
        {failed || locations.length === 0 ? (
          <EmptyState
            title="The charging directory is still being built"
            body="We are verifying each site in person before listing it, because a charger that is listed but broken is worse than no listing at all. Until then, plan on charging at home."
            action={{ label: 'Read the home charging guide', href: '/guides/charging-at-home' }}
          />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {locations.map((location) => (
              <li key={location.id} className="border border-hairline p-5">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    {location.name}
                  </h2>
                  <span className="shrink-0 font-data text-eyebrow uppercase text-steel-muted">
                    {location.access === 'public'
                      ? 'Public'
                      : location.access === 'customers_only'
                        ? 'Customers only'
                        : 'Private'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-steel">{location.address}</p>
                <p className="mt-1 font-data text-xs text-steel-muted">
                  {location.operator} · {location.open_hours}
                </p>
                <ul className="mt-4 space-y-1">
                  {location.connectors.map((connector) => (
                    <li
                      key={`${connector.type}-${connector.power_kw}`}
                      className="flex items-baseline justify-between font-data text-xs"
                    >
                      <span className="text-steel">
                        {connector.type} × {connector.count}
                      </span>
                      <span className="tabular-nums text-chrome">{connector.power_kw} kW</span>
                    </li>
                  ))}
                </ul>
                {location.verified_at && (
                  <p className="mt-4 font-data text-eyebrow uppercase text-volt">
                    Checked{' '}
                    {new Date(location.verified_at).toLocaleDateString('en-RW', {
                      dateStyle: 'medium',
                    })}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <section className="mt-16 max-w-prose">
        <h2 className="section-heading">Common questions</h2>
        <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
          {FAQS.map((faq) => (
            <details key={faq.question} className="py-4">
              <summary className="cursor-pointer list-none font-display text-sm font-semibold tracking-tight">
                {faq.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
