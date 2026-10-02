import { formatPrice } from '@/lib/format';
import type { VehicleSummary } from '@/types/vehicle';

/** One featured listing, as the coverflow shows it. */
export interface CoverCard {
  id: string;
  image: string | null;
  alt: string;
  year: number;
  title: string;
  city: string;
  price: string | null;
  verified: boolean;
  viewHref: string;
  dealHref: string;
  dealLabel: string;
}

/** A listing as a card in the featured fan: what it is, where, and what it costs. */
export function toCard(v: VehicleSummary): CoverCard {
  const title = `${v.make} ${v.model}`;
  return {
    id: v.id,
    image: v.primary_image ? v.primary_image.detail || v.primary_image.card : null,
    alt: v.primary_image?.alt || title,
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
