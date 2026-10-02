import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

/** One featured listing, as the showroom shows it. */
export interface CoverCard {
  id: string;
  image: string | null;
  /** The photo's own proportions, so the car is shown whole. */
  width: number;
  height: number;
  alt: string;
  /** The model's name, lettered on the studio wall behind the car. */
  wordmark: string;
  year: number;
  title: string;
  city: string;
  price: string | null;
  verified: boolean;
  viewHref: string;
  dealHref: string;
  dealLabel: string;
}

/** A listing as the showroom shows it: what it is, where, and what it costs. */
export function toCard(v: VehicleSummary): CoverCard {
  const title = `${v.make} ${v.model}`;
  return {
    id: v.id,
    image: v.primary_image ? v.primary_image.detail || v.primary_image.card : null,
    width: v.primary_image?.width || 3,
    height: v.primary_image?.height || 2,
    alt: v.primary_image?.alt || title,
    wordmark: v.model,
    year: v.year,
    title,
    city: v.location.city,
    price: v.price === null ? null : formatPrice(v.price, v.currency),
    verified: v.verified,
    viewHref: `/cars/${v.slug}`,
    dealHref: v.listing_mode === 'rental' ? `/cars/${v.slug}?mode=rental` : `/cars/${v.slug}`,
    dealLabel:
      v.listing_mode === 'rental'
        ? 'Rent'
        : v.listing_mode === 'sale_and_rental'
          ? 'Buy or rent'
          : 'Buy',
  };
}
