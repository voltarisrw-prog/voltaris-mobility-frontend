import { request } from './client';

/**
 * Authentication is entirely cookie-based. The backend sets an httpOnly, SameSite
 * session cookie plus a readable CSRF cookie. No token is ever returned to JS, so
 * there is nothing for this module to store.
 *
 * BACKEND DEPENDENCY
 *   POST /auth/register            create account, sends verification email
 *   POST /auth/login               may respond MFA_REQUIRED before issuing a session
 *   POST /auth/logout              clears the session cookie
 *   POST /auth/forgot-password     always 204, regardless of whether the email exists
 *   POST /auth/reset-password      consumes a single-use token
 *   POST /auth/verify-email        consumes a single-use token
 *   GET  /auth/session             current viewer, or 401
 */

/** Mirrors the backend `Role` enum exactly, including case. */
export type Role =
  | 'BUYER'
  | 'SELLER'
  | 'DEALER'
  | 'SALES_AGENT'
  | 'FINANCE'
  | 'CONTENT_MANAGER'
  | 'ADMIN'
  | 'SUPER_ADMIN';

/** Roles permitted to open the admin surface. The backend authorizes every call
 *  regardless — this only decides what to render. */
export const STAFF_ROLES: readonly Role[] = ['SALES_AGENT', 'FINANCE', 'ADMIN', 'SUPER_ADMIN'];

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

export function login(input: LoginInput): Promise<Session> {
  return request<Session>('/auth/login', { method: 'POST', body: input, auth: true });
}

export function register(input: {
  full_name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<{ verification_required: boolean }> {
  return request('/auth/register', { method: 'POST', body: input });
}

export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST', auth: true });
}

export function forgotPassword(email: string): Promise<void> {
  return request<void>('/auth/forgot-password', { method: 'POST', body: { email }, auth: true });
}

export function resetPassword(token: string, password: string): Promise<void> {
  return request<void>('/auth/reset-password', {
    method: 'POST',
    body: { token, password },
    auth: true,
  });
}

export function verifyEmail(token: string): Promise<void> {
  return request<void>('/auth/verify-email', { method: 'POST', body: { token }, auth: true });
}

export function getSession(): Promise<Session> {
  return request<Session>('/auth/session', { auth: true });
}

/**
 * Google sign-in, step one. Returns the URL to send the browser to; the backend
 * generates and stores the `state` and `nonce` server-side, so nothing the client
 * holds can be tampered with.
 */
export function googleAuthorizeUrl(): Promise<{ authorization_url: string }> {
  return request<{ authorization_url: string }>('/auth/google/authorize');
}

/**
 * Step two. The backend exchanges the code server-side, verifies Google's ID token
 * against its JWKS, and links to an existing account by provider subject or verified
 * email — one account per person. The session cookies come back on this response.
 */
export function googleCallback(code: string, state: string): Promise<Session> {
  return request<Session>('/auth/google/callback', {
    method: 'POST',
    body: { code, state },
  });
}
