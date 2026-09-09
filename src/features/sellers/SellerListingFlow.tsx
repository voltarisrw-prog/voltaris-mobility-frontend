'use client';

import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { Button, Field, inputClass, selectClass, useToast } from '@/components/ui';
import { createMediaIntents, finalizeMedia, submitListing, uploadToStorage } from '@/lib/api/sellers';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { sellerListingSchema, type SellerListingForm as Values } from '@/lib/validation/schemas';

const STEPS = [
  {
    id: 1,
    label: 'About you',
    fields: ['full_name', 'email', 'phone', 'seller_type', 'location_slug'],
  },
  {
    id: 2,
    label: 'The vehicle',
    fields: [
      'make',
      'model',
      'variant',
      'year',
      'condition',
      'mileage_km',
      'battery_kwh',
      'range_km',
      'body_type',
      'description',
    ],
  },
  { id: 3, label: 'Photos', fields: [] },
  {
    id: 4,
    label: 'Price and documents',
    fields: [
      'expected_price',
      'has_registration_document',
      'has_import_documents',
      'accepts_review',
    ],
  },
] as const;

const MAX_PHOTOS = 12;
const MAX_BYTES = 12 * 1024 * 1024;

export function SellerListingFlow() {
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<string | null>(null);

  const form = useForm<Values>({
    resolver: zodResolver(sellerListingSchema),
    mode: 'onTouched',
    defaultValues: {
      seller_type: 'private',
      condition: 'used',
      body_type: 'suv',
      has_registration_document: false,
      has_import_documents: false,
    },
  });
  const { register, handleSubmit, trigger, formState } = form;
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    track('seller_listing_started', {});
  }, []);

  // Previews are derived from the files, not mirrored into state — the object URLs
  // are a pure function of `photos`. The effect exists only to revoke the previous
  // batch, so twelve photos do not leak twelve blobs.
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  if (reference) {
    return (
      <div className="border border-volt/25 bg-volt-wash p-8">
        <h2 className="font-display text-headline">Submitted for review</h2>
        <p className="mt-4 max-w-prose text-sm leading-relaxed text-steel">
          Reference <span className="font-data text-chrome">{reference}</span>. Your listing is
          <strong className="font-medium"> not published yet</strong>. A Voltaris reviewer checks
          the documents and photos first, and we will contact you on the number you gave if anything
          is missing. Most reviews finish within two working days.
        </p>
      </div>
    );
  }

  async function next() {
    const current = STEPS.find((s) => s.id === step);
    const fields = (current?.fields ?? []) as (keyof Values)[];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) setStep((value) => Math.min(STEPS.length, value + 1));
  }

  function addPhotos(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const rejected = incoming.filter((file) => file.size > MAX_BYTES);
    if (rejected.length > 0) {
      toast.push('error', `${rejected.length} photo(s) are over 12 MB and were not added.`);
    }
    setPhotos((current) =>
      [...current, ...incoming.filter((f) => f.size <= MAX_BYTES)].slice(0, MAX_PHOTOS),
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const submission = await submitListing(values);

      if (photos.length > 0) {
        const altPrefix = `${values.year} ${values.make} ${values.model}`;

        // 1. Ask the backend to presign one PUT per file. It signs the content
        //    type and length into each URL, so storage rejects a mismatch itself.
        setUploadStage(`Preparing ${photos.length} photo(s)…`);
        const intents = await createMediaIntents(
          photos.map((file) => ({
            filename: file.name,
            content_type: file.type,
            size_bytes: file.size,
          })),
          submission.reference,
        );

        // 2. Upload straight to object storage. Sequential, not parallel: twelve
        //    concurrent 12 MB uploads will stall a mobile connection, and a
        //    stalled bar looks like a broken form.
        for (let index = 0; index < photos.length; index += 1) {
          const intent = intents[index];
          const file = photos[index];
          if (!intent || !file) continue;
          setUploadStage(`Uploading photo ${index + 1} of ${photos.length}…`);
          await uploadToStorage(intent, file);
        }

        // 3. Publish. This is where EXIF — including the GPS coordinates that
        //    would otherwise reveal where the photo was taken — is stripped, and
        //    the four display sizes are produced.
        setUploadStage('Processing photos…');
        await finalizeMedia(
          intents.map((intent) => intent.media_key),
          altPrefix,
        );
      }

      track('seller_listing_submitted', {
        make: values.make,
        model: values.model,
        year: values.year,
      });
      setReference(submission.reference);
    } catch (cause) {
      // The listing itself is already saved at this point, so a failed upload
      // must not read as a lost submission.
      setUploadStage(null);
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="mb-12 border-y border-hairline bg-surface">
        <div className="flex items-stretch overflow-x-auto">
          {STEPS.map((item) => {
            const active = item.id === step;
            const complete = item.id < step;

            return (
              <div
                key={item.id}
                className="min-w-[9rem] flex-1 border-r border-hairline last:border-r-0"
              >
                <div
                  aria-current={active ? 'step' : undefined}
                  className={[
                    'relative flex h-full min-h-[5.5rem] flex-col justify-between p-4 transition-colors sm:p-5',
                    active ? 'bg-chrome text-surface' : 'bg-surface text-steel',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={[
                        'font-data text-[10px] uppercase tracking-[0.18em]',
                        active
                          ? 'text-surface/60'
                          : complete
                            ? 'text-volt'
                            : 'text-steel-muted',
                      ].join(' ')}
                    >
                      {complete ? 'Complete' : `0${item.id}`}
                    </span>

                    {active && (
                      <span className="h-1.5 w-1.5 rounded-full bg-volt" aria-hidden="true" />
                    )}
                  </div>

                  <span
                    className={[
                      'font-display text-base font-semibold tracking-tight sm:text-lg',
                      active ? 'text-surface' : 'text-chrome',
                    ].join(' ')}
                  >
                    {item.label}
                  </span>

                  {active && (
                    <span
                      className="absolute inset-x-0 bottom-0 h-0.5 bg-volt"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8 flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow text-volt">STEP {step} OF {STEPS.length}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
            {STEPS[step - 1]?.label}
          </h2>
        </div>

        <p className="hidden max-w-xs text-right text-xs leading-relaxed text-steel sm:block">
          Your progress stays here while you move through the listing.
        </p>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <Field label="Your name" error={errors.full_name?.message} required>
            {(p) => (
              <input {...p} {...register('full_name')} autoComplete="name" className={inputClass} />
            )}
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.message} required>
              {(p) => <input {...p} {...register('email')} type="email" className={inputClass} />}
            </Field>
            <Field label="Phone" error={errors.phone?.message} required>
              {(p) => <input {...p} {...register('phone')} type="tel" className={inputClass} />}
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Selling as" error={errors.seller_type?.message} required>
              {(p) => (
                <select {...p} {...register('seller_type')} className={selectClass}>
                  <option value="private">A private owner</option>
                  <option value="dealer">A dealership</option>
                </select>
              )}
            </Field>
            <Field label="Where is the vehicle" error={errors.location_slug?.message} required>
              {(p) => (
                <select {...p} {...register('location_slug')} className={selectClass}>
                  <option value="">Choose a district</option>
                  <option value="kigali-gasabo">Kigali — Gasabo</option>
                  <option value="kigali-kicukiro">Kigali — Kicukiro</option>
                  <option value="kigali-nyarugenge">Kigali — Nyarugenge</option>
                  <option value="musanze">Musanze</option>
                  <option value="rubavu">Rubavu</option>
                  <option value="huye">Huye</option>
                  <option value="rusizi">Rusizi</option>
                </select>
              )}
            </Field>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Make" error={errors.make?.message} required>
              {(p) => (
                <input {...p} {...register('make')} placeholder="BYD" className={inputClass} />
              )}
            </Field>
            <Field label="Model" error={errors.model?.message} required>
              {(p) => (
                <input {...p} {...register('model')} placeholder="Atto 3" className={inputClass} />
              )}
            </Field>
            <Field label="Year" error={errors.year?.message} required>
              {(p) => (
                <input
                  {...p}
                  {...register('year')}
                  type="number"
                  inputMode="numeric"
                  className={inputClass}
                />
              )}
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Battery (kWh)" error={errors.battery_kwh?.message} required>
              {(p) => (
                <input
                  {...p}
                  {...register('battery_kwh')}
                  type="number"
                  step="0.1"
                  className={inputClass}
                />
              )}
            </Field>
            <Field
              label="Range (km)"
              hint="Manufacturer figure"
              error={errors.range_km?.message}
              required
            >
              {(p) => (
                <input {...p} {...register('range_km')} type="number" className={inputClass} />
              )}
            </Field>
            <Field label="Odometer (km)" error={errors.mileage_km?.message} required>
              {(p) => (
                <input {...p} {...register('mileage_km')} type="number" className={inputClass} />
              )}
            </Field>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Body type" error={errors.body_type?.message} required>
              {(p) => (
                <select {...p} {...register('body_type')} className={selectClass}>
                  <option value="suv">SUV</option>
                  <option value="sedan">Sedan</option>
                  <option value="hatchback">Hatchback</option>
                  <option value="pickup">Pickup</option>
                  <option value="van">Van</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="bus">Bus</option>
                </select>
              )}
            </Field>
            <Field label="Condition" error={errors.condition?.message} required>
              {(p) => (
                <select {...p} {...register('condition')} className={selectClass}>
                  <option value="used">Used</option>
                  <option value="new">New</option>
                  <option value="certified">Certified pre-owned</option>
                </select>
              )}
            </Field>
          </div>
          <Field
            label="Describe it"
            hint="Service history, why you are selling, anything a buyer would ask"
            error={errors.description?.message}
            required
          >
            {(p) => (
              <textarea {...p} {...register('description')} rows={6} className={inputClass} />
            )}
          </Field>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-10">
          <section>
            <div className="mb-7 border-b border-hairline pb-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
                01 / Vehicle photography
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
                Let the car speak for itself.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
                Strong photography makes a listing feel trustworthy before a
                buyer reads a single specification. Add up to 12 clear photos.
              </p>
            </div>

            <label className="group relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed border-steel/40 bg-surface-muted px-6 py-10 text-center transition-colors hover:border-chrome hover:bg-surface">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(event) => {
                  void addPhotos(event.target.files);
                  event.target.value = '';
                }}
              />

              <span className="font-data text-[10px] uppercase tracking-[0.18em] text-volt">
                {photos.length}/{MAX_PHOTOS} photos added
              </span>

              <span className="mt-4 font-display text-xl font-semibold tracking-tight text-chrome sm:text-2xl">
                Add vehicle photos
              </span>

              <span className="mt-2 max-w-md text-sm leading-relaxed text-steel">
                Exterior, interior, dashboard, wheels, charging equipment and
                any details a buyer should see.
              </span>

              <span className="mt-6 inline-flex items-center border border-chrome px-5 py-2.5 font-data text-[10px] font-semibold uppercase tracking-[0.16em] text-chrome transition-colors group-hover:bg-chrome group-hover:text-surface">
                Choose files
              </span>

              <span className="mt-4 font-data text-[9px] uppercase tracking-[0.14em] text-steel-muted">
                JPG, PNG or WEBP · maximum 12 MB each
              </span>
            </label>
          </section>

          {photos.length > 0 && (
            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
                    Your gallery
                  </p>
                  <p className="mt-1 text-sm text-steel">
                    {photos.length === 1
                      ? '1 photo ready for review'
                      : `${photos.length} photos ready for review`}
                  </p>
                </div>

                <p className="font-data text-[10px] uppercase tracking-[0.14em] text-steel-muted">
                  First photo = cover
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px bg-hairline sm:grid-cols-3 lg:grid-cols-4">
                {photos.map((file, index) => (
                  <div key={`${file.name}-${file.lastModified}`} className="group relative aspect-[4/3] overflow-hidden bg-surface">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={`Vehicle photo ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />

                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-chrome/85 px-3 py-2 text-surface">
                      <span className="font-data text-[9px] uppercase tracking-[0.12em]">
                        {index === 0 ? 'Cover' : `Photo ${index + 1}`}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setPhotos((current) =>
                            current.filter((_, photoIndex) => photoIndex !== index),
                          )
                        }
                        className="font-data text-[9px] uppercase tracking-[0.12em] text-surface/70 transition-colors hover:text-surface"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-px bg-hairline sm:grid-cols-3">
            <div className="bg-surface p-5">
              <p className="font-data text-[9px] uppercase tracking-[0.16em] text-volt">
                01
              </p>
              <p className="mt-3 font-display font-semibold text-chrome">
                Exterior
              </p>
              <p className="mt-1 text-xs leading-relaxed text-steel">
                Show the full vehicle from multiple angles.
              </p>
            </div>

            <div className="bg-surface p-5">
              <p className="font-data text-[9px] uppercase tracking-[0.16em] text-volt">
                02
              </p>
              <p className="mt-3 font-display font-semibold text-chrome">
                Interior
              </p>
              <p className="mt-1 text-xs leading-relaxed text-steel">
                Include seats, dashboard and controls.
              </p>
            </div>

            <div className="bg-surface p-5">
              <p className="font-data text-[9px] uppercase tracking-[0.16em] text-volt">
                03
              </p>
              <p className="mt-3 font-display font-semibold text-chrome">
                Details
              </p>
              <p className="mt-1 text-xs leading-relaxed text-steel">
                Highlight wheels, charging gear and notable features.
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-12">
          <section>
            <div className="mb-7 border-b border-hairline pb-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
                01 / Your asking price
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
                What would make the sale worthwhile?
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
                Set the price you expect to receive. Our team can review the
                listing before it goes live.
              </p>
            </div>

            <div className="max-w-xl">
              <Field label="Expected price (RWF)" error={errors.expected_price?.message}>
                {(p) => (
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-hairline px-4 font-data text-[10px] uppercase tracking-[0.14em] text-steel-muted">
                      RWF
                    </span>
                    <input
                      {...p}
                      {...register('expected_price')}
                      type="number"
                      className={`${inputClass} pl-20 text-lg font-semibold tabular-nums`}
                      placeholder="e.g. 45,000,000"
                      min="0"
                    />
                  </div>
                )}
              </Field>

              <p className="mt-3 text-xs leading-relaxed text-steel">
                A realistic asking price helps buyers understand the listing
                quickly. You can discuss the final price during verification.
              </p>
            </div>
          </section>

          <section>
            <div className="mb-7 border-b border-hairline pb-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
                02 / Documentation
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
                Show that the vehicle is ready.
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-steel">
                Let us know which documents you already have. This helps the
                verification team understand what is available.
              </p>
            </div>

            <div className="divide-y divide-hairline border-y border-hairline">
              <label className="flex cursor-pointer items-start gap-4 py-5">
                <input
                  {...register('has_registration_document')}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-current"
                />
                <span>
                  <span className="block font-display font-semibold text-chrome">
                    Registration document available
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-steel">
                    I have the vehicle registration documentation available for review.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-4 py-5">
                <input
                  {...register('has_import_documents')}
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-current"
                />
                <span>
                  <span className="block font-display font-semibold text-chrome">
                    Import documents available
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-steel">
                    I have relevant import documentation available where applicable.
                  </span>
                </span>
              </label>
            </div>
          </section>

          <section>
            <div className="mb-7 border-b border-hairline pb-5">
              <p className="font-data text-[10px] uppercase tracking-[0.18em] text-steel-muted">
                03 / Verification
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-chrome sm:text-3xl">
                One final step.
              </h3>
            </div>

            <label className="flex cursor-pointer items-start gap-4 border border-hairline bg-surface-muted p-5 sm:p-6">
              <input
                {...register('accepts_review')}
                type="checkbox"
                className="mt-1 h-4 w-4 accent-current"
              />
              <span>
                <span className="block font-display font-semibold text-chrome">
                  I agree to Voltaris reviewing this listing.
                </span>
                <span className="mt-2 block max-w-2xl text-xs leading-relaxed text-steel">
                  Voltaris may review the information and photos submitted to
                  verify the listing before publication. Additional information
                  may be requested if something needs clarification.
                </span>
              </span>
            </label>

            <div className="mt-6 flex items-start gap-4 border-l-2 border-volt pl-5">
              <div>
                <p className="font-data text-[10px] uppercase tracking-[0.16em] text-volt">
                  Ready when you are
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-steel">
                  Submit once everything looks right. Your listing is saved
                  before photo processing begins, so an upload issue will not
                  erase your submission.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {uploadStage && (
        <p aria-live="polite" className="mt-8 font-data text-eyebrow uppercase text-volt">
          {uploadStage}
        </p>
      )}

      <div className="mt-10 flex items-center gap-3 border-t border-hairline/60 pt-6">
        {step > 1 && (
          <Button type="button" variant="ghost" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        )}
        {step < STEPS.length ? (
          <Button type="button" onClick={next}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={isSubmitting}>
            Submit for review
          </Button>
        )}
      </div>
    </form>
  );
}
