import type { VehicleSummary } from '@/types/vehicle';
import type { VehicleImage } from '@/types/vehicle';
import { request } from './client';
import type { Page } from '@/types/api';

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  email_verified: boolean;
  preferred_language: 'en' | 'fr' | 'rw';
  marketing_opt_in: boolean;
  created_at: string;
};

export type SavedSearch = {
  id: string;
  label: string;
  query: string;
  alerts_enabled: boolean;
  created_at: string;
};

export type InquiryRecord = {
  reference: string;
  vehicle: {
    id: string;
    slug: string;
    make: string;
    model: string;
    year: number;
    primary_image?: VehicleImage;
  };
  status: string;
  created_at: string;
};

export type TestDriveRecord = {
  reference: string;
  vehicle: {
    id: string;
    slug: string;
    make: string;
    model: string;
    year: number;
  };
  status: string;
  scheduled_for: string;
  location: string;
};

export type ReservationRecord = {
  reference: string;
  vehicle: {
    id: string;
    slug: string;
    make: string;
    model: string;
    year: number;
    primary_image?: VehicleImage;
  };
  status: string;
  pickup_date: string;
  return_date: string;
  pickup_location: string;
};

export type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  created_at: string;
  href: string;
};

// API functions
export async function getProfile(): Promise<Profile> {
  return request('/me');
}

export async function updateProfile(updates: Partial<Profile>): Promise<Profile> {
  return request('/me', { method: 'PATCH', body: updates });
}

export async function getSavedVehicles(): Promise<VehicleSummary[]> {
  const response = await request<Page<VehicleSummary>>('/me/saved-vehicles');
  return response?.items ?? [];
}

export async function getSavedSearches(): Promise<SavedSearch[]> {
  return request('/me/saved-searches');
}

export async function getMyInquiries(): Promise<InquiryRecord[]> {
  const response = await request<Page<InquiryRecord>>('/me/inquiries');
  return response?.items ?? [];
}

export async function getMyTestDrives(): Promise<TestDriveRecord[]> {
  const response = await request<Page<TestDriveRecord>>('/me/test-drives');
  return response?.items ?? [];
}

export async function getNotifications(): Promise<NotificationRecord[]> {
  const response = await request<Page<NotificationRecord>>('/me/notifications');
  return response?.items ?? [];
}
