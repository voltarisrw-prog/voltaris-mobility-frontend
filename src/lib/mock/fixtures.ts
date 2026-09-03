import type { VehicleDetail, VehicleImage, VehicleSummary } from '@/types/vehicle';
import type { DealerDetail } from '@/types/dealer';
import type { Article } from '@/lib/api/content';
import type { PublicUser } from '@/lib/api/auth';
import type {
  InquiryRecord,
  NotificationRecord,
  Profile,
  ReservationRecord,
  SavedSearch,
  TestDriveRecord,
} from '@/lib/api/users';

/**
 * Demo data for local/preview use while the real backend isn't reachable — see
 * NEXT_PUBLIC_DEMO_DATA in `.env.example` and the routing in `./resolve.ts`.
 *
 * Photos live in /public/demo (checked into the repo, not fetched at runtime).
 * A real backend produces a distinct URL per size (thumb/card/detail/gallery);
 * here every size of a given vehicle points at the same file — fine for
 * checking layout, not representative of real image weight.
 *
 * The two vehicle-adjacent photos that didn't fit any body type in
 * `types/vehicle.ts` (a curtain-side and a box truck — there's no "truck"
 * option, only van/suv/sedan/etc.) are used as editorial imagery instead of
 * forced into a mismatched vehicle listing.
 */

function image(path: string, alt: string): VehicleImage {
  const url = `/demo/vehicles/${path}`;
  return { thumb: url, card: url, detail: url, gallery: url, width: 1536, height: 1024, alt };
}

const DAY = 86_400_000;
const now = () => new Date();
const daysAgo = (n: number) => new Date(now().getTime() - n * DAY).toISOString();

export const MOCK_VEHICLES: VehicleDetail[] = [
  {
    id: 'v-tesla-mzplaid-24',
    slug: 'tesla-model-s-2024-kigali',
    make: 'Tesla',
    model: 'Model S',
    variant: 'Plaid',
    year: 2024,
    price: 148_000_000,
    currency: 'RWF',
    rental_price_per_day: 95_000,
    mileage_km: 6_200,
    battery_kwh: 100,
    range_km: 600,
    body_type: 'sedan',
    condition: 'certified',
    location: { city: 'Kigali', district: 'Kacyiru', slug: 'kigali-kacyiru' },
    listing_mode: 'sale_and_rental',
    status: 'available',
    verified: true,
    primary_image: image(
      'model-s-black.jpg',
      'Black Tesla Model S Plaid, three-quarter front view',
    ),
    published_at: daysAgo(2),
    description:
      'A Plaid in as-new condition, one owner, full service history through Voltaris. Tri-motor, the fastest production sedan currently listed on the platform.',
    images: [image('model-s-black.jpg', 'Black Tesla Model S Plaid, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'Kigali Prime Motors',
      slug: 'kigali-prime-motors',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 760,
    torque_nm: 1420,
    top_speed_kph: 322,
    seats: 5,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 250, port_type: 'CCS2', dc_10_80_minutes: 27 },
    dimensions: { length_mm: 4970, width_mm: 1987, height_mm: 1445, boot_litres: 793 },
    warranty: { vehicle_months: 24, battery_months: 96, battery_km: 192_000 },
    features: [
      'Autopilot',
      'Panoramic glass roof',
      'Premium audio',
      'Air suspension',
      'Heated seats (all rows)',
    ],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: true,
    faqs: [
      {
        question: 'Is the battery health report included?',
        answer:
          'Yes — every listing includes a battery health report from Voltaris inspection, available on request.',
      },
      {
        question: 'Can this be delivered outside Kigali?',
        answer:
          'Delivery is available nationwide at an additional cost, arranged after reservation.',
      },
    ],
    updated_at: daysAgo(1),
  },
  {
    id: 'v-tesla-mzlr-22',
    slug: 'tesla-model-s-2022-kigali',
    make: 'Tesla',
    model: 'Model S',
    variant: 'Long Range',
    year: 2022,
    price: 96_000_000,
    currency: 'RWF',
    rental_price_per_day: null,
    mileage_km: 24_500,
    battery_kwh: 95,
    range_km: 480,
    body_type: 'sedan',
    condition: 'used',
    location: { city: 'Kigali', district: 'Nyarutarama', slug: 'kigali-nyarutarama' },
    listing_mode: 'sale',
    status: 'available',
    verified: true,
    primary_image: image('model-s-black.jpg', 'Black Tesla Model S, three-quarter front view'),
    published_at: daysAgo(14),
    description:
      'Second owner, imported and re-registered in Rwanda in 2023. Minor kerb rash on the left rear rim, disclosed and priced in.',
    images: [image('model-s-black.jpg', 'Black Tesla Model S, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'Kigali Prime Motors',
      slug: 'kigali-prime-motors',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 493,
    torque_nm: 910,
    top_speed_kph: 250,
    seats: 5,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 250, port_type: 'CCS2', dc_10_80_minutes: 30 },
    dimensions: { length_mm: 4970, width_mm: 1987, height_mm: 1445, boot_litres: 793 },
    warranty: { vehicle_months: 12, battery_months: 60, battery_km: 120_000 },
    features: ['Autopilot', 'Panoramic glass roof', 'Premium audio', 'Heated seats (all rows)'],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: false,
    faqs: [],
    updated_at: daysAgo(9),
  },
  {
    id: 'v-porsche-taycan4s-23',
    slug: 'porsche-taycan-2023-kigali',
    make: 'Porsche',
    model: 'Taycan',
    variant: '4S',
    year: 2023,
    price: 172_000_000,
    currency: 'RWF',
    rental_price_per_day: 130_000,
    mileage_km: 11_000,
    battery_kwh: 93,
    range_km: 420,
    body_type: 'sedan',
    condition: 'certified',
    location: { city: 'Kigali', district: 'Kiyovu', slug: 'kigali-kiyovu' },
    listing_mode: 'sale_and_rental',
    status: 'available',
    verified: true,
    primary_image: image('taycan-white.jpg', 'White Porsche Taycan 4S, three-quarter front view'),
    published_at: daysAgo(5),
    description:
      'Voltaris-inspected, no accident history. Yellow calipers, Performance Battery Plus. A regular in the weekend rental rotation.',
    images: [image('taycan-white.jpg', 'White Porsche Taycan 4S, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'Rift Valley EV Co.',
      slug: 'rift-valley-ev-co',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 360,
    torque_nm: 650,
    top_speed_kph: 250,
    seats: 4,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 270, port_type: 'CCS2', dc_10_80_minutes: 22 },
    dimensions: { length_mm: 4963, width_mm: 1966, height_mm: 1381, boot_litres: 407 },
    warranty: { vehicle_months: 24, battery_months: 96, battery_km: 192_000 },
    features: [
      'Sport Chrono',
      'Adaptive air suspension',
      'Bose surround sound',
      'Matrix LED headlights',
    ],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: true,
    faqs: [
      {
        question: 'Is this the same car used for rentals?',
        answer:
          'Yes — check available dates before reserving a purchase test drive on a day it is booked out.',
      },
    ],
    updated_at: daysAgo(3),
  },
  {
    id: 'v-porsche-taycanturbos-24',
    slug: 'porsche-taycan-turbo-s-2024-kigali',
    make: 'Porsche',
    model: 'Taycan',
    variant: 'Turbo S',
    year: 2024,
    price: 245_000_000,
    currency: 'RWF',
    rental_price_per_day: null,
    mileage_km: 2_100,
    battery_kwh: 93,
    range_km: 450,
    body_type: 'sedan',
    condition: 'used',
    location: { city: 'Kigali', district: 'Kiyovu', slug: 'kigali-kiyovu' },
    listing_mode: 'sale',
    status: 'available',
    verified: true,
    primary_image: image(
      'taycan-white.jpg',
      'White Porsche Taycan Turbo S, three-quarter front view',
    ),
    published_at: daysAgo(1),
    description:
      'The newest listing on the floor. Barely run in — under 2,200km. Full options list, ceramic brakes.',
    images: [image('taycan-white.jpg', 'White Porsche Taycan Turbo S, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'Rift Valley EV Co.',
      slug: 'rift-valley-ev-co',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 460,
    torque_nm: 1050,
    top_speed_kph: 260,
    seats: 4,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 270, port_type: 'CCS2', dc_10_80_minutes: 22 },
    dimensions: { length_mm: 4963, width_mm: 1966, height_mm: 1381, boot_litres: 407 },
    warranty: { vehicle_months: 24, battery_months: 96, battery_km: 192_000 },
    features: ['Carbon ceramic brakes', 'Sport Chrono', 'Rear-axle steering', 'Burmester 3D audio'],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: false,
    faqs: [],
    updated_at: daysAgo(1),
  },
  {
    id: 'v-mb-eqs580-23',
    slug: 'mercedes-eqs-2023-kigali',
    make: 'Mercedes-Benz',
    model: 'EQS',
    variant: '580',
    year: 2023,
    price: 178_000_000,
    currency: 'RWF',
    rental_price_per_day: 110_000,
    mileage_km: 9_800,
    battery_kwh: 108,
    range_km: 590,
    body_type: 'sedan',
    condition: 'certified',
    location: { city: 'Kigali', district: 'Kimihurura', slug: 'kigali-kimihurura' },
    listing_mode: 'sale_and_rental',
    status: 'available',
    verified: true,
    primary_image: image('eqs-black.jpg', 'Black Mercedes-Benz EQS 580, three-quarter front view'),
    published_at: daysAgo(8),
    description:
      'The longest range on the floor. Executive rear seating package, MBUX Hyperscreen. Popular as an airport-transfer rental.',
    images: [image('eqs-black.jpg', 'Black Mercedes-Benz EQS 580, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'Kigali Prime Motors',
      slug: 'kigali-prime-motors',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 400,
    torque_nm: 858,
    top_speed_kph: 210,
    seats: 5,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 200, port_type: 'CCS2', dc_10_80_minutes: 31 },
    dimensions: { length_mm: 5216, width_mm: 1926, height_mm: 1512, boot_litres: 610 },
    warranty: { vehicle_months: 24, battery_months: 96, battery_km: 192_000 },
    features: [
      'MBUX Hyperscreen',
      'Executive rear seats',
      'Burmester 4D audio',
      'Air Balance package',
    ],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: true,
    faqs: [],
    updated_at: daysAgo(4),
  },
  {
    id: 'v-mb-eqs450-22',
    slug: 'mercedes-eqs-2022-musanze',
    make: 'Mercedes-Benz',
    model: 'EQS',
    variant: '450+',
    year: 2022,
    price: 134_000_000,
    currency: 'RWF',
    rental_price_per_day: null,
    mileage_km: 31_000,
    battery_kwh: 90,
    range_km: 520,
    body_type: 'sedan',
    condition: 'used',
    location: { city: 'Musanze', slug: 'musanze' },
    listing_mode: 'sale',
    status: 'available',
    verified: false,
    primary_image: image('eqs-black.jpg', 'Black Mercedes-Benz EQS 450+, three-quarter front view'),
    published_at: daysAgo(20),
    description:
      'Private sale, listed directly by the owner. Voltaris verification is pending — the seller has been contacted for documents.',
    images: [image('eqs-black.jpg', 'Black Mercedes-Benz EQS 450+, three-quarter front view')],
    seller: {
      type: 'private',
      display_name: 'Private seller',
      verified: false,
      phone: '+250788112233',
    },
    drivetrain: 'rwd',
    power_kw: 245,
    torque_nm: 568,
    top_speed_kph: 210,
    seats: 5,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 200, port_type: 'CCS2', dc_10_80_minutes: 31 },
    dimensions: { length_mm: 5216, width_mm: 1926, height_mm: 1512, boot_litres: 610 },
    features: ['MBUX infotainment', 'Adaptive cruise control'],
    financing_available: false,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: false,
    faqs: [
      {
        question: 'Why is this listing not verified?',
        answer:
          'This is a private sale awaiting document review. Arrange an independent inspection before paying a deposit.',
      },
    ],
    updated_at: daysAgo(20),
  },
  {
    id: 'v-mb-eqv300-23',
    slug: 'mercedes-eqv-2023-kigali',
    make: 'Mercedes-Benz',
    model: 'EQV',
    variant: '300',
    year: 2023,
    price: 156_000_000,
    currency: 'RWF',
    rental_price_per_day: 140_000,
    mileage_km: 14_200,
    battery_kwh: 90,
    range_km: 363,
    body_type: 'van',
    condition: 'certified',
    location: { city: 'Kigali', district: 'Kanombe (Airport)', slug: 'kigali-kanombe' },
    listing_mode: 'sale_and_rental',
    status: 'available',
    verified: true,
    primary_image: image('vclass-black.jpg', 'Black Mercedes-Benz EQV, three-quarter front view'),
    published_at: daysAgo(6),
    description:
      "Seven-seat electric van, the vehicle behind most of Voltaris's VIP airport-transfer bookings. Leather captain's chairs, privacy glass.",
    images: [image('vclass-black.jpg', 'Black Mercedes-Benz EQV, three-quarter front view')],
    seller: {
      type: 'dealer',
      display_name: 'VoltMove Fleet & Logistics',
      slug: 'voltmove-fleet-logistics',
      verified: true,
    },
    drivetrain: 'fwd',
    power_kw: 150,
    torque_nm: 362,
    top_speed_kph: 160,
    seats: 7,
    doors: 4,
    charging: { ac_kw: 11, dc_kw: 110, port_type: 'CCS2', dc_10_80_minutes: 45 },
    dimensions: { length_mm: 5140, width_mm: 1928, height_mm: 1901, boot_litres: 1030 },
    warranty: { vehicle_months: 24, battery_months: 96, battery_km: 160_000 },
    features: ["Captain's chairs", 'Privacy glass', 'Dual sliding doors', 'Chauffeur partition'],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: true,
    faqs: [],
    updated_at: daysAgo(2),
  },
  {
    id: 'v-toyota-lc-hybrid-23',
    slug: 'toyota-land-cruiser-2023-kigali',
    make: 'Toyota',
    model: 'Land Cruiser',
    variant: 'V8 Hybrid',
    year: 2023,
    price: 132_000_000,
    currency: 'RWF',
    rental_price_per_day: null,
    mileage_km: 18_000,
    battery_kwh: 1.9,
    range_km: 8,
    body_type: 'suv',
    condition: 'certified',
    location: { city: 'Kigali', district: 'Remera', slug: 'kigali-remera' },
    listing_mode: 'sale',
    status: 'available',
    verified: true,
    primary_image: image(
      'landcruiser-black.jpg',
      'Black Toyota Land Cruiser V8 Hybrid, three-quarter front view',
    ),
    published_at: daysAgo(11),
    description:
      'Mild-hybrid V8 — the battery buys back fuel economy and low-speed torque, not a long electric-only range. Full Toyota Rwanda service history.',
    images: [
      image(
        'landcruiser-black.jpg',
        'Black Toyota Land Cruiser V8 Hybrid, three-quarter front view',
      ),
    ],
    seller: {
      type: 'dealer',
      display_name: 'Kigali Prime Motors',
      slug: 'kigali-prime-motors',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 305,
    torque_nm: 650,
    top_speed_kph: 210,
    seats: 7,
    doors: 5,
    charging: {
      ac_kw: 3.3,
      dc_kw: null,
      port_type: 'Type 1 (mild-hybrid, AC only)',
      dc_10_80_minutes: null,
    },
    dimensions: { length_mm: 5015, width_mm: 1980, height_mm: 1925, boot_litres: 175 },
    warranty: { vehicle_months: 24, battery_months: 60, battery_km: 100_000 },
    features: ['Third-row seating', 'Crawl control', 'Multi-terrain select', 'JBL premium audio'],
    financing_available: true,
    test_drive_available: true,
    purchase_enabled: true,
    rental_enabled: false,
    faqs: [
      {
        question: 'Is this fully electric?',
        answer:
          'No — this is a mild hybrid. The small battery improves fuel economy and low-speed response; it does not drive on electric power alone for any real distance.',
      },
    ],
    updated_at: daysAgo(7),
  },
  {
    id: 'v-toyota-lc-hybrid-21',
    slug: 'toyota-land-cruiser-2021-rubavu',
    make: 'Toyota',
    model: 'Land Cruiser',
    variant: 'V8 Hybrid',
    year: 2021,
    price: 108_000_000,
    currency: 'RWF',
    rental_price_per_day: null,
    mileage_km: 58_000,
    battery_kwh: 1.6,
    range_km: 6,
    body_type: 'suv',
    condition: 'used',
    location: { city: 'Rubavu', slug: 'rubavu' },
    listing_mode: 'sale',
    status: 'sold',
    verified: true,
    primary_image: image(
      'landcruiser-black.jpg',
      'Black Toyota Land Cruiser V8 Hybrid, three-quarter front view',
    ),
    published_at: daysAgo(45),
    description: 'Sold — kept here as a recently-closed reference listing.',
    images: [
      image(
        'landcruiser-black.jpg',
        'Black Toyota Land Cruiser V8 Hybrid, three-quarter front view',
      ),
    ],
    seller: {
      type: 'dealer',
      display_name: 'Rift Valley EV Co.',
      slug: 'rift-valley-ev-co',
      verified: true,
    },
    drivetrain: 'awd',
    power_kw: 305,
    torque_nm: 650,
    top_speed_kph: 210,
    seats: 7,
    doors: 5,
    charging: {
      ac_kw: 3.3,
      dc_kw: null,
      port_type: 'Type 1 (mild-hybrid, AC only)',
      dc_10_80_minutes: null,
    },
    dimensions: { length_mm: 5015, width_mm: 1980, height_mm: 1925, boot_litres: 175 },
    features: ['Third-row seating', 'Crawl control', 'Multi-terrain select'],
    financing_available: false,
    test_drive_available: false,
    purchase_enabled: false,
    rental_enabled: false,
    faqs: [],
    updated_at: daysAgo(30),
  },
];

export interface MockDealer extends DealerDetail {
  vehicleSlugs: string[];
}

/**
 * No real manufacturer logos here on purpose — see the conversation this data
 * was requested in. `logo_url: null` is not a missing asset; it is the
 * correct value, and DealerCard already renders an initials badge for it.
 */
export const MOCK_DEALERS: MockDealer[] = [
  {
    id: 'd-kigali-prime',
    slug: 'kigali-prime-motors',
    name: 'Kigali Prime Motors',
    verified: true,
    city: 'Kigali',
    logo_url: null,
    vehicle_count: 3,
    description:
      'A showroom on KG 7 Ave specialising in certified pre-owned EVs, with an in-house inspection bay Voltaris audits quarterly.',
    address: 'KG 7 Ave, Kacyiru, Kigali',
    phone: '+250788445566',
    whatsapp: '250788445566',
    website: 'https://example.com',
    established_year: 2019,
    cover_image_url: '/demo/lifestyle/dealership-handshake.jpg',
    vehicleSlugs: [
      'tesla-model-s-2024-kigali',
      'tesla-model-s-2022-kigali',
      'mercedes-eqs-2023-kigali',
      'toyota-land-cruiser-2023-kigali',
    ],
  },
  {
    id: 'd-rift-valley',
    slug: 'rift-valley-ev-co',
    name: 'Rift Valley EV Co.',
    verified: true,
    city: 'Musanze',
    logo_url: null,
    vehicle_count: 3,
    description:
      "Northern Province's EV specialist — sales, rentals, and a growing charging network toward Volcanoes National Park.",
    address: 'NR4, Musanze',
    phone: '+250788778899',
    whatsapp: '250788778899',
    established_year: 2022,
    cover_image_url: '/demo/lifestyle/villa-sunset-charging.jpg',
    vehicleSlugs: [
      'porsche-taycan-2023-kigali',
      'porsche-taycan-turbo-s-2024-kigali',
      'toyota-land-cruiser-2021-rubavu',
    ],
  },
  {
    id: 'd-lakeside-rubavu',
    slug: 'lakeside-auto-rubavu',
    name: 'Lakeside Auto Rubavu',
    verified: false,
    city: 'Rubavu',
    logo_url: null,
    vehicle_count: 0,
    description:
      'A small independent lot by Lake Kivu. Verification documents are under review with Voltaris.',
    address: 'Rubavu town',
    // No cover photo on file — deliberately, so the dealer showcase's "drop
    // anyone with no cover image" path has something real to filter out.
    cover_image_url: null,
    vehicleSlugs: [],
  },
  {
    id: 'd-voltmove',
    slug: 'voltmove-fleet-logistics',
    name: 'VoltMove Fleet & Logistics',
    verified: true,
    city: 'Kigali',
    logo_url: null,
    vehicle_count: 1,
    description:
      'Commercial EV and hybrid fleet sales and airport-transfer rentals for corporate accounts.',
    address: 'Special Economic Zone, Kigali',
    phone: '+250788990011',
    whatsapp: '250788990011',
    established_year: 2021,
    cover_image_url: '/demo/vehicles/truck-box-white.jpg',
    vehicleSlugs: ['mercedes-eqv-2023-kigali'],
  },
];

const cover = (path: string, alt: string) => ({
  url: `/demo/lifestyle/${path}`,
  alt,
  width: 1536,
  height: 1024,
});

export const MOCK_ARTICLES: Article[] = [
  {
    slug: 'voltaris-opens-rental-fleet-kigali',
    kind: 'blog',
    title: 'Voltaris opens an EV rental fleet in Kigali',
    excerpt:
      'Six vehicles, three locations, and a reservation flow built for dates, not just a filter.',
    category: 'news',
    cover_image: cover(
      'villa-sunset-charging.jpg',
      'A Porsche Taycan charging at a modern Kigali villa at dusk',
    ),
    author: 'Voltaris Team',
    reading_minutes: 4,
    published_at: daysAgo(2),
    updated_at: daysAgo(2),
    body_html:
      '<p>Starting this week, a subset of the Voltaris catalog is available to rent by the day, not just to buy. The rental flow asks for a location and dates up front, then only shows vehicles Voltaris can actually confirm for that window.</p><p>It launches with six vehicles across three pickup points in Kigali, with more locations planned as the fleet grows.</p>',
    faqs: [],
    related_slugs: ['home-charging-setup-kigali', 'six-evs-worth-cross-shopping-rwanda'],
  },
  {
    slug: 'six-evs-worth-cross-shopping-rwanda',
    kind: 'blog',
    title: 'Six EVs worth cross-shopping in Rwanda right now',
    excerpt:
      'From a Polestar 2 to a Taycan — what six very different price points actually buy you.',
    category: 'comparisons',
    cover_image: cover(
      'ev-lineup.jpg',
      'Six electric vehicles from different manufacturers lined up in a studio',
    ),
    author: 'Eric N.',
    reading_minutes: 7,
    published_at: daysAgo(9),
    updated_at: daysAgo(9),
    body_html:
      "<p>Range, charging speed, and running cost matter more than badge prestige once you're actually paying for electricity in Kigali. Here's how six current listings stack up against each other on the numbers that matter.</p>",
    faqs: [],
    related_slugs: ['voltaris-opens-rental-fleet-kigali'],
  },
  {
    slug: 'what-voltaris-verification-checks',
    kind: 'blog',
    title: '"Verified" actually means something here — here\'s what it checks',
    excerpt:
      'Documents, a physical inspection, and a battery health read before a listing can carry the mark.',
    category: 'insights',
    cover_image: cover(
      'dealership-handshake.jpg',
      'Two people shaking hands in a car dealership showroom',
    ),
    author: 'Aline U.',
    reading_minutes: 5,
    published_at: daysAgo(16),
    updated_at: daysAgo(16),
    body_html:
      "<p>A verified badge on Voltaris means three things happened before the listing went live: ownership documents were checked, the vehicle was physically inspected, and — for EVs and hybrids — battery health was measured rather than taken on the seller's word.</p>",
    faqs: [],
    related_slugs: [],
  },
  {
    slug: 'rwanda-fleets-going-hybrid',
    kind: 'blog',
    title: "Rwanda's commercial fleets are going hybrid",
    excerpt:
      'Heavy-duty logistics is the quiet half of the transition — long before it shows up in showroom sales.',
    category: 'market',
    cover_image: cover(
      'truck-curtain-black.jpg',
      'A black curtain-side heavy truck in a studio setting',
    ),
    author: 'Voltaris Team',
    reading_minutes: 6,
    published_at: daysAgo(23),
    updated_at: daysAgo(23),
    body_html:
      '<p>Passenger EVs get the headlines, but freight operators running the Kigali–Musanze corridor are the ones actually running the numbers on hybrid drivetrains, where fuel is the single largest line item.</p>',
    faqs: [],
    related_slugs: [],
  },
  {
    slug: 'weekend-ev-road-trip-kigali-cafe',
    kind: 'blog',
    title: "A weekend loop: Kigali's best stops by EV",
    excerpt: "Range anxiety is mostly a planning problem. Here's a loop that solves it.",
    category: 'owner-stories',
    cover_image: cover(
      'cafe-noir-evening.jpg',
      'A couple walking past a parked EV outside a café at night',
    ),
    author: 'Aline U.',
    reading_minutes: 5,
    published_at: daysAgo(30),
    updated_at: daysAgo(30),
    body_html:
      "<p>A reader-submitted loop through Kigali's evening spots, timed around a single top-up rather than a full charge — the way most owners actually drive.</p>",
    faqs: [],
    related_slugs: [],
  },
  {
    slug: 'first-time-ev-owner-checklist',
    kind: 'guide',
    title: 'Bringing home your first EV: a day-one checklist',
    excerpt:
      'The charger, the app, the tyre pressures — everything to sort out before the first full week.',
    category: 'buying-guides',
    cover_image: cover(
      'family-home-charging.jpg',
      'A family celebrating with car keys in front of their new EV at home',
    ),
    author: 'Voltaris Team',
    reading_minutes: 8,
    published_at: daysAgo(40),
    updated_at: daysAgo(12),
    body_html:
      '<p>A first EV changes a few daily habits more than it changes anything mechanical. This is the list Voltaris hands new owners at handover, kept up to date as the models on the platform change.</p>',
    faqs: [
      {
        question: 'Do I need a home charger on day one?',
        answer:
          'Not necessarily — most first weeks run fine on a standard outlet. Plan the home charger install within the first month.',
      },
    ],
    related_slugs: ['home-charging-setup-kigali'],
  },
  {
    slug: 'home-charging-setup-kigali',
    kind: 'guide',
    title: "Home charging setup for Kigali's new EV owners",
    excerpt: 'What a wallbox install actually involves, and what it costs before you commit.',
    category: 'charging',
    cover_image: cover(
      'villa-sunset-charging.jpg',
      'A Porsche Taycan charging at a modern villa overlooking a city skyline at dusk',
    ),
    author: 'Eric N.',
    reading_minutes: 6,
    published_at: daysAgo(55),
    updated_at: daysAgo(20),
    body_html:
      '<p>A wallbox is not required to own an EV in Kigali, but it changes daily charging from an errand into a non-event. Here is what the install actually involves, wired through REG-approved electricians.</p>',
    faqs: [],
    related_slugs: ['first-time-ev-owner-checklist'],
  },
  {
    slug: 'airport-transfer-fleet-guide',
    kind: 'guide',
    title: 'Choosing a VIP airport transfer vehicle',
    excerpt: 'What actually matters for a corporate account booking a recurring transfer.',
    category: 'ownership',
    cover_image: cover(
      'vip-airport-transfer.jpg',
      'A chauffeur beside a black Mercedes-Benz van at a VIP arrivals terminal',
    ),
    author: 'Voltaris Team',
    reading_minutes: 5,
    published_at: daysAgo(60),
    updated_at: daysAgo(25),
    body_html:
      "<p>For a recurring corporate transfer contract, range and charge time matter more than luxury trim — the vehicle needs to complete the day's full schedule of transfers without a mid-shift charging stop.</p>",
    faqs: [],
    related_slugs: ['voltaris-opens-rental-fleet-kigali'],
  },
  {
    slug: 'ev-road-trip-planning-rwanda',
    kind: 'guide',
    title: 'Planning a longer EV road trip in Rwanda',
    excerpt:
      'Charger coverage outside Kigali is thinner than it looks on a map — how to plan around it.',
    category: 'market',
    cover_image: cover(
      'driving-pov-palms.jpg',
      'A woman driving an EV, viewed from the passenger seat, with palm trees outside',
    ),
    author: 'Aline U.',
    reading_minutes: 7,
    published_at: daysAgo(70),
    updated_at: daysAgo(30),
    body_html:
      '<p>A route Voltaris has now run several times with different EVs, with the charging stops and realistic dwell times that never make it onto the marketing map.</p>',
    faqs: [],
    related_slugs: [],
  },
];

// ---------------------------------------------------------------------------
// The signed-in demo account — see NEXT_PUBLIC_DEMO_DATA and lib/mock/session.ts.
// Login accepts any email/password that passes the form's own validation and
// signs in as this one fixed person; there's no real multi-account system
// behind it. Profile edits and saved-vehicle/search writes echo back
// successfully but aren't persisted anywhere — a page reload reverts them,
// since there's no server for a demo session to actually live on.

export const DEMO_USER: PublicUser = {
  id: 'demo-user-1',
  full_name: 'Aline Uwase',
  email: 'aline@example.com',
  roles: ['BUYER'],
  email_verified: true,
  mfa_enabled: false,
};

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER.id,
  full_name: DEMO_USER.full_name,
  email: DEMO_USER.email,
  phone: '+250788223344',
  email_verified: true,
  preferred_language: 'en',
  marketing_opt_in: true,
  created_at: daysAgo(210),
};

function vehicleRef(slug: string) {
  const vehicle = MOCK_VEHICLES.find((v) => v.slug === slug);
  if (!vehicle) throw new Error(`lib/mock/fixtures: no vehicle with slug "${slug}"`);
  return vehicle;
}

const taycan = vehicleRef('porsche-taycan-2023-kigali');
const eqv = vehicleRef('mercedes-eqv-2023-kigali');
const modelS = vehicleRef('tesla-model-s-2024-kigali');
const eqs = vehicleRef('mercedes-eqs-2023-kigali');

export const DEMO_SAVED_VEHICLES: VehicleSummary[] = [taycan, eqs];

export const DEMO_SAVED_SEARCHES: SavedSearch[] = [
  {
    id: 'search-1',
    label: 'Long-range EVs under 180M',
    query: 'minRange=400&maxPrice=180000000&sort=range_desc',
    alerts_enabled: true,
    created_at: daysAgo(18),
  },
];

export const DEMO_INQUIRIES: InquiryRecord[] = [
  {
    reference: 'ENQ-DEMO01',
    vehicle: {
      id: eqs.id,
      slug: eqs.slug,
      make: eqs.make,
      model: eqs.model,
      year: eqs.year,
      primary_image: typeof eqs.primary_image === "string" ? eqs.primary_image : (eqs.primary_image as any)?.url,
    },
    status: 'answered',
    created_at: daysAgo(5),
  },
];

export const DEMO_TEST_DRIVES: TestDriveRecord[] = [
  {
    reference: 'TD-DEMO01',
    vehicle: {
      id: modelS.id,
      slug: modelS.slug,
      make: modelS.make,
      model: modelS.model,
      year: modelS.year,
    },
    status: 'confirmed',
    scheduled_for: new Date(now().getTime() + 3 * DAY).toISOString(),
    location: 'Kigali — Kacyiru',
  },
];

export const DEMO_RESERVATIONS: ReservationRecord[] = [
  {
    reference: 'RES-DEMO01',
    vehicle: {
      id: eqv.id,
      slug: eqv.slug,
      make: eqv.make,
      model: eqv.model,
      year: eqv.year,
      primary_image: typeof eqv.primary_image === "string" ? eqv.primary_image : (eqv.primary_image as any)?.url,
    },
    status: 'confirmed',
    pickup_date: new Date(now().getTime() + 5 * DAY).toISOString().slice(0, 10),
    return_date: new Date(now().getTime() + 7 * DAY).toISOString().slice(0, 10),
    pickup_location: 'Kigali — Kanombe (Airport)',
  },
  {
    reference: 'RES-DEMO02',
    vehicle: {
      id: taycan.id,
      slug: taycan.slug,
      make: taycan.make,
      model: taycan.model,
      year: taycan.year,
      primary_image: typeof taycan.primary_image === "string" ? taycan.primary_image : (taycan.primary_image as any)?.url,
    },
    status: 'completed',
    pickup_date: daysAgo(20).slice(0, 10),
    return_date: daysAgo(18).slice(0, 10),
    pickup_location: 'Kigali — Kiyovu',
  },
];

export const DEMO_NOTIFICATIONS: NotificationRecord[] = [
  {
    id: 'notif-1',
    title: 'Your EQV rental is confirmed',
    body: 'Pickup at Kanombe (Airport) is booked. Bring your driving licence.',
    read: false,
    created_at: daysAgo(1),
    href: `/rent/reservation/${DEMO_RESERVATIONS[0]!.reference}`,
  },
  {
    id: 'notif-2',
    title: 'Kigali Prime Motors replied to your enquiry',
    body: 'They answered your question about the EQS 580\u2019s warranty coverage.',
    read: true,
    created_at: daysAgo(5),
    href: `/cars/${eqs.slug}`,
  },
];
