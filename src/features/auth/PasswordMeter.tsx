export function PasswordMeter({ value }: { value: string }) {
  let score = 0;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return (
    <div className="auth-meter" data-level={score} aria-live="polite">
      <div className="auth-meter-bars" aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <span>{value ? labels[score] : ''}</span>
    </div>
  );
}
