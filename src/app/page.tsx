import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroMedia } from '@/features/home/HeroMedia';
import { ShowcaseSlider } from '@/features/home/ShowcaseSlider';
import { PowertrainShowcase } from '@/features/home/PowertrainShowcase';
import { RoadTransition } from '@/features/home/RoadTransition';
import { Garage } from '@/features/home/Garage';
import { EnquireHome } from '@/features/home/EnquireHome';
import { ContactHome } from '@/features/home/ContactHome';
import { NetworkHome } from '@/features/home/NetworkHome';
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
            <p className="mb-5 font-sans text-lg font-medium tracking-[0.02em] text-white sm:mb-6 sm:text-xl">
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

      {/* 05 — WORTH A CLOSER LOOK ----------------------------------------- */}
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
                      Worth a closer look
                    </p>
                    <p className="mt-3 max-w-md font-display text-xl leading-tight text-[color:var(--vds-text)] sm:text-2xl">
                      A few vehicles that deserve your attention
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
                <PowertrainShowcase />
              </div>
            </div>
          </section>
        </>
      )}




      {/* 06 — BEYOND THE SHOWROOM ------------------------------------- */}
      <RoadTransition />

      {/* 07 — THE GARAGE -------------------------------------------- */}
      <Garage />

      {/* 09 — ENQUIRE ----------------------------------------------- */}
      <EnquireHome />

      {/* 10 — TALK TO VOLTARIS --------------------------------------- */}
      <ContactHome />

      {/* 11 — OUR NETWORK --------------------------------------------- */}
      <NetworkHome />

    </>
  );
}
