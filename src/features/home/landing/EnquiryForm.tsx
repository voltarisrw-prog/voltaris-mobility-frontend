'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/components/ui';
import { createGeneralInquiry } from '@/lib/api/leads';
import { displayMessage } from '@/lib/api/errors';
import { track } from '@/lib/analytics';
import { generalInquirySchema } from '@/lib/validation/schemas';
import { Roll } from './text';
import s from './home.module.css';

const TOPICS = [
  { value: 'buying', label: 'I want to buy' },
  { value: 'renting', label: 'I want to rent' },
  { value: 'selling', label: 'I want to sell' },
  { value: 'other', label: 'Something else' },
] as const;

/** Which field each part of the enquiry is typed into. */
const FIELD = {
  full_name: 'enq-name',
  email: 'enq-email',
  phone: 'enq-phone',
  topic: 'enq-topic',
  message: 'enq-message',
  consent: 'enq-consent',
} as const;

/**
 * "Start with a simple question" — a general enquiry, sent to the same place
 * the home page's enquiries have always gone. The browser checks the fields
 * first; the stricter rules (a Rwandan mobile number, a sentence or more)
 * then speak through the same bubbles. A real person replies.
 */
export function EnquiryForm() {
  const toast = useToast();
  const form = useRef<HTMLFormElement>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const value = (id: string) => (f.querySelector<HTMLInputElement>(`#${id}`)?.value ?? '').trim();
    const parsed = generalInquirySchema.safeParse({
      full_name: value(FIELD.full_name),
      email: value(FIELD.email),
      // "0788 123 456", as the hint shows it, is a valid number too.
      phone: value(FIELD.phone).replace(/\s+/g, ''),
      topic: value(FIELD.topic),
      message: value(FIELD.message),
      consent: f.querySelector<HTMLInputElement>(`#${FIELD.consent}`)?.checked === true,
    });
    if (!parsed.success) {
      const issue = parsed.error.issues[0]!;
      const id = FIELD[issue.path[0] as keyof typeof FIELD];
      const field = id ? f.querySelector<HTMLInputElement>(`#${id}`) : null;
      if (field) {
        field.setCustomValidity(issue.message);
        field.reportValidity();
        field.addEventListener('input', () => field.setCustomValidity(''), { once: true });
        field.addEventListener('change', () => field.setCustomValidity(''), { once: true });
      }
      return;
    }
    setSending(true);
    try {
      await createGeneralInquiry({
        full_name: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        topic: parsed.data.topic,
        message: parsed.data.message,
        source: 'homepage',
      });
      track('inquiry_created', { preferred_channel: 'email', vehicle_id: 'general' });
      setSent(true);
      f.reset();
    } catch (cause) {
      toast.push('error', displayMessage(cause));
    } finally {
      setSending(false);
    }
  };

  return (
    <form
      ref={form}
      className={`${s.fm} ${s.rv}`}
      data-sent={sent ? '' : undefined}
      onSubmit={onSubmit}
    >
      <div className={s.rv} style={{ '--i': 0 } as React.CSSProperties}>
        <h3>Start with a simple question</h3>
        <p className={s.s}>You don&apos;t need to know exactly what you want yet</p>
      </div>
      <div className={`${s.f} ${s.rv}`} style={{ '--i': 1 } as React.CSSProperties}>
        <input id={FIELD.full_name} name="full_name" required placeholder=" " autoComplete="name" />
        <label htmlFor={FIELD.full_name}>
          Your name<i>*</i>
        </label>
      </div>
      <div className={`${s.r2} ${s.rv}`} style={{ '--i': 2 } as React.CSSProperties}>
        <div className={s.f}>
          <input
            id={FIELD.email}
            name="email"
            type="email"
            required
            placeholder=" "
            autoComplete="email"
          />
          <label htmlFor={FIELD.email}>
            Email<i>*</i>
          </label>
        </div>
        <div className={s.f}>
          <input
            id={FIELD.phone}
            name="phone"
            type="tel"
            required
            placeholder=" "
            autoComplete="tel"
            pattern="[0-9+ ]{9,}"
            aria-describedby="enq-phone-hint"
          />
          <label htmlFor={FIELD.phone}>
            Phone / WhatsApp<i>*</i>
          </label>
          <small id="enq-phone-hint">Rwandan mobile, e.g. 0788 123 456</small>
        </div>
      </div>
      <div className={`${s.f} ${s.rv}`} style={{ '--i': 3 } as React.CSSProperties}>
        <select id={FIELD.topic} name="topic" defaultValue="buying">
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <label htmlFor={FIELD.topic}>
          What can we help with?<i>*</i>
        </label>
      </div>
      <div className={`${s.f} ${s.rv}`} style={{ '--i': 4 } as React.CSSProperties}>
        <textarea
          id={FIELD.message}
          name="message"
          required
          placeholder=" "
          aria-describedby="enq-message-hint"
        />
        <label htmlFor={FIELD.message}>
          Tell us a little more<i>*</i>
        </label>
        <small id="enq-message-hint">
          The more you tell us, the better we can help. For example, I&apos;m looking for an
          affordable hybrid for daily driving in Kigali...
        </small>
      </div>
      <label className={`${s.ck} ${s.rv}`} style={{ '--i': 5 } as React.CSSProperties}>
        <input id={FIELD.consent} type="checkbox" required />
        I&apos;m happy for Voltaris to use my contact details to reply to this enquiry
      </label>
      <button
        className={`${s.btn} ${s.solid} ${s.rv}`}
        style={{ '--i': 6 } as React.CSSProperties}
        data-mag=""
        type="submit"
        disabled={sending}
        aria-busy={sending}
      >
        <Roll>Send enquiry →</Roll>
      </button>
      <div className={s.done} role="status" aria-hidden={!sent}>
        <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="enq-done" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#7fd4ff" />
              <stop offset="1" stopColor="#12d6b0" />
            </linearGradient>
          </defs>
          <circle cx="40" cy="40" r="36" stroke="url(#enq-done)" strokeWidth="3" />
          <path
            d="M24 41l12 12 21-24"
            stroke="url(#enq-done)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>Thank you</h3>
        <p className={s.s}>A real person will get back to you soon.</p>
      </div>
    </form>
  );
}
