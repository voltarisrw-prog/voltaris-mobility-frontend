import type { VehicleDetail } from '@/types/vehicle';

/**
 * Everything the car page shows, worked out once from the listing.
 * Pure functions only — no React — so they can be tested on their own.
 */

export type CarMode = 'sale' | 'rental';

const nf = new Intl.NumberFormat('en-US');
export const num = (n: number) => nf.format(Math.round(n));

/** Which side of the listing to show: the asked-for one if the car offers it. */
export function pickMode(
  v: Pick<VehicleDetail, 'listing_mode' | 'rental_price_per_day'>,
  asked?: string,
): CarMode {
  const canBuy = v.listing_mode !== 'rental';
  const canRent = v.listing_mode !== 'sale';
  if (asked === 'rental' && canRent) return 'rental';
  if (asked === 'sale' && canBuy) return 'sale';
  return canBuy ? 'sale' : 'rental';
}

/** "EQV 300" — the name the page is about; the maker and year sit above it. */
export function nameOf(v: Pick<VehicleDetail, 'model' | 'variant'>): string {
  return `${v.model}${v.variant ? ` ${v.variant}` : ''}`;
}

/** First sentence as the headline, the rest as the paragraph under it. */
export function storyOf(description: string): { headline: string; body: string } {
  const text = (description ?? '').trim();
  if (!text) return { headline: '', body: '' };
  const m = text.match(/^(.{20,180}?[.!?])(\s+|$)/s);
  if (!m || !m[1]) return { headline: text, body: '' };
  return { headline: m[1].trim(), body: text.slice(m[0].length).trim() };
}

export const conditionLabel = (c: VehicleDetail['condition']) =>
  c === 'new' ? 'New' : c === 'certified' ? 'Certified pre-owned' : 'Used';

/** The four big numbers under the name. */
export function bigNumbers(v: VehicleDetail): { value: string; unit: string; label: string }[] {
  const out: { value: string; unit: string; label: string }[] = [
    { value: num(v.range_km), unit: 'km', label: 'Range' },
  ];
  if (v.acceleration_0_100_s && v.body_type !== 'van' && v.body_type !== 'bus') {
    out.push({ value: String(v.acceleration_0_100_s), unit: 's', label: '0–100 km/h' });
  } else {
    out.push({ value: num(v.power_kw), unit: 'kW', label: 'Power' });
  }
  out.push({ value: String(v.seats), unit: '', label: 'Seats' });
  if (v.charging.dc_10_80_minutes) {
    out.push({ value: String(v.charging.dc_10_80_minutes), unit: 'min', label: '10–80% on DC' });
  } else {
    out.push({ value: num(v.battery_kwh), unit: 'kWh', label: 'Battery' });
  }
  return out;
}

export type SpecIcon = 'battery' | 'plug' | 'gauge' | 'ruler' | 'shield';
export interface SpecGroup {
  icon: SpecIcon;
  label: string;
  rows: { label: string; value: string }[];
}

const months = (m?: number) => (m ? (m % 12 === 0 ? `${m / 12} years` : `${m} months`) : '');

/** Specification in five short groups; a row with no value is left out. */
export function specGroups(v: VehicleDetail): SpecGroup[] {
  const d = v.dimensions;
  const w = v.warranty;
  const groups: SpecGroup[] = [
    {
      icon: 'battery',
      label: 'Range & battery',
      rows: [
        { label: 'Driving range', value: `${num(v.range_km)} km` },
        { label: 'Battery', value: `${v.battery_kwh} kWh` },
        {
          label: 'Battery warranty',
          value: w?.battery_months
            ? `${months(w.battery_months)}${w.battery_km ? ` · ${num(w.battery_km)} km` : ''}`
            : '',
        },
      ],
    },
    {
      icon: 'plug',
      label: 'Charging',
      rows: [
        { label: 'AC charging', value: v.charging.ac_kw ? `${v.charging.ac_kw} kW` : '' },
        {
          label: 'DC fast charging',
          value: v.charging.dc_kw ? `${v.charging.dc_kw} kW` : 'Not supported',
        },
        { label: 'Charge port', value: v.charging.port_type ?? '' },
        {
          label: '10–80% on DC',
          value: v.charging.dc_10_80_minutes ? `${v.charging.dc_10_80_minutes} min` : '',
        },
      ],
    },
    {
      icon: 'gauge',
      label: 'Performance',
      rows: [
        { label: 'Power', value: `${num(v.power_kw)} kW` },
        { label: 'Torque', value: v.torque_nm ? `${num(v.torque_nm)} Nm` : '' },
        { label: '0–100 km/h', value: v.acceleration_0_100_s ? `${v.acceleration_0_100_s} s` : '' },
        { label: 'Top speed', value: v.top_speed_kph ? `${num(v.top_speed_kph)} km/h` : '' },
        { label: 'Drivetrain', value: (v.drivetrain ?? '').toUpperCase() },
      ],
    },
    {
      icon: 'ruler',
      label: 'Size & space',
      rows: [
        { label: 'Seats', value: String(v.seats) },
        { label: 'Doors', value: v.doors ? String(v.doors) : '' },
        { label: 'Length', value: d?.length_mm ? `${num(d.length_mm)} mm` : '' },
        { label: 'Width', value: d?.width_mm ? `${num(d.width_mm)} mm` : '' },
        { label: 'Height', value: d?.height_mm ? `${num(d.height_mm)} mm` : '' },
        { label: 'Boot', value: d?.boot_litres ? `${num(d.boot_litres)} L` : '' },
      ],
    },
    {
      icon: 'shield',
      label: 'History',
      rows: [
        { label: 'Odometer', value: `${num(v.mileage_km)} km` },
        { label: 'Condition', value: conditionLabel(v.condition) },
        { label: 'Vehicle warranty', value: months(w?.vehicle_months) },
        { label: 'Documents', value: v.verified ? 'Verified by Voltaris' : 'Not yet verified' },
      ],
    },
  ];
  return groups
    .map((g) => ({ ...g, rows: g.rows.filter((r) => r.value) }))
    .filter((g) => g.rows.length > 0);
}

/**
 * What a charge adds, from 10% up to `to` percent.
 * DC follows the published 10–80% time, then slows to roughly the same time
 * again for the last 20% (how fast chargers taper). Without DC, AC at its rated kW.
 */
export function chargeFrom10(
  v: Pick<VehicleDetail, 'range_km' | 'battery_kwh' | 'charging'>,
  to: number,
): { km: number; kwh: number; minutes: number; dc: boolean; kw: number } {
  const pct = Math.max(10, Math.min(100, Math.round(to)));
  const kwh = (v.battery_kwh * (pct - 10)) / 100;
  const km = (v.range_km * pct) / 100;
  const dc = Boolean(v.charging.dc_kw);
  let minutes: number;
  if (dc) {
    const base =
      v.charging.dc_10_80_minutes ??
      Math.round(((v.battery_kwh * 0.7) / Math.max(1, (v.charging.dc_kw ?? 50) * 0.7)) * 60);
    const upTo80 = (Math.min(pct, 80) - 10) / 70;
    const over80 = Math.max(0, pct - 80) / 20;
    minutes = base * upTo80 + base * 0.9 * over80;
  } else {
    minutes = (kwh / Math.max(1, v.charging.ac_kw || 7)) * 60;
  }
  return {
    km: Math.round(km),
    kwh: Math.round(kwh),
    minutes: Math.round(minutes),
    dc,
    kw: dc ? (v.charging.dc_kw ?? 0) : v.charging.ac_kw,
  };
}

export function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Initials for the seller's badge: "VoltMove Fleet & Logistics" → "VF". */
export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return (
    words
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || 'V'
  ).slice(0, 2);
}

/** The photo's own shape, so its frame can match it exactly. */
export function shapeVars(w?: number, h?: number): Record<string, string> {
  const ww = w && w > 0 ? w : 3;
  const hh = h && h > 0 ? h : 2;
  return { '--ar': `${ww} / ${hh}`, '--arn': String(ww / hh) };
}

/** Labels for the photo tabs, from the photographer's shot roles. */
export function photoLabels(roles: (string | undefined)[]): string[] {
  const seen: Record<string, number> = {};
  const name: Record<string, string> = {
    hero: 'Front',
    interior: 'Inside',
    detail: 'Detail',
    gallery: 'View',
  };
  return roles.map((r, i) => {
    const key = r && name[r] ? r : i === 0 ? 'hero' : 'gallery';
    seen[key] = (seen[key] ?? 0) + 1;
    const base = name[key]!;
    return key === 'hero' || key === 'interior'
      ? seen[key] === 1
        ? base
        : `${base} ${seen[key]}`
      : `${base} ${seen[key]}`;
  });
}
