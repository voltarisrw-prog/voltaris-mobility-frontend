'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

const CENTER_SIZE =
  'h-[clamp(24rem,78vw,30rem)] w-[min(88vw,30rem)] sm:h-[clamp(30rem,68vw,38rem)] sm:w-[min(78vw,30rem)] md:h-[clamp(34rem,62vw,44rem)] md:w-[min(70vw,34rem)] lg:h-[clamp(38rem,54vw,52rem)] lg:w-[min(58vw,40rem)] 2xl:h-[58rem] 2xl:w-[42rem]';

const PEEK_SIZE =
  'h-[clamp(14rem,48vw,17rem)] w-[min(72vw,17rem)] sm:h-[clamp(18rem,48vw,22rem)] sm:w-[min(58vw,19rem)] md:h-[clamp(20rem,44vw,26rem)] md:w-[min(50vw,22rem)] lg:h-[clamp(23rem,38vw,29rem)] lg:w-[min(42vw,25rem)] 2xl:h-[31rem] 2xl:w-[25rem]';

console.log('SHOWCASE IMAGE DEBUG');
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
            className="object-contain p-1 sm:p-2 lg:p-2"
          />
        )
      }
      renderCenter={(vehicle) => {
        const title = `${vehicle.make} ${vehicle.model}`;

        return (
          <>
            {vehicle.primary_image ? (
              <Image
                src={vehicle.primary_image.detail}
                alt={vehicle.primary_image.alt || title}
                fill
                priority
                sizes="(min-width: 1024px) 38rem, (min-width: 768px) 32rem, (min-width: 640px) 28rem, 88vw"
                className="object-contain p-0 sm:p-1 lg:p-1"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-data text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--vds-text-muted)]">
                Photo coming
              </div>
            )}

            <div
              className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/75"
              aria-hidden="true"
            />

            <div className="absolute inset-x-0 top-0 z-10 p-4 sm:p-5 lg:p-6">
              <p className="font-data text-[0.58rem] font-bold uppercase tracking-[0.18em] text-white">
                {vehicle.year}
              </p>

              <h3 className="mt-1 max-w-[75%] font-display text-xl font-semibold leading-none tracking-[-0.03em] text-white sm:text-2xl lg:text-[1.7rem]">
                {title}
              </h3>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-4 sm:p-5 lg:p-6">
              <div className="min-w-0">
                <p className="font-data text-[0.56rem] font-bold uppercase tracking-[0.16em] text-white">
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
