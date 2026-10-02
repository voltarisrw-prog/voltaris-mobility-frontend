'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CarSketch } from './text';
import s from './home.module.css';

/**
 * A photo frame: a car sketch and a shimmer while the photo is on its way, then
 * the photo blurs up into place. If the photo fails, the sketch stays.
 */
export function Photo({
  src,
  sizes,
  className,
  style,
  alt = '',
}: {
  src: string | null;
  sizes: string;
  className?: string;
  style?: React.CSSProperties;
  alt?: string;
}) {
  const [state, setState] = useState<'wait' | 'ok' | 'fail'>(src ? 'wait' : 'fail');
  return (
    <div
      className={`${s.ph}${className ? ` ${className}` : ''}`}
      style={style}
      data-ld={state === 'wait' ? undefined : ''}
    >
      <CarSketch />
      {src && state !== 'fail' && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={state === 'ok' ? s.ld : undefined}
          onLoad={() => setState('ok')}
          onError={() => setState('fail')}
        />
      )}
    </div>
  );
}
