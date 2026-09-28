import { formatPrice } from '@/lib/format';

export function priceLabelFor(price: number | null, perDay: number | null | undefined, mode: 'sale' | 'rental') {
  if (mode === 'rental') return perDay ? `${formatPrice(perDay)} / day` : 'Rental on request';
  return price === null ? 'Price on request' : formatPrice(price);
}
