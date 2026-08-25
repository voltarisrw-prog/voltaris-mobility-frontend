/**
 * Backend response envelope.
 *
 * CONTRACT ASSUMPTION: the error shape is fixed by the backend spec. The success
 * shape is assumed to mirror it as `{ success: true, data: T }`. If the backend
 * returns bare payloads instead, change `unwrap()` in lib/api/client.ts only.
 */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    request_id?: string;
  };
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export interface Page<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}


/**
 * Cursor pagination, used by every collection endpoint that can grow without bound.
 * `skip` costs O(offset) and is unusable past a few thousand documents, so the
 * backend does not offer page numbers for these.
 */
export interface CursorPage<T> {
  items: T[];
  next_cursor: string | null;
}
