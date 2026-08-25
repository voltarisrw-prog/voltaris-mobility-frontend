import { request } from './client';
import type { Page } from '@/types/api';
import type { DealerDetail, DealerSummary } from '@/types/dealer';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * BACKEND DEPENDENCY
 *   GET /dealers                     paginated directory
 *   GET /dealers/{slug}              profile
 *   GET /dealers/{slug}/vehicles     inventory
 */

export function listDealers(page = 1): Promise<Page<DealerSummary>> {
  return request<Page<DealerSummary>>('/dealers', { query: { page }, revalidate: 3600 });
}

export function getDealer(slug: string): Promise<DealerDetail> {
  return request<DealerDetail>(`/dealers/${encodeURIComponent(slug)}`, {
    revalidate: 1800,
    tags: [`dealer:${slug}`],
  });
}

export function getDealerVehicles(slug: string, page = 1): Promise<Page<VehicleSummary>> {
  return request<Page<VehicleSummary>>(`/dealers/${encodeURIComponent(slug)}/vehicles`, {
    query: { page },
    revalidate: 300,
    tags: [`dealer:${slug}`],
  });
}
