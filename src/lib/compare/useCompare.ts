'use client';

import { useSyncExternalStore } from 'react';
import { getCompareIds, subscribeCompare } from './store';

const EMPTY: string[] = [];

/** The server snapshot is always empty — the basket is a client-only convenience,
    so there's nothing to render for it during SSR, and no hydration mismatch risk
    since every consumer only cares whether an id is present, not paints anything
    before mount that would visibly flip. */
export function useCompareIds(): string[] {
  return useSyncExternalStore(subscribeCompare, getCompareIds, () => EMPTY);
}

export { COMPARE_MAX, toggleCompare, removeFromCompare, syncCompareFromUrl, clearCompare } from './store';
