import { z } from 'zod';

/**
 * Marketplace filter state lives in the URL, not in a store. That makes every
 * result set shareable, back-button-correct, and server-renderable.
 */

const csv = (schema: z.ZodTypeAny) =>
  z.preprocess((value) => {
    if (value === undefined || value === '') return undefined;
    if (Array.isArray(value)) return value.flatMap((v) => String(v).split(','));
    return String(value).split(',');
  }, schema.optional());

const int = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max).optional().catch(undefined);

const rentalDateTime = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d)?$/)
  .optional()
  .catch(undefined);

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'newest', label: 'Newest listings' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'range_desc', label: 'Longest range' },
  { value: 'mileage_asc', label: 'Lowest mileage' },
  { value: 'year_desc', label: 'Newest model year' },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]['value'];

export const vehicleFiltersSchema = z.object({
  q: z.string().trim().max(120).optional().catch(undefined),
  make: csv(z.array(z.string().trim().toLowerCase().max(40))),
  model: z.string().trim().max(60).optional().catch(undefined),
  body: csv(z.array(z.enum(['suv', 'sedan', 'hatchback', 'pickup', 'van', 'motorcycle', 'bus']))),
  condition: z.enum(['new', 'used', 'certified']).optional().catch(undefined),
  location: z.string().trim().toLowerCase().max(40).optional().catch(undefined),
  mode: z.enum(['sale', 'rental']).optional().catch(undefined),
  fuel: z.enum(['electric', 'hybrid']).optional().catch(undefined),
  // Only meaningful alongside mode: 'rental'. A native <input type="date"> already
  // constrains the format at the source; this just refuses anything that slipped in
  // some other way (a hand-edited URL) rather than passing it to the backend.
  rentalLocation: z.string().trim().toLowerCase().max(60).optional().catch(undefined),
  rentalStart: rentalDateTime,
  rentalEnd: rentalDateTime,
  minPrice: int(0, 5_000_000_000),
  maxPrice: int(0, 5_000_000_000),
  minYear: int(1990, 2100),
  maxYear: int(1990, 2100),
  maxMileage: int(0, 1_000_000),
  minRange: int(0, 1500),
  minBattery: int(0, 400),
  verified: z
    .preprocess((v) => (v === 'true' || v === true ? true : undefined), z.boolean().optional())
    .catch(undefined),
  sort: z
    .enum([
      'relevance',
      'newest',
      'price_asc',
      'price_desc',
      'range_desc',
      'mileage_asc',
      'year_desc',
    ])
    .optional()
    .catch(undefined),
  page: z.coerce.number().int().min(1).max(500).optional().catch(undefined),
});

export type VehicleFilters = z.infer<typeof vehicleFiltersSchema>;

export interface RentalWindow {
  location: string;
  start: string;
  end: string;
}

/**
 * A rental window only means anything once all three parts are chosen — dates
 * without a pickup location can't be priced or checked for availability. Callers
 * use this instead of checking the three fields individually so "what counts as a
 * complete rental search" is defined in exactly one place.
 */

const RENTAL_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/;

function getKigaliDateTime() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Kigali',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function validateRentalWindow(
  start: string,
  end: string,
): string | null {
  if (!RENTAL_DATE_TIME_PATTERN.test(start) || !RENTAL_DATE_TIME_PATTERN.test(end)) {
    return 'Rental pickup and return must include a valid date and time.';
  }

  if (start < getKigaliDateTime()) {
    return 'Pickup date and time cannot be in the past.';
  }

  if (end <= start) {
    return 'Return must be after the pickup date and time.';
  }

  return null;
}

export function rentalWindow(filters: VehicleFilters): RentalWindow | null {
  if (!filters.rentalLocation || !filters.rentalStart || !filters.rentalEnd) return null;
  return { location: filters.rentalLocation, start: filters.rentalStart, end: filters.rentalEnd };
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function parseFilters(input: RawSearchParams): VehicleFilters {
  const parsed = vehicleFiltersSchema.safeParse(input);
  const filters = parsed.success ? parsed.data : {};
  // Swap inverted ranges rather than returning zero results for an obvious typo.
  if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
    [filters.minPrice, filters.maxPrice] = [filters.maxPrice, filters.minPrice];
  }
  if (filters.minYear && filters.maxYear && filters.minYear > filters.maxYear) {
    [filters.minYear, filters.maxYear] = [filters.maxYear, filters.minYear];
  }
  if (filters.rentalStart && filters.rentalEnd && filters.rentalStart > filters.rentalEnd) {
    // ISO date strings sort lexicographically, so a plain string compare is correct
    // here without parsing either one into a Date.
    [filters.rentalStart, filters.rentalEnd] = [filters.rentalEnd, filters.rentalStart];
  }
  return filters;
}

/** Deterministic serialisation — one filter state, one URL. */
export function toSearchParams(filters: VehicleFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(filters).sort()) {
    const value = filters[key as keyof VehicleFilters];
    if (value === undefined || value === '' || value === false) continue;
    params.set(key, Array.isArray(value) ? [...value].sort().join(',') : String(value));
  }
  return params;
}

export function buildHref(filters: VehicleFilters, basePath = '/cars'): string {
  const qs = toSearchParams(filters).toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function activeFilterCount(filters: VehicleFilters): number {
  const ignored = new Set(['sort', 'page']);
  return Object.entries(filters).filter(
    ([key, value]) => !ignored.has(key) && value !== undefined && value !== '',
  ).length;
}

/**
 * INDEXATION POLICY.
 *
 * Filter combinations multiply faster than search demand does, so only facets with
 * real standalone intent are indexable. Everything else is `noindex, follow`: crawlers
 * still discover the vehicle pages through it, but the filtered view itself never
 * competes with the curated category landing pages.
 *
 * Indexable: no filters, or exactly one of make / body / location / condition.
 * Also indexable: make + location (a genuine query pattern, e.g. "BYD Kigali").
 */
const INDEXABLE_SINGLE = new Set(['make', 'body', 'location', 'condition']);

export function isIndexable(filters: VehicleFilters): boolean {
  const keys = Object.keys(filters).filter(
    (key) => !['sort', 'page'].includes(key) && filters[key as keyof VehicleFilters] !== undefined,
  );
  // Deep pagination adds no unique value to the index.
  if ((filters.page ?? 1) > 5) return false;
  if (keys.length === 0) return true;
  if (keys.length === 1) {
    const key = keys[0];
    if (key === undefined || !INDEXABLE_SINGLE.has(key)) return false;
    // Multi-select facets stop being a clean topic once more than one value is picked.
    const value = filters[key as keyof VehicleFilters];
    return !Array.isArray(value) || value.length === 1;
  }
  if (keys.length === 2 && keys.includes('make') && keys.includes('location')) {
    return (filters.make ?? []).length === 1;
  }
  return false;
}

/** Canonical URL for a filter state — drops sort, which never changes the result set. */
export function canonicalPath(filters: VehicleFilters, basePath = '/cars'): string {
  const rest = { ...filters };
  delete rest.sort;
  return buildHref(rest, basePath);
}
