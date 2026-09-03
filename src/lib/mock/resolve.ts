import { ApiError } from '@/lib/api/errors';
import type { RequestOptions } from '@/lib/api/client';
import type { ArticleSummary } from '@/lib/api/content';
import type { PublicUser } from '@/lib/api/auth';
import type { Profile } from '@/lib/api/users';
import type { CursorPage, Page } from '@/types/api';
import type { DealerSummary } from '@/types/dealer';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';
import {
  DEMO_INQUIRIES,
  DEMO_NOTIFICATIONS,
  DEMO_PROFILE,
  DEMO_RESERVATIONS,
  DEMO_SAVED_SEARCHES,
  DEMO_SAVED_VEHICLES,
  DEMO_TEST_DRIVES,
  DEMO_USER,
  MOCK_ARTICLES,
  MOCK_DEALERS,
  MOCK_VEHICLES,
} from './fixtures';
import { clearDemoSession, readDemoSessionUserId, setDemoSession } from './session';

/**
 * Resolves a subset of API paths against the fixtures in `./fixtures.ts`
 * instead of hitting the network — see NEXT_PUBLIC_DEMO_DATA. Returns
 * `undefined` for anything it doesn't recognise, so `request()` falls through
 * to the real network call for everything not covered here.
 *
 * Covered: browsing vehicles/dealers/articles, and a single demo account —
 * login, register, session, logout, profile, and the /me/* lists the account
 * pages read. NOT covered: checkout, seller submissions, leads, rental
 * reservation writes, or Google OAuth (that needs a real redirect through
 * Google's servers — /auth/google/authorize instead returns the same
 * NOT_CONFIGURED error the real backend would send on an environment without
 * it set up, so the button's existing error handling shows the right
 * message rather than a generic network failure).
 *
 * The demo session is a plain cookie (lib/mock/session.ts), not a real
 * httpOnly one — login/register/logout run this function client-side, so
 * they can set/clear it directly. Writes that would normally persist to a
 * database (a profile edit, saving a vehicle, a new saved search) echo back
 * a success response but change nothing in the fixtures: there is no server
 * for a demo session's edits to live on, so a page reload reverts them.
 * That's a real limitation worth knowing about, not a bug.
 */
export async function resolveMock<T>(
  path: string,
  options: RequestOptions,
): Promise<T | undefined> {
  const query = options.query ?? {};
  const method = options.method ?? 'GET';

  if (path === '/vehicles' && method === 'GET') {
    return listVehicles(query) as T;
  }

  const bySlug = path.match(/^\/vehicles\/by-slug\/([^/]+)$/);
  if (bySlug?.[1]) {
    return vehicleBySlug(decodeURIComponent(bySlug[1])) as T;
  }

  const similar = path.match(/^\/vehicles\/([^/]+)\/similar$/);
  if (similar?.[1]) {
    return similarVehicles(decodeURIComponent(similar[1]), Number(query.limit) || 6) as T;
  }

  if (path === '/vehicles/facets') {
    return vehicleFacets() as T;
  }

  if (path === '/vehicles/compare' && method === 'POST') {
    const ids = (options.body as { ids?: string[] } | undefined)?.ids ?? [];
    return MOCK_VEHICLES.filter((vehicle) => ids.includes(vehicle.id)) as T;
  }

  const dealerVehicles = path.match(/^\/dealers\/([^/]+)\/vehicles$/);
  if (dealerVehicles?.[1]) {
    return dealerVehiclesPage(decodeURIComponent(dealerVehicles[1]), query) as T;
  }

  const dealerBySlug = path.match(/^\/dealers\/([^/]+)$/);
  if (dealerBySlug?.[1]) {
    return dealerBySlugData(decodeURIComponent(dealerBySlug[1])) as T;
  }

  if (path === '/dealers') {
    return dealersPage(query) as T;
  }

  const articleBySlug = path.match(/^\/content\/articles\/([^/]+)$/);
  if (articleBySlug?.[1]) {
    return articleBySlugData(decodeURIComponent(articleBySlug[1])) as T;
  }

  if (path === '/content/articles') {
    return articlesPage(query) as T;
  }

  // -------------------------------------------------------------------------
  // auth

  if (path === '/auth/login' && method === 'POST') {
    setDemoSession(DEMO_USER.id);
    return authTokenResponse() as T;
  }

  if (path === '/auth/register' && method === 'POST') {
    // Matches the real "check your email" flow: the account isn't signed in
    // yet. Use /login (any email/password) to actually get in.
    return { verification_required: true } as T;
  }

  if (path === '/auth/logout' && method === 'POST') {
    clearDemoSession();
    return undefined as T;
  }

  if (path === '/auth/session' && method === 'GET') {
    await requireDemoSession();
    return { user: DEMO_USER } as T;
  }

  if (path === '/auth/refresh' && method === 'POST') {
    await requireDemoSession();
    return authTokenResponse() as T;
  }

  if (path === '/auth/google/authorize') {
    throw new ApiError('NOT_CONFIGURED', 'Google sign-in is not configured', 400);
  }

  // -------------------------------------------------------------------------
  // /me

  if (path === '/me' && method === 'GET') {
    await requireDemoSession();
    return DEMO_PROFILE as T;
  }

  if (path === '/me' && method === 'PATCH') {
    await requireDemoSession();
    return { ...DEMO_PROFILE, ...(options.body as Partial<Profile>) } as T;
  }

  if (path === '/me/saved-vehicles' && method === 'GET') {
    await requireDemoSession();
    return page(DEMO_SAVED_VEHICLES) as T;
  }

  if (/^\/me\/saved-vehicles\/[^/]+$/.test(path) && (method === 'PUT' || method === 'DELETE')) {
    await requireDemoSession();
    return undefined as T;
  }

  if (path === '/me/saved-searches' && method === 'GET') {
    await requireDemoSession();
    return DEMO_SAVED_SEARCHES as T;
  }

  if (path === '/me/saved-searches' && method === 'POST') {
    await requireDemoSession();
    const body = options.body as { label: string; query: string };
    return {
      id: `search-${Date.now()}`,
      label: body.label,
      query: body.query,
      alerts_enabled: true,
      created_at: new Date().toISOString(),
    } as T;
  }

  if (/^\/me\/saved-searches\/[^/]+$/.test(path) && method === 'DELETE') {
    await requireDemoSession();
    return undefined as T;
  }

  if (path === '/me/inquiries' && method === 'GET') {
    await requireDemoSession();
    return page(DEMO_INQUIRIES) as T;
  }

  if (path === '/me/test-drives' && method === 'GET') {
    await requireDemoSession();
    return page(DEMO_TEST_DRIVES) as T;
  }

  if (path === '/me/reservations' && method === 'GET') {
    await requireDemoSession();
    return page(DEMO_RESERVATIONS) as T;
  }

  if (path === '/me/notifications' && method === 'GET') {
    await requireDemoSession();
    return page(DEMO_NOTIFICATIONS) as T;
  }

  if (path === '/orders' && method === 'GET') {
    await requireDemoSession();
    // No orders in the demo catalog — checkout itself is behind
    // NEXT_PUBLIC_FEATURE_CHECKOUT and isn't built yet, so there's nothing
    // real to show here. The account page's own empty state covers it.
    return { items: [], next_cursor: null } satisfies CursorPage<unknown> as T;
  }

  return undefined;
}

async function requireDemoSession(): Promise<void> {
  const userId = await readDemoSessionUserId();
  if (userId !== DEMO_USER.id) {
    throw new ApiError('UNAUTHORIZED', 'Sign in to continue.', 401);
  }
}

function authTokenResponse() {
  return {
    access_token: 'demo',
    refresh_token: 'demo',
    expires_in: 900,
    csrf_token: 'demo',
    user: DEMO_USER as PublicUser,
  };
}

function page<I>(items: I[]): Page<I> {
  return { items, page: 1, per_page: items.length || 1, total: items.length, total_pages: 1 };
}

// ---------------------------------------------------------------------------
// vehicles

function str(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return String(value);
}

function num(value: unknown): number | undefined {
  const parsed = Number(value);
  return Number.isFinite(parsed) && value !== undefined && value !== '' ? parsed : undefined;
}

function listVehicles(query: Record<string, unknown>): Page<VehicleSummary> {
  let items: VehicleSummary[] = MOCK_VEHICLES.filter((vehicle) => vehicle.status !== 'sold');
  // A vehicle that's actually sold should still resolve by slug (a stale
  // link, a "sold" state to show) — it just doesn't show up in list results,
  // same as a real inventory feed.

  const q = str(query.q)?.toLowerCase();
  if (q) {
    items = items.filter((v) =>
      `${v.make} ${v.model} ${v.variant ?? ''}`.toLowerCase().includes(q),
    );
  }

  const make = str(query.make);
  if (make) {
    const makes = make.split(',');
    items = items.filter((v) => makes.includes(v.make.toLowerCase()));
  }

  const body = str(query.body);
  if (body) {
    const bodies = body.split(',');
    items = items.filter((v) => bodies.includes(v.body_type));
  }

  const condition = str(query.condition);
  if (condition) items = items.filter((v) => v.condition === condition);

  const location = str(query.location);
  if (location) items = items.filter((v) => v.location.slug === location);

  const mode = str(query.mode);
  if (mode === 'rental') items = items.filter((v) => v.listing_mode !== 'sale');
  if (mode === 'sale') items = items.filter((v) => v.listing_mode !== 'rental');

  const minPrice = num(query.minPrice);
  if (minPrice !== undefined) items = items.filter((v) => (v.price ?? 0) >= minPrice);
  const maxPrice = num(query.maxPrice);
  if (maxPrice !== undefined) items = items.filter((v) => (v.price ?? 0) <= maxPrice);

  const minYear = num(query.minYear);
  if (minYear !== undefined) items = items.filter((v) => v.year >= minYear);
  const maxYear = num(query.maxYear);
  if (maxYear !== undefined) items = items.filter((v) => v.year <= maxYear);

  const maxMileage = num(query.maxMileage);
  if (maxMileage !== undefined) items = items.filter((v) => v.mileage_km <= maxMileage);

  const minRange = num(query.minRange);
  if (minRange !== undefined) items = items.filter((v) => v.range_km >= minRange);

  const minBattery = num(query.minBattery);
  if (minBattery !== undefined) items = items.filter((v) => v.battery_kwh >= minBattery);

  if (query.verified === 'true' || query.verified === true) {
    items = items.filter((v) => v.verified);
  }

  const sort = str(query.sort) ?? 'relevance';
  items = [...items].sort((a, b) => {
    switch (sort) {
      case 'newest':
        return b.published_at.localeCompare(a.published_at);
      case 'price_asc':
        return (a.price ?? Infinity) - (b.price ?? Infinity);
      case 'price_desc':
        return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      case 'range_desc':
        return b.range_km - a.range_km;
      case 'mileage_asc':
        return a.mileage_km - b.mileage_km;
      case 'year_desc':
        return b.year - a.year;
      default:
        return b.published_at.localeCompare(a.published_at);
    }
  });

  const perPage = 24;
  const page = num(query.page) ?? 1;
  const start = (page - 1) * perPage;
  const paged = items.slice(start, start + perPage);

  return {
    items: paged,
    page,
    per_page: perPage,
    total: items.length,
    total_pages: Math.max(1, Math.ceil(items.length / perPage)),
  };
}

function vehicleBySlug(slug: string): VehicleDetail {
  const found = MOCK_VEHICLES.find((v) => v.slug === slug);
  if (!found) throw new ApiError('VEHICLE_NOT_FOUND', 'Vehicle not found', 404);
  return found;
}

function similarVehicles(id: string, limit: number): VehicleSummary[] {
  const source = MOCK_VEHICLES.find((v) => v.id === id);
  if (!source) return [];
  return MOCK_VEHICLES.filter(
    (v) => v.id !== id && v.status !== 'sold' && v.body_type === source.body_type,
  ).slice(0, limit);
}

function vehicleFacets() {
  const live = MOCK_VEHICLES.filter((v) => v.status !== 'sold');
  const count = <K extends string>(values: K[]) => {
    const counts = new Map<K, number>();
    for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
    return [...counts.entries()].map(([value, count]) => ({ value, label: value, count }));
  };
  const prices = live.map((v) => v.price).filter((p): p is number => p !== null);
  const ranges = live.map((v) => v.range_km);
  return {
    makes: count(live.map((v) => v.make.toLowerCase())),
    bodies: count(live.map((v) => v.body_type)),
    locations: count(live.map((v) => v.location.slug)),
    price: { min: Math.min(...prices), max: Math.max(...prices) },
    range: { min: Math.min(...ranges), max: Math.max(...ranges) },
  };
}

// ---------------------------------------------------------------------------
// dealers

function omit<T extends object, K extends keyof T>(obj: T, key: K): Omit<T, K> {
  const clone = { ...obj };
  delete clone[key];
  return clone;
}

function dealersPage(query: Record<string, unknown>): Page<DealerSummary> {
  const perPage = 24;
  const page = num(query.page) ?? 1;
  const items = MOCK_DEALERS.map((dealer) => omit(dealer, 'vehicleSlugs'));
  return { items, page, per_page: perPage, total: items.length, total_pages: 1 };
}

function dealerBySlugData(slug: string) {
  const found = MOCK_DEALERS.find((d) => d.slug === slug);
  if (!found) throw new ApiError('DEALER_NOT_FOUND', 'Dealer not found', 404);
  return omit(found, 'vehicleSlugs');
}

function dealerVehiclesPage(slug: string, query: Record<string, unknown>): Page<VehicleSummary> {
  const dealer = MOCK_DEALERS.find((d) => d.slug === slug);
  if (!dealer) throw new ApiError('DEALER_NOT_FOUND', 'Dealer not found', 404);
  const items = MOCK_VEHICLES.filter((v) => dealer.vehicleSlugs.includes(v.slug));
  const page = num(query.page) ?? 1;
  return { items, page, per_page: 24, total: items.length, total_pages: 1 };
}

// ---------------------------------------------------------------------------
// content / blog / guides

function articlesPage(query: Record<string, unknown>): Page<ArticleSummary> {
  let items = [...MOCK_ARTICLES];

  const kind = str(query.kind);
  if (kind) items = items.filter((a) => a.kind === kind);

  const category = str(query.category);
  if (category) items = items.filter((a) => a.category === category);

  items.sort((a, b) => b.published_at.localeCompare(a.published_at));

  const page = num(query.page) ?? 1;
  return { items, page, per_page: 24, total: items.length, total_pages: 1 };
}

function articleBySlugData(slug: string) {
  const found = MOCK_ARTICLES.find((a) => a.slug === slug);
  if (!found) throw new ApiError('ARTICLE_NOT_FOUND', 'Article not found', 404);
  return found;
}
