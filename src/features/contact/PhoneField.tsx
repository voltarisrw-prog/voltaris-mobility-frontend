'use client';

import type { ChangeEvent, ComponentPropsWithRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRIES, countryByIso, detectCountry } from '@/lib/validation/phone';

/**
 * Phone input with a country-code picker. Pasting or typing a number that starts with
 * "+" or "00" selects the country and keeps only the national part in the box.
 */
export function PhoneField({
  id,
  iso,
  onIso,
  inputProps,
  invalid,
}: {
  id: string;
  iso: string;
  onIso: (iso: string) => void;
  inputProps: ComponentPropsWithRef<'input'>;
  invalid: boolean;
}) {
  const country = countryByIso(iso);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/[^\d\s+()-]/g, '');
    const t = v.trim();
    if (/^(\+|00)/.test(t)) {
      const digits = t.replace(/^(\+|00)/, '').replace(/\D/g, '');
      const hit = detectCountry(digits);
      if (hit) {
        onIso(hit.iso);
        v = digits.slice(hit.dial.length);
      }
    }
    e.target.value = v;
    void inputProps.onChange?.(e);
  };

  return (
    <div className={`ct-f ct-ip${invalid ? ' is-bad' : ''}`}>
      <div className="ct-cc">
        <span className="ct-ccv" aria-hidden="true">
          {country.iso === 'XX' ? '+' : country.iso} <b>{country.dial ? `+${country.dial}` : ''}</b>
          <ChevronDown size={14} />
        </span>
        <select aria-label="Country code" value={iso} onChange={(e) => onIso(e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.iso === 'XX' ? 'Other country (type +code)' : `${c.name} (+${c.dial})`}
            </option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={country.ex}
        aria-invalid={invalid}
        {...inputProps}
        onChange={onChange}
      />
      <label htmlFor={id}>
        Phone<i>*</i>
      </label>
    </div>
  );
}
