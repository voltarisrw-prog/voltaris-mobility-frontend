'use client';

import { useEffect, useState } from 'react';

type WindowDimensions = {
  width: number;
  height: number;
  devicePixelRatio: number;
};

const getDimensions = (): WindowDimensions => {
  if (typeof window === 'undefined') {
    return {
      width: 0,
      height: 0,
      devicePixelRatio: 1,
    };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};

export function useWindowDimensions(): WindowDimensions {
  const [dimensions, setDimensions] =
    useState<WindowDimensions>(getDimensions);

  useEffect(() => {
    let frame = 0;

    const updateDimensions = () => {
      cancelAnimationFrame(frame);

      frame = requestAnimationFrame(() => {
        setDimensions(getDimensions());
      });
    };

    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    const mediaQuery = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );

    const handlePixelRatioChange = () => {
      updateDimensions();
      mediaQuery.removeEventListener('change', handlePixelRatioChange);
    };

    mediaQuery.addEventListener('change', handlePixelRatioChange);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
      mediaQuery.removeEventListener('change', handlePixelRatioChange);
    };
  }, []);

  return dimensions;
}
