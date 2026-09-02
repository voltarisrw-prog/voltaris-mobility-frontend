import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { VehicleCard } from '@/components/VehicleCard';
import { getFacets, listVehicles } from '@/lib/api/vehicles';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';
import { buildHref } from '@/lib/vehicles/filters';
import type { VehicleSummary } from '@/types/vehicle';

type Params = Promise<{ brand: string }>;

function label(brand: string): string {
  return brand.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { brand } = await params;
  const name = label(brand);
  return buildMetadata({
    title: `${name} electric vehicles for sale in Rwanda`,
    description: `Every ${name} electric vehicle currently listed on Voltaris, with range, battery, price, and verification status. Compare models and book a test drive in Kigali.`,
    path: `/brands/${brand}`,
  });
}

export default async function BrandPage({ params }: { params: Params }) {
  const { brand } = await params;
  const name = label(brand);

  // A brand with no listings and no facet entry is not a page — it is a 404.
  let known = true;
  try {
    const facets = await getFacets();
    known = facets.makes.some((make) => make.value === brand);
  } catch {
    known = true; // Do not 404 on a service failure.
  }
  if (!known) notFound();

  let vehicles: VehicleSummary[] = [];
  let total = 0;
  try {
    const result = await listVehicles({ make: [brand], sort: 'newest' });
    vehicles = result.items;
    total = result.total;
  } catch {
    // Empty state below.
  }

  const models = [...new Set(vehicles.map((v) => v.model))].sort();
  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Brands', path: '/brands' },
    { name, path: `/brands/${brand}` },
  ];

  const faqs = [
    {
      question: `Are ${name} electric vehicles available in Rwanda?`,
      answer:
        total > 0
          ? `Yes — ${total} ${name} ${total === 1 ? 'vehicle is' : 'vehicles are'} listed on Voltaris right now, from verified dealers and private owners.`
          : `There are no ${name} vehicles listed on Voltaris at the moment. New listings appear as soon as they clear review.`,
    },
    {
      question: `Where can I service a ${name} EV in Rwanda?`,
      answer: `Servicing depends on whether ${name} has an authorised agent locally. Ask the seller on any listing before you buy — Voltaris passes the question on and records the answer against the listing.`,
    },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(faqs)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-headline">{name} electric vehicles in Rwanda</h1>
        <p className="mt-4 text-base leading-relaxed text-steel">
          {total > 0
            ? `${total} ${name} ${total === 1 ? 'vehicle' : 'vehicles'} listed on Voltaris${models.length > 0 ? `, across ${models.length} ${models.length === 1 ? 'model' : 'models'}` : ''}. Every listing shows its real driving range so you can compare across the range rather than by trim name.`
            : `No ${name} vehicles are listed right now. Set a saved search and we will tell you when one arrives.`}
        </p>
      </header>

      {models.length > 0 && (
        <nav aria-label={`${name} models`} className="mt-8 flex flex-wrap gap-2">
          {models.map((model) => (
            <Link
              key={model}
              href={buildHref({ make: [brand], model })}
              className="border border-hairline px-3 py-2 font-data text-eyebrow uppercase transition-colors hover:border-volt hover:text-volt"
            >
              {model}
            </Link>
          ))}
        </nav>
      )}

      <section className="mt-10">
        {vehicles.length === 0 ? (
          <EmptyState
            title={`No ${name} listings right now`}
            body="Listings appear here as soon as they clear review. The full marketplace may have something comparable from another brand."
            action={{ label: 'See all electric vehicles', href: '/cars' }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle, index) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-prose">
        <h2 className="section-heading">Common questions</h2>
        <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
          {faqs.map((faq) => (
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
