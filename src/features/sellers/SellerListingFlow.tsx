'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, ImagePlus, Info, ShieldCheck, X } from 'lucide-react';
import { useToast } from '@/components/ui';
import { IntlPhone } from '@/components/IntlPhone';
import { features } from '@/config/features';
import { createMediaIntents, finalizeMedia, submitListing, uploadToStorage } from '@/lib/api/sellers';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { sellerListingSchema, type SellerListingForm as Values } from '@/lib/validation/schemas';
import { SellTicket } from './SellTicket';
import './sell.css';

const LOCATIONS = [
  { value: 'kigali-gasabo', label: 'Kigali — Gasabo' },
  { value: 'kigali-kicukiro', label: 'Kigali — Kicukiro' },
  { value: 'kigali-nyarugenge', label: 'Kigali — Nyarugenge' },
  { value: 'musanze', label: 'Musanze' },
  { value: 'rubavu', label: 'Rubavu' },
  { value: 'huye', label: 'Huye' },
  { value: 'rusizi', label: 'Rusizi' },
] as const;

const SELLER_TYPES = [
  { value: 'private', label: 'A private owner' },
  { value: 'dealer', label: 'A dealership' },
] as const;

const CONDITIONS = [
  { value: 'used', label: 'Used' },
  { value: 'new', label: 'New' },
  { value: 'certified', label: 'Certified pre-owned' },
] as const;

const BODIES = [
  { value: 'suv', label: 'SUV' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'bus', label: 'Bus' },
] as const;

const STEPS = [
  { label: 'About you', fields: ['full_name', 'email', 'phone', 'seller_type', 'location_slug'] },
  {
    label: 'The vehicle',
    fields: ['make', 'model', 'variant', 'year', 'condition', 'mileage_km', 'battery_kwh', 'range_km', 'body_type', 'description'],
  },
  { label: 'Photos', fields: [] },
  {
    label: 'Price and documents',
    fields: ['expected_price', 'has_registration_document', 'has_import_documents', 'accepts_review'],
  },
] as const satisfies readonly { label: string; fields: readonly (keyof Values)[] }[];

const MAX_PHOTOS = 12;
const MAX_BYTES = 12 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RENT_PREFIX = 'RENTAL REQUEST. The expected price below is the daily rate in RWF.\n\n';

type SellerUser = { full_name?: string | undefined; email?: string | undefined; phone?: string | undefined };

export function SellerListingFlow({ user }: { user: SellerUser }) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [back, setBack] = useState(false);
  const [goal, setGoal] = useState<'sell' | 'rent'>('sell');
  const [photos, setPhotos] = useState<File[]>([]);
  const [reference, setReference] = useState<string | null>(null);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const [priceText, setPriceText] = useState('');
  const [dragging, setDragging] = useState(false);
  const rent = features.rentals && goal === 'rent';

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(sellerListingSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: user.full_name ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
      seller_type: 'private',
      condition: 'used',
      body_type: 'suv',
      has_registration_document: false,
      has_import_documents: false,
    },
  });

  // The chip groups write through setValue, so the fields must exist in the form.
  useEffect(() => {
    register('seller_type');
    register('location_slug');
    register('condition');
    register('body_type');
    register('expected_price');
  }, [register]);

  useEffect(() => {
    track('seller_listing_started', {});
  }, []);

  // Previews are derived from the files; the effect only revokes the previous batch.
  const previews = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  const w = watch();
  const loc = LOCATIONS.find((l) => l.value === w.location_slug);
  const car = [w.year, w.make?.trim(), w.model?.trim(), w.variant?.trim()].filter(Boolean).join(' ');
  const meta: string[] = [];
  if (loc) meta.push(loc.label);
  if (w.mileage_km !== undefined && String(w.mileage_km) !== '') meta.push(`${Number(w.mileage_km).toLocaleString('en-US')} km`);
  const cond = CONDITIONS.find((c) => c.value === w.condition);
  if (cond) meta.push(cond.label);
  const body = BODIES.find((b) => b.value === w.body_type);
  if (body) meta.push(body.label);
  if (Number(w.battery_kwh) > 0) meta.push(`${w.battery_kwh} kWh`);
  if (Number(w.range_km) > 0) meta.push(`${w.range_km} km range`);
  const price = Number(w.expected_price);
  const priceLine = price > 0 ? `You asked RF ${price.toLocaleString('en-US')}${rent ? ' / day' : ''}` : 'Set by Voltaris after review';
  const dlen = (w.description ?? '').trim().length;
  const done = [
    Boolean(w.full_name && w.email && w.phone && w.seller_type && w.location_slug),
    Boolean(w.make && w.model && w.year && Number(w.battery_kwh) > 0 && Number(w.range_km) > 0 && dlen >= 40),
    photos.length > 0,
    price > 0 && Boolean(w.accepts_review),
  ].filter(Boolean).length;

  const pick = (name: 'seller_type' | 'location_slug' | 'condition' | 'body_type', value: string) =>
    setValue(name, value as never, { shouldValidate: true, shouldDirty: true, shouldTouch: true });

  const onPrice = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPriceText(digits ? Number(digits).toLocaleString('en-US') : '');
    setValue('expected_price', digits as never, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
  };

  function addPhotos(list: FileList | File[] | null) {
    if (!list) return;
    const incoming = Array.from(list);
    const wrongType = incoming.filter((f) => !TYPES.includes(f.type));
    const tooBig = incoming.filter((f) => TYPES.includes(f.type) && f.size > MAX_BYTES);
    if (wrongType.length > 0) toast.push('error', `${wrongType.length} file(s) were not JPG, PNG or WEBP and were not added.`);
    if (tooBig.length > 0) toast.push('error', `${tooBig.length} photo(s) are over 12 MB and were not added.`);
    setPhotos((current) => [...current, ...incoming.filter((f) => TYPES.includes(f.type) && f.size <= MAX_BYTES)].slice(0, MAX_PHOTOS));
  }
  const makeCover = (i: number) =>
    setPhotos((current) => {
      const next = [...current];
      const [picked] = next.splice(i, 1);
      return picked ? [picked, ...next] : current;
    });

  async function next() {
    const fields = [...STEPS[step]!.fields] as (keyof Values)[];
    const valid = fields.length === 0 ? true : await trigger(fields, { shouldFocus: true });
    if (!valid) return;
    setBack(false);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    setMaxStep((m) => Math.max(m, Math.min(STEPS.length - 1, step + 1)));
  }
  function go(k: number) {
    if (k === step || k > maxStep) return;
    setBack(k < step);
    setStep(k);
  }

  const onSubmit = handleSubmit(
    async (values) => {
      try {
        const payload: Values = rent ? { ...values, description: `${RENT_PREFIX}${values.description}` } : values;
        const submission = await submitListing(payload);

        if (photos.length > 0) {
          const altPrefix = `${values.year} ${values.make} ${values.model}`;

          // 1. Ask the backend to presign one PUT per file.
          setUploadStage(`Preparing ${photos.length} photo(s)…`);
          const intents = await createMediaIntents(
            photos.map((file) => ({ filename: file.name, content_type: file.type, size_bytes: file.size })),
            submission.reference,
          );

          // 2. Upload straight to object storage, one at a time: twelve concurrent
          //    12 MB uploads would stall a mobile connection.
          for (let index = 0; index < photos.length; index += 1) {
            const intent = intents[index];
            const file = photos[index];
            if (!intent || !file) continue;
            setUploadStage(`Uploading photo ${index + 1} of ${photos.length}…`);
            await uploadToStorage(intent, file);
          }

          // 3. Publish. This is where EXIF, including GPS coordinates, is stripped.
          setUploadStage('Processing photos…');
          await finalizeMedia(
            intents.map((intent) => intent.media_key),
            altPrefix,
          );
        }

        track('seller_listing_submitted', { make: values.make, model: values.model, year: values.year });
        setUploadStage(null);
        setReference(submission.reference);
      } catch (cause) {
        // The listing itself is already saved at this point, so a failed upload must not read as a lost submission.
        setUploadStage(null);
        toast.push('error', displayMessage(cause));
      }
    },
    (errs) => {
      const k = STEPS.findIndex((s) => (s.fields as readonly (keyof Values)[]).some((f) => errs[f]));
      if (k >= 0 && k !== step) {
        setBack(k < step);
        setStep(k);
      }
    },
  );

  if (reference) {
    return (
      <div className="sl-grid" id="list">
        <section className="sl-card sl-done" role="status">
          <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <circle cx="40" cy="40" r="36" stroke="#7fd4ff" strokeWidth="3" />
            <path d="M24 41l12 12 21-24" stroke="#12d6b0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2>Submitted for review</h2>
          <p>
            Reference <b>{reference}</b>. Your listing is <strong>not published yet</strong>. A Voltaris reviewer checks
            the documents and photos first, and we will contact you on the number you gave if anything is missing. Most
            reviews finish within two working days.
          </p>
        </section>
        <SellTicket badge={rent ? 'Rent it out' : 'Sell it'} title={car} meta={meta} photo={previews[0]} priceLine={priceLine} done={4} total={4} stamped />
      </div>
    );
  }

  const phoneReg = register('phone');
  const lastStep = step === STEPS.length - 1;
  const stepKey = (k: number) => `Step ${k + 1} of ${STEPS.length}`;

  return (
    <div className="sl-grid" id="list">
      <section className="sl-card" aria-label="List your vehicle">
        <div className="sl-stp" role="group" aria-label="Steps">
          {STEPS.map((s, k) => {
            const isDone = k < step && !(s.fields as readonly (keyof Values)[]).some((f) => errors[f]);
            return (
              <button
                key={s.label}
                type="button"
                className={`sl-sb${k === step ? ' is-on' : ''}${isDone ? ' is-done' : ''}`}
                aria-current={k === step ? 'step' : undefined}
                disabled={k > maxStep}
                onClick={() => go(k)}
              >
                <i>{isDone ? <Check size={14} strokeWidth={3} /> : k + 1}</i>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        <form
          noValidate
          className={`sl-form${back ? ' is-back' : ''}`}
          onSubmit={(e) => {
            e.preventDefault();
            if (lastStep) void onSubmit(e);
            else void next();
          }}
          onKeyDown={(e) => {
            const t = e.target as HTMLElement;
            if (e.key === 'Enter' && t.tagName !== 'TEXTAREA' && t.tagName !== 'BUTTON' && (t as HTMLInputElement).type !== 'checkbox') {
              e.preventDefault();
              if (lastStep) void onSubmit();
              else void next();
            }
          }}
        >
          {/* ---------------------------------------------- 1 About you */}
          {step === 0 && (
            <div className="sl-step">
              <div>
                <p className="sl-k">{stepKey(0)}</p>
                <h2 className="sl-t">About you</h2>
              </div>

              {features.rentals && (
                <div>
                  <span className="sl-lb">What would you like to do?</span>
                  <div className="sl-chs" role="radiogroup" aria-label="Goal">
                    {([['sell', 'Sell it'], ['rent', 'Rent it out']] as const).map(([v, l]) => (
                      <button key={v} type="button" role="radio" aria-checked={goal === v} className={`sl-ch${goal === v ? ' is-on' : ''}`} onClick={() => setGoal(v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className={`sl-f${errors.full_name ? ' is-bad' : ''}`}>
                  <input id="sl-name" placeholder=" " autoComplete="name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
                  <label htmlFor="sl-name">
                    Your name<i>*</i>
                  </label>
                </div>
                <p className="sl-er" role="alert">{errors.full_name?.message}</p>
              </div>

              <div className="sl-r2">
                <div>
                  <div className={`sl-f${errors.email ? ' is-bad' : ''}`}>
                    <input id="sl-email" type="email" placeholder=" " autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
                    <label htmlFor="sl-email">
                      Email<i>*</i>
                    </label>
                  </div>
                  <p className="sl-er" role="alert">{errors.email?.message}</p>
                </div>
                <div>
                  <div className={`sl-f sl-ip${errors.phone ? ' is-bad' : ''}`}>
                    <IntlPhone bare id="sl-phone" aria-invalid={Boolean(errors.phone)} {...phoneReg} />
                    <label htmlFor="sl-phone">
                      Phone<i>*</i>
                    </label>
                  </div>
                  <p className="sl-er" role="alert">{errors.phone?.message}</p>
                </div>
              </div>

              <div>
                <span className="sl-lb">
                  Selling as<i>*</i>
                </span>
                <div className="sl-chs" role="radiogroup" aria-label="Selling as">
                  {SELLER_TYPES.map(({ value, label }) => (
                    <button key={value} type="button" role="radio" aria-checked={w.seller_type === value} className={`sl-ch${w.seller_type === value ? ' is-on' : ''}`} onClick={() => pick('seller_type', value)}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="sl-er" role="alert">{errors.seller_type?.message}</p>
              </div>

              <div>
                <span className="sl-lb">
                  Where is the vehicle<i>*</i>
                </span>
                <div className="sl-chs" role="radiogroup" aria-label="Where is the vehicle">
                  {LOCATIONS.map(({ value, label }) => (
                    <button key={value} type="button" role="radio" aria-checked={w.location_slug === value} className={`sl-ch${w.location_slug === value ? ' is-on' : ''}`} onClick={() => pick('location_slug', value)}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="sl-er" role="alert">{errors.location_slug?.message}</p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------- 2 The vehicle */}
          {step === 1 && (
            <div className="sl-step">
              <div>
                <p className="sl-k">{stepKey(1)}</p>
                <h2 className="sl-t">The vehicle</h2>
              </div>

              <div className="sl-r3">
                {(
                  [
                    ['make', 'Make', 'BYD', true],
                    ['model', 'Model', 'Atto 3', true],
                    ['variant', 'Variant (optional)', '', false],
                  ] as const
                ).map(([name, label, ph, req]) => (
                  <div key={name}>
                    <div className={`sl-f${errors[name] ? ' is-bad' : ''}`}>
                      <input id={`sl-${name}`} placeholder={ph || ' '} autoComplete="off" aria-invalid={Boolean(errors[name])} {...register(name)} />
                      <label htmlFor={`sl-${name}`}>
                        {label}
                        {req && <i>*</i>}
                      </label>
                    </div>
                    <p className="sl-er" role="alert">{errors[name]?.message}</p>
                  </div>
                ))}
              </div>

              <div className="sl-r2">
                {(
                  [
                    ['year', 'Year', '', 'year'],
                    ['mileage_km', 'Odometer', 'km', 'mileage_km'],
                    ['battery_kwh', 'Battery', 'kWh', 'battery_kwh'],
                    ['range_km', 'Range (manufacturer figure)', 'km', 'range_km'],
                  ] as const
                ).map(([name, label, unit]) => (
                  <div key={name}>
                    <div className={`sl-f${unit ? ' sl-hu' : ''}${errors[name] ? ' is-bad' : ''}`}>
                      <input id={`sl-${name}`} type="number" inputMode={name === 'battery_kwh' ? 'decimal' : 'numeric'} step={name === 'battery_kwh' ? '0.1' : undefined} placeholder=" " aria-invalid={Boolean(errors[name])} {...register(name)} />
                      <label htmlFor={`sl-${name}`}>
                        {label}
                        <i>*</i>
                      </label>
                      {unit && <span className="sl-u">{unit}</span>}
                    </div>
                    <p className="sl-er" role="alert">{errors[name]?.message}</p>
                  </div>
                ))}
              </div>

              <div>
                <span className="sl-lb">
                  Condition<i>*</i>
                </span>
                <div className="sl-chs" role="radiogroup" aria-label="Condition">
                  {CONDITIONS.map(({ value, label }) => (
                    <button key={value} type="button" role="radio" aria-checked={w.condition === value} className={`sl-ch${w.condition === value ? ' is-on' : ''}`} onClick={() => pick('condition', value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="sl-lb">
                  Body type<i>*</i>
                </span>
                <div className="sl-chs" role="radiogroup" aria-label="Body type">
                  {BODIES.map(({ value, label }) => (
                    <button key={value} type="button" role="radio" aria-checked={w.body_type === value} className={`sl-ch${w.body_type === value ? ' is-on' : ''}`} onClick={() => pick('body_type', value)}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className={`sl-f${errors.description ? ' is-bad' : ''}`}>
                  <textarea id="sl-desc" rows={6} placeholder=" " maxLength={rent ? 3900 : 4000} aria-invalid={Boolean(errors.description)} {...register('description')} />
                  <label htmlFor="sl-desc">
                    Describe it<i>*</i>
                  </label>
                </div>
                <div className={`sl-meter${dlen >= 40 ? ' is-ok' : ''}`} aria-hidden="true">
                  <i style={{ width: `${Math.min(dlen / 40, 1) * 100}%` }} />
                </div>
                <div className="sl-cnt">
                  <span>{dlen >= 40 ? 'That is enough detail' : 'Service history, why you are selling, anything a buyer would ask'}</span>
                  <span>
                    <b>{(w.description ?? '').length}</b> / {rent ? 3900 : 4000}
                  </span>
                </div>
                <p className="sl-er" role="alert">{errors.description?.message}</p>
              </div>
            </div>
          )}

          {/* ---------------------------------------------- 3 Photos */}
          {step === 2 && (
            <div className="sl-step">
              <div>
                <p className="sl-k">{stepKey(2)}</p>
                <h2 className="sl-t">Let the car speak for itself</h2>
                <p className="sl-sub">Strong photography makes a listing feel trustworthy before a buyer reads a single specification. Add up to 12 clear photos.</p>
              </div>

              <label
                className={`sl-dz${dragging ? ' is-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  addPhotos(e.dataTransfer.files);
                }}
              >
                <ImagePlus size={34} strokeWidth={1.8} aria-hidden="true" />
                <b>Add vehicle photos</b>
                <small>
                  {photos.length}/{MAX_PHOTOS} photos added. Drag them here, or choose files. JPG, PNG or WEBP, maximum 12 MB each.
                </small>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => {
                    addPhotos(event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>

              {photos.length > 0 && (
                <div>
                  <p className="sl-hint">
                    {photos.length === 1 ? '1 photo ready for review' : `${photos.length} photos ready for review`}. The first photo is the cover.
                  </p>
                  <div className="sl-ths">
                    {photos.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="sl-th">
                        {previews[index] && <Image src={previews[index]!} alt={`Vehicle photo ${index + 1}`} fill unoptimized sizes="(min-width: 1024px) 15vw, 40vw" className="object-cover" />}
                        {index === 0 ? <span className="sl-cv">Cover</span> : (
                          <button type="button" className="sl-mc" onClick={() => makeCover(index)}>
                            Make cover
                          </button>
                        )}
                        <button type="button" className="sl-x" aria-label={`Remove photo ${index + 1}`} onClick={() => setPhotos((c) => c.filter((_, i) => i !== index))}>
                          <X size={14} strokeWidth={2.6} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="sl-shield">
                <ShieldCheck size={20} aria-hidden="true" />
                <span>We remove the hidden data inside photos, including GPS location, before publishing, so your home address is not shown.</span>
              </p>

              <div className="sl-tips">
                {([['Exterior', 'Show the full vehicle from multiple angles.'], ['Interior', 'Include seats, dashboard and controls.'], ['Details', 'Highlight wheels, charging gear and notable features.']] as const).map(([h, p]) => (
                  <div key={h}>
                    <b>{h}</b>
                    <small>{p}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ---------------------------------------------- 4 Price and documents */}
          {step === 3 && (
            <div className="sl-step">
              <div>
                <p className="sl-k">{stepKey(3)}</p>
                <h2 className="sl-t">{rent ? 'What would make renting it worthwhile?' : 'What would make the sale worthwhile?'}</h2>
              </div>

              <div>
                <span className="sl-lb" id="sl-pl">
                  {rent ? 'Daily rate you want (RWF)' : 'Expected price (RWF)'}
                  <i>*</i>
                </span>
                <div className={`sl-price${errors.expected_price ? ' is-bad' : ''}`}>
                  <span>RWF</span>
                  <input inputMode="numeric" aria-labelledby="sl-pl" placeholder="0" value={priceText} onChange={onPrice} />
                </div>
                <p className="sl-note">
                  <Info size={20} aria-hidden="true" />
                  <span>
                    {rent
                      ? 'A starting point for the daily rate. Voltaris confirms the final rate after review.'
                      : 'The published price is set by Voltaris after review. This amount helps us decide; it is never shown to buyers.'}
                  </span>
                </p>
                <p className="sl-er" role="alert">{errors.expected_price?.message}</p>
              </div>

              <div className="sl-docs">
                <span className="sl-lb">Documents</span>
                {(
                  [
                    ['has_registration_document', 'I have the vehicle registration document'],
                    ['has_import_documents', 'I have the import documents'],
                  ] as const
                ).map(([name, text]) => (
                  <label key={name} className="sl-ck">
                    <input type="checkbox" className="sl-cb" {...register(name)} />
                    <span className="sl-box"><Check size={16} strokeWidth={3} /></span>
                    <span>{text}</span>
                  </label>
                ))}
                <p className="sl-hint">Having them ready speeds up the review. You can submit without them.</p>
              </div>

              <div>
                <label className={`sl-ck${errors.accepts_review ? ' is-bad' : ''}`}>
                  <input type="checkbox" className="sl-cb" {...register('accepts_review')} />
                  <span className="sl-box"><Check size={16} strokeWidth={3} /></span>
                  <span>I understand the listing is reviewed before it goes live.</span>
                </label>
                <p className="sl-er" role="alert">{errors.accepts_review?.message}</p>
              </div>
            </div>
          )}

          <div className="sl-act">
            {step > 0 && (
              <button type="button" className="sl-btn sl-gh" disabled={isSubmitting} onClick={() => go(step - 1)}>
                <ArrowLeft size={18} /> Back
              </button>
            )}
            <button type="button" className="sl-btn sl-next" disabled={isSubmitting} aria-busy={isSubmitting} onClick={() => (lastStep ? void onSubmit() : void next())}>
              {lastStep ? (isSubmitting ? (uploadStage ?? 'Sending…') : 'Submit for review') : 'Continue'}
              {!lastStep && <ArrowRight size={18} />}
            </button>
          </div>
          {isSubmitting && uploadStage && <div className="sl-prog" aria-hidden="true"><i /></div>}
        </form>
      </section>

      <SellTicket badge={rent ? 'Rent it out' : 'Sell it'} title={car} meta={meta} photo={previews[0]} priceLine={priceLine} done={done} total={4} />
    </div>
  );
}
