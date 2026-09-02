import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroMedia } from '@/features/home/HeroMedia';
import { ShowcaseSlider } from '@/features/home/ShowcaseSlider';
import { AisleRail } from '@/features/vehicles/AisleRail';
import { JsonLd } from '@/components/JsonLd';
import { listVehicles } from '@/lib/api/vehicles';
import { buildMetadata, absoluteUrl } from '@/lib/seo/metadata';
import { site } from '@/config/site';
import { HomeInquiryForm } from '@/features/home/HomeInquiryForm';
import {
  aisles,
  culture,
  editorial,
  entrance,
  finalCta,
  hero,
  inquiry,
  needs,
  sell,
  showcase,
  testDrive,
  trust,
} from '@/content/home';
import type { VehicleSummary } from '@/types/vehicle';

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
  /**
   * Every aisle is a real query. Fetched in parallel and each one allowed to fail on
   * its own — one empty rail should not take down the homepage, and a rail with no
   * results renders as nothing rather than as a row of skeletons pretending.
   */
  const [showcaseVehicles, results] = await Promise.all([
    listVehicles({ ...showcase.query })
      .then((page) => page.items.slice(0, 6))
      .catch(() => [] as VehicleSummary[]),
    Promise.allSettled(aisles.map((aisle) => listVehicles({ ...aisle.query }))),
  ]);

  const railData: { id: string; vehicles: VehicleSummary[] }[] = aisles.map((aisle, index) => {
    const result = results[index];
    return {
      id: aisle.id,
      vehicles: result?.status === 'fulfilled' ? result.value.items.slice(0, 10) : [],
    };
  });

  const anyInventory = railData.some((rail) => rail.vehicles.length > 0);

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* 01 — HERO ------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <HeroMedia />
        <div className="shell relative flex min-h-[88svh] flex-col justify-end py-16 sm:py-20">
          <div className="max-w-2xl animate-rise-in pb-4 sm:pb-8">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="mt-4 max-w-xl font-display text-hero">{hero.headline}</h1>
            <p className="mt-5 max-w-md font-display text-lg tracking-tight text-steel sm:text-xl">
              {hero.sub}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={hero.primaryCta.href}
                className="bg-volt px-7 py-4 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="border border-chrome px-7 py-4 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 02 — THE SHOWCASE ------------------------------------------------ */}
      {showcaseVehicles.length > 0 && (
        <>
          <div className="lane-rule" />
          <section className="pt-16 sm:pt-20">
            <header className="shell max-w-2xl">
              <p className="eyebrow">{showcase.eyebrow}</p>
              <h2 className="mt-4 font-display text-display">{showcase.headline}</h2>
            </header>
            <ShowcaseSlider vehicles={showcaseVehicles} />
          </section>
        </>
      )}

      {/* 03 — THE ENTRANCE ------------------------------------------------ */}
      <div className="lane-rule" />
      <section className="shell py-20">
        <header className="max-w-2xl">
          <p className="eyebrow">{entrance.eyebrow}</p>
          <h2 className="mt-4 font-display text-display">{entrance.headline}</h2>
          <p className="mt-4 text-base text-steel">{entrance.sub}</p>
        </header>

        <ul className="mt-12 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-4">
          {entrance.categories.map((category, index) => {
            const featured = index === 0 || index === 3;

            return (
              <li
                key={category.label}
                className={`panel ${category.span ?? ''} ${featured ? 'lg:col-span-2' : ''}`}
              >
                <Link
                  href={category.href}
                  className={`group relative flex min-h-[13rem] flex-col justify-between overflow-hidden p-7 transition-colors duration-300 hover:bg-slab sm:p-8 ${
                    featured ? 'lg:min-h-[18rem] lg:p-10' : ''
                  }`}
                >
                  <span
                    className={`font-display font-semibold tracking-tight ${
                      featured ? 'text-4xl sm:text-5xl' : 'text-2xl'
                    }`}
                  >
                    {category.label}
                  </span>

                  <span className="flex items-end justify-between gap-4">
                    <span className="max-w-[18rem] text-sm text-steel">{category.line}</span>
                    <ArrowRight
                      className={`shrink-0 text-steel-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-volt ${
                        featured ? 'h-5 w-5' : 'h-4 w-4'
                      }`}
                      aria-hidden="true"
                    />
                  </span>

                  <span className="absolute inset-x-7 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 ease-out group-hover:scale-x-100 lg:inset-x-10" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* 04 — SMART DISCOVERY AND THE AISLES --------------------------- */}
      <div className="lane-rule" />
      <section className="pt-20">
        <header className="shell max-w-2xl">
          <p className="eyebrow">Everything worth driving</p>
          <h2 className="mt-4 font-display text-display">One place. Properly organised.</h2>
          <p className="mt-4 text-base text-steel">
            Aisles instead of an endless grid. Each one is a live query, so what you see is what is
            actually on the floor right now.
          </p>
        </header>

        {anyInventory ? (
          <div className="mt-6 divide-y divide-hairline/60">
            {aisles.map((aisle, index) => {
              const data = railData.find((rail) => rail.id === aisle.id);
              return (
                <AisleRail
                  key={aisle.id}
                  title={aisle.title}
                  line={aisle.line}
                  href={aisle.href}
                  vehicles={data?.vehicles ?? []}
                  priority={index === 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="shell mt-10">
            <div className="border border-dashed border-hairline p-12 text-center">
              <p className="font-display text-xl tracking-tight">The floor is being stocked.</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-steel">
                Listings appear here the moment they clear review. Nothing is shown before it has
                been checked.
              </p>
              <Link
                href="/sell"
                className="mt-7 inline-block bg-volt px-6 py-3 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
              >
                Be the first to list
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 05 — PERSONALISED DISCOVERY ------------------------------------- */}
      <div className="lane-rule" />
      <section className="shell py-20">
        <header className="max-w-2xl">
          <p className="eyebrow">{needs.eyebrow}</p>
          <h2 className="mt-4 font-display text-display">{needs.headline}</h2>
          <p className="mt-4 text-base text-steel">{needs.sub}</p>
        </header>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {needs.options.map((option) => (
            <li key={option.label}>
              <Link
                href={option.href}
                className="group flex items-center justify-between gap-4 border border-hairline p-6 transition-colors duration-200 hover:border-volt"
              >
                <span>
                  <span className="block font-display text-lg font-semibold tracking-tight">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm text-steel">{option.line}</span>
                </span>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-steel-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-volt"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 06 — COMPARISON -------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="panel-deep">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">Side by side</p>
            <h2 className="mt-4 font-display text-display">Don&rsquo;t guess. Compare.</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-steel">
              Specifications on their own tell you very little. Voltaris works out what each
              kilometre of range costs, how long a full charge takes on a home socket, and which car
              wins each row.
            </p>
            <Link
              href="/compare"
              className="mt-8 inline-block border border-chrome px-6 py-3.5 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
            >
              Open the comparison
            </Link>
          </div>

          {/* A miniature of the real comparison table, not a decorative graphic. */}
          <div className="border border-hairline panel p-6">
            <dl className="divide-y divide-hairline/60 text-sm">
              {[
                ['Cost per km of range', 'RWF 87,500', 'RWF 102,300'],
                ['Efficiency', '14.4 kWh/100km', '16.9 kWh/100km'],
                ['Full charge, home socket', '8.6 hours', '9.4 hours'],
                ['10–80% on DC', '40 min', 'No DC charging'],
              ].map(([label, a, b]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_auto_auto] items-baseline gap-4 py-3.5"
                >
                  <dt className="text-steel">{label}</dt>
                  <dd className="bg-volt-wash px-2 py-1 font-data text-xs tabular-nums text-volt">
                    {a}
                  </dd>
                  <dd className="font-data text-xs tabular-nums text-steel-muted">{b}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 font-data text-xs text-steel-muted">
              Illustrative layout. Real figures are calculated from the vehicles you select.
            </p>
          </div>
        </div>
      </section>

      {/* 07 — TRUST ------------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="shell py-20">
        <header className="max-w-2xl">
          <p className="eyebrow">{trust.eyebrow}</p>
          <h2 className="mt-4 font-display text-display">{trust.headline}</h2>
          <p className="mt-4 text-base text-steel">{trust.sub}</p>
        </header>

        <dl className="mt-12 grid gap-px bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {trust.points.map((point) => (
            <div key={point.title} className="panel p-7">
              <dt className="font-display text-base font-semibold tracking-tight">{point.title}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-steel">{point.line}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-steel-muted">{trust.note}</p>
      </section>

      {/* 08 — SELL -------------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="panel-deep">
        <div className="shell py-20">
          <header className="max-w-2xl">
            <p className="eyebrow">{sell.eyebrow}</p>
            <h2 className="mt-4 font-display text-display">{sell.headline}</h2>
            <p className="mt-4 text-base text-steel">{sell.sub}</p>
          </header>

          {/* Numbered because this genuinely is a sequence — the steps happen in order. */}
          <ol className="mt-12 grid gap-8 sm:grid-cols-3">
            {sell.steps.map((step) => (
              <li key={step.n} className="border-t border-hairline pt-6">
                <span className="font-data text-eyebrow text-volt">{step.n}</span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-steel">{step.line}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link
              href={sell.primaryCta.href}
              className="bg-volt px-7 py-4 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
            >
              {sell.primaryCta.label}
            </Link>
            <Link
              href={sell.secondaryCta.href}
              className="border border-hairline px-7 py-4 font-data text-eyebrow uppercase text-steel transition-colors hover:border-chrome hover:text-chrome"
            >
              {sell.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>

      {/* 09 — TEST DRIVE -------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="relative isolate overflow-hidden">
        <div className="vanishing-glow absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="shell relative py-24 text-center">
          <p className="eyebrow">{testDrive.eyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-display">{testDrive.headline}</h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-steel">
            {testDrive.sub}
          </p>
          <Link
            href={testDrive.cta.href}
            className="mt-9 inline-block bg-volt px-7 py-4 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
          >
            {testDrive.cta.label}
          </Link>
        </div>
      </section>

      {/* 10 — EDITORIAL --------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="shell py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:items-start">
          <header>
            <p className="eyebrow">{editorial.eyebrow}</p>
            <h2 className="mt-4 font-display text-display">{editorial.headline}</h2>
            <p className="mt-4 text-base text-steel">{editorial.sub}</p>
            <Link
              href={editorial.cta.href}
              className="mt-8 inline-flex items-center gap-2 font-data text-eyebrow uppercase text-volt transition-opacity hover:opacity-70"
            >
              {editorial.cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </header>

          <ul className="grid gap-px bg-hairline sm:grid-cols-2">
            {editorial.topics.map((topic) => (
              <li key={topic.label} className="panel">
                <Link
                  href={topic.href}
                  className="group flex items-center justify-between gap-4 p-6 transition-colors hover:bg-slab"
                >
                  <span className="font-display text-base font-semibold tracking-tight">
                    {topic.label}
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-steel-muted transition-all duration-200 group-hover:translate-x-1 group-hover:text-volt"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 11 — MOBILITY CULTURE -------------------------------------------- */}
      <div className="lane-rule" />
      <section className="panel-deep">
        <div className="shell grid gap-12 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="eyebrow">{culture.eyebrow}</p>
            <h2 className="mt-4 font-display text-display">{culture.headline}</h2>
          </div>
          <div>
            <p className="max-w-prose text-base leading-relaxed text-steel">{culture.body}</p>
            <dl className="mt-10 grid grid-cols-3 gap-6">
              {culture.stats.map((stat) => (
                <div key={stat.label} className="border-t border-hairline pt-4">
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="block font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
                      {stat.value}
                    </span>
                    <span className="mt-1.5 block font-data text-xs leading-snug text-steel-muted">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* 12 — ENQUIRY --------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="shell py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20">
          <header>
            <p className="eyebrow">{inquiry.eyebrow}</p>
            <h2 className="mt-4 font-display text-display">{inquiry.headline}</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-steel">{inquiry.sub}</p>
            <ul className="mt-8 space-y-3">
              {inquiry.points.map((point) => (
                <li key={point} className="flex items-baseline gap-3 text-sm text-steel">
                  <span
                    aria-hidden="true"
                    className="h-px w-4 shrink-0 translate-y-[-3px] bg-volt"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </header>

          <div className="border border-hairline p-6 sm:p-8">
            <HomeInquiryForm />
          </div>
        </div>
      </section>

      {/* 13 — FINAL CTA --------------------------------------------------- */}
      <div className="lane-rule" />
      <section className="relative isolate overflow-hidden">
        <div className="vanishing-glow absolute inset-0" aria-hidden="true" />
        <div className="shell relative py-28 text-center sm:py-36">
          <h2 className="mx-auto max-w-4xl font-display text-hero">{finalCta.headline}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href={finalCta.primaryCta.href}
              className="bg-volt px-8 py-4 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
            >
              {finalCta.primaryCta.label}
            </Link>
            <Link
              href={finalCta.secondaryCta.href}
              className="border border-chrome px-8 py-4 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
            >
              {finalCta.secondaryCta.label}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
