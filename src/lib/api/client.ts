import { ApiError, isApiFailure } from './errors';
import { envFlag, envNumber, envString } from '@/lib/env';
import type { ApiEnvelope } from '@/types/api';

const isServer = typeof window === 'undefined';

function baseUrl(): string {
  const url = isServer
    ? envString(
        process.env.API_INTERNAL_BASE_URL,
        envString(process.env.NEXT_PUBLIC_API_BASE_URL, ''),
      )
    : envString(process.env.NEXT_PUBLIC_API_BASE_URL, '');

  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set. ' +
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
  revalidate?: number;
  tags?: string[];
  signal?: AbortSignal;
  timeoutMs?: number;
  auth?: boolean;

  /**
   * Internal flag used to prevent an infinite refresh loop.
   */
  skipRefresh?: boolean;
}

function toQueryString(query: Record<string, QueryValue> | undefined): string {
  if (!query) return '';

  const params = new URLSearchParams();

  for (const key of Object.keys(query).sort()) {
    const value = query[key];

    if (value === undefined || value === null || value === '') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of [...value].sort()) {
        params.append(key, String(entry));
      }
    } else {
      params.set(key, String(value));
    }
  }

  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

/**
 * CSRF token is deliberately readable by JavaScript.
 * The access/refresh cookies remain httpOnly.
 */
function csrfToken(): string | undefined {
  if (isServer) return undefined;

  const entry = document.cookie.split('; ').find((cookie) => cookie.startsWith('voltaris_csrf='));

  if (!entry) return undefined;

  return decodeURIComponent(entry.substring('voltaris_csrf='.length));
}

/**
 * Forward incoming browser cookies when Next.js is acting as the server.
 */
async function forwardedCookies(): Promise<string | undefined> {
  if (!isServer) return undefined;

  const { cookies } = await import('next/headers');
  const store = await cookies();

  return store.toString() || undefined;
}

async function performRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', query, body, revalidate, tags, signal, timeoutMs, auth } = options;

  const url = `${baseUrl()}${path.startsWith('/') ? path : `/${path}`}` + `${toQueryString(query)}`;

  const controller = new AbortController();

  const limit = timeoutMs ?? envNumber(process.env.API_SERVER_TIMEOUT_MS, 8000);

  const timer = setTimeout(() => controller.abort(), limit);

  signal?.addEventListener('abort', () => controller.abort(), { once: true });

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  /*
   * Cookie-authenticated mutations require CSRF protection.
   */
  if (method !== 'GET') {
    const csrf = csrfToken();

    if (csrf) {
      headers['X-CSRF-Token'] = csrf;
    }
  }

  /*
   * On the Next.js server, credentials: include cannot magically
   * forward the browser's cookies. Explicitly forward them.
   */
  if (auth) {
    const cookie = await forwardedCookies();

    if (cookie) {
      headers['Cookie'] = cookie;
    }
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

  if (response.status === 204) {
    return undefined as T;
  }

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

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  /*
   * NEXT_PUBLIC_DEMO_DATA=true routes browsing endpoints (vehicles, dealers,
   * articles) to the fixtures in lib/mock/ instead of the network — for
   * running the frontend against something that looks like real inventory
   * while the backend doesn't exist yet. See lib/mock/resolve.ts for exactly
   * what is and isn't covered. Everything not covered falls through to the
   * real request below, unchanged.
   */
  if (envFlag(process.env.NEXT_PUBLIC_DEMO_DATA)) {
    // Dynamic, not static: this keeps every fixture in lib/mock/ (and
    // whatever it takes to build them) out of the bundle and out of module
    // evaluation entirely when the flag is off. A bad fixture — a renamed
    // vehicle slug, anything that throws at module-load time — can then
    // never crash the app for anyone not running in demo mode, because
    // NEXT_PUBLIC_DEMO_DATA=false ships none of that code and never
    // executes it.
    const { resolveMock } = await import('@/lib/mock/resolve');
    const mocked = await resolveMock<T>(path, options);
    if (mocked !== undefined) return mocked;
  }

  try {
    return await performRequest<T>(path, options);
  } catch (cause) {
    /*
     * Access tokens expire after 15 minutes.
     *
     * If an authenticated browser request receives 401, use the
     * refresh cookie once, then retry the original request.
     *
     * skipRefresh prevents an infinite loop when /auth/refresh itself
     * fails.
     */
    if (
      cause instanceof ApiError &&
      cause.status === 401 &&
      options.auth === true &&
      options.skipRefresh !== true &&
      !path.endsWith('/auth/refresh') &&
      !path.endsWith('/auth/login')
    ) {
      try {
        await performRequest('/auth/refresh', {
          method: 'POST',
          auth: true,
          skipRefresh: true,
        });

        return await performRequest<T>(path, {
          ...options,
          skipRefresh: true,
        });
      } catch {
        throw cause;
      }
    }

    throw cause;
  }
}
