import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HeroMedia } from '@/features/home/HeroMedia';
import { ShowcaseSlider } from '@/features/home/ShowcaseSlider';
import { RoadTransition } from '@/features/home/RoadTransition';
import { WayIn } from '@/features/home/WayIn';
import { Garage } from '@/features/home/Garage';
import { RwandaInMotion } from '@/features/home/RwandaInMotion';
import { FinalStatement } from '@/features/home/FinalStatement';
import { PartnersHome } from '@/features/home/PartnersHome';
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

      {/* 02 — LIVE SHOWROOM ------------------------------------------------ */}
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
                    <div className="flex justify-center">
  <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-hairline bg-surface/80 px-5 text-center backdrop-blur-sm sm:h-32 sm:w-32 lg:h-36 lg:w-36">
    <span
      className="font-data text-[0.62rem] uppercase leading-[1.35] tracking-[0.2em] text-chrome sm:text-[0.68rem]"
    >
      Live<br />showroom
    </span>
  </div>
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





      {/* 03 — THE ROAD --------------------------------------------------- */}
      <RoadTransition />

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

    </>
  );
}
