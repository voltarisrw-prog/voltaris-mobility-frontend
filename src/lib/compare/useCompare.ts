'use client';

import { useSyncExternalStore } from 'react';
import { getCompareIds, getCompareItems, subscribeCompare } from './store';

const EMPTY: string[] = [];

/** The server snapshot is always empty — the basket is a client-only convenience,
    so there's nothing to render for it during SSR, and no hydration mismatch risk
    since every consumer only cares whether an id is present, not paints anything
    before mount that would visibly flip. */
export function useCompareIds(): string[] {
  return useSyncExternalStore(subscribeCompare, getCompareIds, () => EMPTY);
}

export function useCompareMode(): 'sale' | 'rental' | null {
  return useSyncExternalStore(
    subscribeCompare,
    () => getCompareItems()[0]?.mode ?? null,
    () => null,
  );
}

export { COMPARE_MAX, toggleCompare, removeFromCompare, syncCompareFromUrl, clearCompare } from './store';
