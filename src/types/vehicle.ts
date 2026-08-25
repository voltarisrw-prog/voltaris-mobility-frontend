export type VehicleCondition = 'new' | 'used' | 'certified';
export type BodyType = 'suv' | 'sedan' | 'hatchback' | 'pickup' | 'van' | 'motorcycle' | 'bus';
export type Drivetrain = 'fwd' | 'rwd' | 'awd';
export type ListingMode = 'sale' | 'rental' | 'sale_and_rental';
export type ListingStatus = 'available' | 'reserved' | 'sold' | 'unavailable';

export interface VehicleImage {
  /** Pre-derived, size-specific URLs produced by the media pipeline. Never the original. */
  thumb: string;
  card: string;
  detail: string;
  gallery: string;
  width: number;
  height: number;
  alt: string;
  blur_data_url?: string;
}

export interface VehicleSeller {
  type: 'dealer' | 'private';
  display_name: string;
  slug?: string;
  verified: boolean;
  /** Present only when the backend permits contact disclosure for this viewer. */
  phone?: string;
  whatsapp?: string;
}

export interface VehicleSummary {
  id: string;
  /** Backend-owned canonical slug: {make}-{model}-{year}-{location}. Never built client-side. */
  slug: string;
  make: string;
  model: string;
  variant?: string;
  year: number;
  /** Customer-facing price in minor units of `currency`. Null when price is on request. */
  price: number | null;
  currency: string;
  rental_price_per_day?: number | null;
  mileage_km: number;
  battery_kwh: number;
  range_km: number;
  body_type: BodyType;
  condition: VehicleCondition;
  location: { city: string; district?: string; slug: string };
  listing_mode: ListingMode;
  status: ListingStatus;
  verified: boolean;
  primary_image: VehicleImage | null;
  published_at: string;
}

export interface VehicleDetail extends VehicleSummary {
  description: string;
  images: VehicleImage[];
  seller: VehicleSeller;
  drivetrain: Drivetrain;
  power_kw: number;
  torque_nm?: number;
  top_speed_kph?: number;
  seats: number;
  doors: number;
  charging: {
    ac_kw: number;
    dc_kw: number | null;
    port_type: string;
    dc_10_80_minutes: number | null;
  };
  dimensions?: { length_mm: number; width_mm: number; height_mm: number; boot_litres?: number };
  warranty?: { vehicle_months?: number; battery_months?: number; battery_km?: number };
  features: string[];
  financing_available: boolean;
  test_drive_available: boolean;
  purchase_enabled: boolean;
  rental_enabled: boolean;
  faqs: { question: string; answer: string }[];
  updated_at: string;
}
