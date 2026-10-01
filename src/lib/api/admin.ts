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
  image_url?: string | null;
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

/* ------------------------------------------------------------ people and access */

export interface AdminUserRow {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  staff: boolean;
  email_verified: boolean;
  mfa_enabled: boolean;
  suspended: boolean;
  suspended_reason: string | null;
  created_at: string;
  last_sign_in: string | null;
}

export function listAdminUsers(
  params: { q?: string; role?: string; page?: number } = {},
): Promise<Page<AdminUserRow>> {
  return request<Page<AdminUserRow>>('/admin/users', { query: { ...params }, auth: true });
}

export function setUserRoles(
  id: string,
  roles: string[],
): Promise<AdminUserRow & { enrolment_code: string | null }> {
  return request(`/admin/users/${encodeURIComponent(id)}/roles`, {
    method: 'PUT',
    body: { roles },
    auth: true,
  });
}

export function suspendUser(id: string, reason: string): Promise<AdminUserRow> {
  return request(`/admin/users/${encodeURIComponent(id)}/suspend`, {
    method: 'POST',
    body: { reason },
    auth: true,
  });
}

export function restoreUser(id: string): Promise<AdminUserRow> {
  return request(`/admin/users/${encodeURIComponent(id)}/restore`, { method: 'POST', auth: true });
}

export function revokeUserSessions(id: string): Promise<void> {
  return request(`/admin/users/${encodeURIComponent(id)}/sessions/revoke`, {
    method: 'POST',
    auth: true,
  });
}

export function resetUserMfa(id: string): Promise<{ enrolment_code: string | null }> {
  return request(`/admin/users/${encodeURIComponent(id)}/mfa/reset`, {
    method: 'POST',
    auth: true,
  });
}

export function newEnrolmentCode(id: string): Promise<{ enrolment_code: string }> {
  return request(`/admin/users/${encodeURIComponent(id)}/mfa/enrolment-code`, {
    method: 'POST',
    auth: true,
  });
}

export interface RoleCatalogue {
  platform: { role: string; label: string; group: string; staff: boolean; permissions: string[] }[];
  company: { kind: string; role: string; label: string; permissions: string[] }[];
  permissions: Record<string, string>;
}

export function getRoleCatalogue(): Promise<RoleCatalogue> {
  return request<RoleCatalogue>('/admin/roles', { auth: true });
}

/* ------------------------------------------------------------ companies */

export interface AdminOrgRow {
  id: string;
  kind: 'dealer' | 'rental' | 'business';
  name: string;
  status: 'active' | 'suspended';
  dealer_id: string | null;
  members: number;
  owner_email: string | null;
  created_at: string;
}

export function listAdminOrgs(
  params: { kind?: string; page?: number } = {},
): Promise<Page<AdminOrgRow>> {
  return request<Page<AdminOrgRow>>('/admin/orgs', { query: { ...params }, auth: true });
}

export function listDealerProfiles(): Promise<{ items: { id: string; name: string }[] }> {
  return request('/admin/dealers', { auth: true });
}

export function createOrg(input: {
  kind: AdminOrgRow['kind'];
  name: string;
  owner_email: string;
  dealer_id?: string | null;
}): Promise<AdminOrgRow> {
  return request('/admin/orgs', { method: 'POST', body: input, auth: true });
}

export function setOrgStatus(id: string, status: AdminOrgRow['status']): Promise<AdminOrgRow> {
  return request(`/admin/orgs/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}

export interface MyAccess {
  roles: { role: string; label: string }[];
  permissions: { key: string; description: string }[];
}

export function getMyAccess(): Promise<MyAccess> {
  return request<MyAccess>('/admin/me', { auth: true });
}

/* ------------------------------------------------------------ dashboards */

export interface DayPoint {
  day: string;
  value: number;
}

/** Each block is present only when the caller's role may see it. */
export interface AdminStats {
  accounts?: { total: number; customers: number; sellers: number; staff: number; suspended: number; new_7d: number };
  signups?: DayPoint[];
  security?: {
    staff: number;
    staff_mfa: number;
    mfa_total: number;
    active_sessions: number;
    mfa_failed_24h: number;
    token_reuse_7d: number;
    throttled_now: number;
  };
  security_events?: { action: string; actor: string; ip: string | null; created_at: string }[];
  signins?: DayPoint[];
  listings?: {
    total: number;
    live: number;
    reserved: number;
    sold: number;
    unpublished: number;
    verified: number;
    rentable: number;
    pending_review: number;
  };
  by_body?: { label: string; value: number }[];
  by_make?: { label: string; value: number }[];
  leads?: DayPoint[];
  leads_total?: { inquiries: number; test_drives: number; open_inquiries: number };
  orders?: {
    total: number;
    purchases: number;
    rentals: number;
    reservations: number;
    pending: number;
    paid: number;
    other: number;
    paid_value: number;
    pending_value: number;
  };
  revenue?: DayPoint[];
  companies?: { dealers: number; rentals: number; businesses: number; suspended: number; members: number };
  content?: { guides: number; posts: number; last_updated: string | null };
  articles?: { slug: string; kind: 'guide' | 'blog'; category: string; title: string; published_at: string }[];
  audit?: { action: string; actor: string; entity: string; created_at: string }[];
  platform?: { migrations: string[]; db_size: string; tables: { label: string; value: number }[]; api_version: string };
}

export function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>('/admin/stats', { auth: true });
}
