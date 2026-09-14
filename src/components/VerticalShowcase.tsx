'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';

import { MarketplaceVehicleCard } from '@/components/MarketplaceVehicleCard';
import type { VehicleSummary } from '@/types/vehicle';

type VerticalShowcaseProps = {
  vehicles: VehicleSummary[];
  mode?: 'sale' | 'rental';
};

const AUTO_ADVANCE_MS = 6500;
const RESUME_DELAY_MS = 1800;

const COPY_COUNT = 3;
const MIDDLE_COPY = 1;

export function VerticalShowcase({
  vehicles,
  mode,
}: VerticalShowcaseProps) {
  const showcaseRef =
    useRef<HTMLDivElement | null>(null);

  const autoTimerRef =
    useRef<number | null>(null);

  const resumeTimerRef =
    useRef<number | null>(null);

  const animationTimerRef =
    useRef<number | null>(null);

  const initializedRef =
    useRef(false);

  const animatingRef =
    useRef(false);

  const currentPhysicalIndexRef =
    useRef(0);

  const canonicalSetTopRef =
    useRef(0);

  const sequenceHeightRef =
    useRef(0);

  const getLoopSets = useCallback(() => {
    const container = showcaseRef.current;

    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-showcase-loop-set]'
      )
    );
  }, []);

  const getSections = useCallback(() => {
    const container = showcaseRef.current;

    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        '.marketplace-vertical-showcase-item'
      )
    );
  }, []);

  /*
   * Measure the real middle copy.
   *
   * The middle copy is the canonical position.
   * When the browser reaches either outer copy,
   * we move it by exactly one sequence height.
   */
  const measureLoop = useCallback(() => {
    const sets = getLoopSets();

    if (sets.length !== COPY_COUNT) {
      return false;
    }

    const middleSet = sets[MIDDLE_COPY];

    if (!middleSet) {
      return false;
    }

    const rect =
      middleSet.getBoundingClientRect();

    canonicalSetTopRef.current =
      window.scrollY + rect.top;

    sequenceHeightRef.current =
      middleSet.offsetHeight;

    return (
      sequenceHeightRef.current > 0
    );
  }, [getLoopSets]);

  /*
   * Recenter the physical document without
   * changing what the customer sees.
   *
   * Example:
   *
   *   COPY 0: 1 2 3
   *   COPY 1: 1 2 3  <- customer lives here
   *   COPY 2: 1 2 3
   *
   * After scrolling down through COPY 2,
   * subtract one complete sequence height.
   *
   * The pixels on screen remain identical because
   * COPY 1 and COPY 2 contain the same vehicles.
   */
  const normalizePosition = useCallback(() => {
    if (
      !initializedRef.current ||
      animatingRef.current
    ) {
      return;
    }

    const sequenceHeight =
      sequenceHeightRef.current;

    if (!sequenceHeight) {
      return;
    }

    const canonicalTop =
      canonicalSetTopRef.current;

    const currentScroll =
      window.scrollY;

    const lowerBoundary =
      canonicalTop - sequenceHeight * 0.65;

    const upperBoundary =
      canonicalTop + sequenceHeight * 1.65;

    if (currentScroll < lowerBoundary) {
      window.scrollTo(
        0,
        currentScroll + sequenceHeight
      );

      return;
    }

    if (currentScroll > upperBoundary) {
      window.scrollTo(
        0,
        currentScroll - sequenceHeight
      );
    }
  }, []);

  /*
   * Determine which physical vehicle is closest
   * to the viewport center.
   */
  const updateComposition = useCallback(() => {
    const sections = getSections();

    if (!sections.length) {
      return;
    }

    const viewportHeight =
      window.innerHeight || 1;

    const viewportCenter =
      viewportHeight * 0.5;

    let closestIndex = 0;
    let closestDistance =
      Number.POSITIVE_INFINITY;

    sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top + rect.height * 0.5;

        const distance =
          Math.abs(
            center - viewportCenter
          );

        if (
          distance <
          closestDistance
        ) {
          closestDistance =
            distance;

          closestIndex =
            index;
        }
      }
    );

    currentPhysicalIndexRef.current =
      closestIndex;

    sections.forEach(
      (section, index) => {
        const rect =
          section.getBoundingClientRect();

        const center =
          rect.top + rect.height * 0.5;

        const distance =
          Math.abs(
            center - viewportCenter
          );

        const range =
          Math.max(
            viewportHeight * 0.82,
            1
          );

        const progress =
          Math.max(
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
      }
    );
  }, [getSections]);

  /*
   * Move exactly one physical vehicle forward.
   *
   * Because the DOM is:
   *
   *   1 2 3 | 1 2 3 | 1 2 3
   *
   * Vehicle 3 naturally has Vehicle 1 after it.
   *
   * There is no 3 -> top-of-page jump.
   */
  const advanceVehicle = useCallback(() => {
    const sections =
      getSections();

    if (
      sections.length < 2 ||
      animatingRef.current
    ) {
      return;
    }

    const current =
      currentPhysicalIndexRef.current;

    const next =
      current + 1;

    const target =
      sections[next];

    if (!target) {
      /*
       * This should only happen if the DOM is
       * unexpectedly incomplete. Recenter and retry.
       */
      normalizePosition();
      return;
    }

    animatingRef.current = true;

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    if (
      animationTimerRef.current !==
      null
    ) {
      window.clearTimeout(
        animationTimerRef.current
      );
    }

    animationTimerRef.current =
      window.setTimeout(() => {
        /*
         * The smooth movement is complete.
         *
         * If we crossed a copy boundary,
         * silently move back one sequence.
         */
        animatingRef.current = false;

        normalizePosition();

        updateComposition();
      }, 1100);
  }, [
    getSections,
    normalizePosition,
    updateComposition,
  ]);

  const stopAutoAdvance =
    useCallback(() => {
      if (
        autoTimerRef.current !== null
      ) {
        window.clearInterval(
          autoTimerRef.current
        );

        autoTimerRef.current = null;
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

  const startAutoAdvance =
    useCallback(() => {
      stopAutoAdvance();

      autoTimerRef.current =
        window.setInterval(
          advanceVehicle,
          AUTO_ADVANCE_MS
        );
    }, [
      advanceVehicle,
      stopAutoAdvance,
    ]);

  const resumeAutoAdvance =
    useCallback(() => {
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
   * Start the browser inside the middle copy.
   */
  useLayoutEffect(() => {
    if (
      initializedRef.current ||
      vehicles.length === 0
    ) {
      return;
    }

    const measured =
      measureLoop();

    if (!measured) {
      return;
    }

    const sets =
      getLoopSets();

    const middleSet =
      sets[MIDDLE_COPY];

    if (!middleSet) {
      return;
    }

    /*
     * Position at the beginning of the middle copy.
     */
    window.scrollTo(
      0,
      middleSet.offsetTop
    );

    /*
     * Measure again because scroll positioning
     * can affect viewport-relative measurements.
     */
    measureLoop();

    initializedRef.current = true;

    updateComposition();
  }, [
    getLoopSets,
    measureLoop,
    updateComposition,
    vehicles.length,
  ]);

  /*
   * Scroll handling.
   */
  useEffect(() => {
    if (vehicles.length === 0) {
      return;
    }

    let frame = 0;

    const onScroll = () => {
      if (frame) {
        return;
      }

      frame =
        window.requestAnimationFrame(
          () => {
            frame = 0;

            normalizePosition();
            updateComposition();
          }
        );
    };

    const onResize = () => {
      measureLoop();
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

      if (
        animationTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          animationTimerRef.current
        );

        animationTimerRef.current = null;
      }

      if (frame) {
        window.cancelAnimationFrame(
          frame
        );
      }
    };
  }, [
    measureLoop,
    normalizePosition,
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
            key={`showcase-loop-${copyIndex}`}
            className="marketplace-showcase-loop-set"
            data-showcase-loop-set
            data-loop-copy={copyIndex}
          >
            {vehicles.map(
              (vehicle, vehicleIndex) => (
                <section
                  key={`${copyIndex}-${vehicle.id}`}
                  className="marketplace-vertical-showcase-item marketplace-infinite-showcase-item"
                  aria-label={`Vehicle ${
                    vehicleIndex + 1
                  }`}
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
                        MIDDLE_COPY &&
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
