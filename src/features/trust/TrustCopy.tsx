'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function TrustCopy({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return (
    <>
      <button
        type="button"
        className={`tr-cp${done ? ' is-ok' : ''}`}
        aria-label={`Copy ${text}`}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            /* the confirmation still shows when the clipboard is blocked */
          }
          setDone(true);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => setDone(false), 1800);
        }}
      >
        {done ? <Check size={20} /> : <Copy size={20} />}
      </button>
      <div className={`tr-toast${done ? ' is-on' : ''}`} role="status">
        {done ? `Copied ${text}` : ''}
      </div>
    </>
  );
}
