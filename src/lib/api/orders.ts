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
 * discount waiting to happen.
 */

export interface OrderLine {
  label: string;
  amount: number;
}

export interface Order {
  id: string;
  reference: string;
  vehicle: { id: string; slug: string; title: string; image_url: string | null };
  kind: 'purchase' | 'rental' | 'reservation';
  status: 'draft' | 'awaiting_payment' | 'confirmed' | 'fulfilled' | 'cancelled';
  payment_state: PaymentState;
  lines: OrderLine[];
  total: number;
  currency: string;
  created_at: string;
}

export function createOrder(input: {
  vehicle_id: string;
  kind: Order['kind'];
  rental_days?: number;
}): Promise<Order> {
  return request<Order>('/orders', { method: 'POST', body: input, auth: true });
}

export function listOrders(cursor?: string): Promise<CursorPage<Order>> {
  return request<CursorPage<Order>>('/orders', {
    query: cursor ? { cursor } : {},
    auth: true,
  });
}

export function getOrder(id: string): Promise<Order> {
  return request<Order>(`/orders/${encodeURIComponent(id)}`, { auth: true });
}
