import { request } from './client';

/**
 * Cookie-based browser authentication.
 *
 * The backend sets:
 *   - voltaris_session  -> httpOnly access/session cookie
 *   - voltaris_refresh  -> httpOnly refresh cookie
 *   - voltaris_csrf     -> readable CSRF cookie
 *
 * Tokens are therefore never stored in localStorage/sessionStorage.
 */

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

export interface PublicUser {
  id: string;
  full_name: string;
  email: string;
  roles: Role[];
  email_verified: boolean;
  mfa_enabled: boolean;
}

export interface Session {
  user: PublicUser;
}

/**
 * Backend /auth/login returns tokens + user.
 * Browser code should expose only the session portion.
 */
interface AuthTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  csrf_token: string;
  user: PublicUser | null;
}

export interface LoginInput {
  email: string;
  password: string;
  otp?: string;
}

export async function login(input: LoginInput): Promise<Session> {
  const response = await request<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: input,
  });

  if (!response.user) {
    throw new Error('Authentication succeeded but no user session was returned.');
  }

  return {
    user: response.user,
  };
}

export async function register(input: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ verification_required: boolean }> {
  return request('/auth/register', {
    method: 'POST',
    body: input,
  });
}

export async function logout(): Promise<void> {
  await request<void>('/auth/logout', {
    method: 'POST',
  });
}

export async function refreshSession(): Promise<Session> {
  const response = await request<AuthTokenResponse>('/auth/refresh', {
    method: 'POST',
  });

  if (!response.user) {
    throw new Error('Session refresh succeeded but no user session was returned.');
  }

  return {
    user: response.user,
  };
}

export async function forgotPassword(email: string): Promise<void> {
  await request<void>('/auth/forgot-password', {
    method: 'POST',
    body: { email },
  });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<void> {
  await request<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
  });
}

export async function verifyEmail(token: string): Promise<void> {
  await request<void>('/auth/verify-email', {
    method: 'POST',
    body: { token },
  });
}

export async function getSession(): Promise<Session> {
  return request<Session>('/auth/session', {
    auth: true,
  });
}

export async function googleAuthorizeUrl(): Promise<{
  authorization_url: string;
}> {
  return request<{ authorization_url: string }>('/auth/google/authorize');
}

export async function googleCallback(
  code: string,
  state: string,
): Promise<Session> {
  const response = await request<AuthTokenResponse>(
    '/auth/google/callback',
    {
      method: 'POST',
      body: { code, state },
    },
  );

  if (!response.user) {
    throw new Error('Google authentication succeeded but no user session was returned.');
  }

  return {
    user: response.user,
  };
}
