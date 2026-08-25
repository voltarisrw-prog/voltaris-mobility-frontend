/**
 * Verification is a backend-issued fact, never inferred in the browser. The badge
 * says what was checked, because an unexplained tick erodes the trust it is meant
 * to build.
 */
export function VerificationBadge({ verified }: { verified: boolean }) {
  if (!verified) {
    return (
      <span className="inline-flex items-center gap-1.5 border border-hairline px-2 py-1 font-data text-eyebrow uppercase text-steel-muted">
        Not yet verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 bg-volt-wash px-2 py-1 font-data text-eyebrow uppercase text-volt">
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-3 w-3 fill-current">
        <path d="M6 0 7.4 1.6 9.5 1.2 9.9 3.3 11.8 4.3 10.8 6.2 11.8 8.1 9.9 9.1 9.5 11.2 7.4 10.8 6 12.4 4.6 10.8 2.5 11.2 2.1 9.1 0.2 8.1 1.2 6.2 0.2 4.3 2.1 3.3 2.5 1.2 4.6 1.6Z" />
        <path d="M5.2 8.2 3.1 6.1l.9-.9 1.2 1.2 2.8-2.8.9.9Z" className="fill-white" />
      </svg>
      Documents verified
    </span>
  );
}
