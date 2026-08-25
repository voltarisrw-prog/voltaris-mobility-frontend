import Image from 'next/image';
import Link from 'next/link';
import { RangeMeter } from './RangeMeter';
import { formatKm, formatKwh, formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

const CONDITION_LABEL: Record<VehicleSummary['condition'], string> = {
  new: 'New',
  used: 'Used',
  certified: 'Certified',
};

/**
 * The listing unit, used on the marketplace, in the aisles, on dealer and brand
 * pages, and in saved vehicles. Hierarchy is deliberate: image, then name and year,
 * then range, then the two specs people actually filter on, then price. Price is
 * prominent through weight and position rather than through size or colour — a huge
 * coloured number reads as a discount sticker, which is the wrong register.
 */
export function VehicleCard({
  vehicle,
  priority = false,
}: {
  vehicle: VehicleSummary;
  priority?: boolean;
}) {
  const title = `${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;
  const sold = vehicle.status === 'sold';

  return (
    <article className="group relative flex h-full flex-col border border-hairline bg-slab/40 transition-colors duration-200 ease-out hover:border-volt/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-abyss">
        {vehicle.primary_image ? (
          <Image
            src={vehicle.primary_image.card}
            alt={vehicle.primary_image.alt || title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 70vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            priority={priority}
            {...(vehicle.primary_image.blur_data_url
              ? { placeholder: 'blur' as const, blurDataURL: vehicle.primary_image.blur_data_url }
              : {})}
          />
        ) : (
          <div className="flex h-full items-center justify-center font-data text-eyebrow uppercase text-steel-muted">
            Photo coming
          </div>
        )}

        {/* Grade the base of the image so the badges never sit on a bright sky. */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-surface/80"
          aria-hidden="true"
        />

        <div className="absolute left-0 top-0 flex flex-col items-start gap-px">
          {vehicle.verified && (
            <span className="bg-volt px-2 py-1 font-data text-eyebrow uppercase text-surface">
              Verified
            </span>
          )}
          {sold && (
            <span className="bg-chrome px-2 py-1 font-data text-eyebrow uppercase text-surface">
              Sold
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div>
          <p className="eyebrow">
            {CONDITION_LABEL[vehicle.condition]} · {vehicle.location.city}
          </p>
          <h3 className="mt-2 font-display text-base font-semibold leading-tight tracking-tight">
            {/* The whole card is clickable via the stretched link, but only the title
                is announced as the link target to a screen reader. */}
            <Link href={`/cars/${vehicle.slug}`} className="after:absolute after:inset-0">
              {title}
            </Link>
          </h3>
          <p className="mt-1 font-data text-xs text-steel-muted">{vehicle.year}</p>
        </div>

        <RangeMeter rangeKm={vehicle.range_km} />

        <dl className="flex items-baseline gap-4 font-data text-xs text-steel">
          <div>
            <dt className="sr-only">Battery</dt>
            <dd className="tabular-nums">{formatKwh(vehicle.battery_kwh)}</dd>
          </div>
          <span aria-hidden="true" className="text-steel-muted">
            ·
          </span>
          <div>
            <dt className="sr-only">Odometer</dt>
            <dd className="tabular-nums">{formatKm(vehicle.mileage_km)}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-hairline/60 pt-4">
          <div>
            <p className="font-display text-lg font-semibold tabular-nums tracking-tight text-chrome">
              {formatPrice(vehicle.price, vehicle.currency)}
            </p>
            {vehicle.rental_price_per_day ? (
              <p className="mt-0.5 font-data text-xs text-steel-muted">
                or {formatPrice(vehicle.rental_price_per_day, vehicle.currency)} / day
              </p>
            ) : null}
          </div>
          <span className="font-data text-eyebrow uppercase text-steel-muted transition-colors group-hover:text-volt">
            View
          </span>
        </div>
      </div>
    </article>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="border border-hairline bg-slab/40" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-abyss" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse bg-hairline" />
        <div className="h-4 w-3/4 animate-pulse bg-hairline" />
        <div className="h-[3px] w-full bg-hairline" />
        <div className="h-3 w-1/2 animate-pulse bg-hairline" />
        <div className="h-6 w-32 animate-pulse bg-hairline" />
      </div>
    </div>
  );
}
