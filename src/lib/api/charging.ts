import { request } from './client';
import type { Page } from '@/types/api';

/**
 * BACKEND DEPENDENCY
 *   GET /charging/locations   directory, filterable by district and connector
 *
 * Rwanda's public charging network is small and changing quickly, so this is built
 * as a directory that can absorb new sites without a schema change rather than as a
 * map feature pinned to today's handful of locations.
 */

export interface ChargingLocation {
  id: string;
  slug: string;
  name: string;
  operator: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  connectors: { type: string; power_kw: number; count: number }[];
  access: 'public' | 'customers_only' | 'private';
  open_hours: string;
  verified_at: string | null;
}

export function listChargingLocations(
  params: { district?: string } = {},
): Promise<Page<ChargingLocation>> {
  return request<Page<ChargingLocation>>('/charging/locations', {
    query: { ...params },
    revalidate: 3600,
  });
}
