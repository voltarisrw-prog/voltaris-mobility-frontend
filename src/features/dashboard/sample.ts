/**
 * Sample figures for modules that aren't built yet (payments, payouts, ad
 * campaigns, inspections, support tickets, fleet maintenance…). Every screen that
 * uses these shows a "Preview · sample data" badge. Deterministic, so screenshots
 * and tests are stable; replace each block with a real API as its module lands.
 */
import type { Point } from './charts';

export function series(days: number, base: number, swing: number, seed = 1): Point[] {
  const out: Point[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const wave = Math.sin((i + seed) * 0.9) * swing + Math.cos((i * seed) / 3) * (swing / 2);
    out.push({ label: d.toISOString().slice(0, 10), value: Math.max(0, Math.round(base + wave)) });
  }
  return out;
}

export const people = [
  'Aline Uwase',
  'Eric Mugisha',
  'Diane Ingabire',
  'Jean Habimana',
  'Grace Mukamana',
  'Patrick Niyonzima',
];
export const cars = [
  'Tesla Model 3',
  'BYD Atto 3',
  'Hyundai Ioniq 5',
  'Nissan Leaf',
  'Kia EV6',
  'VW ID.4',
];
export const pick = <T>(list: T[], i: number): T => list[i % list.length] as T;
