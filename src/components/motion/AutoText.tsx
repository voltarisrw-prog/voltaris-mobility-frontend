'use client';

import { useEffect, useState } from 'react';

type AutoTextProps = {
  items: string[];
  interval?: number;
  className?: string;
};

export function AutoText({
  items,
  interval = 4200,
  className = '',
}: AutoTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % items.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [items.length, interval]);

  return (
    <span
      className={`vds-auto-text inline-block ${className}`}
      aria-live="polite"
      key={items[index]}
    >
      {items[index]}
    </span>
  );
}
