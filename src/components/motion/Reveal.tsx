'use client';

import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from 'react';
import { cn } from '@/lib/format';

export type RevealVariant = 'fade' | 'up' | 'scale';

/**
 * The one motion primitive. An element starts hidden (see `.reveal` in
 * globals.css), and gets `.is-in` when it enters the viewport; the CSS does
 * the rest. `once` keeps it in after the first entry; `stagger` delays each
 * direct child in turn. With prefers-reduced-motion the CSS renders
 * everything static, so nothing here needs a branch.
 *
 * Server-render is visible by default (`.reveal` without JS is opaque), so
 * crawlers, screenshots and no-JS readers never see blank sections.
 */
export function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  stagger = 0,
  once = true,
  threshold = 0.15,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  variant?: RevealVariant;
  /** ms before the element (or its first child) starts. */
  delay?: number;
  /** ms between each direct child. 0 = the element animates as one. */
  stagger?: number;
  once?: boolean;
  threshold?: number;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Arm via the DOM, not state: the hidden style must land before the first
    // paint after hydration, and a state update here would be a second render.
    node.dataset.armed = '1';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      // A ratio threshold can never be met by an element taller than the
      // viewport (the showroom is N × 82svh), so fall back to any pixel.
      {
        threshold: node.offsetHeight > window.innerHeight ? 0 : threshold,
        rootMargin: '0px 0px -8% 0px',
      },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once, threshold]);

  const Component = Tag as unknown as 'div';
  const staggered =
    stagger > 0
      ? Children.map(children, (child, i) =>
          isValidElement(child)
            ? cloneElement(child as ReactElement<{ style?: CSSProperties; className?: string }>, {
                className: cn((child.props as { className?: string }).className, 'reveal-child'),
                style: { ...((child.props as { style?: CSSProperties }).style ?? {}), transitionDelay: `${delay + i * stagger}ms` },
              })
            : child,
        )
      : children;

  return (
    <Component
      ref={ref as never}
      data-variant={variant}
      className={cn('reveal', inView && 'is-in', stagger > 0 && 'reveal-stagger', className)}
      style={stagger > 0 ? undefined : { transitionDelay: `${delay}ms` }}
      {...(rest as object)}
    >
      {staggered}
    </Component>
  );
}
