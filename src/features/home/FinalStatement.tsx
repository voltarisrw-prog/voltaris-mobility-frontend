'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function FinalStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) return;

    const update = () => {
      frameRef.current = null;

      const rect = section.getBoundingClientRect();
      const viewport = window.innerHeight;
      const total = viewport + rect.height;
      const travelled = viewport - rect.top;

      setProgress(Math.min(1, Math.max(0, travelled / total)));
    };

    const onScroll = () => {
      if (frameRef.current === null) {
        frameRef.current = window.requestAnimationFrame(update);
      }
    };

    update();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);

      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const imageScale = 1.04 + progress * 0.06;
  const imageY = (progress - 0.5) * -22;
  const contentY = Math.max(0, 1 - progress * 1.8) * 34;
  const contentOpacity = Math.min(
    1,
    Math.max(0, (progress - 0.08) / 0.3),
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="final-statement-title"
      className="relative isolate min-h-[88svh] overflow-hidden border-y border-hairline sm:min-h-[92svh] lg:min-h-[100svh]"
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${imageY}px, 0) scale(${imageScale})`,
        }}
      >
        <Image
          src="/demo/lifestyle/vip-airport-transfer.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div
        className="absolute inset-0 bg-[#050A16]/30"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-[#050A16]/80 via-[#050A16]/10 to-[#0C0906]/95"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_50%_48%,transparent_8%,rgba(5,10,22,0.2)_62%,rgba(5,10,22,0.72)_100%)]"
        aria-hidden="true"
      />

      <div className="shell relative flex min-h-[88svh] flex-col justify-between py-8 sm:min-h-[92svh] sm:py-10 lg:min-h-[100svh] lg:py-12">
        <div
          className="max-w-6xl pt-8 sm:pt-12 lg:pt-16"
          style={{
            opacity: contentOpacity,
            transform: `translate3d(0, ${contentY}px, 0)`,
          }}
        >
          <h2
            id="final-statement-title"
            className="max-w-6xl font-display text-[clamp(4.5rem,13vw,12rem)] font-medium uppercase leading-[0.72] tracking-[-0.065em] text-chrome"
          >
            Ready
            <br />
            when you
            <br />
            are
          </h2>
        </div>

        <div
          className="flex flex-col items-start gap-8 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-12 sm:pb-8 lg:pb-10"
          style={{
            opacity: Math.min(
              1,
              Math.max(0, (progress - 0.25) / 0.3),
            ),
            transform: `translate3d(0, ${Math.max(0, 1 - progress * 1.5) * 24}px, 0)`,
          }}
        >
          <p className="max-w-xl font-display text-[clamp(1.7rem,3.5vw,3.25rem)] leading-[0.95] tracking-[-0.025em] text-chrome">
            Your next drive is closer than you think
          </p>

          <Link
            href="/cars"
            className="group flex shrink-0 items-center gap-3 border-b border-chrome/40 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-chrome transition-colors hover:border-volt hover:text-volt focus-visible:border-volt focus-visible:text-volt"
          >
            Explore the garage
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
