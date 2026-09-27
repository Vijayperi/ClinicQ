import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest, setToken, setUnauthorizedHandler } from './client';

// A tiny in-memory stand-in for the browser's localStorage.
function createStorage(): Storage {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, value),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
    key: (index) => [...items.keys()][index] ?? null,
    get length() {
      return items.size;
    },
  };
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  vi.stubGlobal('localStorage', createStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
  setUnauthorizedHandler(null);
});

describe('apiRequest', () => {
  it('sends the saved token and JSON body, and returns the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    setToken('abc123');

    const result = await apiRequest('/appointments', { method: 'POST', body: { slotId: 's1' } });

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('/api/appointments', {
      method: 'POST',
      headers: { Authorization: 'Bearer abc123', 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: 's1' }),
    });
  });

  it('turns an API error response into an ApiError with its code and message', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(409, { error: { code: 'SLOT_ALREADY_BOOKED', message: 'Already booked' } }),
        ),
    );

    const error = await apiRequest('/appointments').catch((err: unknown) => err);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: 'SLOT_ALREADY_BOOKED',
      message: 'Already booked',
    });
  });

  it('reports a network failure in plain language', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(apiRequest('/doctors')).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('calls the unauthorized handler when a logged-in request gets 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse(401, { error: { code: 'INVALID_TOKEN', message: 'Expired' } }),
        ),
    );
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);
    setToken('expired-token');

    await expect(apiRequest('/appointments')).rejects.toBeInstanceOf(ApiError);
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });
});
