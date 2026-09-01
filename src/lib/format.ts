import { site } from '@/config/site';

const priceFormatter = new Intl.NumberFormat('en-RW', {
  style: 'currency',
  currency: site.currency,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-RW');

export function formatPrice(amount: number | null, currency: string = site.currency): string {
  if (amount === null) return 'Price on request';
  if (currency !== site.currency) {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return priceFormatter.format(amount);
}

export function formatKm(value: number): string {
  return `${numberFormatter.format(Math.round(value))} km`;
}

export function formatKwh(value: number): string {
  return `${value} kWh`;
}

export function cn(...values: (string | false | null | undefined)[]): string {
  return values.filter(Boolean).join(' ');
}

/** Shared by ProsePage and the guide/blog table of contents — one definition of
    "how a heading becomes a URL fragment" for the whole site. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}