'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * The three actions, always within thumb reach on phones and tablets (≤1024).
 * Slides in once the exterior spread has scrolled away. Targets are 48px.
 */
export function PinnedVehicleCta({
  priceLabel,
  demoDriveHref,
  primary,
  whatsappHref,
}: {
  priceLabel: string;
  demoDriveHref: string | null;
  primary: { label: string; href: string } | null;
  whatsappHref: string | null;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setShown(window.scrollY > window.innerHeight * 0.55);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-white/95 backdrop-blur-xl transition-transform duration-300 lg:hidden ${
        shown ? 'translate-y-0' : 'translate-y-[120%]'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center gap-2 px-[clamp(1rem,4vw,4rem)] py-2.5">
        <p className="min-w-0 flex-1 truncate font-display text-base font-semibold tabular-nums text-chrome">{priceLabel}</p>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            tabIndex={shown ? 0 : -1}
            className="vds-button vds-button-ghost h-12 w-12 shrink-0 px-0"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </a>
        )}
        {demoDriveHref && (
          <Link
            href={demoDriveHref}
            tabIndex={shown ? 0 : -1}
            className="vds-button vds-button-secondary h-12 shrink-0 px-4 font-data text-eyebrow uppercase"
          >
            Demo drive
          </Link>
        )}
        {primary && (
          <Link
            href={primary.href}
            tabIndex={shown ? 0 : -1}
            className="vds-button vds-button-primary h-12 shrink-0 px-4 font-data text-eyebrow uppercase"
          >
            {primary.label}
          </Link>
        )}
      </div>
    </div>
  );
}

