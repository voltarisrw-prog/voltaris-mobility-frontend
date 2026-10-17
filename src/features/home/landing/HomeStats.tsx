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

/**
 * A count is shown as one less than the real figure with a plus ("5" reads "4+"),
 * which is always true. A count of 1 is shown as it is, because "0+" would not be.
 */
const floor = (v: number) => (v > 1 ? { shown: v - 1, plus: true } : { shown: v, plus: false });

/** One figure that counts up from zero the first time it is on screen. */
function Stat({ item, index }: { item: StatItem; index: number }) {
  const { shown, plus } = floor(item.value);
  const box = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(shown);
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
        const delay = (index % 4) * 140;
        const duration = 2000;
        let t0 = 0;
        const step = (t: number) => {
          if (!t0) t0 = t;
          const p = Math.min(Math.max((t - t0 - delay) / duration, 0), 1);
          setN(Math.round(shown * (p === 1 ? 1 : 1 - Math.pow(2, -10 * p))));
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
  }, [shown, index]);

  return (
    <div
      ref={box}
      className={`${st.item} ${s.rv}`}
      data-on={on ? '' : undefined}
      style={{ '--i': index } as CSSProperties}
    >
      <span className={st.sr}>
        {fmt(shown)}
        {plus ? '+' : ''} {item.label}
      </span>
      <div className={st.fig} aria-hidden="true">
        <b className={st.num}>{fmt(n)}</b>
        {plus && <i className={st.plus}>+</i>}
      </div>
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
    <section className={st.sec} id="numbers" aria-labelledby="numbers-h">
      <div className={st.bg} aria-hidden="true" />
      <div className={s.w}>
        <div className={st.head}>
          <span className={`${s.eb} ${s.rv}`}>{eyebrow}</span>
          <h2 id="numbers-h" className={`${s.h2} ${s.rv} ${s.sp}`} data-wide="">
            {words(
              <>
                Voltaris in <em className={s.ser}>numbers</em>
              </>,
            )}
          </h2>
        </div>
        <div className={st.row}>
          {items.map((item, i) => (
            <Stat key={item.key} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
