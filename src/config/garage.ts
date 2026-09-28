/**
 * Garage services and partner workshops. Static until the backend exposes
 * `GET /garages`; the shape is chosen so that swap is a one-line change.
 */
export type GarageServiceId =
  | 'service'
  | 'inspection'
  | 'charger-install'
  | 'tyres'
  | 'detailing'
  | 'diagnostics';

export interface GarageService {
  id: GarageServiceId;
  label: string;
  line: string;
  /** Typical time in the workshop, shown so people can plan their day. */
  duration: string;
}

export const garageServices: GarageService[] = [
  { id: 'service', label: 'Scheduled service', line: 'Brakes, fluids, filters, software — by the book.', duration: 'Half a day' },
  { id: 'inspection', label: 'Pre-purchase inspection', line: 'Battery health, documents and a 120-point check before you buy.', duration: '2 hours' },
  { id: 'charger-install', label: 'Home charger install', line: 'Wallbox supply, wiring and REG-compliant sign-off at your house.', duration: '1 day' },
  { id: 'tyres', label: 'Tyres & alignment', line: 'EV-rated tyres, balancing and four-wheel alignment.', duration: '90 minutes' },
  { id: 'detailing', label: 'Detailing', line: 'Interior and exterior, ceramic coating on request.', duration: 'Half a day' },
  { id: 'diagnostics', label: 'Diagnostics', line: 'A warning light, a noise, a range drop — find out what it is.', duration: '1 hour' },
];

export interface GaragePartner {
  slug: string;
  name: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  services: GarageServiceId[];
  hours: string;
  note: string;
}

export const garagePartners: GaragePartner[] = [
  {
    slug: 'voltaris-kicukiro',
    name: 'Voltaris Service Centre',
    area: 'Kicukiro',
    address: 'KK 15 Rd, Kicukiro, Kigali',
    lat: -1.9706,
    lng: 30.1044,
    services: ['service', 'inspection', 'charger-install', 'tyres', 'detailing', 'diagnostics'],
    hours: 'Mon–Sat 08:00–18:00',
    note: 'Voltaris-run. Every inspection report on the marketplace is issued here.',
  },
  {
    slug: 'ev-lab-gasabo',
    name: 'EV Lab Kigali',
    area: 'Gasabo',
    address: 'KG 9 Ave, Kimihurura, Kigali',
    lat: -1.9502,
    lng: 30.0921,
    services: ['service', 'diagnostics', 'tyres'],
    hours: 'Mon–Fri 08:00–17:30',
    note: 'High-voltage certified technicians; BYD and Geely software tooling.',
  },
  {
    slug: 'gridwise-nyarugenge',
    name: 'Gridwise Charging',
    area: 'Nyarugenge',
    address: 'KN 3 Rd, Nyarugenge, Kigali',
    lat: -1.9441,
    lng: 30.0619,
    services: ['charger-install'],
    hours: 'Mon–Sat 08:00–17:00',
    note: 'Home and office wallboxes; surveys done on site before quoting.',
  },
  {
    slug: 'gloss-house-remera',
    name: 'Gloss House',
    area: 'Remera',
    address: 'KG 11 Ave, Remera, Kigali',
    lat: -1.9578,
    lng: 30.1125,
    services: ['detailing'],
    hours: 'Tue–Sun 09:00–18:00',
    note: 'Collection and return within Kigali included.',
  },
];

export const garageSlots = [
  { value: '08:00', label: '08:00' },
  { value: '10:00', label: '10:00' },
  { value: '12:00', label: '12:00' },
  { value: '14:00', label: '14:00' },
  { value: '16:00', label: '16:00' },
] as const;
