'use client';

import { useEffect } from 'react';

/**
 * Text and scroll motion for the careers page. Pure enhancement: the page is fully
 * readable without it, and `prefers-reduced-motion` switches every effect off in CSS.
 *  - headings: words rise out of a mask      - paragraphs: words focus in
 *  - blocks reveal as they enter the screen  - the open-roles badge counts up
 */
function split(el: HTMLElement, mode: 'mask' | 'focus') {
  if (el.classList.contains('cr-sp')) return;
  let k = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.append(' ');
            return;
          }
          const span = document.createElement('span');
          if (mode === 'mask') {
            span.className = 'cr-wd';
            const inner = document.createElement('span');
            inner.className = 'cr-wi';
            inner.style.setProperty('--k', String(k++));
            inner.textContent = part;
            span.append(inner);
          } else {
            span.className = 'cr-fw';
            span.style.setProperty('--k', String(k++));
            span.textContent = part;
          }
          frag.append(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.classList.add('cr-sp');
}

export function CareersMotion() {
  useEffect(() => {
    const root = document.querySelector('.cr-page');
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-cr-split]').forEach((el) => split(el, 'mask'));
    root.querySelectorAll<HTMLElement>('[data-cr-focus]').forEach((el) => split(el, 'focus'));

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll('[data-cr-in]').forEach((el) => io.observe(el));

    const badge = root.querySelector<HTMLElement>('[data-cr-count]');
    let raf = 0;
    if (badge && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const to = Number(badge.dataset.crCount ?? 0);
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min((t - t0) / 900, 1);
        badge.textContent = String(Math.round(to * p));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      badge.textContent = '0';
      raf = requestAnimationFrame(step);
    }
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
