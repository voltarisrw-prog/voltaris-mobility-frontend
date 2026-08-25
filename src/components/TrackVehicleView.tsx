'use client';

import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** Fires vehicle_view once per mount without turning the detail page into a client tree. */
export function TrackVehicleView(props: {
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  price: number | null;
}) {
  useEffect(() => {
    track('vehicle_view', {
      vehicle_id: props.vehicleId,
      make: props.make,
      model: props.model,
      year: props.year,
      price: props.price,
    });
  }, [props.vehicleId, props.make, props.model, props.year, props.price]);
  return null;
}
