'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import type { VehicleSummary } from '@/types/vehicle';

const CENTER_SIZE =
  'h-[27rem] w-[calc(100vw-1rem)] max-w-[27rem] sm:h-[32rem] sm:w-[26rem] md:h-[36rem] md:w-[30rem] lg:h-[42rem] lg:w-[34rem]';

const PEEK_SIZE =
  'h-[18rem] w-[calc(100vw-4rem)] max-w-[18rem] sm:h-[22rem] sm:w-[18rem] md:h-[25rem] md:w-[20rem] lg:h-[28rem] lg:w-[23rem]';

export function ShowcaseSlider({
  vehicles,
}: {
  vehicles: VehicleSummary[];
}) {
  return (
    <CoverflowShowcase
      items={vehicles}
      getKey={(vehicle) => vehicle.id}
      ariaLabel="Showroom highlights"
      peekLabel={(vehicle) => `View ${vehicle.make} ${vehicle.model}`}
      centerSizeClassName={CENTER_SIZE}
      peekSizeClassName={PEEK_SIZE}
      renderPeek={(vehicle) =>
        vehicle.primary_image && (
          <Image
            src={vehicle.primary_image.card}
            alt=""
            fill
            sizes="(min-width: 1024px) 23rem, (min-width: 640px) 18rem, 90vw"
            className="object-contain p-3 sm:p-4 lg:p-5"
          />
        )
      }
      renderCenter={(vehicle) => {
        const title = `${vehicle.make} ${vehicle.model}`;
        const detailHref = `/cars/${vehicle.slug}`;

        return (
          <>
            {vehicle.primary_image ? (
              <Image
                src={vehicle.primary_image.detail}
                alt={vehicle.primary_image.alt || title}
                fill
                priority
                sizes="(min-width: 1024px) 34rem, (min-width: 768px) 30rem, (min-width: 640px) 26rem, calc(100vw - 1rem)"
                className="object-contain p-2.5 sm:p-4 lg:p-5"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-data text-[0.62rem] uppercase tracking-[0.14em] text-steel-muted">
                Photo coming
              </div>
            )}

            <div
              className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75"
              aria-hidden="true"
            />

            <div className="absolute inset-x-0 top-0 z-10 p-4 sm:p-5 lg:p-6">
              <p className="font-data text-[0.58rem] uppercase tracking-[0.18em] text-white/70">
                {vehicle.year}
              </p>

              <h3 className="mt-1 max-w-[75%] font-display text-xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-2xl lg:text-[1.7rem]">
                {title}
              </h3>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[90] -translate-y-1/2 px-3 sm:px-5 lg:px-7">
              <div className="pointer-events-auto relative flex w-full items-center justify-between gap-3">
                <Link
                  href="/ride"
                  className="group inline-flex min-h-11 max-w-[46%] items-center justify-center gap-2 rounded-full bg-white px-4 py-3 font-data text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-surface shadow-lg transition-all duration-200 hover:bg-volt hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-volt sm:flex-none sm:px-5"
                >
                  Book a Ride
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href={detailHref}
                  className="group inline-flex min-h-11 max-w-[46%] items-center justify-center gap-2 rounded-full border border-white/70 bg-black/55 px-4 py-3 font-data text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white hover:bg-white hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:flex-none sm:px-5"
                >
                  Buy
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </>
        );
      }}
    />
  );
}
