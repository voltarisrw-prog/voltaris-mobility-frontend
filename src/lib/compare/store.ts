'use client';

/**
 * The compare selection is a small basket that survives across pagination,
 * listing pages, homepage aisles, and vehicle-detail pages.
 *
 * Each item now keeps its marketplace context so Buy vehicles can only be
 * compared with Buy vehicles, and Rent vehicles only with Rent vehicles.
 */

export const COMPARE_MAX = 4;

const STORAGE_KEY = 'voltaris:compare';
const CHANGE_EVENT = 'voltaris:compare-change';

export type CompareMode = 'sale' | 'rental';

export interface CompareItem {
  id: string;
  mode: CompareMode;
}

const EMPTY: CompareItem[] = [];

let snapshot: CompareItem[] = EMPTY;
let snapshotIds: string[] = [];
let initialized = false;

function readStorage(): CompareItem[] {
  if (typeof window === 'undefined') return EMPTY;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return EMPTY;

    const items = parsed
      .map((item): CompareItem | null => {
        // Backward compatibility with the old storage format:
        // ["vehicle-1", "vehicle-2"]
        if (typeof item === 'string') {
          return {
            id: item,
            mode: 'sale',
          };
        }

        if (
          typeof item === 'object' &&
          item !== null &&
          'id' in item &&
          'mode' in item &&
          typeof item.id === 'string' &&
          (item.mode === 'sale' || item.mode === 'rental')
        ) {
          return {
            id: item.id,
            mode: item.mode,
          };
        }

        return null;
      })
      .filter((item): item is CompareItem => item !== null)
      .slice(0, COMPARE_MAX);

    return items;
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

function write(items: CompareItem[]): void {
  if (typeof window === 'undefined') return;

  const next = items.slice(0, COMPARE_MAX);

  // Update the stable snapshot BEFORE notifying subscribers.
  snapshot = next;
  snapshotIds = next.map((item) => item.id);
  initialized = true;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage failures.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCompareItems(): CompareItem[] {
  ensureInitialized();
  return snapshot;
}

export function getCompareIds(): string[] {
  ensureInitialized();
  return snapshotIds;
}

export function getCompareMode(id: string): CompareMode | null {
  return getCompareItems().find((item) => item.id === id)?.mode ?? null;
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

  /** True when the add was refused because Buy/Rent modes differ. */
  modeMismatch: boolean;
}

export function toggleCompare(
  id: string,
  mode: CompareMode = 'sale',
): ToggleResult {
  const current = getCompareItems();

  const existing = current.find((item) => item.id === id);

  // Clicking an already-selected vehicle always removes it.
  if (existing) {
    const next = current.filter((item) => item.id !== id);

    write(next);

    return {
      ids: next.map((item) => item.id),
      capped: false,
      modeMismatch: false,
    };
  }

  // Never allow Buy and Rent vehicles in the same comparison basket.
  if (current.length > 0 && current.some((item) => item.mode !== mode)) {
    return {
      ids: current.map((item) => item.id),
      capped: false,
      modeMismatch: true,
    };
  }

  if (current.length >= COMPARE_MAX) {
    return {
      ids: current.map((item) => item.id),
      capped: true,
      modeMismatch: false,
    };
  }

  const next = [...current, { id, mode }];

  write(next);

  return {
    ids: next.map((item) => item.id),
    capped: false,
    modeMismatch: false,
  };
}

export function removeFromCompare(id: string): string[] {
  const next = getCompareItems().filter((item) => item.id !== id);

  write(next);

  return next.map((item) => item.id);
}

/**
 * Called by the /compare page so this store stays synchronized with the URL.
 *
 * Existing comparison items keep their known mode. IDs that are not already
 * in the store inherit the mode represented by the comparison URL.
 */
export function syncCompareFromUrl(
  ids: string[],
  mode: CompareMode = 'sale',
): void {
  const current = getCompareItems();

  const items = ids.map((id) => {
    const existing = current.find((item) => item.id === id);

    return (
      existing ?? {
        id,
        mode,
      }
    );
  });

  write(items);
}

export function clearCompare(): void {
  write([]);
}
