import { z } from 'zod';
import { emailSchema, fullNameSchema, phoneSchema } from '@/lib/validation/schemas';

/**
 * Garage booking. Five steps in the UI, one schema: the stepper validates the
 * fields for its current step with `trigger()`, and the whole object on submit.
 */
export const garageBookingSchema = z.object({
  service: z.enum(['service', 'inspection', 'charger-install', 'tyres', 'detailing', 'diagnostics'], {
    errorMap: () => ({ message: 'Choose a service' }),
  }),
  garage_slug: z.string().min(1, 'Choose a garage'),
  preferred_date: z
    .string()
    .min(1, 'Pick a date')
    .refine((value) => {
      const chosen = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today;
    }, 'Pick a date from today onward'),
  preferred_slot: z.string().min(1, 'Pick a time'),
  vehicle_make: z.string().trim().min(2, 'Make, e.g. BYD').max(40),
  vehicle_model: z.string().trim().min(1, 'Model, e.g. Atto 3').max(60),
  vehicle_plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{2,3}\s?\d{3}\s?[A-Z]$|^$/, 'Rwandan plate, e.g. RAD 123 A')
    .optional(),
  full_name: fullNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  notes: z.string().trim().max(600).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Tick this so the garage can confirm with you' }),
  }),
});
export type GarageBookingForm = z.infer<typeof garageBookingSchema>;
