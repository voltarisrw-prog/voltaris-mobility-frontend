import { request } from './client';

/**
 * Backend authentication response.
 *
 * The backend issues httpOnly cookies for browser authentication.
 * The token fields are returned by the API for non-browser clients,
 * but browser code should never persist them in localStorage/sessionStorage.
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  csrf_token: string;
  user: Session['user'] | null;
}

export type Role =
  | 'BUYER'
  | 'SELLER'
  | 'DEALER'
  | 'SALES_AGENT'
  | 'FINANCE'
  | 'CONTENT_MANAGER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

export const STAFF_ROLES: readonly Role[] = [
  'SALES_AGENT',
  'FINANCE',
  'ADMIN',
  'SUPER_ADMIN',
];

export interface Session {
  user: {
    id: string;
    full_name: string;
    email: string;
    email_verified: boolean;
    roles: Role[];
    mfa_enabled: boolean;
  };
}

export interface LoginInput {
  email: string;
  password: string;
  otp?: string;
}

export function login(
  input: LoginInput,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: input,
    },
  );
}

export function register(input: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ user_id: string; verification_required: boolean }> {
  return request(
    '/auth/register',
    {
      method: 'POST',
      body: input,
    },
  );
}

export function logout(): Promise<void> {
  return request<void>(
    '/auth/logout',
    {
      method: 'POST',
      auth: true,
    },
  );
}

export function refresh(): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      auth: true,
      skipRefresh: true,
    },
  );
}

export function forgotPassword(
  email: string,
): Promise<void> {
  return request<void>(
    '/auth/forgot-password',
    {
      method: 'POST',
      body: { email },
    },
  );
}

export function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  return request<void>(
    '/auth/reset-password',
    {
      method: 'POST',
      body: { token, password },
    },
  );
}

export function verifyEmail(
  token: string,
): Promise<void> {
  return request<void>(
    '/auth/verify-email',
    {
      method: 'POST',
      body: { token },
    },
  );
}

export function getSession(): Promise<Session> {
  return request<Session>(
    '/auth/session',
    {
      auth: true,
    },
  );
}

export function googleAuthorizeUrl(): Promise<{
  authorization_url: string;
}> {
  return request<{
    authorization_url: string;
  }>('/auth/google/authorize');
}

export function googleCallback(
  code: string,
  state: string,
): Promise<AuthResponse> {
  return request<AuthResponse>(
    '/auth/google/callback',
    {
      method: 'POST',
      body: { code, state },
    },
  );
}
