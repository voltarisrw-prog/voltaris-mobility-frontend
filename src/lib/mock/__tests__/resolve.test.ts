import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import type { Page } from '@/types/api';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';
import { resolveMock } from '../resolve';

describe('resolveMock — vehicles', () => {
  it('returns undefined for an unmocked path, so request() falls through to the network', () => {
    expect(resolveMock('/orders/123', {})).toBeUndefined();
  });

  it('lists vehicles and excludes sold ones', () => {
    const page = resolveMock<Page<VehicleSummary>>('/vehicles', { query: {} });
    expect(page).toBeDefined();
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((v) => v.status !== 'sold')).toBe(true);
  });

  it('filters by verified and mode', () => {
    const page = resolveMock<Page<VehicleSummary>>('/vehicles', {
      query: { verified: 'true', mode: 'rental' },
    });
    expect(page!.items.every((v) => v.verified)).toBe(true);
    expect(page!.items.every((v) => v.listing_mode !== 'sale')).toBe(true);
    expect(page!.items.length).toBeGreaterThan(0);
  });

  it('filters by minRange for the "long range" aisle query', () => {
    const page = resolveMock<Page<VehicleSummary>>('/vehicles', { query: { minRange: 350 } });
    expect(page!.items.every((v) => v.range_km >= 350)).toBe(true);
  });

  it('sorts by price_desc', () => {
    const page = resolveMock<Page<VehicleSummary>>('/vehicles', { query: { sort: 'price_desc' } });
    const prices = page!.items.map((v) => v.price ?? 0);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('resolves a vehicle by slug', () => {
    const vehicle = resolveMock<VehicleDetail>('/vehicles/by-slug/tesla-model-s-2024-kigali', {});
    expect(vehicle?.make).toBe('Tesla');
  });

  it('throws a 404 ApiError for an unknown slug, matching real not-found handling', () => {
    expect(() => resolveMock<VehicleDetail>('/vehicles/by-slug/not-a-real-car', {})).toThrow(
      ApiError,
    );
    try {
      resolveMock<VehicleDetail>('/vehicles/by-slug/not-a-real-car', {});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).isNotFound).toBe(true);
    }
  });

  it('still resolves a sold vehicle by slug even though it is excluded from listings', () => {
    const vehicle = resolveMock<VehicleDetail>(
      '/vehicles/by-slug/toyota-land-cruiser-2021-rubavu',
      {},
    );
    expect(vehicle?.status).toBe('sold');
  });
});

describe('resolveMock — dealers', () => {
  it('lists dealers without leaking the internal vehicleSlugs field', () => {
    const page = resolveMock<Page<Record<string, unknown>>>('/dealers', { query: {} });
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((d) => !('vehicleSlugs' in d))).toBe(true);
  });

  it('returns a dealer\u2019s vehicles only', () => {
    const page = resolveMock<Page<VehicleSummary>>('/dealers/voltmove-fleet-logistics/vehicles', {
      query: {},
    });
    expect(page!.items).toHaveLength(1);
    expect(page!.items[0]?.slug).toBe('mercedes-eqv-2023-kigali');
  });

  it('throws a 404 for an unknown dealer', () => {
    expect(() => resolveMock('/dealers/not-a-real-dealer', { query: {} })).toThrow(ApiError);
  });
});

describe('resolveMock — content', () => {
  it('filters articles by kind for the blog page', () => {
    const page = resolveMock<Page<{ kind: string }>>('/content/articles', {
      query: { kind: 'blog' },
    });
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((a) => a.kind === 'blog')).toBe(true);
  });
});
