import { request } from './client';

/**
 * Payment state is READ from the backend. It is never derived in the browser.
 *
 * A returning redirect from a payment provider proves nothing — the browser can be
 * manipulated and the provider callback may not have landed yet. The only source of
 * truth is the backend, which reconciles against the provider webhook.
 *
 * BACKEND DEPENDENCY
 *   POST /orders/{id}/checkout-session   create a provider-hosted session
 *   GET  /orders/{id}/payment            current reconciled payment state
 */

export const PAYMENT_STATES = [
  'PENDING',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
] as const;

export type PaymentState = (typeof PAYMENT_STATES)[number];

export interface PaymentSnapshot {
  order_id: string;
  state: PaymentState;
  /** Amount as reconciled by the backend, in minor units. Display only. */
  amount: number;
  currency: string;
  provider_reference: string | null;
  updated_at: string;
}

export interface CheckoutSession {
  /** Provider-hosted URL. Card data is entered on the provider's page, never ours. */
  redirect_url: string;
  expires_at: string;
}

export function createCheckoutSession(orderId: string): Promise<CheckoutSession> {
  return request<CheckoutSession>(`/orders/${encodeURIComponent(orderId)}/checkout-session`, {
    method: 'POST',
    auth: true,
  });
}

export function getPaymentState(orderId: string): Promise<PaymentSnapshot> {
  // Never cached: a stale PENDING or a stale PAID are both damaging.
  return request<PaymentSnapshot>(`/orders/${encodeURIComponent(orderId)}/payment`, { auth: true });
}
