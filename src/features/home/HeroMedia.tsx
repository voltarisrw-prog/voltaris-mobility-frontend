'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

/**
 * The hero window onto the showroom.
 *
 * The site-wide environment holds the same plate heavily dimmed, because it sits
 * under every paragraph on every page. Here it is shown at real clarity — this
 * is the one screen where the image is the point rather than the texture. Same
 * file, so it is fetched once and this costs nothing extra.
 *
 * The still is the LCP element and always loads. The orbit video, when one is
 * configured, layers on top *after* first paint and cross-fades in. That
 * ordering is the whole point: a `<video>` as the hero's primary media is the
 * classic way to lose two seconds of LCP, and much of this audience is on
 * Rwandan mobile.
 *
 * The video is skipped entirely — not merely paused — when:
 *
 *   - no `NEXT_PUBLIC_HERO_VIDEO_URL` is set (there is no placeholder video)
 *   - the viewport is under 768px
 *   - `prefers-reduced-motion` is set; an orbiting camera is a vestibular trigger
 *   - the browser reports Save-Data, or a 2g/3g effective connection
 *
 * In each case the still remains and the hero still looks like the hero. It also
 * pauses once scrolled out of view, so it is not decoding frames behind the rest
 * of the page.
 */

const VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? '';

const HERO_IMAGES = [
  '/hero/gallery/car1.jpeg',
  '/hero/gallery/car2.jpeg',
  '/hero/gallery/car3.jpeg',
  '/hero/gallery/car4.jpeg',
  '/hero/gallery/car5.jpeg',
  '/hero/gallery/car6.jpeg',
  '/hero/gallery/car7.jpeg',
  '/hero/gallery/car8.jpeg',
];

interface NetworkInformation {
  saveData?: boolean;
  effectiveType?: string;
}

function shouldLoadVideo(): boolean {
  if (!VIDEO_URL) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  if (window.matchMedia('(max-width: 767px)').matches) return false;

  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g|3g/.test(connection.effectiveType)) return false;

  return true;
}

export function HeroMedia() {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    // Deferred to idle so the decision never competes with the poster's decode.
    const schedule = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400));
    schedule(() => setEnabled(shouldLoadVideo()));
  }, []);

  useEffect(() => {
    // Editorial image rotation. Keep the first image visible long enough to
    // establish the hero before moving through the showroom.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const node = frame.current;
    if (!enabled || !node) return;

    // Stop decoding once the hero is off screen. A looping video behind three
    // thousand pixels of content nobody can see is pure battery drain.
    const observer = new IntersectionObserver(
      ([entry]) => {
        const element = video.current;
        if (!element) return;
        if (entry?.isIntersecting) void element.play().catch(() => undefined);
        else element.pause();
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled]);

  return (
    <div ref={frame} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {HERO_IMAGES.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover object-center transition-opacity duration-[1400ms] ease-in-out ${
            index === activeImage ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {enabled && (
        <video
          ref={video}
          // Poster matches the still exactly, so a stalled download is invisible.
          poster="/hero/showroom-1536.webp"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-out ${
            playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* AV1 for browsers that have it; H.264 as the floor. */}
          <source src={`${VIDEO_URL}.webm`} type="video/webm; codecs=av01.0.05M.08" />
          <source src={`${VIDEO_URL}.mp4`} type="video/mp4" />
        </video>
      )}

      {/* Cool the plate toward the brand blue, matching the site-wide grade so
          the hero and the rest of the page read as one room. */}
      <div className="absolute inset-0 bg-gradient-to-br from-volt-deep/30 via-transparent to-surface/40 mix-blend-color" />

      {/*
        Text protection. The copy sits left, so the scrim is weighted left — a
        flat overlay would either wash out the car or leave the headline sitting
        on white bodywork. Graded to solid at the base so the section below joins
        without a seam.
      */}
      {/* Editorial grade: keep the vehicle visible instead of burying it
          under a conventional landing-page scrim. */}
      <div className="absolute inset-0 bg-gradient-to-br from-volt-deep/35 via-transparent to-surface/20" />

      {/* Local text protection. The image stays dominant everywhere else. */}
      <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-surface/85 via-surface/35 to-transparent sm:w-[72%]" />

      {/* Soft transition into the next section without flattening the image. */}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-surface/90" />
    </div>
  );
}
