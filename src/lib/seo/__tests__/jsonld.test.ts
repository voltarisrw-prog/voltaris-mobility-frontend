import { describe, expect, it } from 'vitest';
import { faqJsonLd, vehicleJsonLd } from '../jsonld';
import type { VehicleDetail } from '@/types/vehicle';

function vehicle(overrides: Partial<VehicleDetail> = {}): VehicleDetail {
  return {
    id: 'v1',
    slug: 'byd-atto-3-2023-kigali',
    make: 'BYD',
    model: 'Atto 3',
    year: 2023,
    price: 42_000_000,
    currency: 'RWF',
    mileage_km: 18_400,
    battery_kwh: 60.5,
    range_km: 420,
    body_type: 'suv',
    condition: 'used',
    location: { city: 'Kigali', slug: 'kigali' },
    listing_mode: 'sale',
    status: 'available',
    verified: true,
    primary_image: null,
    published_at: '2026-05-02T09:00:00Z',
    description: 'A well-kept Atto 3.',
    images: [],
    seller: { type: 'dealer', display_name: 'Kigali EV Motors', verified: true },
    drivetrain: 'fwd',
    power_kw: 150,
    seats: 5,
    doors: 5,
    charging: { ac_kw: 7, dc_kw: 88, port_type: 'CCS2', dc_10_80_minutes: 40 },
    features: [],
    financing_available: false,
    test_drive_available: true,
    purchase_enabled: false,
    rental_enabled: false,
    faqs: [],
    updated_at: '2026-05-10T09:00:00Z',
    ...overrides,
  };
}

describe('vehicleJsonLd', () => {
  it('emits an offer with the customer price and availability', () => {
    const data = vehicleJsonLd(vehicle()) as Record<string, Record<string, unknown>>;
    expect(data.offers?.price).toBe(42_000_000);
    expect(data.offers?.availability).toBe('https://schema.org/InStock');
  });

  it('omits the offer entirely when the price is on request', () => {
    // A placeholder price in structured data is misinformation, not a default.
    const data = vehicleJsonLd(vehicle({ price: null }));
    expect(data.offers).toBeUndefined();
  });

  it('marks a sold vehicle as sold out rather than dropping the page', () => {
    const data = vehicleJsonLd(vehicle({ status: 'sold' })) as Record<
      string,
      Record<string, unknown>
    >;
    expect(data.offers?.availability).toBe('https://schema.org/SoldOut');
  });

  it('never claims a used vehicle is new', () => {
    const data = vehicleJsonLd(vehicle({ condition: 'used' }));
    expect(data.itemCondition).toBe('https://schema.org/UsedCondition');
  });
});

describe('faqJsonLd', () => {
  it('returns null for an empty list so no invalid FAQPage is emitted', () => {
    expect(faqJsonLd([])).toBeNull();
  });

  it('builds one Question node per rendered FAQ', () => {
    const data = faqJsonLd([{ question: 'Q1', answer: 'A1' }]) as { mainEntity: unknown[] };
    expect(data.mainEntity).toHaveLength(1);
  });
});
