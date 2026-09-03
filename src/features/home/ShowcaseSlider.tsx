'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Car } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

const CENTER_SIZE = 'h-[24rem] w-[19rem] sm:h-[28rem] sm:w-[23rem] lg:h-[34rem] lg:w-[28rem]';
const PEEK_SIZE = 'h-[20rem] w-[16rem] sm:h-[23rem] sm:w-[19rem] lg:h-[27rem] lg:w-[22rem]';

/**
 * The homepage showroom highlight reel. Only the center card carries
 * interactive text (name, a test-drive link, a link to the full listing, the
 * price) — see CoverflowShowcase for why side cards are select-only.
 */
export function ShowcaseSlider({ vehicles }: { vehicles: VehicleSummary[] }) {
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
            sizes="22rem"
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
                sizes="(min-width: 1024px) 28rem, (min-width: 640px) 23rem, 19rem"
                className="object-contain p-3 sm:p-4 lg:p-5"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-data text-eyebrow uppercase text-steel-muted">
                Photo coming
              </div>
            )}

            {/* Top and bottom scrims — the four elements below sit on real
                gradients, not raw photo, whatever the car's own colour is. */}
            <div
              className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface/85 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface/90 to-transparent"
              aria-hidden="true"
            />

            {/* 1 — name, top. Also the stretched click target for the card
                itself, via the ::after overlay — same pattern VehicleCard
                uses, so a click anywhere on the photo that isn't one of the
                three elements below still goes to the listing, without
                nesting a link inside a link. */}
            <div className="absolute inset-x-4 top-4">
              <p className="eyebrow text-steel-muted/90">{vehicle.year}</p>
              <Link href={detailHref} className="mt-1 block after:absolute after:inset-0">
                <span className="font-display text-xl font-semibold tracking-tight text-chrome sm:text-2xl">
                  {title}
                </span>
              </Link>
            </div>

            <div className="absolute inset-x-4 bottom-3 z-10 flex items-end justify-between gap-4 sm:bottom-4">
              <Link
                href={`/test-drive?vehicle=${vehicle.slug}`}
                className="group inline-flex min-h-10 items-center gap-2 border border-chrome/70 bg-surface/75 px-3.5 py-2.5 font-data text-[0.62rem] uppercase tracking-[0.14em] text-chrome backdrop-blur-md transition-colors hover:border-volt hover:text-volt sm:min-h-11 sm:px-4"
              >
                <Car className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Book a ride</span>
              </Link>

              <Link
                href={detailHref}
                className="group inline-flex min-h-10 items-center gap-2 border-b border-volt px-1 pb-2 font-data text-[0.62rem] uppercase tracking-[0.14em] text-volt transition-colors hover:text-volt-bright sm:min-h-11"
              >
                <span>View vehicle</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>

            {/* 4 — price, bottom. The number itself, not a marketing line —
                a "premium marketplace" reads as premium from the car and
                the typography, not from a discount-sticker phrase on top
                of it. */}
            <div className="absolute inset-x-4 bottom-16 z-10 flex items-baseline justify-between sm:bottom-[4.5rem]">
              <span className="font-data text-lg font-semibold tabular-nums text-chrome sm:text-xl">
                {formatPrice(vehicle.price, vehicle.currency)}
              </span>
              {vehicle.verified && (
                <span className="font-data text-[0.62rem] uppercase tracking-[0.14em] text-volt">
                  Verified
                </span>
              )}
            </div>
          </>
        );
      }}
    />
  );
}
