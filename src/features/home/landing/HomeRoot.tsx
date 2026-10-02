'use client';

import { useEffect, useRef } from 'react';
import s from './home.module.css';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * The home page's root, and the one place its page-wide motion runs:
 *
 *   · reveals — sections, headings (word by word) and eyebrows as they arrive
 *   · magnetic buttons, card tilt and glare, the glow that follows the pointer
 *   · per frame while scrolling: headings open out to full width, the ticker
 *     runs and leans with scroll speed, the statement lights word by word over
 *     the road as it drifts, garage cards step back as the next one arrives
 *
 * The pointer is the ordinary mouse pointer throughout. Elements opt in with
 * data attributes (data-mag, data-tilt, data-glow, data-wide …), so the
 * sections themselves stay plain markup.
 */
export function HomeRoot({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const $$ = (sel: string) => [...el.querySelectorAll<HTMLElement>(sel)];
    const off: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(
      target: HTMLElement | Window | Document,
      type: K,
      fn: (e: HTMLElementEventMap[K]) => void,
      opts?: AddEventListenerOptions,
    ) => {
      target.addEventListener(type, fn as EventListener, opts);
      off.push(() => target.removeEventListener(type, fn as EventListener, opts));
    };

    /* reveals */
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', '');
          io.unobserve(e.target);
        }),
      { threshold: 0.12 },
    );
    $$(`.${s.rv}, .${s.sp}`).forEach((n) => !n.classList.contains(s.eb ?? 'eb') && io.observe(n));
    // An eyebrow is clipped to nothing until it is revealed, so it can never be
    // 12% visible: it is watched for any contact with the screen instead.
    const ebo = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.setAttribute('data-in', '');
          ebo.unobserve(e.target);
        }),
      { threshold: 0 },
    );
    $$(`.${s.eb}`).forEach((n) => ebo.observe(n));

    /* magnetic buttons, for a mouse */
    if (window.matchMedia('(pointer: fine)').matches) {
      $$('[data-mag]').forEach((m) => {
        on(m, 'pointermove', (e) => {
          const r = m.getBoundingClientRect();
          m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        });
        on(m, 'pointerleave', () => (m.style.transform = ''));
      });
    }

    /* 3D tilt with glare; a glow that follows the pointer */
    $$('[data-tilt]').forEach((c) => {
      on(c, 'pointermove', (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--ry', String((px - 0.5) * 14));
        c.style.setProperty('--rx', String((0.5 - py) * 14));
        c.style.setProperty('--gx', `${px * 100}%`);
        c.style.setProperty('--gy', `${py * 100}%`);
      });
      on(c, 'pointerleave', () => {
        c.style.setProperty('--rx', '0');
        c.style.setProperty('--ry', '0');
      });
    });
    $$('[data-glow]').forEach((c) => {
      on(c, 'pointermove', (e) => {
        const r = c.getBoundingClientRect();
        c.style.setProperty('--gx', `${e.clientX - r.left}px`);
        c.style.setProperty('--gy', `${e.clientY - r.top}px`);
      });
    });

    /* per frame */
    const wide = $$('[data-wide]') as (HTMLElement & { _v?: string })[];
    const mq = el.querySelector<HTMLElement>('[data-mq]');
    const st = el.querySelector<HTMLElement>('[data-statement]');
    const lit = $$('[data-sw] > span');
    const gcs = $$('[data-gc]');
    let vy = 0;
    let lastY = window.scrollY;
    let loop = 0;
    const frame = () => {
      loop = requestAnimationFrame(frame);
      if (document.hidden) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      vy += (y - lastY - vy) * 0.15;
      lastY = y;
      if (window.innerWidth >= 700) {
        for (const h of wide) {
          const r = h.getBoundingClientRect();
          if (r.bottom < -50 || r.top > vh + 50) continue;
          const v = (92 + 33 * clamp((vh * 0.98 - r.top) / (vh * 0.62))).toFixed(1);
          if (h._v !== v) {
            h._v = v;
            h.style.setProperty('--wd', v);
          }
        }
      }
      if (mq) {
        const half = mq.scrollWidth / 2 || 1;
        mq.style.transform = `translateX(${-((y * 0.7) % half)}px) skewX(${clamp(vy * -0.3, -9, 9).toFixed(2)}deg)`;
      }
      if (st) {
        const r = st.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          st.style.setProperty('--rp', clamp((vh - r.top) / (vh + r.height)).toFixed(3));
        }
        const p = clamp((vh * 0.85 - r.top) / (vh * 0.75));
        lit.forEach((w, k) => {
          const want = k < p * lit.length + 0.01;
          if (want !== w.hasAttribute('data-lit')) w.toggleAttribute('data-lit', want);
        });
      }
      gcs.forEach((c, k) => {
        const nx = gcs[k + 1];
        if (!nx) return;
        const top = parseFloat(getComputedStyle(c).top) || 96;
        const p = clamp(1 - (nx.getBoundingClientRect().top - top - 40) / (vh * 0.55));
        c.style.transform = `scale(${(1 - 0.05 * p).toFixed(3)})`;
        c.style.filter = `brightness(${(1 - 0.45 * p).toFixed(2)})`;
      });
    };
    loop = requestAnimationFrame(frame);

    return () => {
      io.disconnect();
      ebo.disconnect();
      cancelAnimationFrame(loop);
      off.forEach((f) => f());
    };
  }, []);

  return (
    <div ref={root} className={className} data-motion-ignore="">
      {children}
    </div>
  );
}
