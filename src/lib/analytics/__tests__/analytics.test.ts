import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerProvider, track, type AnalyticsProvider } from '../index';

const sent: { event: string; properties: Record<string, unknown> }[] = [];

const capture: AnalyticsProvider = {
  name: 'capture',
  send(event, properties) {
    sent.push({ event, properties });
  },
};

// track() is a no-op on the server; the tests need a window.
vi.stubGlobal('window', {});
registerProvider(capture);

describe('track', () => {
  beforeEach(() => {
    sent.length = 0;
  });

  it('forwards allowed properties', () => {
    track('vehicle_view', { vehicle_id: 'v1', make: 'BYD', model: 'Atto 3', year: 2023, price: 1 });
    expect(sent[0]?.properties.vehicle_id).toBe('v1');
  });

  it('strips personal data even when a caller passes it', () => {
    // The type system blocks this at compile time; the runtime filter is the
    // second line of defence for anything that reaches here dynamically.
    const payload = { vehicle_id: 'v1', email: 'a@b.com', phone: '0788000000' } as never;
    track('test_drive_started', payload);
    expect(sent[0]?.properties).not.toHaveProperty('email');
    expect(sent[0]?.properties).not.toHaveProperty('phone');
    expect(sent[0]?.properties.vehicle_id).toBe('v1');
  });

  it('never lets a broken provider break the caller', () => {
    registerProvider({
      name: 'broken',
      send() {
        throw new Error('provider down');
      },
    });
    expect(() => track('payment_started', { order_id: 'o1' })).not.toThrow();
  });
});
