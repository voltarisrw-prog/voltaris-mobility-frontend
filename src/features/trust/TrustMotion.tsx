'use client';

import { useEffect } from 'react';

/** Headline words rise out of a mask, paragraphs focus in, blocks reveal and headings widen as they arrive. Pure enhancement. */
function split(el: HTMLElement, mode: 'mask' | 'focus') {
  if (el.classList.contains('tr-sp')) return;
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
            span.className = 'tr-wd';
            const inner = document.createElement('span');
            inner.className = 'tr-wi';
            inner.style.setProperty('--k', String(k++));
            inner.textContent = part;
            span.append(inner);
          } else {
            span.className = 'tr-fw';
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
  el.classList.add('tr-sp');
}

export function TrustMotion() {
  useEffect(() => {
    const root = document.querySelector('.tr-page');
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-tr-split]').forEach((el) => split(el, 'mask'));
    root.querySelectorAll<HTMLElement>('[data-tr-focus]').forEach((el) => split(el, 'focus'));

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
    root.querySelectorAll('[data-tr-in]').forEach((el) => io.observe(el));

    const wide = Array.from(root.querySelectorAll<HTMLElement>('[data-tr-wide]'));
    let raf = 0;
    const loop = () => {
      if (window.innerWidth >= 700) {
        const vh = window.innerHeight;
        wide.forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.bottom < -50 || r.top > vh + 50) return;
          const p = Math.min(Math.max((vh * 0.98 - r.top) / (vh * 0.5), 0), 1);
          el.style.setProperty('--wd', (92 + 33 * p).toFixed(1));
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const glow = (e: PointerEvent) => {
      const c = (e.target as HTMLElement).closest<HTMLElement>('.tr-vc');
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty('--gx', `${e.clientX - r.left}px`);
      c.style.setProperty('--gy', `${e.clientY - r.top}px`);
    };
    root.addEventListener('pointermove', glow as EventListener);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', glow as EventListener);
    };
  }, []);
  return null;
}
