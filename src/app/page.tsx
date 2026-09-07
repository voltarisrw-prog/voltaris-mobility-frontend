import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroMedia } from '@/features/home/HeroMedia';
import { ShowcaseSlider } from '@/features/home/ShowcaseSlider';
import { UniversalSearch } from '@/features/vehicles/UniversalSearch';
import { WayIn } from '@/features/home/WayIn';
import { Garage } from '@/features/home/Garage';
import { RwandaInMotion } from '@/features/home/RwandaInMotion';
import { FinalStatement } from '@/features/home/FinalStatement';
import { PartnersHome } from '@/features/home/PartnersHome';
import { EnquireHome } from '@/features/home/EnquireHome';
import { JsonLd } from '@/components/JsonLd';
import { listVehicles } from '@/lib/api/vehicles';
import { buildMetadata, absoluteUrl } from '@/lib/seo/metadata';
import { site } from '@/config/site';
import { hero, showcase } from '@/content/home';
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
        <div className="shell relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-end py-10 pb-16 text-center sm:min-h-[88svh] sm:py-16 sm:pb-20 lg:pb-24">
          <div className="max-w-5xl animate-rise-in pb-4 sm:pb-6">
            <p className="mb-5 font-data text-[0.65rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)] sm:mb-6">
              {hero.eyebrow}
            </p>

            <h1 className="mt-0 max-w-5xl font-display text-hero">{hero.headline}</h1>

            <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:mt-6 sm:text-lg">
              {hero.sub}
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:mt-9 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href={hero.primaryCta.href}
                className="group inline-flex items-center justify-center gap-3 bg-volt px-7 py-4 font-data text-eyebrow uppercase tracking-[0.08em] text-surface transition-all duration-300 hover:bg-[color:var(--vds-brand-secondary)]"
              >
                {hero.primaryCta.label}
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href={hero.secondaryCta.href}
                className="inline-flex items-center justify-center border border-[color:var(--vds-text)]/40 px-7 py-4 font-data text-eyebrow uppercase tracking-[0.08em] text-[color:var(--vds-text)] transition-all duration-300 hover:border-[color:var(--vds-text)] hover:bg-[color:var(--vds-text)] hover:text-[color:var(--vds-bg)]"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 02 — MARKETPLACE SEARCH -------------------------------------------- */}
      <section className="border-y border-hairline bg-surface">
        <div className="shell py-10 sm:py-14 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.6fr] lg:items-end lg:gap-16">
            <div>
              <p className="font-data text-eyebrow uppercase tracking-[0.16em] text-volt">
                Find your next vehicle
              </p>
              <h2 className="mt-3 max-w-md text-3xl sm:text-4xl lg:text-5xl">
                Start with what you want to drive
              </h2>
            </div>

            <UniversalSearch />
          </div>
        </div>
      </section>

      {/* 02 — LIVE SHOWROOM ------------------------------------------------ */}
      {showcaseVehicles.length > 0 && (
        <>
          <div className="lane-rule" />

          <section className="relative isolate overflow-hidden border-y border-[color:var(--vds-border)]">
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
                <div className="flex flex-col gap-6 border-b border-[color:var(--vds-border)] pb-7 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
                  <div>
                    <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
                      Live inventory
                    </p>
                    <p className="mt-3 max-w-md font-display text-xl leading-tight text-[color:var(--vds-text)] sm:text-2xl">
                      Electric and hybrid vehicles currently available on Voltaris
                    </p>
                  </div>

                  <Link
                    href="/cars"
                    className="group inline-flex w-fit items-center gap-3 border-b border-[color:var(--vds-border)] pb-2 font-data text-[0.65rem] uppercase tracking-[0.16em] text-[color:var(--vds-text)] transition-colors hover:border-volt hover:text-[color:var(--vds-brand-secondary)]"
                  >
                    Explore all vehicles
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





      {/* 03 — CHOOSE YOUR POWERTRAIN ------------------------------------ */}
      <section className="border-y border-[color:var(--vds-border)] bg-[#0c0906]">
        <div className="shell py-16 sm:py-20 lg:py-28">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
              Find your fit
            </p>

            <h2 className="mt-3 text-4xl leading-[0.95] sm:text-5xl lg:text-6xl">
              Choose your powertrain
            </h2>

            <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-muted)] sm:text-lg">
              Two ways to move, one place to find the vehicle that fits your life
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/cars?fuel=electric"
              className="group relative min-h-[28rem] overflow-hidden border border-[color:var(--vds-border)] bg-[#15110d] sm:min-h-[34rem] lg:min-h-[40rem]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(92,200,255,0.16),transparent_62%)] transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/75 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-brand-secondary)]">
                  Fully electric
                </p>

                <h3 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">
                  Electric
                </h3>

                <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)] sm:text-base">
                  Quiet, responsive and designed for everyday electric driving
                </p>

                <span className="mt-7 inline-flex items-center gap-3 border-b border-white/30 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                  Explore electric
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>

            <Link
              href="/cars?fuel=hybrid"
              className="group relative min-h-[28rem] overflow-hidden border border-[color:var(--vds-border)] bg-[#15110d] sm:min-h-[34rem] lg:min-h-[40rem]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(174,255,96,0.11),transparent_62%)] transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0c0906] via-[#0c0906]/75 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-8 lg:p-10">
                <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-brand-secondary)]">
                  Electric + fuel
                </p>

                <h3 className="mt-2 text-4xl sm:text-5xl lg:text-6xl">
                  Hybrid
                </h3>

                <p className="mt-4 max-w-md font-sans text-sm leading-relaxed text-[color:var(--vds-text-muted)] sm:text-base">
                  Flexible power for city driving, longer journeys and everything between
                </p>

                <span className="mt-7 inline-flex items-center gap-3 border-b border-white/30 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-white transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                  Explore hybrid
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 04 — FIND YOUR WAY IN ----------------------------------------- */}
      <WayIn />

      {/* 05 — THE GARAGE ---------------------------------------------- */}
      <Garage />

      {/* 06 — RWANDA IN MOTION --------------------------------------- */}
      <RwandaInMotion />

      {/* 07 — FINAL STATEMENT ---------------------------------------- */}
      <FinalStatement />

      {/* 08 — PARTNERS ----------------------------------------------- */}
      <PartnersHome />

      {/* 09 — ENQUIRE ----------------------------------------------- */}
      <EnquireHome />

    </>
  );
}
