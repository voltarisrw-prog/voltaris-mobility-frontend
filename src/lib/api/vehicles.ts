import { request } from './client';
import type { Page } from '@/types/api';
import type { VehicleDetail, VehicleSummary } from '@/types/vehicle';
import { toSearchParams, type VehicleFilters } from '@/lib/vehicles/filters';

/**
 * BACKEND DEPENDENCY — endpoints consumed by this module.
 *
 *   GET /vehicles                       list + facet filters (see query keys below)
 *   GET /vehicles/by-slug/{slug}        canonical detail lookup; slug is backend-owned
 *   GET /vehicles/{id}/similar          related listings
 *   GET /vehicles/sitemap               id/slug/updated_at/status for sitemap generation
 *   GET /vehicles/facets                available makes, bodies, locations with counts
 *   POST /vehicles/compare              hydrate a comparison set by id
 *
 * None of these are live yet. Contracts are typed here so pages can be built and
 * tested against them; see ARCHITECTURE.md "Backend dependencies".
 *
 * GET /vehicles additionally accepts rentalLocation/rentalStart/rentalEnd (see
 * lib/vehicles/filters.ts). When all three are present the backend must (a) return
 * only vehicles actually free for that window and (b) populate each result's
 * `rental_quote` with the priced total — see lib/api/rentals.ts for why this rides
 * on the existing listing endpoint instead of a separate one.
 */

export const VEHICLE_LIST_TAG = 'vehicles:list';
export const vehicleTag = (slug: string) => `vehicle:${slug}`;

export interface VehicleFacets {
  makes: { value: string; label: string; count: number }[];
  bodies: { value: string; label: string; count: number }[];
  locations: { value: string; label: string; count: number }[];
  price: { min: number; max: number };
  range: { min: number; max: number };
}

export function listVehicles(
  filters: VehicleFilters,
  init?: { signal?: AbortSignal },
): Promise<Page<VehicleSummary>> {
  return request<Page<VehicleSummary>>('/vehicles', {
    query: Object.fromEntries(toSearchParams(filters)),
    revalidate: 60,
    tags: [VEHICLE_LIST_TAG],
    signal: init?.signal,
  });
}

export function getVehicleBySlug(slug: string): Promise<VehicleDetail> {
  return request<VehicleDetail>(`/vehicles/by-slug/${encodeURIComponent(slug)}`, {
    revalidate: 300,
    tags: [vehicleTag(slug)],
  });
}

export function getSimilarVehicles(id: string, limit = 6): Promise<VehicleSummary[]> {
  return request<VehicleSummary[]>(`/vehicles/${encodeURIComponent(id)}/similar`, {
    query: { limit },
    revalidate: 900,
  });
}

export function getFacets(): Promise<VehicleFacets> {
  return request<VehicleFacets>('/vehicles/facets', { revalidate: 3600, tags: [VEHICLE_LIST_TAG] });
}

export interface SitemapVehicle {
  slug: string;
  updated_at: string;
  status: string;
}

export function getVehicleSitemap(page = 1): Promise<Page<SitemapVehicle>> {
  return request<Page<SitemapVehicle>>('/vehicles/sitemap', {
    query: { page, per_page: 5000 },
    revalidate: 3600,
  });
}

export function compareVehicles(ids: string[]): Promise<VehicleDetail[]> {
  return request<VehicleDetail[]>('/vehicles/compare', { method: 'POST', body: { ids } });
}
