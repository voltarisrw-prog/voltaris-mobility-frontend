'use client';

import Image from 'next/image';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import type { VehicleSummary } from '@/types/vehicle';

const CENTER_SIZE =
  'h-[34rem] w-[min(92vw,30rem)] sm:h-[40rem] sm:w-[28rem] md:h-[46rem] md:w-[32rem] lg:h-[52rem] lg:w-[38rem]';

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

        return (
          <>
            {vehicle.primary_image ? (
              <Image
                src={vehicle.primary_image.detail}
                alt={vehicle.primary_image.alt || title}
                fill
                priority
                sizes="(min-width: 1024px) 38rem, (min-width: 768px) 32rem, (min-width: 640px) 28rem, 92vw"
                className="object-contain p-1 sm:p-2 lg:p-3"
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


          </>
        );
      }}
    />
  );
}
