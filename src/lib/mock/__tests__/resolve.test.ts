import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import type { Page } from '@/types/api';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';
import { resolveMock } from '../resolve';

describe('resolveMock — vehicles', () => {
  it('returns undefined for an unmocked path, so request() falls through to the network', async () => {
    await expect(resolveMock('/orders/123', {})).resolves.toBeUndefined();
  });

  it('lists vehicles and excludes sold ones', async () => {
    const page = await resolveMock<Page<VehicleSummary>>('/vehicles', { query: {} });
    expect(page).toBeDefined();
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((v) => v.status !== 'sold')).toBe(true);
  });

  it('filters by verified and mode', async () => {
    const page = await resolveMock<Page<VehicleSummary>>('/vehicles', {
      query: { verified: 'true', mode: 'rental' },
    });
    expect(page!.items.every((v) => v.verified)).toBe(true);
    expect(page!.items.every((v) => v.listing_mode !== 'sale')).toBe(true);
    expect(page!.items.length).toBeGreaterThan(0);
  });

  it('filters by minRange for the "long range" aisle query', async () => {
    const page = await resolveMock<Page<VehicleSummary>>('/vehicles', {
      query: { minRange: 350 },
    });
    expect(page!.items.every((v) => v.range_km >= 350)).toBe(true);
  });

  it('sorts by price_desc', async () => {
    const page = await resolveMock<Page<VehicleSummary>>('/vehicles', {
      query: { sort: 'price_desc' },
    });
    const prices = page!.items.map((v) => v.price ?? 0);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('resolves a vehicle by slug', async () => {
    const vehicle = await resolveMock<VehicleDetail>(
      '/vehicles/by-slug/tesla-model-s-2024-kigali',
      {},
    );
    expect(vehicle?.make).toBe('Tesla');
  });

  it('throws a 404 ApiError for an unknown slug, matching real not-found handling', async () => {
    await expect(
      resolveMock<VehicleDetail>('/vehicles/by-slug/not-a-real-car', {}),
    ).rejects.toThrow(ApiError);
    try {
      await resolveMock<VehicleDetail>('/vehicles/by-slug/not-a-real-car', {});
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).isNotFound).toBe(true);
    }
  });

  it('still resolves a sold vehicle by slug even though it is excluded from listings', async () => {
    const vehicle = await resolveMock<VehicleDetail>(
      '/vehicles/by-slug/toyota-land-cruiser-2021-rubavu',
      {},
    );
    expect(vehicle?.status).toBe('sold');
  });
});

describe('resolveMock — dealers', () => {
  it('lists dealers without leaking the internal vehicleSlugs field', async () => {
    const page = await resolveMock<Page<Record<string, unknown>>>('/dealers', { query: {} });
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((d) => !('vehicleSlugs' in d))).toBe(true);
  });

  it('returns a dealer\u2019s vehicles only', async () => {
    const page = await resolveMock<Page<VehicleSummary>>(
      '/dealers/voltmove-fleet-logistics/vehicles',
      { query: {} },
    );
    expect(page!.items).toHaveLength(1);
    expect(page!.items[0]?.slug).toBe('mercedes-eqv-2023-kigali');
  });

  it('throws a 404 for an unknown dealer', async () => {
    await expect(resolveMock('/dealers/not-a-real-dealer', { query: {} })).rejects.toThrow(
      ApiError,
    );
  });
});

describe('resolveMock — content', () => {
  it('filters articles by kind for the blog page', async () => {
    const page = await resolveMock<Page<{ kind: string }>>('/content/articles', {
      query: { kind: 'blog' },
    });
    expect(page!.items.length).toBeGreaterThan(0);
    expect(page!.items.every((a) => a.kind === 'blog')).toBe(true);
  });
});

describe('resolveMock — auth', () => {
  it('logs in with any credentials and returns the demo user', async () => {
    const result = await resolveMock<{ user: { email: string } | null }>('/auth/login', {
      method: 'POST',
      body: { email: 'anyone@example.com', password: 'whatever' },
    });
    expect(result?.user?.email).toBeDefined();
  });

  it('registration reports verification required rather than signing in', async () => {
    const result = await resolveMock<{ verification_required: boolean }>('/auth/register', {
      method: 'POST',
      body: {},
    });
    expect(result?.verification_required).toBe(true);
  });

  it('rejects /auth/session with 401 when there is no session (no request context in a unit test)', async () => {
    await expect(resolveMock('/auth/session', { method: 'GET' })).rejects.toMatchObject({
      status: 401,
    });
  });

  it('reports Google sign-in as not configured rather than a generic network failure', async () => {
    await expect(resolveMock('/auth/google/authorize', {})).rejects.toMatchObject({
      code: 'NOT_CONFIGURED',
    });
  });

  it('gates /me on the same session check', async () => {
    await expect(resolveMock('/me', { method: 'GET' })).rejects.toMatchObject({ status: 401 });
  });
});
