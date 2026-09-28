import type { VehicleDetail } from '@/types/vehicle';

/** The three numbers that carry a vehicle page. See content/voice.md. */
export function heroNumbers(v: VehicleDetail): { value: string; label: string }[] {
  const range = { value: `${v.range_km.toLocaleString('en-RW')} km`, label: 'range' };
  const seats = { value: String(v.seats), label: 'seats' };
  const power = { value: `${v.power_kw} kW`, label: 'power' };
  const accel = v.acceleration_0_100_s
    ? { value: `${v.acceleration_0_100_s}s`, label: '0–100 km/h' }
    : null;

  switch (v.body_type) {
    case 'suv':
    case 'van':
    case 'bus':
    case 'pickup':
      return [range, seats, power];
    default:
      return [range, accel ?? power, seats];
  }
}
