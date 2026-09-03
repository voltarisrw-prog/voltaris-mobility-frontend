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
