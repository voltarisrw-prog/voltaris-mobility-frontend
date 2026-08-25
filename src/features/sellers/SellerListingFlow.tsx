'use client';

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
      <ol className="mb-10 flex flex-wrap gap-x-6 gap-y-2">
        {STEPS.map((item) => (
          <li
            key={item.id}
            aria-current={item.id === step ? 'step' : undefined}
            className={
              item.id === step
                ? 'font-data text-eyebrow uppercase text-chrome'
                : 'font-data text-eyebrow uppercase text-steel-muted'
            }
          >
            {item.id}. {item.label}
          </li>
        ))}
      </ol>

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
        <div>
          <p className="mb-4 text-sm text-steel">
            Add up to {MAX_PHOTOS} photos: front three-quarter, rear, interior, dashboard showing
            the odometer, charge port, and tyres. Listings with a dashboard photo are reviewed
            faster.
          </p>
          <label className="block cursor-pointer border border-dashed border-hairline p-10 text-center transition-colors hover:border-volt">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => addPhotos(event.target.files)}
            />
            <span className="font-data text-eyebrow uppercase text-volt">Choose photos</span>
            <span className="mt-2 block text-xs text-steel-muted">
              JPEG, PNG, or WebP up to 12 MB each
            </span>
          </label>

          {previews.length > 0 && (
            <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {previews.map((url, index) => (
                <li key={url} className="relative">
                  {/* Local blob previews only — next/image is for remote CDN media. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    className="absolute right-1 top-1 bg-chrome px-2 py-1 font-data text-[0.6rem] uppercase text-surface"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-5">
          <Field
            label="What you want for it (RWF)"
            hint="This is your figure. Voltaris agrees the listed price with you after review."
            error={errors.expected_price?.message}
            required
          >
            {(p) => (
              <input
                {...p}
                {...register('expected_price')}
                type="number"
                inputMode="numeric"
                className={inputClass}
              />
            )}
          </Field>

          <fieldset className="space-y-3">
            <legend className="eyebrow mb-2">Documents you have</legend>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                {...register('has_registration_document')}
                className="h-4 w-4 accent-volt"
              />
              Registration document (yellow card)
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                {...register('has_import_documents')}
                className="h-4 w-4 accent-volt"
              />
              Import and duty clearance
            </label>
          </fieldset>

          <Field label="" error={errors.accepts_review?.message}>
            {(p) => (
              <label className="flex items-start gap-3 text-sm text-steel">
                <input
                  {...p}
                  {...register('accepts_review')}
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 accent-volt"
                />
                I understand that submitting this listing does not publish it, and that Voltaris
                reviews the vehicle and documents first.
              </label>
            )}
          </Field>
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
