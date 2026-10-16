'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import s from './home.module.css';
import st from './stats.module.css';
import { words } from './text';

export interface StatItem {
  key: string;
  label: string;
  value: number;
  note?: string | undefined;
}

const fmt = (n: number) => n.toLocaleString('en-US');

/** One figure that counts up from zero the first time it is on screen. */
function Stat({ item, index }: { item: StatItem; index: number }) {
  const box = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(item.value);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        setOn(true);
        if (reduce) return;
        const delay = index * 120;
        const duration = 1800;
        let t0 = 0;
        const step = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min(Math.max((t - t0 - delay) / duration, 0), 1);
          setN(Math.round(item.value * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    // Start from zero only when it will animate; with reduced motion the real number just shows.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!reduce) setN(0);
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [item.value, index]);

  return (
    <div
      ref={box}
      className={`${st.card} ${s.rv}`}
      data-on={on ? '' : undefined}
      style={{ '--i': index } as CSSProperties}
    >
      <span className={st.idx} aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className={st.sr}>
        {fmt(item.value)} {item.label}
      </span>
      <b className={st.num} aria-hidden="true">
        {fmt(n)}
      </b>
      <span className={st.label} aria-hidden="true">
        {item.label}
      </span>
      {item.note && (
        <small className={st.note} aria-hidden="true">
          {item.note}
        </small>
      )}
    </div>
  );
}

export function HomeStats({ eyebrow, items }: { eyebrow: string; items: StatItem[] }) {
  return (
    <section className={s.sec} id="numbers" aria-labelledby="numbers-h">
      <div className={s.w}>
        <span className={`${s.eb} ${s.rv}`}>{eyebrow}</span>
        <h2 id="numbers-h" className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
          {words(
            <>
              Voltaris in <em className={s.ser}>numbers</em>
            </>,
          )}
        </h2>
        <div className={st.grid}>
          {items.map((item, i) => (
            <Stat key={item.key} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
