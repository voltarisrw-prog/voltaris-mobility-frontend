/**
 * International phone numbers without a heavy library: a short list of countries with
 * their dial code and the national number length. Rwanda keeps its stricter mobile rule.
 * Numbers go to the API in E.164 form, e.g. +250788123456 or +447700900123.
 */
export interface Country {
  iso: string;
  name: string;
  dial: string;
  min: number;
  max: number;
  /** An example national number, shown as the placeholder. */
  ex: string;
  /** Italian numbers keep their leading zero. */
  keepZero?: boolean;
}

export const COUNTRIES: Country[] = [
  { iso: 'RW', name: 'Rwanda', dial: '250', min: 9, max: 9, ex: '788 123 456' },
  { iso: 'KE', name: 'Kenya', dial: '254', min: 9, max: 9, ex: '712 345 678' },
  { iso: 'UG', name: 'Uganda', dial: '256', min: 9, max: 9, ex: '712 345 678' },
  { iso: 'TZ', name: 'Tanzania', dial: '255', min: 9, max: 9, ex: '712 345 678' },
  { iso: 'BI', name: 'Burundi', dial: '257', min: 8, max: 8, ex: '79 561 234' },
  { iso: 'CD', name: 'DR Congo', dial: '243', min: 9, max: 9, ex: '812 345 678' },
  { iso: 'ET', name: 'Ethiopia', dial: '251', min: 9, max: 9, ex: '911 234 567' },
  { iso: 'NG', name: 'Nigeria', dial: '234', min: 10, max: 10, ex: '802 123 4567' },
  { iso: 'GH', name: 'Ghana', dial: '233', min: 9, max: 9, ex: '231 234 567' },
  { iso: 'ZA', name: 'South Africa', dial: '27', min: 9, max: 9, ex: '71 123 4567' },
  { iso: 'EG', name: 'Egypt', dial: '20', min: 10, max: 10, ex: '100 123 4567' },
  { iso: 'MA', name: 'Morocco', dial: '212', min: 9, max: 9, ex: '612 345 678' },
  { iso: 'US', name: 'United States', dial: '1', min: 10, max: 10, ex: '201 555 0123' },
  { iso: 'CA', name: 'Canada', dial: '1', min: 10, max: 10, ex: '506 234 5678' },
  { iso: 'GB', name: 'United Kingdom', dial: '44', min: 10, max: 10, ex: '7400 123456' },
  { iso: 'IE', name: 'Ireland', dial: '353', min: 8, max: 9, ex: '85 012 3456' },
  { iso: 'FR', name: 'France', dial: '33', min: 9, max: 9, ex: '6 12 34 56 78' },
  { iso: 'DE', name: 'Germany', dial: '49', min: 10, max: 11, ex: '1512 3456789' },
  { iso: 'BE', name: 'Belgium', dial: '32', min: 8, max: 9, ex: '470 12 34 56' },
  { iso: 'NL', name: 'Netherlands', dial: '31', min: 9, max: 9, ex: '6 12345678' },
  { iso: 'CH', name: 'Switzerland', dial: '41', min: 9, max: 9, ex: '78 123 45 67' },
  { iso: 'SE', name: 'Sweden', dial: '46', min: 7, max: 9, ex: '70 123 45 67' },
  { iso: 'NO', name: 'Norway', dial: '47', min: 8, max: 8, ex: '412 34 567' },
  { iso: 'IT', name: 'Italy', dial: '39', min: 9, max: 10, ex: '312 345 6789', keepZero: true },
  { iso: 'ES', name: 'Spain', dial: '34', min: 9, max: 9, ex: '612 34 56 78' },
  { iso: 'PT', name: 'Portugal', dial: '351', min: 9, max: 9, ex: '912 345 678' },
  { iso: 'AE', name: 'United Arab Emirates', dial: '971', min: 9, max: 9, ex: '50 123 4567' },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', min: 9, max: 9, ex: '51 234 5678' },
  { iso: 'QA', name: 'Qatar', dial: '974', min: 8, max: 8, ex: '3312 3456' },
  { iso: 'IN', name: 'India', dial: '91', min: 10, max: 10, ex: '81234 56789' },
  { iso: 'CN', name: 'China', dial: '86', min: 11, max: 11, ex: '131 2345 6789' },
  { iso: 'JP', name: 'Japan', dial: '81', min: 10, max: 10, ex: '90 1234 5678' },
  { iso: 'KR', name: 'South Korea', dial: '82', min: 9, max: 10, ex: '10 1234 5678' },
  { iso: 'SG', name: 'Singapore', dial: '65', min: 8, max: 8, ex: '8123 4567' },
  { iso: 'AU', name: 'Australia', dial: '61', min: 9, max: 9, ex: '412 345 678' },
  { iso: 'NZ', name: 'New Zealand', dial: '64', min: 8, max: 10, ex: '21 123 4567' },
  { iso: 'BR', name: 'Brazil', dial: '55', min: 10, max: 11, ex: '11 91234 5678' },
  { iso: 'XX', name: 'Other country', dial: '', min: 6, max: 15, ex: '+ country code, then number' },
];

export const countryByIso = (iso: string): Country => COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0]!;

/** Longest dial-code match for digits typed after a leading "+" or "00". */
export function detectCountry(digits: string): Country | undefined {
  let best: Country | undefined;
  for (const c of COUNTRIES) {
    if (c.dial && digits.startsWith(c.dial) && (!best || c.dial.length > best.dial.length)) best = c;
  }
  return best;
}

export function nationalDigits(c: Country, raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (c.dial && d.length > c.max && d.startsWith(c.dial)) d = d.slice(c.dial.length);
  if (c.iso !== 'XX' && !c.keepZero && d.startsWith('0')) d = d.slice(1);
  return d;
}

export function isValidPhone(c: Country, raw: string): boolean {
  const d = nationalDigits(c, raw);
  if (c.iso === 'XX') return d.length >= 6 && d.length <= 15;
  if (c.iso === 'RW') return /^7[2389]\d{7}$/.test(d);
  return d.length >= c.min && d.length <= c.max;
}

export function toE164(c: Country, raw: string): string {
  const d = nationalDigits(c, raw);
  return c.iso === 'XX' ? `+${d}` : `+${c.dial}${d}`;
}

const TZ: Record<string, string> = {
  'Africa/Kigali': 'RW', 'Africa/Nairobi': 'KE', 'Africa/Kampala': 'UG', 'Africa/Dar_es_Salaam': 'TZ',
  'Africa/Bujumbura': 'BI', 'Africa/Kinshasa': 'CD', 'Africa/Addis_Ababa': 'ET', 'Africa/Lagos': 'NG',
  'Africa/Accra': 'GH', 'Africa/Johannesburg': 'ZA', 'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'Europe/London': 'GB', 'Europe/Dublin': 'IE',
  'Europe/Paris': 'FR', 'Europe/Berlin': 'DE', 'Europe/Brussels': 'BE', 'Europe/Amsterdam': 'NL',
  'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO', 'Europe/Rome': 'IT',
  'Europe/Madrid': 'ES', 'Europe/Lisbon': 'PT', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Qatar': 'QA',
  'Asia/Kolkata': 'IN', 'Asia/Shanghai': 'CN', 'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Singapore': 'SG',
  'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU', 'Pacific/Auckland': 'NZ', 'America/Sao_Paulo': 'BR',
};
export const guessCountry = (tz: string): string | undefined => TZ[tz];

/* ---- accept a number from any country, output one format (E.164) ---- */
export const PHONE_ERROR =
  'Enter a valid phone number. If it is not a Rwandan number, include the country code, for example +44 7700 900123';
export const PHONE_HINT = 'Include your country code if outside Rwanda, e.g. +44 7700 900123';

/**
 * Starts with "+" or "00": the country is read from the code and the length checked for it
 * (unknown codes accept 8 to 15 digits). No "+": treated as a Rwandan number, as before.
 */
export function parsePhone(raw: string): { ok: boolean; e164: string } {
  const t = raw.trim().replace(/[()\s.-]/g, '');
  if (/^(\+|00)/.test(t)) {
    const digits = t.replace(/^(\+|00)/, '');
    if (!/^\d+$/.test(digits)) return { ok: false, e164: '' };
    const c = detectCountry(digits);
    if (c) {
      const rest = digits.slice(c.dial.length);
      const nat = !c.keepZero && rest.startsWith('0') ? rest.slice(1) : rest;
      const ok = c.iso === 'RW' ? /^7[2389]\d{7}$/.test(nat) : nat.length >= c.min && nat.length <= c.max;
      return { ok, e164: ok ? `+${c.dial}${nat}` : '' };
    }
    const ok = digits.length >= 8 && digits.length <= 15;
    return { ok, e164: ok ? `+${digits}` : '' };
  }
  const m = /^(250)?0?(7[2389]\d{7})$/.exec(t);
  return m ? { ok: true, e164: `+250${m[2]}` } : { ok: false, e164: '' };
}
