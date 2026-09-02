'use client';

/**
 * The compare selection is a small basket that has to survive across pagination,
 * aisles, and vehicle-detail pages before it has anywhere to go — someone might add
 * a car from page 1 of the listings, another from a homepage aisle, and a third from
 * a dealer page, before ever visiting /compare. Everything else in this app treats
 * the URL as the single source of truth (see VehicleFilters, VehicleComparison), and
 * that's still correct once a person has arrived at /compare. This store exists only
 * for the "before there's a URL to put it in" part of the journey.
 *
 * /compare itself keeps reading `?ids=` and removing a vehicle there still does a URL
 * replace — see VehicleComparison.tsx. `syncCompareFromUrl` below is how that page
 * folds its current ids back into this store, so a person who removes a vehicle from
 * the comparison table doesn't still see it marked "added" if they browse back to the
 * marketplace afterwards.
 */

export const COMPARE_MAX = 4;

const STORAGE_KEY = 'voltaris:compare';
const CHANGE_EVENT = 'voltaris:compare-change';

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string').slice(0, COMPARE_MAX)
      : [];
  } catch {
    // Corrupt or inaccessible storage (private browsing, quota) degrades to "nothing
    // queued" rather than throwing — this basket is a convenience, not a commitment.
    return [];
  }
}

function write(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore write failures for the same reason reads degrade quietly above.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getCompareIds(): string[] {
  return read();
}

/** Notifies same-tab listeners on our own writes, and other tabs via the native
    `storage` event (which never fires in the tab that made the change). */
export function subscribeCompare(callback: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export interface ToggleResult {
  ids: string[];
  /** True when the add was refused because the basket was already at COMPARE_MAX —
      the caller decides how to surface that (a toast, in practice). */
  capped: boolean;
}

export function toggleCompare(id: string): ToggleResult {
  const current = read();
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
  const next = read().filter((value) => value !== id);
  write(next);
  return next;
}

/** Called by the /compare page so this store never disagrees with the URL that page
    treats as authoritative. */
export function syncCompareFromUrl(ids: string[]): void {
  write(ids.slice(0, COMPARE_MAX));
}

export function clearCompare(): void {
  write([]);
}
