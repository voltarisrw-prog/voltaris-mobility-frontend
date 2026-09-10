'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

const CENTER_SIZE =
  'h-[26rem] w-[min(88vw,27rem)] sm:h-[40rem] sm:w-[28rem] md:h-[46rem] md:w-[32rem] lg:h-[52rem] lg:w-[38rem]';

const PEEK_SIZE =
  'h-[15rem] w-[calc(100vw-5rem)] max-w-[15rem] sm:h-[22rem] sm:w-[18rem] md:h-[25rem] md:w-[20rem] lg:h-[28rem] lg:w-[23rem]';

const SHOWCASE_IMAGES = [
  '/hero/gallery/hero-01.png',
  '/hero/gallery/hero-02.png',
  '/hero/gallery/hero-03.png',
  '/hero/gallery/hero-04.png',
  '/hero/gallery/hero-05.jpeg',
] as const;

const SHOWCASE_FALLBACK_IMAGE = '/hero/gallery/hero-01.png';

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
      renderPeek={(vehicle) => {
        const index = vehicles.findIndex((item) => item.id === vehicle.id);
        const image = SHOWCASE_IMAGES[index % SHOWCASE_IMAGES.length] ?? SHOWCASE_FALLBACK_IMAGE;

        return (
          <Image
            src={image}
            alt={`${vehicle.make} ${vehicle.model}`}
            fill
            sizes="(min-width: 1024px) 23rem, (min-width: 640px) 18rem, 90vw"
            className="object-contain p-2 sm:p-3 lg:p-4"
          />
        );
      }}
      renderCenter={(vehicle) => {
        const title = `${vehicle.make} ${vehicle.model}`;

        return (
          <>
            <Image
              src={
                SHOWCASE_IMAGES[
                  vehicles.findIndex((item) => item.id === vehicle.id) %
                    SHOWCASE_IMAGES.length
                ] ?? SHOWCASE_FALLBACK_IMAGE
              }
              alt={title}
              fill
              priority
              sizes="(min-width: 1024px) 38rem, (min-width: 768px) 32rem, (min-width: 640px) 28rem, 88vw"
              className="object-contain p-1 sm:p-2 lg:p-2"
            />

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

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-5 lg:p-6">
              <div className="min-w-0">
                <p className="font-data text-[0.56rem] uppercase tracking-[0.16em] text-white/60">
                  {vehicle.location.city}
                </p>

                <p className="mt-1 font-display text-lg font-semibold leading-none tracking-[-0.02em] text-white sm:text-xl">
                  {vehicle.price === null
                    ? 'Price on request'
                    : formatPrice(vehicle.price, vehicle.currency)}
                </p>
              </div>

              {vehicle.verified && (
                <span className="shrink-0 border border-white/30 bg-black/20 px-2.5 py-1.5 font-data text-[0.52rem] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                  Verified
                </span>
              )}
            </div>

            <div className="absolute inset-y-0 inset-x-0 z-10 pointer-events-none">
              <Link
                href={`/cars/${vehicle.slug}`}
                className="group pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 inline-flex min-h-11 items-center gap-1.5 rounded-full vds-link-outline px-2.5 py-2.5 font-data text-[0.52rem] font-bold uppercase tracking-[0.12em] text-black shadow-[0_12px_35px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1/2 hover:bg-white/90 hover:shadow-[0_16px_45px_-12px_rgba(0,0,0,0.7)] sm:left-5 sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3 sm:text-[0.56rem] sm:tracking-[0.14em] lg:left-6"
              >
                <span>View vehicle</span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href={
                  vehicle.listing_mode === 'rental'
                    ? `/cars/${vehicle.slug}?mode=rental`
                    : `/cars/${vehicle.slug}`
                }
                className="group pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 inline-flex min-h-11 items-center gap-1.5 rounded-full vds-link-outline px-2.5 py-2.5 font-data text-[0.52rem] font-bold uppercase tracking-[0.12em] text-black shadow-[0_12px_35px_-12px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1/2 hover:bg-white/90 hover:shadow-[0_16px_45px_-12px_rgba(0,0,0,0.7)] sm:right-5 sm:min-h-12 sm:gap-2 sm:px-4 sm:py-3 sm:text-[0.56rem] sm:tracking-[0.14em] lg:right-6"
              >
                <span>
                  {vehicle.listing_mode === 'rental'
                    ? 'Rent'
                    : vehicle.listing_mode === 'sale_and_rental'
                      ? 'Buy or Rent'
                      : 'Buy'}
                </span>
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>

          </>
        );
      }}
    />
  );
}
