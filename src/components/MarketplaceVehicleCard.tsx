import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
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

  return (
    <article
      className={`group relative overflow-hidden bg-slab ${
        featured
          ? 'lg:col-span-2'
          : ''
      }`}
    >
      <Link
        href={`/cars/${vehicle.slug}`}
        className="block"
        aria-label={`Explore ${title}`}
      >
        <div
          className={`relative overflow-hidden bg-abyss ${
            featured
              ? 'aspect-[16/10] sm:aspect-[16/9]'
              : 'aspect-[4/3] sm:aspect-[3/2]'
          }`}
        >
          {vehicle.primary_image ? (
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
          ) : (
            <div className="flex h-full items-center justify-center font-data text-eyebrow uppercase text-steel-muted">
              Photos coming soon
            </div>
          )}

          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70"
            aria-hidden="true"
          />

          {vehicle.status === 'sold' && (
            <span className="absolute left-5 top-5 bg-surface/90 px-3 py-1.5 font-data text-eyebrow uppercase text-chrome backdrop-blur-sm">
              Sold
            </span>
          )}

          <div className="absolute right-4 top-4 z-10">
            <CompareToggleButton
              vehicleId={vehicle.id}
              variant="icon"
              className="border-white/30 bg-black/25 text-white backdrop-blur-md hover:border-white"
            />
          </div>

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:p-6">
            <div className="min-w-0 text-white">
              <p className="font-data text-[0.6875rem] uppercase tracking-[0.16em] text-white/70">
                {vehicle.year} · {vehicle.location.city}
              </p>

              <h2
                className={`mt-1 font-display font-semibold tracking-tight ${
                  featured
                    ? 'text-xl sm:text-2xl lg:text-3xl'
                    : 'text-lg sm:text-xl'
                }`}
              >
                {title}
              </h2>

              <p className="mt-2 font-data text-sm tabular-nums text-white/90">
                {priceLabel}
              </p>
            </div>

            <span
              aria-hidden="true"
              className="hidden shrink-0 items-center gap-2 border border-white/30 bg-black/20 px-3 py-2 font-data text-[0.6875rem] uppercase tracking-[0.14em] text-white backdrop-blur-md transition-colors group-hover:border-white sm:inline-flex"
            >
              Explore
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
