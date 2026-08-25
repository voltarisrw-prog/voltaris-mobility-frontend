import { request } from './client';

/**
 * BACKEND DEPENDENCY
 *   POST /inquiries        create a buyer enquiry against a listing
 *   POST /test-drives      request a test drive
 *   GET  /test-drives/{reference}   public status lookup by reference
 *
 * The backend is authoritative for lead validation, spam scoring, and which seller
 * contact details (if any) are returned. The frontend never decides a lead is valid.
 */

export interface InquiryInput {
  vehicle_id: string;
  full_name: string;
  email: string;
  phone: string;
  message: string;
  preferred_channel: 'email' | 'phone' | 'whatsapp';
}

export interface InquiryResult {
  reference: string;
  status: 'received';
}

export function createInquiry(input: InquiryInput): Promise<InquiryResult> {
  return request<InquiryResult>('/inquiries', { method: 'POST', body: input });
}

export interface GeneralInquiryInput {
  full_name: string;
  email: string;
  phone: string;
  topic: 'buying' | 'selling' | 'renting' | 'partnership' | 'other';
  message: string;
  /** Attribution, so marketing spend can be measured against real leads. */
  source: string;
}

/**
 * Same endpoint, no vehicle. The backend routes on the absence of `vehicle_id`:
 * a general enquiry goes to the sales queue rather than to a specific seller.
 */
export function createGeneralInquiry(input: GeneralInquiryInput): Promise<InquiryResult> {
  return request<InquiryResult>('/inquiries', { method: 'POST', body: input });
}

export interface TestDriveInput {
  vehicle_id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_date: string; // ISO date
  preferred_time_slot: 'morning' | 'afternoon' | 'evening';
  location_slug: string;
  notes?: string;
}

export type TestDriveStatus = 'requested' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';

export interface TestDriveResult {
  reference: string;
  status: TestDriveStatus;
  scheduled_for: string | null;
}

export function requestTestDrive(input: TestDriveInput): Promise<TestDriveResult> {
  return request<TestDriveResult>('/test-drives', { method: 'POST', body: input });
}

export function getTestDrive(reference: string): Promise<TestDriveResult> {
  return request<TestDriveResult>(`/test-drives/${encodeURIComponent(reference)}`);
}
