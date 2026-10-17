'use client';

import { useEffect, useRef } from 'react';
import { readPhoto } from '@/features/car/photo';

/**
 * Renders nothing. It reads the photo's own backdrop colour and hands it to the card's
 * media area as --photo-bg, so the space around a fitted photo is the photo's own
 * backdrop rather than a grey halo.
 */
export function FeedBackdrop({ src }: { src: string }) {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const media = marker.current?.closest<HTMLElement>('.marketplace-vehicle-card-media');
    if (!media) return;
    let gone = false;
    readPhoto(src)
      .then((info) => {
        if (!gone && info?.bg) media.style.setProperty('--photo-bg', info.bg);
      })
      .catch(() => undefined);
    return () => {
      gone = true;
    };
  }, [src]);

  return <span ref={marker} hidden aria-hidden="true" />;
}
