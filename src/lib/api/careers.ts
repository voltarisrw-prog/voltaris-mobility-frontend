import { request } from './client';
import type {
  JobApplicationInput,
  JobApplicationResult,
} from '@/types/careers';

export interface CVUploadIntent {
  upload_url: string;
  storage_key: string;
  expires_at: string;
  max_bytes: number;
}

export async function createCVUploadIntent(
  file: File,
): Promise<CVUploadIntent> {
  return request<CVUploadIntent>('/careers/cv-upload-intents', {
    method: 'POST',
    body: {
      content_type: file.type,
      size_bytes: file.size,
    },
  });
}

export async function uploadCV(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
      'Content-Length': String(file.size),
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('CV upload failed.');
  }
}

export async function submitJobApplication(
  input: JobApplicationInput & { cv_storage_key: string },
): Promise<JobApplicationResult> {
  return request<JobApplicationResult>('/careers/applications', {
    method: 'POST',
    body: input,
  });
}

export async function getJobApplicationStatus(
  reference: string,
): Promise<JobApplicationResult> {
  return request<JobApplicationResult>(
    `/careers/applications/${encodeURIComponent(reference)}`,
  );
}
