import { z } from 'zod';
import { generalInquirySchema } from '@/lib/validation/schemas';
import { countryByIso, isValidPhone } from '@/lib/validation/phone';

/**
 * The general enquiry schema with an international phone number: the country is part
 * of the form, and the number is checked against that country's length rules.
 */
export const contactSchema = generalInquirySchema
  .extend({
    phone: z.string().trim().min(1, 'Enter your phone number'),
    phone_country: z.string().min(2),
  })
  .superRefine((v, ctx) => {
    const c = countryByIso(v.phone_country);
    if (v.phone && !isValidPhone(c, v.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message:
          c.iso === 'RW'
            ? 'Enter a Rwandan mobile number, for example 0788 123 456'
            : c.iso === 'XX'
              ? 'Enter your number with its country code, for example +44 7400 123456'
              : `Enter a valid ${c.name} number, for example ${c.ex}`,
      });
    }
  });

export type ContactForm = z.infer<typeof contactSchema>;
