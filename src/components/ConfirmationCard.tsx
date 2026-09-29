'use client';

import Link from 'next/link';
import { CalendarPlus, MessageCircle } from 'lucide-react';
import { site } from '@/config/site';
import { Reveal } from '@/components/motion/Reveal';


export interface ConfirmationProps {
  eyebrow: string;
  title: string;
  reference: string;
  steps: [string, string, string];
  /** For the .ics file. Omit when there is no fixed time yet. */
  event?: { title: string; start: string; durationMinutes?: number; location?: string };
  whatsappText?: string;
  links?: { label: string; href: string }[];
}

function ics(e: NonNullable<ConfirmationProps['event']>, reference: string) {
  const start = new Date(e.start);
  const end = new Date(start.getTime() + (e.durationMinutes ?? 60) * 60_000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Voltaris//EN', 'BEGIN:VEVENT',
    `UID:${reference}@voltaris.rw`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(start)}`, `DTEND:${fmt(end)}`,
    `SUMMARY:${e.title}`, e.location ? `LOCATION:${e.location}` : '', `DESCRIPTION:Reference ${reference}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
}

/**
 * One confirmation for every flow: order, rental, garage, test drive. Reference,
 * three next steps, WhatsApp, add-to-calendar. Nothing else.
 */
export function ConfirmationCard(p: ConfirmationProps) {
  const wa = site.contact.whatsapp
    ? `https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(p.whatsappText ?? `Hello Voltaris, about reference ${p.reference}.`)}`
    : null;

  function addToCalendar() {
    if (!p.event) return;
    const blob = new Blob([ics(p.event, p.reference)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `voltaris-${p.reference}.ics`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="border border-hairline bg-white p-6 text-chrome sm:p-8">
      <p className="eyebrow text-volt-deep">{p.eyebrow}</p>
      <h2 className="mt-3 font-display text-headline">{p.title}</h2>
      <p className="mt-3 font-data text-sm">
        Reference <span className="font-semibold">{p.reference}</span>
      </p>

      <Reveal as="ol" stagger={140} threshold={0} className="mt-8 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
        {p.steps.map((step, i) => (
          <li key={step} className="bg-white p-4">
            <p className="font-data text-xs text-steel-muted">0{i + 1}</p>
            <p className="mt-2 text-sm leading-relaxed text-steel">{step}</p>
          </li>
        ))}
      </Reveal>

      <div className="mt-6 flex flex-wrap gap-3">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 bg-chrome px-5 font-data text-eyebrow uppercase text-white">
            <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
          </a>
        )}
        {p.event && (
          <button type="button" onClick={addToCalendar} className="inline-flex min-h-12 items-center gap-2 border border-chrome px-5 font-data text-eyebrow uppercase text-chrome">
            <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to calendar
          </button>
        )}
        {p.links?.map((l) => (
          <Link key={l.href} href={l.href} className="inline-flex min-h-12 items-center border border-hairline px-5 font-data text-eyebrow uppercase text-steel hover:text-chrome">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
