'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * JS fallback for browsers without `animation-timeline: view()`. Sets
 * `--parallax` on the frame from -1 (entering) to 1 (leaving); the CSS in
 * globals.css turns that into a 7% drift. Does nothing where the native
 * timeline is supported or motion is reduced.
 */
export function Parallax({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (CSS.supports('animation-timeline: view()')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / (vh / 2 + r.height / 2)));
      node.style.setProperty('--parallax', String(-p));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div ref={ref} className={`parallax-frame ${className ?? ''}`}>{children}</div>;
}
