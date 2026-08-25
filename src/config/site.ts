import { envUrl } from '@/lib/env';

export const site = {
  name: 'Voltaris Mobility',
  legalName: 'Voltaris Mobility Ltd',
  tagline: 'Find your next drive',
  // envUrl, not `??`: a blank NEXT_PUBLIC_SITE_URL in a hosting dashboard is an
  // empty string, which `??` passes straight through to `new URL('')`.
  url: envUrl('NEXT_PUBLIC_SITE_URL', process.env.NEXT_PUBLIC_SITE_URL, 'https://voltaris.rw'),
  locale: 'en_RW',
  currency: 'RWF',
  country: 'RW',
  contact: { email: 'hello@voltaris.rw', phone: '+250788000000', whatsapp: '250788000000' },
  address: { locality: 'Kigali', region: 'Kigali City', country: 'RW' },
  social: {
    x: 'https://x.com/voltarisrw',
    linkedin: 'https://www.linkedin.com/company/voltarisrw',
  },
} as const;

/** Market ceiling used to normalise the range meter. Sourced from backend config later. */
export const MARKET_MAX_RANGE_KM = 700;
