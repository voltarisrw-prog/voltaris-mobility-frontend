export type JobApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'shortlisted'
  | 'rejected'
  | 'hired';

export interface JobApplicationInput {
  job_slug: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url?: string;
  portfolio_url?: string;
  cover_letter: string;
  cv_file_name: string;
}

export interface JobApplicationResult {
  reference: string;
  status: JobApplicationStatus;
}
