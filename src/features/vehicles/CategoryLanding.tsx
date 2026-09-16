import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { EmptyState } from '@/components/EmptyState';
import { JsonLd } from '@/components/JsonLd';
import { VehicleCard } from '@/components/VehicleCard';
import { listVehicles } from '@/lib/api/vehicles';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { buildHref } from '@/lib/vehicles/filters';
import type { LandingPage } from '@/config/landing';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * One renderer for every curated landing page. The content comes from
 * config/landing.ts; this file only decides how it is laid out.
 */
export async function CategoryLanding({ page }: { page: LandingPage }) {
  let vehicles: VehicleSummary[] = [];
  let total = 0;
  let failed = false;

  try {
    const result = await listVehicles({ ...page.filters, sort: 'newest' });
    vehicles = result.items.slice(0, 9);
    total = result.total;
  } catch {
    failed = true;
  }

  const trail = [
    { name: 'Home', path: '/' },
    { name: 'Electric vehicles', path: '/cars' },
    { name: page.h1, path: `/${page.slug}` },
  ];

  return (
    <div className="shell py-10">
      <JsonLd data={breadcrumbJsonLd(trail)} />
      <JsonLd data={faqJsonLd(page.faqs)} />
      <Breadcrumbs trail={trail} />

      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-headline">{page.h1}</h1>
        <p className="mt-4 text-base leading-relaxed text-steel">{page.intro}</p>
        {total > 0 && (
          <p className="mt-4 font-data text-xs tabular-nums text-steel-muted">
            {total} listed right now
          </p>
        )}
      </header>

      <section className="mt-10">
        {failed || vehicles.length === 0 ? (
          <EmptyState
            title="Nothing listed in this category yet"
            body="New listings appear here as soon as they clear review. In the meantime, the full marketplace may have something close."
            action={{ label: 'See all electric vehicles', href: '/cars' }}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} priority={index < 3} />
              ))}
            </div>
            <Link
              href={buildHref({ ...page.filters })}
              className="mt-8 inline-block border border-chrome px-6 py-3 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
            >
              Open in the marketplace with filters →
            </Link>
          </>
        )}
      </section>

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <article className="max-w-prose">
          {page.body.map((section) => (
            <section key={section.heading} className="mb-10">
              <h2 className="section-heading">
                {section.heading}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-steel">{section.text}</p>
            </section>
          ))}

          <section>
            <h2 className="section-heading">Common questions</h2>
            <div className="mt-4 divide-y divide-hairline/60 border-y border-hairline/60">
              {page.faqs.map((faq) => (
                <details key={faq.question} className="py-4">
                  <summary className="cursor-pointer list-none font-display text-sm font-semibold tracking-tight">
                    {faq.question}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-steel">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </article>

        <aside>
          <h2 className="eyebrow">Related</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              { href: '/electric-cars-rwanda', label: 'All electric cars in Rwanda' },
              { href: '/electric-suvs-rwanda', label: 'Electric SUVs' },
              { href: '/electric-sedans-rwanda', label: 'Electric sedans' },
              { href: '/used-electric-cars-rwanda', label: 'Used electric cars' },
              { href: '/electric-cars-kigali', label: 'Listed in Kigali' },
              { href: '/charging', label: 'Where to charge' },
              { href: '/guides', label: 'EV buying guides' },
            ]
              .filter((link) => link.href !== `/${page.slug}`)
              .map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-steel hover:text-volt hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
