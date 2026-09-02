'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { CoverflowShowcase } from '@/components/CoverflowShowcase';

const CENTER_SIZE = 'h-[24rem] w-[19rem] sm:h-[28rem] sm:w-[23rem] lg:h-[32rem] lg:w-[26rem]';
const PEEK_SIZE = 'h-[20rem] w-[16rem] sm:h-[23rem] sm:w-[19rem] lg:h-[26rem] lg:w-[21rem]';

/**
 * A dealer worth putting in the coverflow, not just a dealer. `DealerSummary`
 * (what `/dealers` returns) has only a small square `logo_url` — fine at
 * 56px in `DealerCard`, not at hero scale. The photographic cover image only
 * exists on `DealerDetail`, which is a separate request per dealer. This
 * type is what's left after the page fetches those details for a handful of
 * candidates and drops the ones with no cover image to show — see the note
 * in `dealers/page.tsx`.
 */
export interface DealerShowcaseItem {
  slug: string;
  name: string;
  city: string;
  verified: boolean;
  vehicleCount: number;
  coverImageUrl: string;
  whatsapp?: string;
  phone?: string;
}

/**
 * Same coverflow, carrying dealers instead of vehicles or posts. A dealer's
 * two natural actions are "talk to them" and "see their listings" — the same
 * two-action shape as the vehicle showcase's test-drive/listing pair, so
 * this keeps the left slot as an action (WhatsApp or a phone call, whichever
 * the dealer has) rather than falling back to something informational.
 */
export function DealerShowcase({ dealers }: { dealers: DealerShowcaseItem[] }) {
  return (
    <CoverflowShowcase
      items={dealers}
      getKey={(dealer) => dealer.slug}
      ariaLabel="Featured dealers"
      peekLabel={(dealer) => `View ${dealer.name}`}
      centerSizeClassName={CENTER_SIZE}
      peekSizeClassName={PEEK_SIZE}
      renderPeek={(dealer) => (
        <Image src={dealer.coverImageUrl} alt="" fill sizes="21rem" className="object-cover" />
      )}
      renderCenter={(dealer) => {
        const href = `/dealers/${dealer.slug}`;
        const contact = dealer.whatsapp
          ? { href: `https://wa.me/${dealer.whatsapp.replace(/\D/g, '')}`, label: 'WhatsApp' }
          : dealer.phone
            ? { href: `tel:${dealer.phone}`, label: 'Call' }
            : null;

        return (
          <>
            <Image
              src={dealer.coverImageUrl}
              alt={dealer.name}
              fill
              priority
              sizes="(min-width: 1024px) 26rem, (min-width: 640px) 23rem, 19rem"
              className="object-cover"
            />

            <div
              className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-surface/85 to-transparent"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-surface/90 to-transparent"
              aria-hidden="true"
            />

            {/* 1 — name and city, top. Stretched click target for the card
                itself, same ::after pattern as the other two showcases. */}
            <div className="absolute inset-x-4 top-4">
              <p className="eyebrow text-steel-muted/90">{dealer.city}</p>
              <Link href={href} className="mt-1 block after:absolute after:inset-0">
                <span className="font-display text-xl font-semibold tracking-tight text-chrome sm:text-2xl">
                  {dealer.name}
                </span>
              </Link>
            </div>

            {/* 2 — talk to them, left. Omitted entirely (rather than shown
                disabled) on the rare dealer with neither a phone nor a
                WhatsApp number on file. */}
            {contact && (
              <Link
                href={contact.href}
                className="absolute left-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-chrome/70 bg-surface/70 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-chrome backdrop-blur-sm transition-colors hover:border-volt hover:text-volt"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {contact.label}
              </Link>
            )}

            {/* 3 — their listings, right. */}
            <Link
              href={href}
              className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1.5 border border-volt/60 bg-volt/10 px-3 py-2 font-data text-[0.65rem] uppercase tracking-wide text-volt backdrop-blur-sm transition-colors hover:bg-volt hover:text-surface"
            >
              View
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>

            {/* 4 — inventory count, bottom, in place of the vehicle
                showcase's price — a dealer doesn't have a single price, but
                "how much is actually here" is the equivalent question. */}
            <Link
              href={href}
              className="absolute inset-x-4 bottom-4 z-10 flex items-baseline justify-between"
            >
              <span className="font-data text-lg font-semibold tabular-nums text-chrome sm:text-xl">
                {dealer.vehicleCount} {dealer.vehicleCount === 1 ? 'vehicle' : 'vehicles'}
              </span>
              {dealer.verified && (
                <span className="font-data text-[0.65rem] uppercase tracking-wide text-volt">
                  Verified
                </span>
              )}
            </Link>
          </>
        );
      }}
    />
  );
}
