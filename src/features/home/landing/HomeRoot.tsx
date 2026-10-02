'use client';

import { useEffect, useRef } from 'react';
import s from './home.module.css';

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * The home page's root, and the one place its page-wide motion runs:
 *
 *   · reveals — sections, headings (word by word) and eyebrows as they arrive
 *   · the cursor ring, which grows and names what is under it ("Drag", "View")
 *   · magnetic buttons, card tilt and glare, the glow that follows the pointer
 *   · the hero spotlight, and its blue / teal tint over "Electric" / "Hybrid"
 *   · per frame while scrolling: headings open out to full width, the ticker
 *     runs and leans with scroll speed, the statement lights word by word,
 *     garage cards step back as the next one arrives, the hero drifts
 *
 * Elements opt in with data attributes (data-mag, data-tilt, data-glow,
 * data-wide, data-cur …), so the sections themselves stay plain markup.
 */
export function HomeRoot({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const cur = useRef<HTMLDivElement>(null);

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

    /* cursor, magnetic buttons */
    const fine = window.matchMedia('(pointer: fine)').matches;
    const ring = cur.current;
    let raf = 0;
    if (fine && ring) {
      document.body.classList.add('home-cursor');
      off.push(() => document.body.classList.remove('home-cursor'));
      let x = -99;
      let y = -99;
      let cx = -99;
      let cy = -99;
      on(window, 'pointermove', (e) => {
        x = e.clientX;
        y = e.clientY;
      });
      const follow = () => {
        cx += (x - cx) * 0.2;
        cy += (y - cy) * 0.2;
        ring.style.transform = `translate(${cx}px,${cy}px)`;
        raf = requestAnimationFrame(follow);
      };
      raf = requestAnimationFrame(follow);
      on(document, 'pointerover', (e) => {
        const t = (e.target as Element | null)?.closest<HTMLElement>('[data-cur],a,button');
        const label = t?.dataset.cur ?? '';
        if (label) ring.setAttribute('data-big', '');
        else ring.removeAttribute('data-big');
        ring.dataset.t = label;
      });
      $$('[data-mag]').forEach((m) => {
        on(m, 'pointermove', (e) => {
          const r = m.getBoundingClientRect();
          m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px,${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
        });
        on(m, 'pointerleave', () => (m.style.transform = ''));
      });
    }

    /* hero spotlight and tints */
    const hero = el.querySelector<HTMLElement>('[data-hero]');
    if (hero) {
      on(hero, 'pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        hero.style.setProperty('--mx', `${px * 100}%`);
        hero.style.setProperty('--my', `${py * 100}%`);
        hero.style.setProperty('--px', String(px - 0.5));
        hero.style.setProperty('--py', String(py - 0.5));
      });
      $$('[data-tint]').forEach((w) => {
        on(w, 'pointerenter', () => (hero.dataset.t = w.dataset.tint));
        on(w, 'pointerleave', () => (hero.dataset.t = ''));
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
      if (st && lit.length) {
        const r = st.getBoundingClientRect();
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
      if (hero) hero.style.setProperty('--sy', String(clamp(y / vh) * 140));
    };
    loop = requestAnimationFrame(frame);

    return () => {
      io.disconnect();
      ebo.disconnect();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(loop);
      off.forEach((f) => f());
    };
  }, []);

  return (
    <div ref={root} className={className} data-motion-ignore="">
      <div ref={cur} className={s.cur} aria-hidden="true" />
      {children}
    </div>
  );
}
