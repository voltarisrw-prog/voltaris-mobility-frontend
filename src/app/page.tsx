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
      <section className="shell py-24 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-[minmax(14rem,0.7fr)_minmax(0,2fr)] lg:gap-20">
          <header className="max-w-sm">
            <p className="eyebrow">{entrance.eyebrow}</p>
            <h2 className="mt-5 font-display text-display">{entrance.headline}</h2>
            <p className="mt-5 text-base leading-relaxed text-steel">{entrance.sub}</p>
          </header>

          <nav aria-label="Explore Voltaris" className="border-t border-hairline">
            <ul>
              {entrance.categories.map((category, index) => {
                const featured = index === 0 || index === 3;

                return (
                  <li key={category.label} className="border-b border-hairline">
                    <Link
                      href={category.href}
                      className="group relative flex items-center justify-between gap-6 py-5 transition-colors duration-300 sm:py-6"
                    >
                      <span className="flex min-w-0 items-baseline gap-4 sm:gap-7">
                        <span className="font-data text-[0.6rem] uppercase tracking-[0.18em] text-steel-muted">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className={`font-display font-semibold leading-none tracking-[-0.035em] transition-transform duration-300 group-hover:translate-x-2 ${
                            featured
                              ? "text-4xl sm:text-5xl lg:text-6xl"
                              : "text-2xl sm:text-3xl"
                          }`}
                        >
                          {category.label}
                        </span>
                      </span>

                      <span className="flex shrink-0 items-center gap-4">
                        <span className="hidden text-right text-xs text-steel sm:block">
                          {category.line}
                        </span>
                        <ArrowRight
                          className={`h-5 w-5 text-steel-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-volt ${
                            featured ? "sm:h-6 sm:w-6" : ""
                          }`}
                          aria-hidden="true"
                        />
                      </span>

                      <span
                        className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 ease-out group-hover:scale-x-100"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      {/* 04 — SMART DISCOVERY AND THE AISLES --------------------------- */}
      <div className="lane-rule" />
      <section className="relative overflow-hidden py-28 sm:py-36">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[1fr_2fr] lg:items-end lg:gap-20">
            <header className="max-w-lg">
              <p className="eyebrow">The floor</p>
              <h2 className="mt-5 font-display text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.88] tracking-[-0.055em]">
                Explore what is moving.
              </h2>
            </header>

            <div className="max-w-xl pb-1 lg:ml-auto">
              <p className="text-lg leading-relaxed text-steel sm:text-xl">
                A live selection of vehicles available now. Browse by what has just arrived,
                what goes the distance, or what fits the budget.
              </p>
            </div>
          </div>

          {anyInventory ? (
            <>
              {(() => {
                const featuredRail = railData.find((rail) => rail.id === "new-arrivals");

                return featuredRail ? (
                  <div className="mt-16 sm:mt-20">
                    <AisleRail
                      title="Just arrived"
                      line="The newest listings to clear review."
                      href="/cars?sort=newest"
                      vehicles={featuredRail.vehicles}
                      priority
                    />
                  </div>
                ) : null;
              })()}

              <nav
                aria-label="Browse vehicle collections"
                className="mt-10 border-y border-hairline"
              >
                <ul className="flex flex-wrap">
                  {aisles.slice(1).map((aisle) => (
                    <li key={aisle.id} className="border-r border-hairline last:border-r-0">
                      <Link
                        href={aisle.href}
                        className="group flex items-center gap-3 px-4 py-4 font-data text-[0.65rem] uppercase tracking-[0.16em] text-steel-muted transition-colors hover:text-volt sm:px-5"
                      >
                        <span>{aisle.title}</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </>
          ) : (
            <div className="mt-16 border-y border-hairline py-12">
              <p className="text-sm text-steel">
                The showroom is being refreshed. Check back soon for new vehicles.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden py-28 sm:py-36">
        <div className="shell">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)] lg:gap-24">
            <header>
              <p className="eyebrow">{needs.eyebrow}</p>
              <h2 className="mt-5 max-w-4xl font-display text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-[0.84] tracking-[-0.06em]">
                {needs.headline}
              </h2>
            </header>

            <div className="flex items-end lg:pb-2">
              <p className="max-w-md text-lg leading-relaxed text-steel sm:text-xl">
                {needs.sub}
              </p>
            </div>
          </div>

          <nav aria-label="Find your next drive" className="mt-20 border-t border-hairline">
            <ul>
              {needs.options.map((option, index) => (
                <li key={option.label} className="border-b border-hairline">
                  <Link
                    href={option.href}
                    className="group relative grid gap-4 py-7 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center sm:py-9"
                  >
                    <span className="font-data text-[0.62rem] uppercase tracking-[0.18em] text-steel-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0">
                      <span className="block font-display text-3xl font-semibold leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-3 sm:text-5xl lg:text-6xl">
                        {option.label}
                      </span>
                      <span className="mt-2 block max-w-lg text-sm text-steel sm:text-base">
                        {option.line}
                      </span>
                    </span>

                    <ArrowRight
                      className="hidden h-7 w-7 text-steel-muted transition-all duration-500 group-hover:translate-x-2 group-hover:text-volt sm:block"
                      aria-hidden="true"
                    />

                    <span
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-volt transition-transform duration-500 group-hover:scale-x-100"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* 06 — DECISION ---------------------------------------------------- */}
      <section className="relative overflow-hidden border-y border-hairline">
        <div className="shell py-28 sm:py-36">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-end lg:gap-24">
            <div>
              <p className="eyebrow">Side by side</p>
              <h2 className="mt-5 max-w-4xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                Don&rsquo;t guess.
                <br />
                Compare.
              </h2>

              <p className="mt-7 max-w-lg text-lg leading-relaxed text-steel sm:text-xl">
                Specifications only tell part of the story. Voltaris turns the numbers into
                something you can actually use when choosing your next drive.
              </p>

              <Link
                href="/compare"
                className="mt-9 inline-flex items-center gap-3 border-b border-chrome pb-2 font-data text-eyebrow uppercase tracking-[0.12em] text-chrome transition-colors hover:border-volt hover:text-volt"
              >
                Open the comparison
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div>
              <p className="mb-5 font-data text-[0.6rem] uppercase tracking-[0.18em] text-steel-muted">
                Example comparison
              </p>

              <dl className="border-t border-hairline">
                {[
                  ["Cost per km of range", "RWF 87,500", "RWF 102,300"],
                  ["Efficiency", "14.4 kWh/100km", "16.9 kWh/100km"],
                  ["Full charge, home socket", "8.6 hours", "9.4 hours"],
                  ["10–80% on DC", "40 min", "No DC charging"],
                ].map(([label, a, b]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-5 border-b border-hairline py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                  >
                    <dt className="text-sm text-steel">{label}</dt>
                    <dd className="font-data text-xs tabular-nums text-chrome">{a}</dd>
                    <dd className="hidden font-data text-xs tabular-nums text-steel-muted sm:block">
                      {b}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 font-data text-[0.6rem] uppercase tracking-[0.12em] text-steel-muted">
                Illustrative figures · real values calculated from selected vehicles
              </p>
            </div>
          </div>

          <div className="mt-28 border-t border-hairline pt-10 sm:mt-36 sm:pt-12">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,2fr)] lg:items-end lg:gap-20">
              <header>
                <p className="eyebrow">{trust.eyebrow}</p>
                <h3 className="mt-4 font-display text-4xl font-semibold leading-[0.9] tracking-[-0.05em] sm:text-5xl">
                  {trust.headline}
                </h3>
              </header>

              <div>
                <dl className="grid gap-0 border-t border-hairline sm:grid-cols-3 sm:border-t-0">
                  {trust.points.map((point, index) => (
                    <div
                      key={point.title}
                      className="border-b border-hairline py-5 sm:border-b-0 sm:border-l sm:px-6 sm:first:border-l-0 sm:first:pl-0"
                    >
                      <dt className="font-display text-base font-semibold tracking-tight">
                        {point.title}
                      </dt>
                      <dd className="mt-2 max-w-xs text-sm leading-relaxed text-steel">
                        {point.line}
                      </dd>
                      <span className="mt-5 block font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </dl>

                <p className="mt-7 max-w-2xl text-sm leading-relaxed text-steel-muted">
                  {trust.note}
                </p>
              </div>
            </div>
          </div>
        </div>
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
