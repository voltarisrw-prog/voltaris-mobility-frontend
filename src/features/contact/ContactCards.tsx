'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Check, Copy, Mail, MapPin, Phone, ShieldCheck, type LucideIcon } from 'lucide-react';

interface Props {
  email: string;
  phone: string;
  address: string;
  privacyEmail: string;
}

export function ContactCards({ email, phone, address, privacyEmail }: Props) {
  const [copied, setCopied] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Kigali' });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be blocked; the toast still tells the person what happened */
    }
    setCopied(key);
    setToast(`Copied ${text}`);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(null);
      setToast(null);
    }, 1900);
  }

  const spot = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--gx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--gy', `${e.clientY - r.top}px`);
  };

  const rows: { key: string; label: string; Icon: LucideIcon; value: string; href?: string; copy?: string; extra?: string }[] = [
    { key: 'email', label: 'Email', Icon: Mail, value: email, href: `mailto:${email}`, copy: email },
    { key: 'phone', label: 'Phone', Icon: Phone, value: phone, href: `tel:${phone.replace(/\s/g, '')}`, copy: phone },
    { key: 'where', label: 'Where we are', Icon: MapPin, value: address, ...(address.includes('Kigali') && time ? { extra: time } : {}) },
    { key: 'privacy', label: 'Data and privacy', Icon: ShieldCheck, value: privacyEmail, href: `mailto:${privacyEmail}`, copy: privacyEmail },
  ];

  return (
    <>
      <dl className="ct-cards">
        {rows.map(({ key, label, Icon, value, href, copy: c, extra }) => (
          <div key={key} className="ct-cc2" onPointerMove={spot} style={{} as CSSProperties}>
            <span className="ct-ci">
              <Icon size={24} strokeWidth={1.8} />
            </span>
            <div>
              <dt>{label}</dt>
              <dd>
                {href ? <a href={href}>{value}</a> : <span>{value}</span>}
                {extra && <em>{extra}</em>}
              </dd>
            </div>
            {c && (
              <button
                type="button"
                className={`ct-cp${copied === key ? ' is-ok' : ''}`}
                aria-label={`Copy ${label.toLowerCase()}`}
                onClick={() => void copy(c, key)}
              >
                {copied === key ? <Check size={18} /> : <Copy size={18} />}
              </button>
            )}
          </div>
        ))}
      </dl>
      <div className={`ct-toast${toast ? ' is-on' : ''}`} role="status">
        {toast}
      </div>
    </>
  );
}
