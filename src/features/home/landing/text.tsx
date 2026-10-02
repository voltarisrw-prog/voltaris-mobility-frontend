import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import s from './home.module.css';

type Mode = 'mask' | 'focus';

/**
 * Splits text into one span per word, keeping any wrapping elements (an accent
 * <em>, a line <span>) around their words. Each word carries its position as
 * `--k`, which staggers its entrance.
 *
 *   mask  — headings: each word rises out of its own mask
 *   focus — paragraphs: each word fades and sharpens into place
 */
function splitWords(node: ReactNode, mode: Mode, counter: { k: number }): ReactNode {
  if (typeof node === 'string') {
    return node.split(/(\s+)/).map((part, i) => {
      if (!part) return null;
      if (/^\s+$/.test(part)) return ' ';
      const k = counter.k++;
      const style = { '--k': k } as React.CSSProperties;
      return mode === 'mask' ? (
        <span key={`w${k}-${i}`} className={s.wd}>
          <span className={s.wi} style={style}>
            {part}
          </span>
        </span>
      ) : (
        <span key={`w${k}-${i}`} className={s.fw} style={style}>
          {part}
        </span>
      );
    });
  }
  if (typeof node === 'number') return splitWords(String(node), mode, counter);
  if (Array.isArray(node)) {
    return Children.map(node, (child) => splitWords(child, mode, counter));
  }
  if (isValidElement(node)) {
    const el = node as ReactElement<{ children?: ReactNode }>;
    if (el.type === 'br') return el;
    return cloneElement(el, undefined, splitWords(el.props.children, mode, counter));
  }
  return node;
}

export function words(children: ReactNode, mode: Mode = 'mask'): ReactNode {
  return splitWords(children, mode, { k: 0 });
}

/** A label that rolls up to a copy of itself on hover. */
export function Roll({ children }: { children: string }) {
  return (
    <span className={s.roll}>
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

/** The design's arrow. */
export function Arrow({ size = 14, flip = false }: { size?: number; flip?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={flip ? { transform: 'rotate(180deg)' } : undefined}
    >
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The car outline that stands in a photo frame until the photo arrives. */
export function CarSketch() {
  return (
    <svg viewBox="0 0 400 140" aria-hidden="true">
      <ellipse cx="200" cy="124" rx="165" ry="9" fill="#000" opacity=".3" />
      <path
        d="M26 98c3-22 16-34 40-40l52-26c20-10 86-10 120 0l54 26c26 4 54 14 60 40v10H26z"
        fill="#c9d3ea"
        stroke="rgba(127,212,255,.5)"
        strokeWidth="1.5"
      />
      <path d="M130 40c26-8 84-8 128 0l36 22H112z" fill="#0a0f22" opacity=".85" />
      <circle cx="104" cy="108" r="22" fill="#05070f" />
      <circle cx="104" cy="108" r="10" fill="#7b86a6" />
      <circle cx="300" cy="108" r="22" fill="#05070f" />
      <circle cx="300" cy="108" r="10" fill="#7b86a6" />
    </svg>
  );
}
