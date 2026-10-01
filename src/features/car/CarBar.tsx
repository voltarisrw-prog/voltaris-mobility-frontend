'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import c from './car.module.css';

/**
 * Phones and tablets: once the car has scrolled away, a floating capsule keeps
 * the price and the next step under the thumb. (Its `fixed inset-x-0 bottom-0`
 * wrapper also tells the site header to put its Buy · Rent · Sell dock away.)
 */
export function CarBar({
  name,
  price,
  primary,
  whatsappHref,
}: {
  name: string;
  price: string;
  primary: { label: string; href: string };
  whatsappHref: string | null;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setShown(window.scrollY > window.innerHeight * 0.6);
        frame = 0;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 ${c.barWrap}`}
      data-shown={shown ? '' : undefined}
      aria-hidden={!shown}
    >
      <div className={c.bar}>
        <div className={c.barText}>
          <span>{name}</span>
          <b>{price}</b>
        </div>
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp the seller"
            tabIndex={shown ? 0 : -1}
            className={c.barIcon}
          >
            <MessageCircle aria-hidden="true" />
          </a>
        )}
        <Link href={primary.href} tabIndex={shown ? 0 : -1} className={c.barGo}>
          {primary.label}
        </Link>
      </div>
    </div>
  );
}
