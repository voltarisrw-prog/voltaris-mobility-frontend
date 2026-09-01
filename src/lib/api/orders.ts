import { request } from './client';
import type { CursorPage } from '@/types/api';
import type { PaymentState } from './payments';

/**
 * BACKEND DEPENDENCY
 *   POST /orders            create an order from a listing; the backend prices it
 *   GET  /orders            the viewer's orders
 *   GET  /orders/{id}       one order
 *
 * The frontend never sends a price. It sends a vehicle id and an intent; the backend
 * decides what the order costs. A client-supplied amount is a client-supplied
 * discount waiting to happen. The same rule applies to a rental's total: the
 * frontend sends the window it wants, not a number — see rentalQuote() in
 * lib/api/rentals.ts for the priced preview shown before checkout.
 */

export interface OrderLine {
  label: string;
  amount: number;
}

export interface OrderRental {
  location_id: string;
  start_date: string;
  end_date: string;
}

export interface Order {
  id: string;
  reference: string;
  vehicle: { id: string; slug: string; title: string; image_url: string | null };
  kind: 'purchase' | 'rental' | 'reservation';
  status: 'draft' | 'awaiting_payment' | 'confirmed' | 'fulfilled' | 'cancelled';
  payment_state: PaymentState;
  /** Present only when kind === 'rental'. */
  rental?: OrderRental;
  lines: OrderLine[];
  total: number;
  currency: string;
  created_at: string;
}

export function createOrder(input: {
  vehicle_id: string;
  kind: Order['kind'];
  rental?: OrderRental;
}): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: input, auth: true });
}

export function listOrders(cursor?: string, kind?: Order['kind']): Promise<CursorPage<Order>> {
  return request<CursorPage<Order>>('/orders', {
    query: { ...(cursor ? { cursor } : {}), ...(kind ? { kind } : {}) },
    auth: true,
  });
}

export function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${encodeURIComponent(id)}`, { auth: true });
}
