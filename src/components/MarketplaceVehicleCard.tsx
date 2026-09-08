import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BatteryCharging, Zap } from 'lucide-react';
import { CompareToggleButton } from './CompareToggleButton';
import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

export function MarketplaceVehicleCard({
  vehicle,
  priority = false,
  featured = false,
  mode,
}: {
  vehicle: VehicleSummary;
  priority?: boolean;
  featured?: boolean;
  mode?: 'sale' | 'rental';
}) {
  const title = `${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ''}`;

  const price =
    mode === 'rental'
      ? (vehicle.rental_price_per_day ?? null)
      : vehicle.price;

  const priceLabel =
    mode === 'rental' && vehicle.rental_price_per_day
      ? `${formatPrice(vehicle.rental_price_per_day, vehicle.currency)} / day`
      : price !== null
        ? formatPrice(price, vehicle.currency)
        : 'Price on request';

  const vehicleText =
    `${vehicle.make} ${vehicle.model} ${vehicle.variant ?? ''}`.toLowerCase();

  const isHybrid =
    /hybrid|recharge|\b500h\b|\b450h\b|\b300h\b/.test(vehicleText);

  const isElectric =
    !isHybrid &&
    vehicle.range_km > 50 &&
    vehicle.battery_kwh >= 20;

  const powertrainLabel = isHybrid
    ? 'Hybrid'
    : isElectric
      ? 'Full electric'
      : null;

  const actionHref =
    mode === 'rental'
      ? `/cars/${vehicle.slug}#rental-details`
      : `/checkout/start?vehicle=${encodeURIComponent(vehicle.id)}`;

  const actionLabel = mode === 'rental' ? 'Rent this car' : 'Order this car';

  return (
    <article
      className={`group relative overflow-hidden bg-slab ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      <div
        className={`relative overflow-hidden bg-abyss ${
          featured
            ? 'aspect-[16/10] sm:aspect-[16/9]'
            : 'aspect-[4/3] sm:aspect-[3/2]'
        }`}
      >
        {vehicle.primary_image ? (
          <Link
            href={`/cars/${vehicle.slug}`}
            className="absolute inset-0 z-0 block"
            aria-label={`View details for ${title}`}
          >
            <Image
              src={vehicle.primary_image.detail ?? vehicle.primary_image.card}
              alt={vehicle.primary_image.alt || title}
              fill
              sizes={
                featured
                  ? '(min-width: 1024px) 66vw, 100vw'
                  : '(min-width: 1024px) 33vw, 100vw'
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              priority={priority}
              {...(vehicle.primary_image.blur_data_url
                ? {
                    placeholder: 'blur' as const,
                    blurDataURL: vehicle.primary_image.blur_data_url,
                  }
                : {})}
            />
          </Link>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center font-data text-eyebrow uppercase text-steel-muted">
            Photos coming soon
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/10 to-black/20"
          aria-hidden="true"
        />

        {powertrainLabel && (
          <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
            <span className="inline-flex items-center gap-2 border border-white/25 bg-black/35 px-3 py-2 font-data text-[0.625rem] uppercase tracking-[0.16em] text-white backdrop-blur-md">
              {isHybrid ? (
                <BatteryCharging className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {powertrainLabel}
            </span>
          </div>
        )}

        <div className="absolute right-4 top-4 z-10 sm:right-5 sm:top-5">
          <CompareToggleButton
            vehicleId={vehicle.id}
            variant="icon"
            className="border-white/30 bg-black/30 text-white backdrop-blur-md hover:border-white"
          />
        </div>

        {vehicle.status === 'sold' && (
          <span className="absolute left-4 top-16 z-10 bg-surface/90 px-3 py-1.5 font-data text-eyebrow uppercase text-chrome backdrop-blur-sm sm:left-5">
            Sold
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-5">
            <Link
              href={`/cars/${vehicle.slug}`}
              className="block text-white"
              aria-label={`Explore ${title}`}
            >
              <p className="font-data text-[0.625rem] uppercase tracking-[0.18em] text-white/65">
                {vehicle.year} · {vehicle.location.city}
              </p>

              <h2
                className={`mt-1 max-w-[80%] font-display font-semibold tracking-tight ${
                  featured
                    ? 'text-2xl sm:text-3xl lg:text-4xl'
                    : 'text-xl sm:text-2xl'
                }`}
              >
                {title}
              </h2>

              <p className="mt-2 font-data text-sm tabular-nums text-white/90">
                {priceLabel}
              </p>
            </Link>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {mode ? (
                <Link
                  href={actionHref}
                  className="inline-flex min-h-9 items-center gap-2 bg-volt px-3.5 py-2 font-data text-[0.58rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-volt-bright sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-[0.625rem]"
                >
                  {actionLabel}
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link
                    href={`/checkout/start?vehicle=${encodeURIComponent(vehicle.id)}`}
                    className="inline-flex min-h-9 items-center gap-2 bg-volt px-3.5 py-2 font-data text-[0.58rem] uppercase tracking-[0.14em] text-surface transition-colors hover:bg-volt-bright sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-[0.625rem]"
                  >
                    Order
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>

                  <Link
                    href={`/cars/${vehicle.slug}#rental-details`}
                    className="inline-flex min-h-9 items-center gap-2 border border-white/35 bg-black/25 px-3.5 py-2 font-data text-[0.58rem] uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors hover:border-white sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-[0.625rem]"
                  >
                    Rent
                  </Link>

                  <Link
                    href={`/test-drive?vehicle=${encodeURIComponent(vehicle.id)}`}
                    className="inline-flex min-h-9 items-center gap-2 border border-white/35 bg-black/25 px-3.5 py-2 font-data text-[0.58rem] uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors hover:border-white sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-[0.625rem]"
                  >
                    Book free demo drive
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </>
              )}

              <Link
                href={`/cars/${vehicle.slug}`}
                className="inline-flex min-h-9 items-center gap-2 border border-white/35 bg-black/25 px-3.5 py-2 font-data text-[0.58rem] uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors hover:border-white sm:min-h-10 sm:px-4 sm:py-2.5 sm:text-[0.625rem]"
              >
                View details
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
