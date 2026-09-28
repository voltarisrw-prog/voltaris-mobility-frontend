import { request } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { createGeneralInquiry } from '@/lib/api/leads';

export interface GarageBookingInput {
  service: string;
  garage_slug: string;
  preferred_date: string; // ISO date
  preferred_slot: string; // HH:MM
  vehicle: { make: string; model: string; plate?: string };
  full_name: string;
  phone: string;
  email: string;
  notes?: string;
}

export type GarageBookingStatus = 'requested' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';

export interface GarageBookingResult {
  reference: string;
  status: GarageBookingStatus;
  scheduled_for: string | null;
}

/**
 * `POST /garage-bookings` mirrors `/test-drives`. Until the backend ships it,
 * a 404 on that route falls back to a general enquiry, so the booking still
 * reaches a human on day one. The fallback triggers only on the route being
 * missing, never on a validation error, so a real backend bug is not hidden.
 */
export async function requestGarageBooking(input: GarageBookingInput): Promise<GarageBookingResult> {
  try {
    return await request<GarageBookingResult>('/garage-bookings', { method: 'POST', body: input });
  } catch (cause) {
    if (!(cause instanceof ApiError) || cause.status !== 404) throw cause;
    const message = [
      'Garage booking request',
      `Service: ${input.service}`,
      `Garage: ${input.garage_slug}`,
      `When: ${input.preferred_date} at ${input.preferred_slot}`,
      `Vehicle: ${input.vehicle.make} ${input.vehicle.model}${input.vehicle.plate ? ` (${input.vehicle.plate})` : ''}`,
      input.notes ? `Notes: ${input.notes}` : null,
    ]
      .filter(Boolean)
      .join('\n');
    const result = await createGeneralInquiry({
      full_name: input.full_name,
      email: input.email,
      phone: input.phone,
      topic: 'other',
      message,
      source: 'garage-booking-fallback',
    });
    return { reference: result.reference, status: 'requested', scheduled_for: null };
  }
}
