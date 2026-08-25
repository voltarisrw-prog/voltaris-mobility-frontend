import type { ApiFailure } from '@/types/api';

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly requestId?: string;

  constructor(code: string, message: string, status: number, requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.requestId = requestId;
  }

  get isNotFound(): boolean {
    return this.status === 404 || this.code.endsWith('_NOT_FOUND');
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isRetryable(): boolean {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

/**
 * Copy shown to people. The backend `message` is treated as untrusted for display —
 * it may carry internal detail — so known codes are mapped and everything else
 * falls back to a generic line. Never render stack traces or raw upstream errors.
 */
const MESSAGES: Record<string, string> = {
  VEHICLE_NOT_FOUND: 'This vehicle is no longer listed.',
  DEALER_NOT_FOUND: 'We could not find this dealer.',
  VALIDATION_ERROR: 'Some details need fixing before this can be sent.',
  RATE_LIMITED: 'Too many requests. Wait a moment and try again.',
  UNAUTHORIZED: 'Sign in to continue.',
  FORBIDDEN: 'This account does not have access to that.',
  NETWORK_ERROR: 'We could not reach Voltaris. Check your connection and try again.',
  TIMEOUT: 'That request took too long. Try again.',
};

export function displayMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return MESSAGES[error.code] ?? 'Something went wrong on our side. Try again in a moment.';
  }
  return 'Something went wrong. Try again in a moment.';
}

export function isApiFailure(body: unknown): body is ApiFailure {
  return (
    typeof body === 'object' &&
    body !== null &&
    (body as { success?: unknown }).success === false &&
    typeof (body as { error?: unknown }).error === 'object'
  );
}
