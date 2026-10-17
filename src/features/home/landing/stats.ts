import { garagePartners, garageServices } from '@/config/garage';
import { statsConfig } from '@/content/home';
import { listDealers } from '@/lib/api/dealers';
import { getFacets } from '@/lib/api/vehicles';
import type { StatItem } from './HomeStats';

const whole = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : null;

const size = (v: unknown): number =>
  Array.isArray(v) ? v.length : v && typeof v === 'object' ? Object.keys(v).length : 0;

/**
 * The numbers on the home page. Anything that cannot be counted for real is left
 * out, so a stat never appears with an invented value: a failed request, a missing
 * total, or a figure in `statsConfig` that nobody has filled in all simply drop out.
 */
export async function loadStats(): Promise<StatItem[]> {
  const [facets, dealers] = await Promise.all([
    getFacets().catch(() => null),
    listDealers(1).catch(() => null),
  ]);

  const out: StatItem[] = [];
  const add = (key: string, label: string, value: number | null, note?: string) => {
    if (value !== null && value > 0) out.push({ key, label, value, note });
  };

  // Figures entered by hand come first: they are the headline numbers.
  for (const m of statsConfig.manual) {
    add(m.key, m.label, whole(m.value), m.asOf ? `As of ${m.asOf}` : undefined);
  }

  if (facets) {
    add('listed', 'Vehicles listed', facets.makes.reduce((n, make) => n + make.count, 0));
    add('brands', 'Brands', facets.makes.length);
  }

  // Only a real total counts; the length of one page would under-count.
  add('dealers', 'Dealers', dealers ? whole((dealers as unknown as { total?: unknown }).total) : null);
  add('garages', 'Garage partners', size(garagePartners));
  if (facets) {
    add('locations', 'Locations', facets.locations.length);
    add('bodies', 'Body types', facets.bodies.length);
  }
  add('services', 'Garage services', size(garageServices));

  return out;
}
