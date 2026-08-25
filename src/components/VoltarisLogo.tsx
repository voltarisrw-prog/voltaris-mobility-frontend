import { useId } from 'react';

/**
 * The Voltaris mark, rebuilt as vector.
 *
 * The supplied artwork is a raster JPEG on a baked-in dark field, which cannot sit
 * on a transparent header, cannot be recoloured, and cannot stay sharp at 24px or at
 * 400px. This is the same geometry as vector: the chrome V, the road receding between
 * its arms, the lane dashes, and the light at the vanishing point. The raster files
 * are kept in `public/brand/` for Open Graph cards and app icons, where a bitmap is
 * what is actually wanted.
 */
export function VoltarisMark({ className, title }: { className?: string; title?: string }) {
  // ids must be unique per instance or a second mark on the page reuses the first's gradients
  const uid = useId().replace(/:/g, '');
  const chrome = `chrome-${uid}`;
  const road = `road-${uid}`;
  const glow = `glow-${uid}`;

  return (
    <svg
      viewBox="0 0 120 104"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={chrome} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2F4F6" />
          <stop offset="34%" stopColor="#A8AEB8" />
          <stop offset="52%" stopColor="#E8EAED" />
          <stop offset="72%" stopColor="#6C727C" />
          <stop offset="100%" stopColor="#C4CAD2" />
        </linearGradient>
        <linearGradient id={road} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9EE4FF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#5CC8FF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#5CC8FF" stopOpacity="0.08" />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0%" stopColor="#DFF6FF" />
          <stop offset="45%" stopColor="#5CC8FF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#5CC8FF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* The road, receding from the base of the V to the vanishing point. */}
      <path d="M60 22 L82 96 L38 96 Z" fill={`url(#${road})`} />

      {/* Lane dashes, shortening with distance so the perspective reads. */}
      <g fill="#E8EAED">
        <rect x="58.7" y="86" width="2.6" height="9" rx="1" />
        <rect x="59.1" y="70" width="1.8" height="7" rx="0.9" opacity="0.85" />
        <rect x="59.4" y="56" width="1.2" height="5.5" rx="0.6" opacity="0.7" />
        <rect x="59.6" y="45" width="0.8" height="4" rx="0.4" opacity="0.55" />
        <rect x="59.75" y="37" width="0.5" height="2.6" rx="0.25" opacity="0.4" />
      </g>

      {/* The light at the vanishing point. */}
      <circle cx="60" cy="24" r="13" fill={`url(#${glow})`} />
      <circle cx="60" cy="24" r="2.4" fill="#F4FCFF" />

      {/* The chrome V — two tapered arms meeting at the base. */}
      <path
        d="M8 4 L20 2 L60 92 L52 100 Z"
        fill={`url(#${chrome})`}
      />
      <path
        d="M112 4 L100 2 L60 92 L68 100 Z"
        fill={`url(#${chrome})`}
      />
    </svg>
  );
}

/** Mark plus wordmark, for the header and footer. */
export function VoltarisLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <VoltarisMark className={className} title="Voltaris Mobility" />
      <span className="leading-none">
        <span className="block font-display text-[1.05rem] font-bold tracking-[0.14em] text-chrome">
          VOLTARIS
        </span>
        <span className="mt-0.5 block font-data text-[0.5rem] tracking-[0.42em] text-volt">
          MOBILITY
        </span>
      </span>
    </span>
  );
}
