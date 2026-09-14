'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_ADVANCE_MS = 6500;
const RESUME_DELAY_MS = 1800;

/*
 * Three copies create a physical runway:
 *
 *   COPY 0: 1 2 3
 *   COPY 1: 1 2 3   <- canonical viewing zone
 *   COPY 2: 1 2 3
 *
 * When the user reaches an outer copy, the page is silently
 * re-centered by exactly one sequence height. Because the
 * content is identical, the visual position does not jump.
 */
const COPY_COUNT = 3;
const CANONICAL_COPY = 1;

export function VerticalShowcase({
  vehicles,
  mode,
}: VerticalShowcaseProps) {
  const showcaseRef = useRef<HTMLDivElement | null>(null);

  const timerRef = useRef<number | null>(null);
  const resumeTimerRef = useRef<number | null>(null);

  const initializedRef = useRef(false);
  const normalizingRef = useRef(false);
  const animatingRef = useRef(false);

  const currentSectionRef = useRef(0);

  const getSets = useCallback(() => {
    const container = showcaseRef.current;

    if (!container) return [];

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        '.marketplace-showcase-loop-set'
      )
    );
  }, []);

  const getSections = useCallback(() => {
    const container = showcaseRef.current;

    if (!container) return [];

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        '.marketplace-vertical-showcase-item'
      )
    );
  }, []);

  const getSetHeight = useCallback(() => {
    const sets = getSets();

    return sets[0]?.getBoundingClientRect().height ?? 0;
  }, [getSets]);

  /*
   * Keep the browser inside the middle copy.
   *
   * This is the key to making:
   *
   *   1 -> 2 -> 3 -> 1
   *
   * physically seamless.
   */
  const normalizeLoopPosition = useCallback(() => {
    if (
      normalizingRef.current ||
      !initializedRef.current
    ) {
      return;
    }

    const sets = getSets();

    if (sets.length !== COPY_COUNT) {
      return;
    }

    const setHeight = getSetHeight();

    if (!setHeight) return;

    const canonicalTop =
      sets[CANONICAL_COPY]?.getBoundingClientRect().top;

    if (canonicalTop === undefined) return;

    const viewportTop = window.scrollY;

    /*
     * We compare against the canonical copy's document position.
     *
     * If the user moves one full copy above or below it,
     * shift the browser by exactly one copy height.
     */
    const middleStart =
      viewportTop +
      canonicalTop;

    const distanceFromMiddle =
      viewportTop - middleStart;

    if (
      distanceFromMiddle <
      -setHeight * 0.65
    ) {
      normalizingRef.current = true;

      window.scrollTo(
        0,
        window.scrollY + setHeight
      );

      normalizingRef.current = false;
    } else if (
      distanceFromMiddle >
      setHeight * 1.65
    ) {
      normalizingRef.current = true;

      window.scrollTo(
        0,
        window.scrollY - setHeight
      );

      normalizingRef.current = false;
    }
  }, [getSetHeight, getSets]);

  /*
   * Apply cinematic focus based on distance from viewport center.
   */
  const updateComposition = useCallback(() => {
    const sections = getSections();

    if (!sections.length) return;

    const viewportHeight =
      window.innerHeight || 1;

    const viewportCenter =
      viewportHeight * 0.5;

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

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    currentSectionRef.current =
      closestIndex;

    sections.forEach((section, index) => {
      const rect =
        section.getBoundingClientRect();

      const center =
        rect.top + rect.height * 0.5;

      const distance =
        Math.abs(center - viewportCenter);

      const range =
        Math.max(viewportHeight * 0.82, 1);

      const progress = Math.max(
        0,
        Math.min(
          1,
          1 - distance / range
        )
      );

      const direction =
        center < viewportCenter
          ? -1
          : 1;

      section.style.setProperty(
        '--vehicle-progress',
        progress.toFixed(4)
      );

      section.style.setProperty(
        '--vehicle-direction',
        String(direction)
      );

      section.style.setProperty(
        '--vehicle-distance',
        `${Math.min(
          distance,
          viewportHeight
        )}px`
      );

      section.dataset.active =
        index === closestIndex
          ? 'true'
          : 'false';
    });
  }, [getSections]);

  const goToNextVehicle = useCallback(() => {
    const sections = getSections();

    if (
      sections.length < 2 ||
      animatingRef.current
    ) {
      return;
    }

    const current =
      currentSectionRef.current;

    const next =
      current + 1;

    const target =
      sections[next];

    if (!target) return;

    animatingRef.current = true;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    /*
     * Allow the smooth scroll to finish before
     * normalization is considered.
     */
    window.setTimeout(() => {
      animatingRef.current = false;
      normalizeLoopPosition();
      updateComposition();
    }, 1100);
  }, [
    getSections,
    normalizeLoopPosition,
    updateComposition,
  ]);

  const stopAutoAdvance = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(
        timerRef.current
      );

      timerRef.current = null;
    }

    if (
      resumeTimerRef.current !== null
    ) {
      window.clearTimeout(
        resumeTimerRef.current
      );

      resumeTimerRef.current = null;
    }
  }, []);

  const startAutoAdvance = useCallback(() => {
    stopAutoAdvance();

    timerRef.current =
      window.setInterval(
        goToNextVehicle,
        AUTO_ADVANCE_MS
      );
  }, [
    goToNextVehicle,
    stopAutoAdvance,
  ]);

  const resumeAutoAdvance = useCallback(() => {
    stopAutoAdvance();

    resumeTimerRef.current =
      window.setTimeout(() => {
        startAutoAdvance();
      }, RESUME_DELAY_MS);
  }, [
    startAutoAdvance,
    stopAutoAdvance,
  ]);

  /*
   * Initial positioning:
   *
   * Start in the middle copy so there is room
   * to travel in either direction.
   */
  useLayoutEffect(() => {
    if (
      initializedRef.current ||
      vehicles.length < 1
    ) {
      return;
    }

    const sets = getSets();

    if (sets.length !== COPY_COUNT) {
      return;
    }

    const canonicalSet =
      sets[CANONICAL_COPY];

    if (!canonicalSet) return;

    const targetTop =
      canonicalSet.offsetTop;

    /*
     * Start at the first vehicle of the
     * canonical middle sequence.
     */
    window.scrollTo(0, targetTop);

    initializedRef.current = true;

    updateComposition();
  }, [
    getSets,
    updateComposition,
    vehicles.length,
  ]);

  useEffect(() => {
    if (!vehicles.length) return;

    let frame = 0;

    const onScroll = () => {
      if (!frame) {
        frame =
          window.requestAnimationFrame(
            () => {
              frame = 0;

              normalizeLoopPosition();
              updateComposition();
            }
          );
      }
    };

    const onResize = () => {
      normalizeLoopPosition();
      updateComposition();
    };

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      onResize
    );

    const container =
      showcaseRef.current;

    if (container) {
      container.addEventListener(
        'mouseenter',
        stopAutoAdvance
      );

      container.addEventListener(
        'mouseleave',
        resumeAutoAdvance
      );

      container.addEventListener(
        'touchstart',
        stopAutoAdvance,
        { passive: true }
      );

      container.addEventListener(
        'touchend',
        resumeAutoAdvance,
        { passive: true }
      );
    }

    startAutoAdvance();

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );

      window.removeEventListener(
        'resize',
        onResize
      );

      if (container) {
        container.removeEventListener(
          'mouseenter',
          stopAutoAdvance
        );

        container.removeEventListener(
          'mouseleave',
          resumeAutoAdvance
        );

        container.removeEventListener(
          'touchstart',
          stopAutoAdvance
        );

        container.removeEventListener(
          'touchend',
          resumeAutoAdvance
        );
      }

      stopAutoAdvance();

      if (frame) {
        window.cancelAnimationFrame(
          frame
        );
      }
    };
  }, [
    normalizeLoopPosition,
    resumeAutoAdvance,
    startAutoAdvance,
    stopAutoAdvance,
    updateComposition,
    vehicles.length,
  ]);

  if (!vehicles.length) {
    return null;
  }

  return (
    <div
      ref={showcaseRef}
      className="marketplace-vertical-showcase marketplace-infinite-showcase"
    >
      {Array.from(
        { length: COPY_COUNT },
        (_, copyIndex) => (
          <div
            key={`showcase-copy-${copyIndex}`}
            className="marketplace-showcase-loop-set"
            data-loop-copy={copyIndex}
          >
            {vehicles.map(
              (vehicle, vehicleIndex) => (
                <section
                  key={`${copyIndex}-${vehicle.id}`}
                  className="marketplace-vertical-showcase-item marketplace-infinite-showcase-item"
                  aria-label={`Vehicle ${vehicleIndex + 1}`}
                  data-vehicle-index={
                    vehicleIndex
                  }
                  data-loop-copy={
                    copyIndex
                  }
                >
                  <MarketplaceVehicleCard
                    vehicle={vehicle}
                    priority={
                      copyIndex ===
                        CANONICAL_COPY &&
                      vehicleIndex === 0
                    }
                    featured={true}
                    mode={mode}
                  />
                </section>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}
