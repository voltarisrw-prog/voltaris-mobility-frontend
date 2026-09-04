import { afterEach, describe, expect, it, vi } from 'vitest';

const resolveMock = vi.fn();

vi.mock('@/lib/mock/resolve', () => ({
  resolveMock,
}));

describe('request — demo data safety', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    resolveMock.mockReset();
    delete process.env.NEXT_PUBLIC_DEMO_DATA;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('uses the real API path when NEXT_PUBLIC_DEMO_DATA=false', async () => {
    process.env.NEXT_PUBLIC_DEMO_DATA = 'false';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test/api/v1';

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { source: 'real-api' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { request } = await import('../client');

    const result = await request<{ source: string }>('/vehicles');

    expect(result).toEqual({ source: 'real-api' });
    expect(resolveMock).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.example.test/api/v1/vehicles',
    );
  });
});

describe('request — demo module is not evaluated when off', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_DEMO_DATA;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('never imports lib/mock/resolve at all when the flag is false, even if it would throw on load', async () => {
    process.env.NEXT_PUBLIC_DEMO_DATA = 'false';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test/api/v1';

    // A stand-in for a broken fixture (e.g. a vehicleRef() lookup for a
    // slug that no longer exists) — this file throws the instant anything
    // imports it. If request() ever imports lib/mock eagerly again, this
    // test fails with that thrown error instead of the assertion below.
    vi.doMock('@/lib/mock/resolve', () => {
      throw new Error('lib/mock/resolve was evaluated even though DEMO_DATA=false');
    });

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { source: 'real-api' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { request } = await import('../client');
    const result = await request<{ source: string }>('/vehicles');

    expect(result).toEqual({ source: 'real-api' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('request — demo module is not evaluated when off', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_DEMO_DATA;
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  it('never imports lib/mock/resolve at all when the flag is false, even if it would throw on load', async () => {
    process.env.NEXT_PUBLIC_DEMO_DATA = 'false';
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://api.example.test/api/v1';

    vi.doMock('@/lib/mock/resolve', () => {
      throw new Error('lib/mock/resolve was evaluated even though DEMO_DATA=false');
    });

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: { source: 'real-api' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const { request } = await import('../client');
    const result = await request<{ source: string }>('/vehicles');

    expect(result).toEqual({ source: 'real-api' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
