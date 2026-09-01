export interface RentalLocation {
  id: string;
  name: string;
  city: string;
}

export interface RentalQuoteLine {
  label: string;
  amount: number;
}

export interface RentalQuote {
  vehicle_id: string;
  location_id: string;
  start_date: string;
  end_date: string;
  nights: number;
  daily_rate: number;
  currency: string;
  /** e.g. "4 nights", "Service fee", "Refundable deposit" — the backend decides what's
      itemised, the same way Order.lines does for purchases. */
  lines: RentalQuoteLine[];
  total: number;
  available: boolean;
  /** Present when `available` is false — e.g. "Already booked 12–15 Jun". */
  unavailable_reason?: string;
}
