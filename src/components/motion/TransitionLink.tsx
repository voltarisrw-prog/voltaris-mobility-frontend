'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

/**
 * A Link that wraps client navigation in document.startViewTransition, so an
 * element with `view-transition-name: vehicle-hero` on both pages morphs
 * between them. Where the API is missing, or motion is reduced, it is an
 * ordinary Link. Modified clicks (new tab) are left to the browser.
 */
export function TransitionLink({
  href,
  children,
  onClick,
  ...rest
}: LinkProps & { children: ReactNode; className?: string; 'aria-label'?: string; onClick?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  const router = useRouter();
  function handle(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const doc = document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => unknown };
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    const url = typeof href === 'string' ? href : href.toString();
    doc.startViewTransition(() => router.push(url));
  }
  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  );
}
