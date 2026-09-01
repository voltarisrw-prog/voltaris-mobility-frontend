import { describe, expect, it } from 'vitest';
import {
  buildHref,
  canonicalPath,
  isIndexable,
  parseFilters,
  rentalWindow,
  toSearchParams,
} from '../filters';

describe('parseFilters', () => {
  it('drops unknown and malformed values instead of failing', () => {
    const filters = parseFilters({ make: 'byd', maxPrice: 'not-a-number', sort: 'chaos' });
    expect(filters.make).toEqual(['byd']);
    expect(filters.maxPrice).toBeUndefined();
    expect(filters.sort).toBeUndefined();
  });

  it('swaps inverted ranges rather than returning nothing', () => {
    const filters = parseFilters({ minPrice: '50000000', maxPrice: '10000000' });
    expect(filters.minPrice).toBe(10000000);
    expect(filters.maxPrice).toBe(50000000);
  });

  it('splits comma-separated multi-select facets', () => {
    expect(parseFilters({ body: 'suv,sedan' }).body).toEqual(['suv', 'sedan']);
  });

  it('rejects out-of-range page numbers', () => {
    expect(parseFilters({ page: '0' }).page).toBeUndefined();
    expect(parseFilters({ page: '9999' }).page).toBeUndefined();
  });
});

describe('toSearchParams', () => {
  it('serialises deterministically so one filter state has one URL', () => {
    const a = toSearchParams(parseFilters({ make: 'byd', body: 'suv', location: 'kigali' }));
    const b = toSearchParams(parseFilters({ location: 'kigali', body: 'suv', make: 'byd' }));
    expect(a.toString()).toBe(b.toString());
  });

  it('omits empty and false values', () => {
    expect(buildHref({ q: undefined, verified: undefined })).toBe('/cars');
  });
});

describe('indexation policy', () => {
  it('indexes the bare marketplace', () => {
    expect(isIndexable(parseFilters({}))).toBe(true);
  });

  it('indexes a single meaningful facet', () => {
    expect(isIndexable(parseFilters({ make: 'byd' }))).toBe(true);
    expect(isIndexable(parseFilters({ location: 'kigali' }))).toBe(true);
    expect(isIndexable(parseFilters({ condition: 'used' }))).toBe(true);
  });

  it('indexes make plus location, a real query pattern', () => {
    expect(isIndexable(parseFilters({ make: 'byd', location: 'kigali' }))).toBe(true);
  });

  it('refuses thin permutations', () => {
    expect(isIndexable(parseFilters({ make: 'byd', maxPrice: '40000000' }))).toBe(false);
    expect(isIndexable(parseFilters({ minRange: '300' }))).toBe(false);
    expect(isIndexable(parseFilters({ body: 'suv,sedan' }))).toBe(false);
    expect(isIndexable(parseFilters({ make: 'byd', body: 'suv', location: 'kigali' }))).toBe(false);
  });

  it('refuses deep pagination', () => {
    expect(isIndexable(parseFilters({ page: '6' }))).toBe(false);
  });
});

describe('canonicalPath', () => {
  it('drops sort, which reorders but never changes the result set', () => {
    expect(canonicalPath(parseFilters({ make: 'byd', sort: 'price_asc' }))).toBe('/cars?make=byd');
  });
});

describe('rentalWindow', () => {
  it('returns null unless location, start, and end are all present', () => {
    expect(rentalWindow(parseFilters({ mode: 'rental' }))).toBeNull();
    expect(rentalWindow(parseFilters({ rentalLocation: 'kigali' }))).toBeNull();
    expect(
      rentalWindow(parseFilters({ rentalLocation: 'kigali', rentalStart: '2026-09-10' })),
    ).toBeNull();
  });

  it('swaps an inverted date range the same way price and year ranges are swapped', () => {
    const filters = parseFilters({
      rentalLocation: 'kigali',
      rentalStart: '2026-09-20',
      rentalEnd: '2026-09-10',
    });
    expect(rentalWindow(filters)).toEqual({
      location: 'kigali',
      start: '2026-09-10',
      end: '2026-09-20',
    });
  });

  it('rejects a malformed date rather than passing it to the backend', () => {
    const filters = parseFilters({
      rentalLocation: 'kigali',
      rentalStart: 'not-a-date',
      rentalEnd: '2026-09-20',
    });
    expect(filters.rentalStart).toBeUndefined();
    expect(rentalWindow(filters)).toBeNull();
  });
});
