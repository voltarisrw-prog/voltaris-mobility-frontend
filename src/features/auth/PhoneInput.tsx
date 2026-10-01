'use client';

import type { ComponentPropsWithRef } from 'react';

/** Digits only, as the backend expects: +250 followed by the 9-digit mobile number. */
export function toRwandaE164(value: string): string {
  let d = value.replace(/\D/g, '');
  if (d.startsWith('250')) d = d.slice(3);
  if (d.startsWith('0')) d = d.slice(1);
  return '+250' + d;
}

export function PhoneInput({ onChange, ...props }: ComponentPropsWithRef<'input'>) {
  return (
    <div className="auth-phone">
      <span aria-hidden="true">+250</span>
      <input
        {...props}
        type="tel"
        inputMode="tel"
        placeholder="788 123 456"
        onChange={(e) => {
          e.target.value = e.target.value.replace(/[\s-]/g, '');
          onChange?.(e);
        }}
      />
    </div>
  );
}
