/**
 * Reading environment variables safely.
 *
 * The whole reason this file exists: `process.env.X ?? fallback` is wrong for
 * environment variables. `??` only falls back on `null` and `undefined`, but the
 * common real-world failure is an **empty string** — a variable added in a
 * hosting dashboard with the value field left blank, or a `.env` line like
 * `FOO=` with nothing after it.
 *
 * That mistake produced three separate bugs here, only one of which announced
 * itself:
 *
 *   - `new URL('')` threw `ERR_INVALID_URL` during the build, from inside a
 *     `metadata` export, which points at the layout rather than at the missing
 *     variable.
 *   - A blank `API_INTERNAL_BASE_URL` won over the public one, so every
 *     server-side fetch targeted `''`.
 *   - `Number('')` is `0`, so a blank `API_SERVER_TIMEOUT_MS` set every server
 *     request's timeout to zero milliseconds. Silent, and baffling to trace.
 *
 * Every read goes through these helpers so the mistake cannot recur, and a
 * genuinely missing required value fails with a message naming the variable.
 */

/** Trimmed value, or undefined when unset, empty, or whitespace. */
function raw(name: string): string | undefined {
  // Do not index process.env dynamically for NEXT_PUBLIC_* — Next inlines these
  // at build time by matching the literal text, so callers must pass the value.
  const value = process.env[name];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

export function envString(value: string | undefined, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed === '' ? fallback : trimmed;
}

export function envNumber(value: string | undefined, fallback: number): number {
  const text = envString(value, '');
  if (text === '') return fallback;
  const parsed = Number(text);
  // NaN and negatives are as broken as empty. A timeout of -5 is not a timeout.
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function envFlag(value: string | undefined): boolean {
  const text = envString(value, '').toLowerCase();
  return text === 'true' || text === '1' || text === 'yes';
}

/**
 * A URL that must parse.
 *
 * Fails with the variable name rather than `ERR_INVALID_URL` from wherever the
 * value happened to be used. Being told "NEXT_PUBLIC_SITE_URL is empty" is the
 * difference between a two-minute fix and reading a stack trace into
 * `layout.tsx`.
 */
export function envUrl(name: string, value: string | undefined, fallback: string): string {
  const candidate = envString(value, fallback);
  try {
    // Normalised, so a trailing slash in the dashboard cannot produce
    // `https://voltaris.rw//cars` in every canonical tag.
    return new URL(candidate).origin;
  } catch {
    throw new Error(
      `${name} is not a valid URL (received ${JSON.stringify(value ?? null)}). ` +
        `Set it to an absolute URL such as ${fallback}, or remove it to use the default.`,
    );
  }
}

export { raw as readEnv };
