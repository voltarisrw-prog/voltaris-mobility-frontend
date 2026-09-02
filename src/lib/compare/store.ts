'use client';

/**
 * The compare selection is a small basket that survives across pagination,
 * listing pages, homepage aisles, and vehicle-detail pages.
 *
 * localStorage remains the persistence layer, while `snapshot` is the stable
 * in-memory value consumed by useSyncExternalStore.
 */

export const COMPARE_MAX = 4;

const STORAGE_KEY = 'voltaris:compare';
const CHANGE_EVENT = 'voltaris:compare-change';

const EMPTY: string[] = [];

/**
 * Stable in-memory snapshot.
 *
 * IMPORTANT:
 * getCompareIds() must return the same array reference until the store changes.
 * This is required by React's useSyncExternalStore.
 */
let snapshot: string[] = EMPTY;
let initialized = false;

function readStorage(): string[] {
  if (typeof window === 'undefined') return EMPTY;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return EMPTY;

    const ids = parsed
      .filter((id): id is string => typeof id === 'string')
      .slice(0, COMPARE_MAX);

    return ids;
  } catch {
    // Corrupt or inaccessible storage degrades to an empty basket.
    return EMPTY;
  }
}

function ensureInitialized(): void {
  if (initialized || typeof window === 'undefined') return;

  snapshot = readStorage();
  initialized = true;
}

function write(ids: string[]): void {
  if (typeof window === 'undefined') return;

  const next = ids.slice(0, COMPARE_MAX);

  // Update the stable snapshot BEFORE notifying subscribers.
  snapshot = next;
  initialized = true;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage failures.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCompareIds(): string[] {
  ensureInitialized();
  return snapshot;
}

/**
 * Notifies same-tab listeners on our own writes, and other tabs via the native
 * storage event.
 */
export function subscribeCompare(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export interface ToggleResult {
  ids: string[];
  /** True when the add was refused because the basket is full. */
  capped: boolean;
}

export function toggleCompare(id: string): ToggleResult {
  const current = getCompareIds();

  if (current.includes(id)) {
    const next = current.filter((value) => value !== id);
    write(next);
    return { ids: next, capped: false };
  }

  if (current.length >= COMPARE_MAX) {
    return { ids: current, capped: true };
  }

  const next = [...current, id];
  write(next);

  return { ids: next, capped: false };
}

export function removeFromCompare(id: string): string[] {
  const next = getCompareIds().filter((value) => value !== id);

  write(next);

  return next;
}

/**
 * Called by the /compare page so this store stays synchronized with the URL.
 */
export function syncCompareFromUrl(ids: string[]): void {
  write(ids);
}

export function clearCompare(): void {
  write([]);
}
