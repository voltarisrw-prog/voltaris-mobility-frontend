import { MfaPanel } from '@/features/auth/MfaPanel';
import { getSession } from '@/lib/api/auth';

export default async function SecurityPage() {
  const { user } = await getSession();
  return (
    <section>
      <h2 className="section-heading">Security</h2>
      {user.mfa_enabled ? (
        <p className="mt-4 max-w-xl text-sm">
          Two-step sign-in is <strong>on</strong>. You&apos;ll be asked for a code from your
          authenticator app when you sign in with your password
          {user.mfa_required ? ', and every 12 hours for staff tools' : ''}. Lost your phone? Use
          one of your recovery codes, or ask a Security Administrator to reset it.
        </p>
      ) : (
        <div className="mt-6">
          <MfaPanel
            mode="setup"
            needsSetupCode={user.mfa_required}
            intro={
              user.mfa_required
                ? 'Your staff role needs two-step sign-in. Enter the setup code your Super Administrator gave you, then scan the QR code.'
                : 'Optional, and strongly recommended: a code from your phone on top of your password.'
            }
          />
        </div>
      )}
    </section>
  );
}
