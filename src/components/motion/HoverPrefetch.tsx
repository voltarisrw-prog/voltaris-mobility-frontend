'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

/**
 * Warms the vehicle route on hover or first touch, so the detail page is in
 * the router cache before the click. Rendered as an invisible overlay-free
 * sibling: it listens on its parent (the card), not on itself.
 */
export function HoverPrefetch({ href }: { href: string }) {
  const router = useRouter();
  const done = useRef(false);
  const ref = useRef<HTMLSpanElement>(null);
  function arm() {
    if (done.current) return;
    done.current = true;
    router.prefetch(href);
  }
  return (
    <span
      ref={(node) => {
        ref.current = node;
        const parent = node?.parentElement;
        if (!parent || parent.dataset.prefetchArmed) return;
        parent.dataset.prefetchArmed = '1';
        parent.addEventListener('mouseenter', arm, { once: true });
        parent.addEventListener('touchstart', arm, { once: true, passive: true });
        parent.addEventListener('focusin', arm, { once: true });
      }}
      hidden
    />
  );
}
