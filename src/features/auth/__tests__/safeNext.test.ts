import { describe, expect, it } from 'vitest';
import { safeNext } from '../safeNext';

describe('safeNext', () => {
  it('allows a same-origin path', () => {
    expect(safeNext('/account/saved')).toBe('/account/saved');
  });

  it('rejects an absolute URL', () => {
    expect(safeNext('https://evil.example/steal')).toBe('/account');
  });

  it('rejects a protocol-relative URL', () => {
    expect(safeNext('//evil.example')).toBe('/account');
  });

  it('rejects the backslash bypass', () => {
    expect(safeNext('/\\evil.example')).toBe('/account');
  });

  it('falls back when absent', () => {
    expect(safeNext(null)).toBe('/account');
    expect(safeNext(undefined)).toBe('/account');
  });
});
