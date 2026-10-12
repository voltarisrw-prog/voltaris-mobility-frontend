'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ArrowRight, Car, Check, Handshake, KeyRound, MessageCircle, Tag, type LucideIcon } from 'lucide-react';
import { useToast } from '@/components/ui';
import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { countryByIso, guessCountry, toE164 } from '@/lib/validation/phone';
import { contactSchema, type ContactForm as Values } from './schema';
import { PhoneField } from './PhoneField';
import './contact.css';

const TOPICS: { value: Values['topic']; label: string; Icon: LucideIcon }[] = [
  { value: 'buying', label: 'I want to buy a vehicle', Icon: Car },
  { value: 'selling', label: 'I have a vehicle to sell', Icon: Tag },
  { value: 'renting', label: 'I want to rent', Icon: KeyRound },
  { value: 'partnership', label: 'Dealer or partnership enquiry', Icon: Handshake },
  { value: 'other', label: 'Something else', Icon: MessageCircle },
];

const EXAMPLE = 'I am looking for an electric SUV under 40M with enough range for Kigali to Musanze and back.';
const MAX = 1500;

export function ContactForm() {
  const toast = useToast();
  const [reference, setReference] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(contactSchema),
    mode: 'onTouched',
    defaultValues: { topic: 'buying', full_name: '', email: '', phone: '', phone_country: 'RW', message: '' },
  });

  useEffect(() => {
    register('topic');
    register('phone_country');
  }, [register]);

  // Start from the visitor's own country (from their time zone); Rwanda otherwise.
  useEffect(() => {
    const guess = guessCountry(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (guess && guess !== 'RW') setValue('phone_country', guess);
  }, [setValue]);

  const topic = watch('topic');
  const iso = watch('phone_country');
  const length = (watch('message') ?? '').length;
  const phoneReg = register('phone');

  if (reference) {
    return (
      <div className="ct-done" role="status">
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle cx="40" cy="40" r="36" stroke="#7fd4ff" strokeWidth="3" />
          <path d="M24 41l12 12 21-24" stroke="#12d6b0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2>We have it</h2>
        <p>
          Reference <b>{reference}</b>. Someone from the Voltaris team will reply within one working day,
          on whichever channel you gave us.
        </p>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createGeneralInquiry({
        full_name: values.full_name,
        email: values.email,
        phone: toE164(countryByIso(values.phone_country), values.phone),
        topic: values.topic,
        message: values.message,
        source: 'contact-page',
      });
      track('inquiry_created', { vehicle_id: 'none', preferred_channel: values.topic });
      setReference(result.reference);
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="ct-fm">
      {/* Honeypot: hidden from people and screen readers; naive bots fill it in. */}
      <div style={{ position: 'absolute', left: -9999 }} aria-hidden="true">
        <label htmlFor="company-website">Leave this empty</label>
        <input id="company-website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <p className="ct-k">Send a message</p>
        <p className="ct-sub">Tell us what you need and the Voltaris team will get back to you.</p>
      </div>

      <div>
        <span className="ct-lb" id="ct-topic">
          What is this about<i>*</i>
        </span>
        <div className="ct-tpc" role="radiogroup" aria-labelledby="ct-topic">
          {TOPICS.map(({ value, label, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={topic === value}
              className={`ct-tp${topic === value ? ' is-on' : ''}`}
              onClick={() => setValue('topic', value, { shouldValidate: true, shouldDirty: true })}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
        <p className="ct-er" role="alert">
          {errors.topic?.message}
        </p>
      </div>

      <div>
        <div className={`ct-f${errors.full_name ? ' is-bad' : ''}`}>
          <input id="ct-name" placeholder=" " autoComplete="name" aria-invalid={Boolean(errors.full_name)} {...register('full_name')} />
          <label htmlFor="ct-name">
            Your name<i>*</i>
          </label>
        </div>
        <p className="ct-er" role="alert">
          {errors.full_name?.message}
        </p>
      </div>

      <div className="ct-r2">
        <div>
          <div className={`ct-f${errors.email ? ' is-bad' : ''}`}>
            <input id="ct-email" type="email" placeholder=" " autoComplete="email" aria-invalid={Boolean(errors.email)} {...register('email')} />
            <label htmlFor="ct-email">
              Email<i>*</i>
            </label>
          </div>
          <p className="ct-er" role="alert">
            {errors.email?.message}
          </p>
        </div>
        <div>
          <PhoneField id="ct-phone" iso={iso} onIso={(v) => setValue('phone_country', v, { shouldValidate: false })} inputProps={phoneReg} invalid={Boolean(errors.phone)} />
          <p className="ct-hint">Choose your country code, or paste a number that starts with +</p>
          <p className="ct-er" role="alert">
            {errors.phone?.message}
          </p>
        </div>
      </div>

      <div>
        <div className={`ct-f${errors.message ? ' is-bad' : ''}`}>
          <textarea
            id="ct-message"
            rows={5}
            placeholder={topic === 'buying' ? EXAMPLE : 'Tell us a little about what you need'}
            aria-invalid={Boolean(errors.message)}
            {...register('message')}
          />
          <label htmlFor="ct-message">
            Your message<i>*</i>
          </label>
        </div>
        <div className="ct-cnt">
          <span className="ct-er" role="alert">
            {errors.message?.message}
          </span>
          <span className={length > MAX ? 'is-over' : ''}>
            <b>{length}</b> / {MAX}
          </span>
        </div>
      </div>

      <div>
        <label className={`ct-ck${errors.consent ? ' is-bad' : ''}`}>
          <input type="checkbox" className="ct-cb" {...register('consent')} />
          <span className="ct-box">
            <Check size={16} strokeWidth={3} />
          </span>
          <span>Voltaris may use my details to reply to this enquiry.</span>
        </label>
        <p className="ct-er" role="alert">
          {errors.consent?.message}
        </p>
      </div>

      <button type="submit" className="ct-btn" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send enquiry'}
        {!isSubmitting && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
