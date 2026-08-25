import { request } from './client';
import type { Page } from '@/types/api';

/**
 * Admin API surface.
 *
 * Role checks in the admin UI are ergonomics — they stop staff seeing controls they
 * cannot use. They are NOT authorization. Every route below is authorized by the
 * backend against the session, and the backend rejects the call regardless of what
 * the UI chose to render.
 *
 * BACKEND DEPENDENCY
 *   GET   /admin/metrics
 *   GET   /admin/vehicles                 review queue and live inventory
 *   PATCH /admin/vehicles/{id}/status     approve, reject, unpublish
 *   GET   /admin/leads
 *   GET   /admin/orders
 *   GET   /admin/audit-logs
 */

export interface AdminMetrics {
  listings_pending_review: number;
  listings_live: number;
  leads_last_7_days: number;
  test_drives_upcoming: number;
  orders_awaiting_payment: number;
  gross_merchandise_value_30d: number;
  currency: string;
}

export function getAdminMetrics(): Promise<AdminMetrics> {
  return request<AdminMetrics>('/admin/metrics', { auth: true });
}

export interface AdminVehicleRow {
  id: string;
  slug: string;
  title: string;
  seller_name: string;
  status: 'pending_review' | 'live' | 'rejected' | 'sold' | 'unpublished';
  verified: boolean;
  price: number | null;
  currency: string;
  submitted_at: string;
}

export function listAdminVehicles(
  params: { status?: string; page?: number } = {},
): Promise<Page<AdminVehicleRow>> {
  return request<Page<AdminVehicleRow>>('/admin/vehicles', { query: { ...params }, auth: true });
}

export function setVehicleStatus(
  id: string,
  status: 'live' | 'rejected' | 'unpublished',
  reason?: string,
): Promise<AdminVehicleRow> {
  return request<AdminVehicleRow>(`/admin/vehicles/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: { status, reason },
    auth: true,
  });
}

export interface AdminLeadRow {
  reference: string;
  kind: 'inquiry' | 'test_drive';
  customer_name: string;
  vehicle_title: string;
  status: string;
  created_at: string;
}

export function listAdminLeads(params: { page?: number } = {}): Promise<Page<AdminLeadRow>> {
  return request<Page<AdminLeadRow>>('/admin/leads', { query: { ...params }, auth: true });
}

export interface AuditLogRow {
  id: string;
  actor: string;
  action: string;
  entity: string;
  created_at: string;
}

export function listAuditLogs(params: { page?: number } = {}): Promise<Page<AuditLogRow>> {
  return request<Page<AuditLogRow>>('/admin/audit-logs', { query: { ...params }, auth: true });
}
