import { request } from './client';
import { ApiError } from './errors';
import type { RentalLocation, RentalQuote } from '@/types/rental';

/**
 * BACKEND DEPENDENCY — none of this exists yet, same status as everything else in
 * ARCHITECTURE.md's "Backend dependencies" table.
 *
 *   GET /rentals/locations              fixed set of pickup/drop-off locations
 *   GET /vehicles/{id}/rental-quote     priced breakdown for one vehicle + window
 *
 * Availability itself is not a separate endpoint here — it rides on the existing
 * `GET /vehicles` contract via rentalLocation/rentalStart/rentalEnd (documented in
 * lib/api/vehicles.ts) so a rental search gets the same facets, sorting, and
 * pagination the sale marketplace already has, instead of a second listing
 * implementation to keep in sync with the first.
 *
 * Locations are a fixed backend-owned list, not free text: a rental is a physical
 * handover, so "Kigali Airport" has to be a place the vehicle's owner actually
 * services, not a string the frontend invented.
 *
 * A confirmed reservation is not a new concept either — it's an Order with
 * kind: 'rental' (see lib/api/orders.ts and createOrder's location/start_date/
 * end_date fields). One payment, checkout, and account surface serves both a
 * purchase and a rental rather than two parallel systems.
 */

export function getRentalLocations(): Promise<RentalLocation[]> {
  return request<RentalLocation[]>('/rentals/locations', { revalidate: 3600 });
}

export function getRentalQuote(
  vehicleId: string,
  window: { location: string; start: string; end: string },
): Promise<RentalQuote> {
  return request<RentalQuote>(`/vehicles/${encodeURIComponent(vehicleId)}/rental-quote`, {
    query: { location: window.location, start: window.start, end: window.end },
  });
}

/**
 *   GET /vehicles/{id}/rental-availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 *   → { unavailable: ["2026-10-03", "2026-10-04", …] }
 *
 * Days the vehicle cannot be picked up or held. The calendar greys them out
 * before a quote is ever requested. Absent endpoint (404) → nothing greyed;
 * the quote still guards the booking.
 */
export async function getRentalAvailability(
  vehicleId: string,
  window: { from: string; to: string },
): Promise<string[]> {
  try {
    const result = await request<{ unavailable: string[] }>(
      `/vehicles/${encodeURIComponent(vehicleId)}/rental-availability`,
      { query: { from: window.from, to: window.to } },
    );
    return result.unavailable ?? [];
  } catch (cause) {
    if (cause instanceof ApiError && cause.status === 404) return [];
    throw cause;
  }
}
