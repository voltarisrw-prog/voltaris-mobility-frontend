'use client';

import { useState } from 'react';
import { Button, Field, inputClass } from '@/components/ui';
import { enableMfa, startMfaSetup, verifyMfa, type MfaSetup } from '@/lib/api/auth';
import { displayMessage } from '@/lib/api/errors';

/**
 * Two-step sign-in with an authenticator app.
 *   mode="setup"  — first time: scan the QR code, confirm one code, save recovery codes.
 *   mode="verify" — already set up: enter the current code (or a recovery code).
 * On success the page reloads so every server component sees the new session state.
 */
export function MfaPanel({
  mode,
  intro,
  needsSetupCode = false,
}: {
  mode: 'setup' | 'verify';
  intro?: string;
  /** Staff: a one-time setup code from a Super Administrator is required to enrol. */
  needsSetupCode?: boolean;
}) {
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [setupCode, setSetupCode] = useState('');
  const [code, setCode] = useState('');
  const [recovery, setRecovery] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      setError(displayMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  if (recovery) {
    return (
      <div className="max-w-xl">
        <h2 className="section-heading">Save your recovery codes</h2>
        <p className="mt-3 text-sm text-steel">
          If you lose your phone, each of these codes lets you in once. Store them somewhere safe (a
          password manager or printed). They won&apos;t be shown again.
        </p>
        <ol className="mt-6 grid grid-cols-2 gap-2 border border-hairline p-4 font-data text-sm">
          {recovery.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          I&apos;ve saved them — continue
        </Button>
      </div>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    run(async () => {
      if (mode === 'setup') {
        const result = await enableMfa(code);
        setRecovery(result.recovery_codes);
      } else {
        await verifyMfa(code);
        window.location.reload();
      }
    });
  };

  return (
    <div className="max-w-xl">
      <h2 className="section-heading">
        {mode === 'setup' ? 'Turn on two-step sign-in' : 'Confirm it’s you'}
      </h2>
      <p className="mt-3 text-sm text-steel">
        {intro ??
          (mode === 'setup'
            ? 'Use an authenticator app such as Google Authenticator or Microsoft Authenticator.'
            : 'Enter the 6-digit code from your authenticator app, or one of your recovery codes.')}
      </p>

      {error && (
        <p
          role="alert"
          className="mt-6 border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      )}

      {mode === 'setup' && !setup && (
        <div className="mt-6 flex flex-wrap items-end gap-4">
          {needsSetupCode && (
            <div className="w-72">
              <Field label="Setup code from your Super Administrator" required>
                {(p) => (
                  <input
                    {...p}
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    autoComplete="off"
                    placeholder="xxxx-xxxx-xxxx"
                    className={`${inputClass} font-data`}
                  />
                )}
              </Field>
            </div>
          )}
          <Button
            loading={busy}
            disabled={needsSetupCode && setupCode.trim().length < 12}
            onClick={() => run(async () => setSetup(await startMfaSetup(setupCode.trim())))}
          >
            Set up authenticator
          </Button>
        </div>
      )}

      {mode === 'setup' && setup && (
        <div className="mt-6 flex flex-wrap items-start gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- data: URI from our own API */}
          <img
            src={setup.qr_svg}
            alt="QR code to scan with your authenticator app"
            width={180}
            height={180}
          />
          <div className="min-w-0 flex-1 text-sm">
            <p>1. Open your authenticator app and scan this code.</p>
            <p className="mt-2 text-steel">Can&apos;t scan? Enter this key instead:</p>
            <p className="mt-1 break-all font-data">{setup.secret}</p>
            <p className="mt-4">2. Type the 6-digit code it shows below.</p>
          </div>
        </div>
      )}

      {(mode === 'verify' || setup) && (
        <form onSubmit={submit} className="mt-6 flex flex-wrap items-end gap-4">
          <div className="w-56">
            <Field label="Code" required>
              {(p) => (
                <input
                  {...p}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  inputMode={mode === 'setup' ? 'numeric' : 'text'}
                  autoComplete="one-time-code"
                  maxLength={12}
                  className={`${inputClass} font-data tracking-[0.3em]`}
                />
              )}
            </Field>
          </div>
          <Button type="submit" loading={busy} disabled={code.trim().length < 6}>
            {mode === 'setup' ? 'Turn on' : 'Continue'}
          </Button>
        </form>
      )}
    </div>
  );
}
