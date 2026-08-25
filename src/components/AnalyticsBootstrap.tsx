'use client';

import { useEffect } from 'react';
import { consoleProvider, registerProvider } from '@/lib/analytics';

let registered = false;

/**
 * Providers are registered once, client-side. The real provider is added here when
 * a write key exists; until then events go to the console so funnels can be checked
 * during development without shipping a third-party script.
 */
export function AnalyticsBootstrap() {
  useEffect(() => {
    if (registered) return;
    registered = true;
    if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
      registerProvider(consoleProvider);
    }
  }, []);
  return null;
}
