import { describe, expect, it } from 'vitest';
import { envFlag, envNumber, envString, envUrl } from '../env';

/**
 * These exist because `process.env.X ?? fallback` shipped and broke a production
 * build. `??` only catches null and undefined; the real-world failure is an
 * empty string from a blank field in a hosting dashboard.
 */

describe('envString', () => {
  it('falls back on an empty string — the case ?? misses', () => {
    expect(envString('', 'default')).toBe('default');
  });
  it('falls back on whitespace only', () => {
    expect(envString('   ', 'default')).toBe('default');
  });
  it('falls back on undefined', () => {
    expect(envString(undefined, 'default')).toBe('default');
  });
  it('trims a real value', () => {
    expect(envString('  https://voltaris.rw  ', 'x')).toBe('https://voltaris.rw');
  });
});

describe('envNumber', () => {
  it('does not turn an empty string into zero', () => {
    // Number('') === 0, which set every server request's timeout to 0ms.
    expect(envNumber('', 8000)).toBe(8000);
  });
  it('rejects a non-numeric value rather than producing NaN', () => {
    expect(envNumber('soon', 8000)).toBe(8000);
  });
  it('rejects zero and negatives — a timeout of -5 is not a timeout', () => {
    expect(envNumber('0', 8000)).toBe(8000);
    expect(envNumber('-5', 8000)).toBe(8000);
  });
  it('accepts a real value', () => {
    expect(envNumber('12000', 8000)).toBe(12000);
  });
});

describe('envFlag', () => {
  it('is off unless explicitly on', () => {
    for (const value of ['', '   ', undefined, 'false', '0', 'no', 'maybe']) {
      expect(envFlag(value)).toBe(false);
    }
  });
  it('accepts the usual affirmatives, case-insensitively', () => {
    for (const value of ['true', 'TRUE', '1', 'yes']) {
      expect(envFlag(value)).toBe(true);
    }
  });
});

describe('envUrl', () => {
  it('falls back when empty instead of throwing ERR_INVALID_URL', () => {
    // The exact production build failure this file was written for.
    expect(envUrl('NEXT_PUBLIC_SITE_URL', '', 'https://voltaris.rw')).toBe('https://voltaris.rw');
  });
  it('normalises away a trailing slash', () => {
    // Otherwise every canonical tag becomes https://voltaris.rw//cars
    expect(envUrl('X', 'https://voltaris.rw/', 'https://fallback.rw')).toBe('https://voltaris.rw');
  });
  it('names the variable when the value is unusable', () => {
    expect(() => envUrl('NEXT_PUBLIC_SITE_URL', 'not-a-url', 'https://voltaris.rw')).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
  });
  it('accepts a valid absolute URL', () => {
    expect(envUrl('X', 'https://api.voltaris.rw', 'https://fallback.rw')).toBe(
      'https://api.voltaris.rw',
    );
  });
});
