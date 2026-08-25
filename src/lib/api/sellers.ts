import { request } from './client';
import type { SellerListingForm } from '@/lib/validation/schemas';

/**
 * BACKEND DEPENDENCY
 *   POST /seller-listings                    submit a listing for review
 *   POST /seller-listings/{id}/media-intents get pre-signed upload URLs
 *   GET  /seller-listings/{reference}        submission status
 *
 * Photos are uploaded straight from the browser to object storage using short-lived
 * pre-signed URLs. Originals never pass through this app, and no storage credential
 * is ever sent to the client.
 */

export interface SellerSubmission {
  reference: string;
  status: 'submitted' | 'in_review' | 'approved' | 'rejected' | 'needs_information';
  submitted_at: string;
}

export function submitListing(input: SellerListingForm): Promise<SellerSubmission> {
  return request<SellerSubmission>('/seller-listings', { method: 'POST', body: input, auth: true });
}

export interface MediaIntent {
  upload_url: string;
  /** Opaque handle the backend later resolves to a stored object. */
  media_key: string;
  expires_at: string;
}

export interface VehicleImageOut {
  thumb: string;
  card: string;
  detail: string;
  gallery: string;
  width: number;
  height: number;
  alt: string;
  blur_data_url: string;
}

export function createMediaIntents(
  files: { filename: string; content_type: string; size_bytes: number }[],
  listingReference?: string,
): Promise<MediaIntent[]> {
  return request<MediaIntent[]>('/media/intents', {
    method: 'POST',
    body: { files, listing_reference: listingReference },
    auth: true,
  });
}

/**
 * Upload one file straight to object storage.
 *
 * Deliberately plain `fetch`, not the API client: this goes to R2, not to our
 * backend, so it must not carry our session cookie or CSRF header. The content
 * type must match what was presigned exactly — it is inside the signature, and
 * R2 rejects a mismatch before storing anything.
 */
export async function uploadToStorage(
  intent: MediaIntent,
  file: File,
  signal?: AbortSignal,
): Promise<void> {
  const response = await fetch(intent.upload_url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }
}

/**
 * Ask the backend to validate and publish the uploaded originals.
 *
 * This is where EXIF is stripped and the four variants are produced — the
 * uploaded file is not usable until it returns.
 */
export function finalizeMedia(
  mediaKeys: string[],
  altPrefix: string,
): Promise<VehicleImageOut[]> {
  return request<VehicleImageOut[]>('/media/finalize', {
    method: 'POST',
    body: { media_keys: mediaKeys, alt_prefix: altPrefix },
    auth: true,
  });
}

export function getSubmission(reference: string): Promise<SellerSubmission> {
  return request<SellerSubmission>(`/seller-listings/${encodeURIComponent(reference)}`, {
    auth: true,
  });
}
