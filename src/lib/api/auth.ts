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

/** Platform roles. What each may do is defined by the backend (app/rbac.py) and sent as `permissions`. */
export const STAFF_ROLES = [
  'SUPER_ADMIN',
  'PLATFORM_ADMIN',
  'SECURITY_ADMIN',
  'SUPPORT_ADMIN',
  'FINANCE_MANAGER',
  'FINANCE_OFFICER',
  'RECONCILIATION_OFFICER',
  'VEHICLE_INSPECTOR',
  'VERIFICATION_OFFICER',
  'COMPLIANCE_OFFICER',
  'MARKETING_MANAGER',
  'CONTENT_EDITOR',
  'ADVERTISING_MANAGER',
  'DEVELOPER',
  'DATA_ANALYST',
  'AUDITOR',
] as const;

export type Role = (typeof STAFF_ROLES)[number] | 'CUSTOMER' | 'SELLER';

/** Where a person lands after signing in when no `next` was asked for: staff go to the admin area. */
export function landingFor(user: Pick<PublicUser, 'roles'>): string {
  return user.roles.some((role) => (STAFF_ROLES as readonly string[]).includes(role))
    ? '/admin'
    : '/account';
}

/** UI convenience only — the backend authorises every call on its own. */
export function can(user: Pick<PublicUser, 'permissions'>, ...permissions: string[]): boolean {
  return permissions.some((permission) => (user.permissions ?? []).includes(permission));
}

export interface Membership {
  org_id: string;
  kind: 'dealer' | 'rental' | 'business';
  name: string;
  status: 'active' | 'suspended';
  role: string;
  role_label: string;
  permissions: string[];
}

export interface PublicUser {
  id: string;
  full_name: string;
  email: string;
  roles: Role[];
  email_verified: boolean;
  mfa_enabled: boolean;
  /** Staff: powers need an authenticator code in this session. */
  mfa_required?: boolean;
  mfa_verified?: boolean;
  permissions?: string[];
}

export interface Session {
  user: PublicUser;
  memberships?: Membership[];
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

export async function resetPassword(token: string, password: string): Promise<void> {
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

export async function googleCallback(code: string, state: string): Promise<Session> {
  const response = await request<AuthTokenResponse>('/auth/google/callback', {
    method: 'POST',
    body: { code, state },
  });

  if (!response.user) {
    throw new Error('Google authentication succeeded but no user session was returned.');
  }

  return {
    user: response.user,
  };
}

/* ------------------------------------------------------------ two-step sign-in */

export interface MfaSetup {
  secret: string;
  otpauth_url: string;
  qr_svg: string;
}

/** Staff pass the one-time setup code their Super Administrator gave them. */
export function startMfaSetup(enrolmentCode?: string): Promise<MfaSetup> {
  return request<MfaSetup>('/auth/mfa/setup', {
    method: 'POST',
    body: { enrolment_code: enrolmentCode || null },
  });
}

export function enableMfa(code: string): Promise<Session & { recovery_codes: string[] }> {
  return request('/auth/mfa/enable', { method: 'POST', body: { code } });
}

export function verifyMfa(code: string): Promise<Session> {
  return request<Session>('/auth/mfa/verify', { method: 'POST', body: { code } });
}
