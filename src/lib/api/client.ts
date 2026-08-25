import { ApiError, isApiFailure } from './errors';
import { envNumber, envString } from '@/lib/env';
import type { ApiEnvelope } from '@/types/api';

const isServer = typeof window === 'undefined';

function baseUrl(): string {
  // envString, not `??`: a blank API_INTERNAL_BASE_URL would otherwise win over
  // the public one and point every server-side fetch at an empty string.
  const url = isServer
    ? envString(process.env.API_INTERNAL_BASE_URL, envString(process.env.NEXT_PUBLIC_API_BASE_URL, ''))
    : envString(process.env.NEXT_PUBLIC_API_BASE_URL, '');
  if (!url) {
    // Name the variable. "API base URL is not configured" sends someone reading
    // .env.example; naming it sends them straight to the dashboard field.
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set (or is empty). ' +
        'Set it to your API origin including the version prefix, ' +
        'for example https://api.voltaris.rw/api/v1',
    );
  }
  return url.replace(/\/$/, '');
}

export type QueryValue = string | number | boolean | undefined | null | (string | number)[];

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Record<string, QueryValue>;
  body?: unknown;
  /** Next.js data cache. Omit for user-specific or mutating calls. */
  revalidate?: number;
  tags?: string[];
  signal?: AbortSignal;
  timeoutMs?: number;
  /**
   * Forward the caller's session cookie on server-side requests.
   *
   * `credentials: 'include'` does nothing during server rendering — there is no
   * browser to attach cookies. Authenticated data fetched in a Server Component has
   * to carry the incoming cookie header explicitly, or every such call returns 401.
   *
   * Reading cookies also opts the route out of static rendering, which is correct
   * for per-viewer data and wrong for the public marketplace. That is why this is a
   * per-call flag rather than a default.
   */
  auth?: boolean;
}

function toQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  // Sorted so an identical filter set always produces one cache key and one canonical URL.
  for (const key of Object.keys(query).sort()) {
    const value = query[key];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const entry of [...value].sort()) params.append(key, String(entry));
    } else {
      params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/** Double-submit CSRF token. Read only in the browser; the session cookie is httpOnly. */
function csrfToken(): string | undefined {
  if (isServer) return undefined;
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith('voltaris_csrf='))
    ?.split('=')[1];
}

/** Server-side only. Returns the viewer's cookie header for authenticated calls. */
async function forwardedCookies(): Promise<string | undefined> {
  if (!isServer) return undefined;
  const { cookies } = await import('next/headers');
  const store = await cookies();
  return store.toString() || undefined;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, revalidate, tags, signal, timeoutMs, auth } = options;
  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}${toQueryString(query)}`;

  const controller = new AbortController();
  // envNumber, not Number(x ?? 8000): Number('') is 0, which would abort every
  // server-side request immediately.
  const limit = timeoutMs ?? envNumber(process.env.API_SERVER_TIMEOUT_MS, 8000);
  const timer = setTimeout(() => controller.abort(), limit);
  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') {
    const token = csrfToken();
    if (token) headers['X-CSRF-Token'] = token;
  }
  if (auth) {
    const cookie = await forwardedCookies();
    if (cookie) headers['Cookie'] = cookie;
  }

  const cachePolicy =
    revalidate === undefined && !tags
      ? { cache: 'no-store' as const }
      : { next: { revalidate, tags } };

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // Session is an httpOnly, SameSite cookie set by the backend. No tokens in JS.
      credentials: 'include',
      signal: controller.signal,
      ...cachePolicy,
    });
  } catch (cause) {
    const aborted = cause instanceof Error && cause.name === 'AbortError';
    throw new ApiError(
      aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
      aborted ? 'Request timed out' : 'Network request failed',
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (response.status === 204) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('INVALID_RESPONSE', 'Response was not valid JSON', response.status);
  }

  if (isApiFailure(payload)) {
    throw new ApiError(
      payload.error.code,
      payload.error.message,
      response.status,
      payload.error.request_id,
    );
  }

  if (!response.ok) {
    throw new ApiError('UNEXPECTED_ERROR', 'Unexpected error', response.status);
  }

  const envelope = payload as ApiEnvelope<T>;
  return envelope.success === true ? envelope.data : (payload as T);
}
