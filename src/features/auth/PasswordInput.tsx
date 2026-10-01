'use client';

import { useState, type ComponentPropsWithRef } from 'react';

export function PasswordInput(props: ComponentPropsWithRef<'input'>) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-pw">
      <input {...props} type={show ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-pressed={show}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
