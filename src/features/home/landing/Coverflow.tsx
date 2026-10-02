'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { CoverCard } from './cards';
import { Photo } from './Photo';
import { Arrow, Roll } from './text';
import s from './home.module.css';

const DUR = 4800;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The featured vehicles as a fan of cards: the one in front is lit and shows
 * its buttons. It moves on by itself (with a progress bar) while on screen,
 * and can be dragged, swiped, clicked to a side card, or stepped with the
 * arrow keys. Cards fan out one after another the first time it comes into
 * view, and the prices count up.
 */
export function Coverflow({ cards }: { cards: CoverCard[] }) {
  const cf = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const ctl = useRef<{ go: (d: number) => void; restart: () => void } | null>(null);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = cf.current;
    if (!root) return;
    const els = [...root.querySelectorAll<HTMLElement>('[data-card]')];
    const n = els.length;
    if (!n) return;
    let idx = n > 1 ? 1 : 0;
    let vis = true;
    let t0 = performance.now();
    let sx: number | null = null;
    let moved = 0;

    const delta = (k: number) => {
      const d = k - idx;
      return ((((d + n / 2) % n) + n) % n) - n / 2;
    };
    const render = () => {
      const mob = window.innerWidth < 640;
      const step = mob ? 54 : 60;
      els.forEach((c, k) => {
        const d = delta(k);
        const a = Math.abs(d);
        c.style.transform = `translate(-50%,-50%) translateX(${d * step}%) translateZ(${-a * 170}px) rotateY(${-d * (mob ? 20 : 28)}deg) scale(${1 - Math.min(a, 3) * 0.07})`;
        c.style.zIndex = String(10 - Math.round(a));
        c.style.opacity = String(a > 2.1 ? 0 : 1 - a * 0.2);
        c.style.pointerEvents = a > 2.1 ? 'none' : 'auto';
        c.toggleAttribute('data-on', Math.round(a) === 0);
        c.toggleAttribute('inert', a > 2.1);
      });
    };
    const go = (d: number) => {
      idx = (((idx + d) % n) + n) % n;
      t0 = performance.now();
      render();
    };
    ctl.current = { go, restart: () => (t0 = performance.now()) };

    const off: (() => void)[] = [];
    const on = (t: EventTarget, type: string, fn: EventListener) => {
      t.addEventListener(type, fn);
      off.push(() => t.removeEventListener(type, fn));
    };
    els.forEach((c, k) =>
      on(c, 'click', (e) => {
        if (moved > 6) {
          e.preventDefault();
          return;
        }
        const d = Math.round(delta(k));
        if (d !== 0) {
          e.preventDefault();
          go(d);
        }
      }),
    );
    // Dragging over a photo or a link would start the browser's own drag and
    // cancel the pointer, so the fan could never be dragged with a mouse.
    on(root, 'dragstart', (e) => e.preventDefault());
    on(root, 'pointerdown', (e) => {
      sx = (e as PointerEvent).clientX;
      moved = 0;
    });
    on(window, 'pointermove', (e) => {
      if (sx !== null) moved = Math.abs((e as PointerEvent).clientX - sx);
    });
    on(window, 'pointerup', (e) => {
      if (sx === null) return;
      const dx = (e as PointerEvent).clientX - sx;
      sx = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
    on(root, 'keydown', (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === 'ArrowRight') go(1);
      if (key === 'ArrowLeft') go(-1);
    });
    on(window, 'resize', render);

    const seen = new IntersectionObserver(([e]) => (vis = Boolean(e?.isIntersecting)), {
      threshold: 0.3,
    });
    seen.observe(root);

    // The first time it comes into view: fan out one after another, count up.
    let clear = 0;
    const enter = new IntersectionObserver(
      (es) => {
        if (!es[0]?.isIntersecting) return;
        enter.disconnect();
        els.forEach((c, k) => (c.style.transitionDelay = `${k * 90}ms`));
        root.removeAttribute('data-pre');
        clear = window.setTimeout(() => els.forEach((c) => (c.style.transitionDelay = '')), 1600);
        countUp(root);
      },
      { threshold: 0.25 },
    );
    enter.observe(root);

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (pausedRef.current || !vis || document.hidden || n < 2) return;
      const p = (now - t0) / DUR;
      if (bar.current) bar.current.style.width = `${clamp(p) * 100}%`;
      if (p >= 1) go(1);
    };
    raf = requestAnimationFrame(tick);
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(clear);
      seen.disconnect();
      enter.disconnect();
      off.forEach((f) => f());
      ctl.current = null;
    };
  }, []);

  return (
    <>
      <div
        ref={cf}
        className={s.cf}
        data-pre=""
        data-cur="Drag"
        role="region"
        aria-label="Featured vehicles"
        tabIndex={0}
      >
        {cards.map((v) => (
          <article key={v.id} className={s.cc} data-card="">
            <Photo
              src={v.image}
              alt={v.alt}
              sizes="(min-width: 1236px) 420px, (min-width: 736px) 34vw, 250px"
            />
            <div className={s.i}>
              <small>{v.year}</small>
              <h3>{v.title}</h3>
              <div className={s.r}>
                <span>
                  {v.city}
                  {v.price && (
                    <>
                      <br />
                      <b>{v.price}</b>
                    </>
                  )}
                </span>
                {v.verified && <span className={s.vf}>Verified</span>}
              </div>
              <div className={s.a}>
                <Link href={v.viewHref}>
                  <Roll>View vehicle</Roll>
                </Link>
                <Link href={v.dealHref}>
                  <Roll>{v.dealLabel}</Roll>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className={s.ctl}>
        <button type="button" className={s.cb} onClick={() => ctl.current?.go(-1)}>
          <Arrow flip />
          <span>Previous</span>
        </button>
        <div className={s.bar}>
          <i ref={bar} />
        </div>
        <button
          type="button"
          className={`${s.cb} ${s.p}`}
          aria-label="Pause autoplay"
          aria-pressed={paused}
          onClick={() => {
            pausedRef.current = !pausedRef.current;
            setPaused(pausedRef.current);
            ctl.current?.restart();
          }}
        >
          {paused ? '▶' : '❚❚'}
        </button>
        <button type="button" className={s.cb} onClick={() => ctl.current?.go(1)}>
          <span>Next</span>
          <Arrow />
        </button>
      </div>
    </>
  );
}

/** Prices count up from zero, easing out over a second and a half. */
function countUp(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>('b').forEach((b) => {
    // Written into the text node React made, so React still owns it.
    const node = b.firstChild;
    const m = node?.nodeValue?.match(/^(\D*)([\d,]+)$/);
    if (!node || !m) return;
    const to = Number(m[2]!.replace(/,/g, ''));
    const t0 = performance.now();
    const f = (t: number) => {
      const p = clamp((t - t0) / 1500);
      const e = 1 - Math.pow(1 - p, 4);
      node.nodeValue = m[1] + Math.round(to * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(f);
    };
    requestAnimationFrame(f);
  });
}
