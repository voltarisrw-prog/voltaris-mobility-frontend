'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MOVES = [
  {
    number: '01',
    title: 'Kigali',
    description: 'Efficient electric and hybrid vehicles for everyday city driving',
    href: '/cars?location=kigali',
  },
  {
    number: '02',
    title: 'Across Rwanda',
    description: 'Comfortable choices for longer journeys between cities and districts',
    href: '/cars',
  },
  {
    number: '03',
    title: 'Electric future',
    description: 'Explore a new generation of vehicles built for cleaner everyday movement',
    href: '/cars?fuel=electric',
  },
] as const;

export function RwandaInMotion() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0.5);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    if (reducedMotion) {
      return;
    }

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

  const imageScale = 1.02 + progress * 0.05;
  const imageY = (progress - 0.5) * -18;

  return (
    <section
      ref={sectionRef}
      aria-labelledby="rwanda-in-motion-title"
      className="relative isolate overflow-hidden border-y border-[color:var(--vds-border)] bg-[#0c0906]"
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${imageY}px, 0) scale(${imageScale})`,
        }}
      >
        <Image
          src="/demo/lifestyle/villa-sunset-charging.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div
        className="absolute inset-0 bg-[#0c0906]/55"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0c0906]/85 via-[#0c0906]/30 to-[#0c0906]/95"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_55%_45%,transparent_10%,rgba(5,10,22,0.35)_68%,rgba(5,10,22,0.8)_100%)]"
        aria-hidden="true"
      />

      <div className="shell relative py-20 sm:py-24 lg:py-32">
        <div className="max-w-5xl">
          <p className="font-data text-[0.62rem] uppercase tracking-[0.2em] text-[color:var(--vds-brand-secondary)]">
            Rwanda
          </p>

          <h2
            id="rwanda-in-motion-title"
            className="mt-4 max-w-5xl font-display text-[clamp(3.8rem,10vw,9rem)] leading-[0.8] tracking-[-0.055em] text-[color:var(--vds-text)]"
          >
            Made for how
            <br />
            Rwanda moves
          </h2>

          <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-[color:var(--vds-text-secondary)] sm:text-lg">
            Discover electric and hybrid vehicles around the places you go,
            the journeys you make and the way you want to move
          </p>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden border border-[color:var(--vds-border)] bg-[color:var(--vds-border)] md:grid-cols-3 lg:mt-20">
          {MOVES.map((move) => (
            <Link
              key={move.title}
              href={move.href}
              className="group relative min-h-[16rem] bg-[#0c0906]/75 p-6 backdrop-blur-sm transition-colors duration-500 hover:bg-[#15110d]/90 sm:min-h-[18rem] sm:p-8"
            >
              <div className="flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-data text-[0.58rem] tracking-[0.16em] text-[color:var(--vds-text-muted)]">
                    {move.number}
                  </span>

                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--vds-border)] transition-all duration-300 group-hover:border-[color:var(--vds-brand-secondary)] group-hover:bg-[color:var(--vds-brand-secondary)] group-hover:text-[#0c0906]">
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-4xl leading-none tracking-[-0.03em] sm:text-5xl">
                    {move.title}
                  </h3>

                  <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[color:var(--vds-text-secondary)]">
                    {move.description}
                  </p>

                  <span className="mt-5 inline-flex border-b border-white/20 pb-1.5 font-data text-[0.56rem] uppercase tracking-[0.16em] text-[color:var(--vds-text-secondary)] transition-colors group-hover:border-[color:var(--vds-brand-secondary)] group-hover:text-[color:var(--vds-brand-secondary)]">
                    Explore vehicles
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
