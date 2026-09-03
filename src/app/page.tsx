import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroMedia } from '@/features/home/HeroMedia';
import { ShowcaseSlider } from '@/features/home/ShowcaseSlider';
import { JsonLd } from '@/components/JsonLd';
import { listVehicles } from '@/lib/api/vehicles';
import { buildMetadata, absoluteUrl } from '@/lib/seo/metadata';
import { site } from '@/config/site';
import { HomeInquiryForm } from '@/features/home/HomeInquiryForm';
import {
  finalCta,
  hero,
  inquiry,
  sell,
  showcase,
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
  const showcaseVehicles = await listVehicles({ ...showcase.query })
    .then((page) => page.items.slice(0, 6))
    .catch(() => [] as VehicleSummary[]);

  return (
    <>
      <JsonLd data={websiteJsonLd()} />

      {/* 01 — HERO ------------------------------------------------------- */}
      <section className="relative isolate overflow-hidden">
        <HeroMedia />
        <div className="shell relative flex min-h-[100svh] flex-col items-center justify-center py-16 text-center sm:py-20">
          <div className="max-w-5xl animate-rise-in pb-20 sm:pb-24">
            <h1 className="mt-0 max-w-5xl font-display text-hero">{hero.headline}</h1>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={hero.primaryCta.href}
                className="bg-volt px-7 py-4 font-data text-eyebrow uppercase text-surface transition-colors hover:bg-volt-bright"
              >
                {hero.primaryCta.label}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 02 — THE SHOWCASE ------------------------------------------------ */}
      {showcaseVehicles.length > 0 && (
        <>
          <div className="lane-rule" />

          <section className="relative isolate overflow-hidden border-y border-hairline">
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_55%_70%_at_50%_45%,rgba(92,200,255,0.08),transparent_68%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0c0906] via-[#0c0906]/70 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/60 to-transparent"
              aria-hidden="true"
            />

            <div className="relative py-16 sm:py-20 lg:py-24">
              <header className="shell">
                <div className="flex flex-col gap-8 border-b border-hairline pb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                  <div>
                    <div className="flex items-center gap-4">
                      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-volt/60 motion-reduce:hidden" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-volt" />
                      </span>

                      <h2 className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-none tracking-[-0.055em] text-chrome">
                        Live showroom
                      </h2>
                    </div>
                  </div>

                  <Link
                    href="/cars"
                    className="group inline-flex w-fit items-center gap-3 border-b border-chrome/50 pb-2 font-data text-[0.65rem] uppercase tracking-[0.16em] text-chrome transition-colors hover:border-volt hover:text-volt"
                  >
                    View all
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </header>

              <div className="mt-2 sm:mt-4">
                <ShowcaseSlider vehicles={showcaseVehicles} />
              </div>
            </div>
          </section>
        </>
      )}

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
      <section className="relative overflow-hidden border-t border-hairline">
        <div className="shell py-28 sm:py-36">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:gap-24">
            <header className="max-w-4xl">
              <p className="eyebrow">{sell.eyebrow}</p>
              <h2 className="mt-5 font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                {sell.headline}
              </h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-steel sm:text-xl">
                {sell.sub}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
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
            </header>

            <ol className="border-t border-hairline">
              {sell.steps.map((step) => (
                <li
                  key={step.n}
                  className="grid grid-cols-[3rem_minmax(0,1fr)] gap-5 border-b border-hairline py-6 sm:grid-cols-[4rem_minmax(0,1fr)] sm:py-8"
                >
                  <span className="font-data text-eyebrow text-volt">{step.n}</span>
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm leading-relaxed text-steel">
                      {step.line}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* 12 — ENQUIRY --------------------------------------------------- */}
      <section className="relative overflow-hidden border-t border-hairline">
        <div className="shell py-28 sm:py-36">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-24">
            <header className="max-w-xl">
              <p className="eyebrow">{inquiry.eyebrow}</p>

              <h2 className="mt-6 max-w-3xl font-display text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[0.86] tracking-[-0.06em]">
                {inquiry.headline}
              </h2>

              <p className="mt-7 max-w-md text-lg leading-relaxed text-steel sm:text-xl">
                {inquiry.sub}
              </p>

              <ul className="mt-10 space-y-4 border-t border-hairline pt-7">
                {inquiry.points.map((point, index) => (
                  <li
                    key={point}
                    className="flex items-baseline gap-4 text-sm text-steel"
                  >
                    <span className="font-data text-[0.6rem] uppercase tracking-[0.16em] text-volt">
                      0{index + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </header>

            <div className="lg:pt-4">
              <div className="border-t border-chrome pt-6 sm:pt-8">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <p className="font-data text-[0.62rem] uppercase tracking-[0.18em] text-chrome">
                    Start a conversation
                  </p>
                  <span className="font-data text-[0.58rem] uppercase tracking-[0.16em] text-steel-muted">
                    Voltaris / Enquiry
                  </span>
                </div>

                <HomeInquiryForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13 — FINAL CTA --------------------------------------------------- */}
      <section className="relative isolate overflow-hidden border-t border-hairline">
        <div className="vanishing-glow absolute inset-0 opacity-60" aria-hidden="true" />

        <div className="shell relative py-32 sm:py-44">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)] lg:items-end lg:gap-20">
            <div>
              <p className="eyebrow">Voltaris Mobility</p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-steel-muted">
                A better way to move through Rwanda.
              </p>
            </div>

            <div>
              <h2 className="max-w-5xl font-display text-[clamp(3.75rem,9vw,8rem)] font-semibold leading-[0.82] tracking-[-0.065em]">
                {finalCta.headline}
              </h2>

              <div className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
                <Link
                  href={finalCta.primaryCta.href}
                  className="group inline-flex items-center gap-3 border-b border-chrome pb-2 font-data text-eyebrow uppercase tracking-[0.12em] text-chrome transition-colors hover:border-volt hover:text-volt"
                >
                  {finalCta.primaryCta.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href={finalCta.secondaryCta.href}
                  className="font-data text-eyebrow uppercase tracking-[0.12em] text-steel-muted transition-colors hover:text-chrome"
                >
                  {finalCta.secondaryCta.label}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
