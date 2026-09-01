/**
 * The analytics contract. Adding an event means adding it here first, which keeps
 * property names stable across the codebase and makes the payload reviewable.
 *
 * RULE: no personally identifying or payment data in any payload. No email, phone,
 * full name, address, card details, or provider references. Amounts are allowed
 * because they are already public listing data.
 */
export interface AnalyticsEvents {
  vehicle_view: {
    vehicle_id: string;
    make: string;
    model: string;
    year: number;
    price: number | null;
  };
  search: { query: string; result_count: number };
  filter_used: { filter: string; value: string; result_count: number };
  compare_vehicle: { vehicle_ids: string[]; count: number };
  compare_add: { vehicle_id: string; count: number };
  compare_remove: { vehicle_id: string; count: number };
  favorite_vehicle: { vehicle_id: string; action: 'add' | 'remove' };
  seller_listing_started: Record<string, never>;
  seller_listing_submitted: { make: string; model: string; year: number };
  test_drive_started: { vehicle_id: string };
  test_drive_submitted: { vehicle_id: string; location_slug: string };
  inquiry_created: { vehicle_id: string; preferred_channel: string };
  checkout_started: { order_id: string; amount: number; currency: string };
  payment_started: { order_id: string };
  payment_completed: { order_id: string };
  payment_failed: { order_id: string; reason_code: string };
  dealer_contact: { dealer_slug: string; method: 'phone' | 'whatsapp' | 'form' };
  whatsapp_click: { context: string; vehicle_id?: string };
  phone_click: { context: string; vehicle_id?: string };
  content_view: { slug: string; category: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;

/** Property keys that must never leave the browser, enforced at runtime in track(). */
export const FORBIDDEN_KEYS = [
  'email',
  'phone',
  'full_name',
  'name',
  'address',
  'card',
  'card_number',
  'cvv',
  'password',
  'token',
  'provider_reference',
];
