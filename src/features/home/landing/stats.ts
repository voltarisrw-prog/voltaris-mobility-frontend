import { garagePartners } from '@/config/garage';
import { statsConfig } from '@/content/home';
import { listDealers } from '@/lib/api/dealers';
import { getFacets } from '@/lib/api/vehicles';
import type { StatItem } from './HomeStats';

const whole = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v) : null;

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

  // Figures entered by hand come first: they are the headline numbers.
  for (const m of statsConfig.manual) {
    const v = whole(m.value);
    if (v !== null && v > 0) {
      out.push({ key: m.key, label: m.label, value: v, note: m.asOf ? `As of ${m.asOf}` : undefined });
    }
  }

  if (facets) {
    const listed = facets.makes.reduce((n, make) => n + make.count, 0);
    if (listed > 0) out.push({ key: 'listed', label: 'Vehicles listed', value: listed });
    if (facets.makes.length > 0) out.push({ key: 'brands', label: 'Brands', value: facets.makes.length });
  }

  // Only a real total counts; the length of one page would under-count.
  const dealerTotal = dealers ? whole((dealers as unknown as { total?: unknown }).total) : null;
  if (dealerTotal && dealerTotal > 0) out.push({ key: 'dealers', label: 'Dealers', value: dealerTotal });

  if (garagePartners.length > 0) {
    out.push({ key: 'garages', label: 'Garage partners', value: garagePartners.length });
  }

  return out;
}
