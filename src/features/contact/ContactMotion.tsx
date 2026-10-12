'use client';

import { useEffect } from 'react';

/** Headline words rise out of a mask, paragraphs focus in, blocks reveal on entry. Pure enhancement. */
function split(el: HTMLElement, mode: 'mask' | 'focus') {
  if (el.classList.contains('ct-sp')) return;
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
            span.className = 'ct-wd';
            const inner = document.createElement('span');
            inner.className = 'ct-wi';
            inner.style.setProperty('--k', String(k++));
            inner.textContent = part;
            span.append(inner);
          } else {
            span.className = 'ct-fw';
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
  el.classList.add('ct-sp');
}

export function ContactMotion() {
  useEffect(() => {
    const root = document.querySelector('.ct-page');
    if (!root) return;
    root.querySelectorAll<HTMLElement>('[data-ct-split]').forEach((el) => split(el, 'mask'));
    root.querySelectorAll<HTMLElement>('[data-ct-focus]').forEach((el) => split(el, 'focus'));
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
    root.querySelectorAll('[data-ct-in]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
