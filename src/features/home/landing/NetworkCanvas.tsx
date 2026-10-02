'use client';

import { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/**
 * The network: dots drifting and joining when they pass close, and reaching
 * for the pointer when it is near. Runs only while on (or near) the screen.
 */
export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    let W = 0;
    let H = 0;
    let pts: Dot[] = [];
    const m = { x: -999, y: -999 };
    let run = false;
    let inited = false;
    let raf = 0;

    const size = () => {
      const r = cv.getBoundingClientRect();
      const d = window.devicePixelRatio || 1;
      W = r.width;
      H = r.height;
      cv.width = W * d;
      cv.height = H * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      pts = Array.from({ length: Math.round((W * H) / 8500) }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      }));
    };
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (!run) return;
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i]!;
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j]!;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 95) {
            ctx.strokeStyle = `rgba(127,212,255,${0.28 * (1 - d / 95)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - m.x, a.y - m.y);
        if (dm < 150) {
          ctx.strokeStyle = `rgba(18,214,176,${0.7 * (1 - dm / 150)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
          a.x += (m.x - a.x) * 0.01;
          a.y += (m.y - a.y) * 0.01;
        }
        ctx.fillStyle = dm < 150 ? '#12d6b0' : '#7fd4ff';
        ctx.beginPath();
        ctx.arc(a.x, a.y, dm < 150 ? 2.6 : 1.6, 0, 7);
        ctx.fill();
      }
    };

    const move = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
    };
    const leave = () => (m.x = -999);
    const resize = () => inited && size();
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerleave', leave);
    window.addEventListener('resize', resize);
    const io = new IntersectionObserver(
      ([e]) => {
        run = Boolean(e?.isIntersecting);
        if (run && !inited) {
          inited = true;
          size();
          raf = requestAnimationFrame(draw);
        }
      },
      { rootMargin: '200px' },
    );
    io.observe(cv);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      cv.removeEventListener('pointermove', move);
      cv.removeEventListener('pointerleave', leave);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" />;
}
