'use client';

import { useEffect, useRef, useState, type ChangeEvent, type ComponentPropsWithRef, type FocusEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRIES, countryByIso, detectCountry, guessCountry } from '@/lib/validation/phone';
import { cn } from '@/lib/format';
import './phone-field.css';

type Props = ComponentPropsWithRef<'input'> & {
  /** Render the picker and input as siblings (for forms that position their own floating label). */
  bare?: boolean;
};

function setNative(el: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * A phone input with a country-code picker that still holds ONE value, so it drops into any
 * react-hook-form field: `<IntlPhone {...register('phone')} />`. Outside Rwanda the value keeps
 * its "+code" in front; a number pasted with "+" picks the country by itself.
 */
export function IntlPhone({ bare, ref, onChange, onFocus, onBlur, className, placeholder, ...rest }: Props) {
  const inner = useRef<HTMLInputElement | null>(null);
  const [iso, setIso] = useState('RW');
  const country = countryByIso(iso);

  const setRef = (el: HTMLInputElement | null) => {
    inner.current = el;
    if (typeof ref === 'function') ref(el);
    else if (ref) (ref as { current: HTMLInputElement | null }).current = el;
  };

  // Start from the number already in the box, else from the visitor's own country.
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const v = el.value.trim();
    if (/^(\+|00)/.test(v)) {
      const hit = detectCountry(v.replace(/^(\+|00)/, '').replace(/\D/g, ''));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (hit) setIso(hit.iso);
    } else if (!v) {
      const g = guessCountry(Intl.DateTimeFormat().resolvedOptions().timeZone);
      if (g) setIso(g);
    }
  }, []);

  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d\s+()-]/g, '');
    const t = v.trim();
    if (/^(\+|00)/.test(t)) {
      if (t.startsWith('00')) v = '+' + t.slice(2);
      const hit = detectCountry(t.replace(/^(\+|00)/, '').replace(/\D/g, ''));
      if (hit && hit.dial !== country.dial) setIso(hit.iso);
    } else if (t && iso !== 'RW') {
      const nat = v.replace(/\D/g, '');
      v = country.iso === 'XX' ? `+${nat}` : nat.startsWith(country.dial) && nat.length > country.max ? `+${nat}` : `+${country.dial} ${nat}`;
    }
    if (v !== e.target.value) e.target.value = v;
    onChange?.(e);
  };

  const pick = (next: string) => {
    const el = inner.current;
    setIso(next);
    if (!el) return;
    const t = el.value.trim();
    let national = t;
    if (/^(\+|00)/.test(t)) {
      const digits = t.replace(/^(\+|00)/, '').replace(/\D/g, '');
      national = country.dial && digits.startsWith(country.dial) ? digits.slice(country.dial.length) : digits;
    }
    national = national.replace(/[^\d\s()-]/g, '').trim();
    const c = countryByIso(next);
    setNative(el, c.iso === 'XX' ? `+${national}` : `+${c.dial} ${national}`);
    el.focus();
  };

  const focus = (e: FocusEvent<HTMLInputElement>) => {
    if (!e.target.value.trim() && iso !== 'RW') setNative(e.target, country.dial ? `+${country.dial} ` : '+');
    onFocus?.(e);
  };
  const blur = (e: FocusEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    if (e.target.value && (!digits || digits === country.dial)) setNative(e.target, '');
    onBlur?.(e);
  };

  const picker = (
    <div className="vph-cc">
      <span className="vph-ccv" aria-hidden="true">
        {country.iso === 'XX' ? '+' : country.iso} <b>{country.dial ? `+${country.dial}` : ''}</b>
        <ChevronDown size={14} />
      </span>
      <select aria-label="Country code" value={iso} onChange={(e) => pick(e.target.value)}>
        {COUNTRIES.map((c) => (
          <option key={c.iso} value={c.iso}>
            {c.iso === 'XX' ? 'Other country (type +code)' : `${c.name} (+${c.dial})`}
          </option>
        ))}
      </select>
    </div>
  );

  const input = (
    <input
      {...rest}
      ref={setRef}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder ?? country.ex}
      className={cn(className, 'vph-in')}
      onChange={handle}
      onFocus={focus}
      onBlur={blur}
    />
  );

  return bare ? (
    <>
      {picker}
      {input}
    </>
  ) : (
    <div className="vph">
      {picker}
      {input}
    </div>
  );
}
