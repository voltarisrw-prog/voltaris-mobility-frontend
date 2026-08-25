import { FORBIDDEN_KEYS, type AnalyticsEventName, type AnalyticsEvents } from './events';

export interface AnalyticsProvider {
  name: string;
  send(event: string, properties: Record<string, unknown>): void;
}

const providers: AnalyticsProvider[] = [];

export function registerProvider(provider: AnalyticsProvider): void {
  providers.push(provider);
}

function stripSensitive(properties: Record<string, unknown>): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (FORBIDDEN_KEYS.some((forbidden) => key.toLowerCase().includes(forbidden))) {
      if (process.env.NEXT_PUBLIC_ENVIRONMENT !== 'production') {
        console.warn(`[analytics] dropped forbidden property "${key}"`);
      }
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

/**
 * Single entry point for product analytics. Typed against the event map so a
 * mistyped name or a missing property fails at compile time rather than showing up
 * as a silently empty funnel three weeks later.
 */
export function track<E extends AnalyticsEventName>(
  event: E,
  properties: AnalyticsEvents[E],
): void {
  if (typeof window === 'undefined') return;
  const payload = stripSensitive(properties as Record<string, unknown>);
  for (const provider of providers) {
    try {
      provider.send(event, payload);
    } catch {
      // Analytics must never break a user flow.
    }
  }
}

/** Development sink so events are observable before a provider is wired up. */
export const consoleProvider: AnalyticsProvider = {
  name: 'console',
  send(event, properties) {
    console.info(`[analytics] ${event}`, properties);
  },
};
