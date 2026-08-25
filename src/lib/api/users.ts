import { request } from './client';
import type { Page } from '@/types/api';
import type { VehicleSummary } from '@/types/vehicle';

/**
 * BACKEND DEPENDENCY — all routes require an authenticated session.
 *   GET/PATCH /me                     profile
 *   GET/PUT/DELETE /me/saved-vehicles saved listings
 *   GET/POST/DELETE /me/saved-searches
 *   GET /me/inquiries, /me/test-drives, /me/orders, /me/notifications
 */

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  email_verified: boolean;
  preferred_language: 'en' | 'fr' | 'rw';
  marketing_opt_in: boolean;
  created_at: string;
}

export function getProfile(): Promise<Profile> {
  return request<Profile>('/me', { auth: true });
}

export function updateProfile(input: Partial<Profile>): Promise<Profile> {
  return request<Profile>('/me', { method: 'PATCH', body: input, auth: true });
}

export function getSavedVehicles(): Promise<Page<VehicleSummary>> {
  return request<Page<VehicleSummary>>('/me/saved-vehicles', { auth: true });
}

export function saveVehicle(vehicleId: string): Promise<void> {
  return request<void>(`/me/saved-vehicles/${encodeURIComponent(vehicleId)}`, {
    method: 'PUT',
    auth: true,
  });
}

export function unsaveVehicle(vehicleId: string): Promise<void> {
  return request<void>(`/me/saved-vehicles/${encodeURIComponent(vehicleId)}`, {
    method: 'DELETE',
    auth: true,
  });
}

export interface SavedSearch {
  id: string;
  label: string;
  /** Serialised marketplace query string, replayed against /cars. */
  query: string;
  alerts_enabled: boolean;
  created_at: string;
}

export function getSavedSearches(): Promise<SavedSearch[]> {
  return request<SavedSearch[]>('/me/saved-searches', { auth: true });
}

export function createSavedSearch(label: string, query: string): Promise<SavedSearch> {
  return request<SavedSearch>('/me/saved-searches', {
    method: 'POST',
    body: { label, query },
    auth: true,
  });
}

export function deleteSavedSearch(id: string): Promise<void> {
  return request<void>(`/me/saved-searches/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    auth: true,
  });
}

export interface InquiryRecord {
  reference: string;
  vehicle: Pick<VehicleSummary, 'id' | 'slug' | 'make' | 'model' | 'year' | 'primary_image'>;
  status: 'received' | 'answered' | 'closed';
  created_at: string;
}

export function getMyInquiries(): Promise<Page<InquiryRecord>> {
  return request<Page<InquiryRecord>>('/me/inquiries', { auth: true });
}

export interface TestDriveRecord {
  reference: string;
  vehicle: Pick<VehicleSummary, 'id' | 'slug' | 'make' | 'model' | 'year'>;
  status: 'requested' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  scheduled_for: string | null;
  location: string;
}

export function getMyTestDrives(): Promise<Page<TestDriveRecord>> {
  return request<Page<TestDriveRecord>>('/me/test-drives', { auth: true });
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  href?: string;
}

export function getNotifications(): Promise<Page<NotificationRecord>> {
  return request<Page<NotificationRecord>>('/me/notifications', { auth: true });
}
