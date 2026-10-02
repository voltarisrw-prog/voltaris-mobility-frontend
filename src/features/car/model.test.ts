import { describe, expect, it } from 'vitest';
import { chargeFrom10, duration, initials, nameOf, photoLabels, pickMode, storyOf } from './model';

const charging = { ac_kw: 11, dc_kw: 110, port_type: 'CCS2', dc_10_80_minutes: 45 };

describe('car page model', () => {
  it('shows the side of the listing that exists', () => {
    expect(pickMode({ listing_mode: 'sale_and_rental', rental_price_per_day: 1 }, 'rental')).toBe(
      'rental',
    );
    expect(pickMode({ listing_mode: 'sale', rental_price_per_day: null }, 'rental')).toBe('sale');
    expect(pickMode({ listing_mode: 'rental', rental_price_per_day: 1 }, undefined)).toBe('rental');
    expect(pickMode({ listing_mode: 'rental', rental_price_per_day: 1 }, 'sale')).toBe('rental');
  });

  it('names the car without the maker', () => {
    expect(nameOf({ model: 'EQV', variant: '300' })).toBe('EQV 300');
    expect(nameOf({ model: 'Taycan' })).toBe('Taycan');
  });

  it('splits the first sentence off as the headline', () => {
    expect(storyOf('Seven-seat electric van. Leather chairs, privacy glass.')).toEqual({
      headline: 'Seven-seat electric van.',
      body: 'Leather chairs, privacy glass.',
    });
    expect(storyOf('')).toEqual({ headline: '', body: '' });
    expect(storyOf('No full stop here').headline).toBe('No full stop here');
  });

  it('works out a DC charge from 10%', () => {
    const v = { range_km: 363, battery_kwh: 90, charging };
    expect(chargeFrom10(v, 80)).toMatchObject({ km: 290, kwh: 63, minutes: 45, dc: true, kw: 110 });
    expect(chargeFrom10(v, 10)).toMatchObject({ kwh: 0, minutes: 0 });
    expect(chargeFrom10(v, 100).minutes).toBeGreaterThan(45);
  });

  it('falls back to AC when there is no DC', () => {
    const r = chargeFrom10(
      { range_km: 300, battery_kwh: 60, charging: { ...charging, dc_kw: null } },
      80,
    );
    expect(r.dc).toBe(false);
    expect(r.minutes).toBe(Math.round((42 / 11) * 60));
  });

  it('formats durations and initials', () => {
    expect(duration(45)).toBe('45 min');
    expect(duration(120)).toBe('2 h');
    expect(duration(229)).toBe('3 h 49 min');
    expect(initials('VoltMove Fleet & Logistics')).toBe('VF');
    expect(initials('Kigali Prime Motors')).toBe('KP');
  });

  it('labels photos by their role', () => {
    expect(photoLabels(['hero', 'interior', 'detail', 'detail', undefined])).toEqual([
      'Front',
      'Inside',
      'Detail 1',
      'Detail 2',
      'View 1',
    ]);
    expect(photoLabels([undefined, undefined])).toEqual(['Front', 'View 1']);
  });
});

describe('gallery close-ups', () => {
  it('frames the front on the side the car faces and stays inside the photo', async () => {
    const { closeUps } = await import('./photo');
    const box = { x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.8 };
    const left = closeUps({ box, nose: 'left' });
    const right = closeUps({ box, nose: 'right' });
    expect(left.map((v) => v.label)).toEqual(['Front', 'Wheels', 'Roofline']);
    expect(left[0]!.cx).toBeLessThan(0.5);
    expect(right[0]!.cx).toBeGreaterThan(0.5);
    for (const v of [...left, ...right]) {
      expect(v.cx).toBeGreaterThanOrEqual(0.5 / v.zoom);
      expect(v.cx).toBeLessThanOrEqual(1 - 0.5 / v.zoom);
      expect(v.cy).toBeGreaterThanOrEqual(0.5 / v.zoom);
      expect(v.cy).toBeLessThanOrEqual(1 - 0.5 / v.zoom);
    }
  });
});
