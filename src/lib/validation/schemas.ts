import { z } from 'zod';

/**
 * Client-side validation is a courtesy to the person filling the form, nothing more.
 * The backend re-validates everything. Nothing here is a security control.
 */

// Rwandan mobile numbers: +2507XXXXXXXX or 07XXXXXXXX.
export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?250)?0?7[2389]\d{7}$/, 'Enter a Rwandan mobile number, for example 0788 123 456');

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email address');

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Enter your full name')
  .max(120, 'That name is too long');

export const inquirySchema = z.object({
  vehicle_id: z.string().min(1),
  full_name: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z
    .string()
    .trim()
    .min(10, 'Tell the seller what you want to know — at least a sentence')
    .max(1500, 'Keep it under 1500 characters'),
  preferred_channel: z.enum(['email', 'phone', 'whatsapp']),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Tick this so we can pass on your details' }),
  }),
});

export type InquiryForm = z.infer<typeof inquirySchema>;

/**
 * General enquiry from the homepage. No `vehicle_id`, because the person has not
 * chosen one yet — this is the top of the funnel, and demanding a listing first
 * loses exactly the buyers who do not know what they want.
 */
export const generalInquirySchema = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  topic: z.enum(['buying', 'selling', 'renting', 'partnership', 'other']),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little about what you need')
    .max(1500, 'Keep it under 1500 characters'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Tick this so we can reply' }),
  }),
});

export type GeneralInquiryForm = z.infer<typeof generalInquirySchema>;

export const testDriveSchema = z.object({
  vehicle_id: z.string().min(1, 'Choose a vehicle'),
  full_name: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  preferred_date: z
    .string()
    .min(1, 'Pick a date')
    .refine((value) => {
      const chosen = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today;
    }, 'Pick a date from today onward'),
  preferred_time_slot: z.enum(['morning', 'afternoon', 'evening']),
  location_slug: z.string().min(1, 'Choose where you want to drive it'),
  notes: z.string().trim().max(600).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Tick this so we can arrange the drive' }),
  }),
});

export type TestDriveForm = z.infer<typeof testDriveSchema>;

export const sellerStepOne = z.object({
  full_name: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  seller_type: z.enum(['private', 'dealer']),
  location_slug: z.string().min(1, 'Choose where the vehicle is'),
});

export const sellerStepTwo = z.object({
  make: z.string().trim().min(1, 'Enter the make'),
  model: z.string().trim().min(1, 'Enter the model'),
  variant: z.string().trim().max(60).optional(),
  year: z.coerce
    .number()
    .int()
    .min(2005, 'Enter a year from 2005 onward')
    .max(new Date().getFullYear() + 1),
  condition: z.enum(['new', 'used', 'certified']),
  mileage_km: z.coerce.number().int().min(0).max(1_000_000),
  battery_kwh: z.coerce.number().min(1, 'Enter the battery size in kWh').max(400),
  range_km: z.coerce.number().int().min(1, 'Enter the range in km').max(1500),
  body_type: z.enum(['suv', 'sedan', 'hatchback', 'pickup', 'van', 'motorcycle', 'bus']),
  description: z.string().trim().min(40, 'Write at least a couple of sentences').max(4000),
});

export const sellerStepThree = z.object({
  // Amount the seller wants. The published price is set by Voltaris after review —
  // this is an input to that decision, never the customer-facing figure.
  expected_price: z.coerce.number().int().min(1, 'Enter the amount you want for it'),
  has_registration_document: z.boolean(),
  has_import_documents: z.boolean(),
  accepts_review: z.literal(true, {
    errorMap: () => ({
      message: 'Confirm you understand the listing is reviewed before it goes live',
    }),
  }),
});

export const sellerListingSchema = sellerStepOne.merge(sellerStepTwo).merge(sellerStepThree);
export type SellerListingForm = z.infer<typeof sellerListingSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
  otp: z.string().trim().length(6, 'Enter the 6-digit code').optional(),
});

export const registerSchema = z
  .object({
    full_name: fullNameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: z
      .string()
      .min(12, 'Use at least 12 characters')
      .regex(/[a-z]/, 'Include a lowercase letter')
      .regex(/[A-Z]/, 'Include an uppercase letter')
      .regex(/\d/, 'Include a number'),
    confirm_password: z.string(),
    accepts_terms: z.literal(true, {
      errorMap: () => ({ message: 'Accept the terms to continue' }),
    }),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ['confirm_password'],
    message: 'The passwords do not match',
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(12, 'Use at least 12 characters'),
    confirm_password: z.string(),
  })
  .refine((values) => values.password === values.confirm_password, {
    path: ['confirm_password'],
    message: 'The passwords do not match',
  });

export const profileSchema = z.object({
  full_name: fullNameSchema,
  phone: phoneSchema,
  preferred_language: z.enum(['en', 'fr', 'rw']),
  marketing_opt_in: z.boolean(),
});


export const jobApplicationSchema = z.object({
  job_slug: z.string().min(1, 'Job role is required.'),
  full_name: z.string().trim().min(2, 'Enter your full name.').max(120, 'Name is too long.'),
  email: z.string().trim().email('Enter a valid email address.'),
  phone: z.string().trim().min(7, 'Enter a valid phone number.').max(30, 'Phone number is too long.'),
  linkedin_url: z
    .string()
    .trim()
    .url('Enter a valid LinkedIn URL.')
    .optional()
    .or(z.literal('')),
  portfolio_url: z
    .string()
    .trim()
    .url('Enter a valid portfolio or GitHub URL.')
    .optional()
    .or(z.literal('')),
  cover_letter: z
    .string()
    .trim()
    .min(80, 'Your cover letter should be at least 80 characters.')
    .max(5000, 'Your cover letter is too long.'),
  cv_file_name: z.string().min(1, 'A CV is required.'),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree before submitting your application.' }),
  }),
});

export type JobApplicationForm = z.infer<typeof jobApplicationSchema>;
