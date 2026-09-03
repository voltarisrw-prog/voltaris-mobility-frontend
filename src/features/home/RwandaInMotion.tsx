'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function RwandaInMotion() {
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

  const imageScale = 1.02 + progress * 0.06;
  const imageY = (progress - 0.5) * -20;
  const contentY = Math.max(0, 1 - progress * 1.7) * 34;
  const contentOpacity = Math.min(
    1,
    Math.max(0, (progress - 0.12) / 0.34),
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="rwanda-in-motion-title"
      className="relative isolate min-h-[78svh] overflow-hidden border-y border-hairline sm:min-h-[86svh] lg:min-h-[92svh]"
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
        className="absolute inset-0 bg-[#0C0906]/35"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0C0906]/80 via-[#0C0906]/15 to-[#0C0906]/95"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_55%_48%,transparent_8%,rgba(5,10,22,0.28)_68%,rgba(5,10,22,0.78)_100%)]"
        aria-hidden="true"
      />

      <div className="shell relative flex min-h-[78svh] flex-col justify-between py-8 sm:min-h-[86svh] sm:py-10 lg:min-h-[92svh] lg:py-12">
        <div
          className="max-w-5xl"
          style={{
            opacity: contentOpacity,
            transform: `translate3d(0, ${contentY}px, 0)`,
          }}
        >
          <h2
            id="rwanda-in-motion-title"
            className="max-w-5xl font-display text-[clamp(4rem,12vw,11rem)] font-medium uppercase leading-[0.76] tracking-[-0.06em] text-chrome"
          >
            Rwanda
            <br />
            in motion
          </h2>
        </div>

        <div
          className="flex items-end justify-between gap-8"
          style={{
            opacity: Math.min(
              1,
              Math.max(0, (progress - 0.28) / 0.32),
            ),
            transform: `translate3d(0, ${Math.max(0, 1 - progress * 1.5) * 24}px, 0)`,
          }}
        >
          <div className="max-w-xl">
            <p className="font-display text-[clamp(1.7rem,3.5vw,3.25rem)] leading-[0.95] tracking-[-0.025em] text-chrome">
              Vehicles for the roads you know
              <br className="hidden sm:block" />
              and the roads still ahead
            </p>

            <p className="mt-6 max-w-md font-data text-[0.62rem] uppercase leading-[1.6] tracking-[0.14em] text-chrome/65 sm:text-[0.68rem]">
              Voltaris connects people with vehicles that fit the way
              Rwanda moves — from everyday journeys to moments that matter.
            </p>
          </div>

          <Link
            href="/about"
            className="group hidden shrink-0 items-center gap-3 border-b border-chrome/35 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-chrome transition-colors hover:border-volt hover:text-volt focus-visible:border-volt focus-visible:text-volt sm:flex"
          >
            Discover Voltaris
            <ArrowUpRight
              className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <Link
          href="/about"
          className="group flex w-fit items-center gap-3 border-b border-chrome/35 pb-2 font-data text-[0.62rem] uppercase tracking-[0.16em] text-chrome transition-colors hover:border-volt hover:text-volt focus-visible:border-volt focus-visible:text-volt sm:hidden"
        >
          Discover Voltaris
          <ArrowUpRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
