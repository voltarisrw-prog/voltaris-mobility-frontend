'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export function RoadTransition() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

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
      const nextProgress = Math.min(
        1,
        Math.max(0, travelled / total),
      );

      setProgress(nextProgress);
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

  const imageScale = 1.04 + progress * 0.07;
  const imageY = (progress - 0.5) * -18;
  const contentY = Math.max(0, 1 - progress * 1.8) * 28;
  const contentOpacity = Math.min(
    1,
    Math.max(0, (progress - 0.18) / 0.32),
  );

  return (
    <section
      ref={sectionRef}
      aria-label="The road"
      className="relative isolate h-[78svh] min-h-[34rem] overflow-hidden border-y border-[color:var(--vds-border)] vds-section sm:h-[86svh] lg:h-[92svh]"
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate3d(0, ${imageY}px, 0) scale(${imageScale})`,
        }}
      >
        <Image
          src="/demo/lifestyle/driving-pov-palms.jpg"
          alt=""
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div
        className="absolute inset-0 bg-[#0C0906]/35"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0C0906]/75 via-[#0C0906]/20 to-[#0C0906]/90"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_65%_70%_at_50%_48%,transparent_10%,rgba(5,10,22,0.35)_72%,rgba(5,10,22,0.72)_100%)]"
        aria-hidden="true"
      />

      <div className="shell relative flex h-full flex-col justify-between py-8 sm:py-10 lg:py-12">
        <div
          className="max-w-5xl pb-8 transition-opacity duration-300 sm:pb-12 lg:pb-16"
          style={{
            opacity: contentOpacity,
            transform: `translate3d(0, ${contentY}px, 0)`,
          }}
        >
          <p className="mb-5 max-w-xs font-data text-[0.62rem] uppercase leading-[1.5] tracking-[0.18em] text-[color:var(--vds-text-secondary)] sm:mb-7 sm:text-[0.68rem]">
            Beyond the showroom
          </p>

          <h2 className="max-w-4xl font-display text-[clamp(3.5rem,9vw,8.5rem)] font-medium uppercase leading-[0.84] tracking-[-0.045em] text-[color:var(--vds-text)]">
            Not just
            <br />
            a car
          </h2>

          <div className="mt-7 flex items-end justify-between gap-8 sm:mt-9 lg:mt-10">
            <p className="max-w-md font-display text-[clamp(1.7rem,3.5vw,3.25rem)] leading-[0.95] tracking-[-0.025em] text-[color:var(--vds-text)]">
              A way to move
            </p>

            <span className="hidden font-data text-[0.58rem] uppercase tracking-[0.18em] text-[color:var(--vds-text-muted)] sm:block">
              Keep moving
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
