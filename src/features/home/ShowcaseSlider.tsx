'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Car, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * A cylinder-style showcase: the current vehicle sits large and centered, the
 * previous and next sit smaller and rotated on either side, and everything
 * beyond that is parked out of view as an animation buffer rather than
 * unmounted — so advancing never pops or jump-cuts.
 *
 * Only the center card carries interactive text (name, a test-drive link, a
 * link to the full listing, the price). The side cards are a preview, not a
 * second set of targets — they're a button that brings that vehicle to
 * center, nothing more, which keeps tab order sane: one real set of links at
 * a time, not three.
 */
export function ShowcaseSlider({ vehicles }: { vehicles: VehicleSummary[] }) {
  const [current, setCurrent] = useState(0);
  const count = vehicles.length;

  const go = useCallback(
    (direction: -1 | 1) => {
      if (count === 0) return;
      setCurrent((value) => (value + direction + count) % count);
    },
    [count],
  );

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') go(-1);
    if (event.key === 'ArrowRight') go(1);
  };

  if (count === 0) return null;

  // Derived, not stored: if a revalidated fetch returns fewer vehicles than
  // the current index, this falls back to a valid one on the very next
  // render rather than needing an effect to correct state after the fact.
  const safeCurrent = current % count;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Showroom highlights"
      className="relative py-6 sm:py-10"
    >
      <div
        onKeyDown={onKeyDown}
        className="relative mx-auto flex h-[26rem] max-w-shell items-center justify-center overflow-hidden sm:h-[30rem] lg:h-[36rem]"
        style={{ perspective: '1800px' }}
      >
        {vehicles.map((vehicle, index) => (
          <ShowcaseCard
            key={vehicle.id}
            vehicle={vehicle}
            offset={circularOffset(index, safeCurrent, count)}
            onSelect={() => setCurrent(index)}
          />
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-surface/70 text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt sm:left-4 sm:flex lg:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center border border-hairline bg-surface/70 text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt sm:right-4 sm:flex lg:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Mobile: the hero arrows above are hidden below `sm` (thumb reach on a
          narrow screen makes edge-of-viewport buttons awkward) — swipe the
          side cards or tap one to bring it to center instead. A visible pair
          of on-card controls stands in for the arrows there. */}
      {count > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3 sm:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous"
            className="inline-flex h-10 w-10 items-center justify-center border border-hairline text-chrome"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next"
            className="inline-flex h-10 w-10 items-center justify-center border border-hairline text-chrome"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}

/** Shortest signed distance around the loop — e.g. for 5 items, -2..2. */
function circularOffset(index: number, current: number, length: number): number {
  let diff = (index - current) % length;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

function ShowcaseCard({
  vehicle,
  offset,
  onSelect,
}: {
  vehicle: VehicleSummary;
  offset: number;
  onSelect: () => void;
}) {
  const abs = Math.abs(offset);
  const isCenter = offset === 0;
  const title = `${vehicle.make} ${vehicle.model}`;
  const detailHref = `/cars/${vehicle.slug}`;

  // Beyond ±1 the card exists only so the next step in either direction has
  // something to animate in from — it is never meant to be seen mid-transition.
  const hidden = abs > 1;
  const style: React.CSSProperties = {
    transform: `translateX(${offset * 62}%) scale(${isCenter ? 1 : 0.74}) rotateY(${offset * -22}deg)`,
    opacity: hidden ? 0 : isCenter ? 1 : 0.55,
    zIndex: 20 - abs * 5,
    pointerEvents: hidden ? 'none' : 'auto',
  };

  if (!isCenter) {
    return (
      <button
        type="button"
        onClick={onSelect}
        aria-label={`View ${title}`}
        tabIndex={hidden ? -1 : 0}
        style={style}
        className="absolute h-[20rem] w-[16rem] shrink-0 overflow-hidden border border-hairline/60 bg-abyss transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none sm:h-[23rem] sm:w-[19rem] lg:h-[27rem] lg:w-[22rem]"
      >
        {vehicle.primary_image && (
          <Image
            src={vehicle.primary_image.card}
            alt=""
            fill
            sizes="22rem"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-surface/45" aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      style={style}
      className="absolute h-[24rem] w-[19rem] shrink-0 overflow-hidden border border-hairline bg-abyss shadow-[0_30px_60px_-15px_rgba(0,3,12,0.7)] transition-[transform,opacity] duration-500 ease-out motion-reduce:transition-none sm:h-[28rem] sm:w-[23rem] lg:h-[34rem] lg:w-[28rem]"
    >
      {vehicle.primary_image ? (
        <Image
          src={vehicle.primary_image.detail}
          alt={vehicle.primary_image.alt || title}
          fill
          priority
          sizes="(min-width: 1024px) 28rem, (min-width: 640px) 23rem, 19rem"
          className="object-cover"
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

      {/* 1 — name, top. Also the stretched click target for the card itself,
          via the ::after overlay — same pattern VehicleCard uses, so a click
          anywhere on the photo that isn't one of the three elements below
          still goes to the listing, without nesting a link inside a link. */}
      <div className="absolute inset-x-4 top-4">
        <p className="eyebrow text-steel-muted/90">{vehicle.year}</p>
        <Link href={detailHref} className="mt-1 block after:absolute after:inset-0">
          <span className="font-display text-xl font-semibold tracking-tight text-chrome sm:text-2xl">
            {title}
          </span>
        </Link>
      </div>

      {/* 2 — book a test drive, left. */}
      <Link
        href={`/test-drive?vehicle=${vehicle.slug}`}
        className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-chrome/70 bg-surface/70 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt"
      >
        <Car className="h-3.5 w-3.5" aria-hidden="true" />
        Free ride
      </Link>

      {/* 3 — everything about it, right. */}
      <Link
        href={detailHref}
        className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-volt/60 bg-volt/10 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-volt backdrop-blur-sm transition-colors hover:bg-volt hover:text-surface"
      >
        More
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>

      {/* 4 — price, bottom. The number itself, not a marketing line — a
          "premium marketplace" reads as premium from the car and the
          typography, not from a discount-sticker phrase on top of it. */}
      <Link
        href={detailHref}
        className="absolute inset-x-4 bottom-4 z-10 flex items-baseline justify-between"
      >
        <span className="font-data text-lg font-semibold tabular-nums text-chrome sm:text-xl">
          {formatPrice(vehicle.price, vehicle.currency)}
        </span>
        {vehicle.verified && (
          <span className="font-data text-[0.65rem] uppercase tracking-wide text-volt">
            Verified
          </span>
        )}
      </Link>
    </div>
  );
}
