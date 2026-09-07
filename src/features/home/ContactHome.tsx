'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpRight, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { generalInquirySchema, type GeneralInquiryForm } from '@/lib/validation/schemas';

export function ContactHome() {
  const toast = useToast();
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GeneralInquiryForm>({
    resolver: zodResolver(generalInquirySchema),
    defaultValues: {
      topic: 'buying',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createGeneralInquiry({
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        topic: values.topic,
        message: values.message,
        source: 'homepage',
      });

      track('inquiry_created', {
        preferred_channel: 'email',
        vehicle_id: 'general',
      });

      setReference(result.reference);
      reset();
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <section className="border-t border-[color:var(--vds-border)] bg-[#f3eee7] py-20 text-[#171411] sm:py-28 lg:py-36">
      <div className="mx-auto grid max-w-shell gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-16">
        <div className="max-w-xl lg:sticky lg:top-24">
          <p className="font-data text-[0.68rem] uppercase tracking-[0.22em] text-[#716a61]">
            Talk to Voltaris
          </p>

          <h2 className="mt-4 max-w-lg font-display text-[clamp(3rem,7vw,6rem)] leading-[0.9] tracking-[-0.045em]">
            Tell us what you need
          </h2>

          <p className="mt-6 max-w-md text-base leading-relaxed text-[#5e5851] sm:text-lg">
            Not sure where to start? Tell us what you&apos;re looking for and we&apos;ll help you
            find the right next move
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-[#5e5851]">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171411] text-[#f3eee7]">
              <MessageCircle size={17} strokeWidth={1.7} />
            </span>
            <span>Real people, practical answers</span>
          </div>
        </div>

        <div className="relative">
          <div
            className="absolute -inset-2 rounded-[2rem] bg-black/[0.07] blur-2xl"
            aria-hidden="true"
          />

          <div className="relative rounded-[1.75rem] border border-black/[0.08] bg-white p-5 shadow-[0_30px_90px_-28px_rgba(0,0,0,0.38)] sm:p-8 lg:p-10">
            {reference ? (
              <div className="flex min-h-[32rem] flex-col justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#171411] text-white">
                  <Check size={24} strokeWidth={2} />
                </div>

                <p className="mt-7 font-data text-[0.68rem] uppercase tracking-[0.2em] text-[#716a61]">
                  Enquiry received
                </p>

                <h3 className="mt-3 font-display text-4xl italic leading-none tracking-[-0.03em] sm:text-5xl">
                  We&apos;ll take it from here
                </h3>

                <p className="mt-5 max-w-md text-base leading-relaxed text-[#5e5851]">
                  Thanks for reaching out. Our team has your enquiry and will get back to you
                  using the contact details you provided
                </p>

                <div className="mt-7 inline-flex w-fit items-center gap-3 rounded-xl border border-black/[0.08] bg-[#f6f3ef] px-4 py-3 text-sm">
                  <span className="text-[#716a61]">Reference</span>
                  <span className="font-data text-[#171411]">{reference}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setReference(null)}
                  className="mt-8 flex w-fit items-center gap-2 text-sm font-semibold text-[#171411] underline decoration-black/20 underline-offset-4 transition hover:decoration-black"
                >
                  Send another enquiry
                  <ArrowUpRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8 border-b border-black/[0.08] pb-6">
                  <p className="text-sm font-medium text-[#171411]">Start with a simple question</p>
                  <p className="mt-1 text-sm text-[#716a61]">
                    You don&apos;t need to know exactly what you want yet
                  </p>
                </div>

                <form onSubmit={onSubmit} noValidate className="space-y-5">
                  <Field label="Your name" error={errors.full_name?.message} required>
                    {(props) => (
                      <input
                        {...props}
                        {...register('full_name')}
                        autoComplete="name"
                        className={inputClass}
                      />
                    )}
                  </Field>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Email" error={errors.email?.message} required>
                      {(props) => (
                        <input
                          {...props}
                          {...register('email')}
                          type="email"
                          autoComplete="email"
                          className={inputClass}
                        />
                      )}
                    </Field>

                    <Field
                      label="Phone / WhatsApp"
                      hint="Rwandan mobile, e.g. 0788 123 456"
                      error={errors.phone?.message}
                      required
                    >
                      {(props) => (
                        <input
                          {...props}
                          {...register('phone')}
                          type="tel"
                          autoComplete="tel"
                          className={inputClass}
                        />
                      )}
                    </Field>
                  </div>

                  <Field label="What can we help with?" error={errors.topic?.message} required>
                    {(props) => (
                      <select {...props} {...register('topic')} className={selectClass}>
                        <option value="buying">I want to buy</option>
                        <option value="renting">I want to rent</option>
                        <option value="selling">I want to sell</option>
                        <option value="partnership">I want to discuss a partnership</option>
                        <option value="other">Something else</option>
                      </select>
                    )}
                  </Field>

                  <Field
                    label="Tell us a little more"
                    hint="The more you tell us, the better we can help"
                    error={errors.message?.message}
                    required
                  >
                    {(props) => (
                      <textarea
                        {...props}
                        {...register('message')}
                        rows={6}
                        placeholder="For example, I'm looking for an affordable hybrid for daily driving in Kigali..."
                        className={inputClass}
                      />
                    )}
                  </Field>

                  <Field label="" error={errors.consent?.message}>
                    {(props) => (
                      <label className="flex items-start gap-3 text-sm leading-relaxed text-[#716a61]">
                        <input
                          {...props}
                          {...register('consent')}
                          type="checkbox"
                          className="mt-1 h-4 w-4 shrink-0 accent-[#171411]"
                        />
                        <span>
                          I&apos;m happy for Voltaris to use my contact details to reply to this
                          enquiry
                        </span>
                      </label>
                    )}
                  </Field>

                  <div className="pt-2">
                    <Button type="submit" loading={isSubmitting}>
                      Send enquiry
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
