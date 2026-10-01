import { request } from './client';
import type { Membership } from './auth';

/**
 * Company console. The backend checks, on every call, that the caller belongs to
 * this company and that their role there allows the action.
 */

export interface OrgHome {
  id: string;
  kind: Membership['kind'];
  name: string;
  role: string;
  role_label: string;
  permissions: string[];
  assignable_roles: { role: string; label: string }[];
}

export interface OrgMember {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  role_label: string;
  since: string;
}

export interface OrgVehicle {
  id: string;
  slug: string;
  title: string;
  image_url?: string | null;
  body_type?: string;
  range_km?: number;
  status: 'available' | 'reserved' | 'sold' | 'unavailable';
  price: number | null;
  rental_price_per_day: number | null;
  listing_mode: string;
  currency: string;
}

export interface OrgLead {
  reference: string;
  kind: 'inquiry' | 'test_drive';
  customer_name: string;
  email: string;
  phone: string;
  vehicle_title: string;
  status: string;
  assigned_to: string | null;
  created_at: string;
}

const id = (value: string) => encodeURIComponent(value);

export const myOrgs = () => request<{ items: Membership[] }>('/orgs/mine', { auth: true });
export const orgHome = (org: string) => request<OrgHome>(`/orgs/${id(org)}`, { auth: true });
export const orgMembers = (org: string) =>
  request<{ items: OrgMember[] }>(`/orgs/${id(org)}/members`, { auth: true });
export const orgVehicles = (org: string) =>
  request<{ items: OrgVehicle[] }>(`/orgs/${id(org)}/vehicles`, { auth: true });
export const orgLeads = (org: string) =>
  request<{ items: OrgLead[] }>(`/orgs/${id(org)}/leads`, { auth: true });

export const addOrgMember = (org: string, email: string, role: string) =>
  request(`/orgs/${id(org)}/members`, { method: 'POST', body: { email, role }, auth: true });
export const removeOrgMember = (org: string, user: string) =>
  request<void>(`/orgs/${id(org)}/members/${id(user)}`, { method: 'DELETE', auth: true });
export const setOrgVehicleStatus = (org: string, vehicle: string, status: OrgVehicle['status']) =>
  request<OrgVehicle>(`/orgs/${id(org)}/vehicles/${id(vehicle)}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
export const assignOrgLead = (org: string, reference: string, userId: string | null) =>
  request(`/orgs/${id(org)}/leads/${id(reference)}/assign`, {
    method: 'POST',
    body: { user_id: userId },
    auth: true,
  });
