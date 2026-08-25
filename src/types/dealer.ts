export interface DealerSummary {
  id: string;
  slug: string;
  name: string;
  verified: boolean;
  city: string;
  logo_url: string | null;
  vehicle_count: number;
}

export interface DealerDetail extends DealerSummary {
  description: string;
  address: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  established_year?: number;
  cover_image_url: string | null;
}
