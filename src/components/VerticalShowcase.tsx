'use client';

import { useEffect, useRef, useState } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_SPEED = 0.28;
const MAX_DELTA_MS = 32;
const RESUME_DELAY_MS = 1400;

export function VerticalShowcase({
  vehicles,
  mode = 'sale',
}: VerticalShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const animationRef = useRef<number | null>(null);
  const interactionTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const userInteractingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const autoScrollingUntilRef = useRef(0);

  const count = vehicles.length;

  /*
   * ORIGINAL 3D SHOWCASE
   *
   * Every card remains part of the normal document flow.
   * Its 3D position is calculated from its real position in the
   * viewport. This keeps manual scrolling completely natural.
   */
  useEffect(() => {
    if (!count) return;

    let frame: number | null = null;

    const updateShowcase = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[data-marketplace-showcase-item]',
        ),
      );

      if (!sections.length) return;

      const viewportCenter =
        window.innerHeight * 0.5;

      let closestIndex = 0;
      let closestDistance =
        Number.POSITIVE_INFINITY;

      sections.forEach((section, index) => {
        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top + rect.height * 0.5;

        const distance =
          Math.abs(center - viewportCenter);

        const sectionHeight =
          Math.max(rect.height, 1);

        const rawProgress =
          (viewportCenter - center) /
          sectionHeight;

        const progress = Math.max(
          -1.5,
          Math.min(1.5, rawProgress),
        );

        const absProgress = Math.min(
          Math.abs(progress),
          1,
        );

        const direction =
          progress > 0 ? 1 : -1;

        /*
         * ORIGINAL 3D TRANSFORM VALUES
         */
        const rotateY =
          progress * -25;

        const rotateX =
          absProgress * 8 * direction;

        const rotateZ =
          progress * -2.5;

        const translateX =
          progress * -4;

        const translateY =
          progress * 18;

        const translateZ =
          -absProgress * 110;

        const scale =
          1 - absProgress * 0.095;

        const opacity =
          1 -
          Math.max(0, absProgress - 0.45) *
            0.55;

        section.style.setProperty(
          '--showcase-rotate-y',
          `${rotateY}deg`,
        );

        section.style.setProperty(
          '--showcase-rotate-x',
          `${rotateX}deg`,
        );

        section.style.setProperty(
          '--showcase-rotate-z',
          `${rotateZ}deg`,
        );

        section.style.setProperty(
          '--showcase-translate-x',
          `${translateX}%`,
        );

        section.style.setProperty(
          '--showcase-translate-y',
          `${translateY}px`,
        );

        section.style.setProperty(
          '--showcase-translate-z',
          `${translateZ}px`,
        );

        section.style.setProperty(
          '--showcase-scale',
          `${scale}`,
        );

        section.style.setProperty(
          '--showcase-opacity',
          `${opacity}`,
        );

        if (
          distance < closestDistance
        ) {
          closestDistance = distance;
          closestIndex =
            index % count;
        }
      });

      setActiveIndex(closestIndex);
    };

    const requestUpdate = () => {
      if (frame !== null) return;

      frame =
        window.requestAnimationFrame(() => {
          updateShowcase();
          frame = null;
        });
    };

    updateShowcase();

    window.addEventListener(
      'scroll',
      requestUpdate,
      { passive: true },
    );

    window.addEventListener(
      'resize',
      requestUpdate,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        'scroll',
        requestUpdate,
      );

      window.removeEventListener(
        'resize',
        requestUpdate,
      );

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [count]);

  /*
   * NATIVE PAGE AUTOPLAY
   *
   * Autoplay uses the browser's actual document scroll position.
   * It never transforms the showcase track itself.
   *
   * Therefore:
   *   - manual scroll = completely natural
   *   - 3D follows real viewport positions
   *   - autoplay = gentle background movement
   */
  useEffect(() => {
    if (count < 2 || !autoPlay) return;

    let running = true;

    const animate = (now: number) => {
      if (!running) return;

      const previous =
        lastTimeRef.current ?? now;

      const elapsed = Math.min(
        now - previous,
        MAX_DELTA_MS,
      );

      lastTimeRef.current = now;

      if (!userInteractingRef.current) {
        const showcase =
          document.querySelector<HTMLElement>(
            '.marketplace-3d-showcase',
          );

        if (showcase) {
          const rect =
            showcase.getBoundingClientRect();

          /*
           * Only autoplay while the showcase is actually
           * participating in the viewport.
           */
          const visible =
            rect.top < window.innerHeight &&
            rect.bottom > 0;

          if (visible) {
            const maxScroll =
              document.documentElement
                .scrollHeight -
              window.innerHeight;

            if (
              window.scrollY <
              maxScroll - 1
            ) {
              const movement =
                AUTO_SPEED *
                (elapsed / 16.67);

              /*
               * Native page movement only.
               * No carousel track transform.
               */
              autoScrollingUntilRef.current =
                performance.now() + 100;

              window.scrollBy(
                0,
                movement,
              );
            }
          }
        }
      }

      animationRef.current =
        window.requestAnimationFrame(
          animate,
        );
    };

    animationRef.current =
      window.requestAnimationFrame(
        animate,
      );

    return () => {
      running = false;

      if (
        animationRef.current !== null
      ) {
        window.cancelAnimationFrame(
          animationRef.current,
        );

        animationRef.current = null;
      }
    };
  }, [count, autoPlay]);

  /*
   * USER CONTROL
   *
   * Any native scroll immediately takes control away
   * from autoplay. Autoplay only resumes after the user
   * has genuinely stopped interacting.
   */
  useEffect(() => {
    if (count < 2) return;

    const pauseAutoplay =
      () => {
        /*
         * Ignore scroll events generated by our own
         * window.scrollBy() calls. Otherwise autoplay
         * immediately interprets its own movement as
         * user interaction and pauses itself.
         */
        if (
          performance.now() <
          autoScrollingUntilRef.current
        ) {
          return;
        }

        userInteractingRef.current =
          true;

        if (
          interactionTimerRef.current
        ) {
          clearTimeout(
            interactionTimerRef.current,
          );
        }

        interactionTimerRef.current =
          setTimeout(() => {
            userInteractingRef.current =
              false;

            lastTimeRef.current =
              performance.now();
          }, RESUME_DELAY_MS);
      };

    const startTouch =
      () => {
        userInteractingRef.current =
          true;

        if (
          interactionTimerRef.current
        ) {
          clearTimeout(
            interactionTimerRef.current,
          );
        }
      };

    const endTouch =
      () => {
        if (
          interactionTimerRef.current
        ) {
          clearTimeout(
            interactionTimerRef.current,
          );
        }

        interactionTimerRef.current =
          setTimeout(() => {
            userInteractingRef.current =
              false;

            lastTimeRef.current =
              performance.now();
          }, RESUME_DELAY_MS);
      };

    window.addEventListener(
      'scroll',
      pauseAutoplay,
      { passive: true },
    );

    window.addEventListener(
      'wheel',
      pauseAutoplay,
      { passive: true },
    );

    window.addEventListener(
      'touchstart',
      startTouch,
      { passive: true },
    );

    window.addEventListener(
      'touchend',
      endTouch,
      { passive: true },
    );

    window.addEventListener(
      'touchcancel',
      endTouch,
      { passive: true },
    );

    return () => {
      window.removeEventListener(
        'scroll',
        pauseAutoplay,
      );

      window.removeEventListener(
        'wheel',
        pauseAutoplay,
      );

      window.removeEventListener(
        'touchstart',
        startTouch,
      );

      window.removeEventListener(
        'touchend',
        endTouch,
      );

      window.removeEventListener(
        'touchcancel',
        endTouch,
      );

      if (
        interactionTimerRef.current
      ) {
        clearTimeout(
          interactionTimerRef.current,
        );
      }
    };
  }, [count]);

  if (!vehicles.length) return null;

  return (
    <>
      <button
        type="button"
        className={`marketplace-native-showcase-autoplay ${
          autoPlay
            ? 'marketplace-native-showcase-autoplay-on'
            : 'marketplace-native-showcase-autoplay-off'
        }`}
        aria-pressed={autoPlay}
        aria-label={`Autoplay ${autoPlay ? 'on' : 'off'}`}
        onClick={() => {
          const next = !autoPlay;
          setAutoPlay(next);

          if (next) {
            userInteractingRef.current = false;
            lastTimeRef.current = performance.now();
          }
        }}
      >
        <span className="marketplace-native-showcase-autoplay-label">
          {autoPlay ? 'ON' : 'OFF'}
        </span>
        <span
          className="marketplace-native-showcase-autoplay-knob"
          aria-hidden="true"
        />
      </button>

      <section
        className="marketplace-native-showcase marketplace-3d-showcase"
        aria-label="Vehicle showroom"
      >
      <div className="marketplace-native-showcase-header">
        <div>
          <p className="marketplace-native-showcase-kicker">
            {mode === 'rental'
              ? 'Available for rent'
              : 'Available vehicles'}
          </p>

          <p className="marketplace-native-showcase-count">
            {String(activeIndex + 1).padStart(
              2,
              '0',
            )}{' '}
            /{' '}
            {String(count).padStart(
              2,
              '0',
            )}
          </p>
        </div>

      </div>

      <div className="marketplace-native-showcase-list marketplace-3d-showcase-list">
        {vehicles.map(
          (vehicle, index) => (
            <article
              key={`${vehicle.id}-${index}`}
              data-marketplace-showcase-item
              className={`marketplace-native-showcase-item marketplace-3d-showcase-item ${
                index === activeIndex
                  ? 'marketplace-native-showcase-item-active'
                  : ''
              }`}
            >
              <div className="marketplace-3d-showcase-stage">
                <MarketplaceVehicleCard
                  vehicle={vehicle}
                  featured
                  mode={mode}
                />
              </div>
            </article>
          ),
        )}
      </div>
      </section>
    </>
  );
}

export default VerticalShowcase;
