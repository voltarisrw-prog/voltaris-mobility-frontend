'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, useToast } from '@/components/ui';
import { createCheckoutSession, getPaymentState, type PaymentState } from '@/lib/api/payments';
import { displayMessage } from '@/lib/api/errors';
import { formatPrice } from '@/lib/format';
import { track } from '@/lib/analytics';
import type { Order } from '@/lib/api/orders';

/* --------------------------------------------------------------- The badge */

const STATE_STYLE: Record<PaymentState, string> = {
  PENDING: 'bg-slab text-steel',
  PROCESSING: 'bg-volt-wash text-volt',
  PAID: 'bg-volt text-surface',
  FAILED: 'bg-danger text-surface',
  CANCELLED: 'bg-hairline text-steel',
  REFUNDED: 'bg-hairline text-chrome',
};

const STATE_LABEL: Record<PaymentState, string> = {
  PENDING: 'Awaiting payment',
  PROCESSING: 'Payment processing',
  PAID: 'Paid',
  FAILED: 'Payment failed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
};

export function PaymentStatus({ state }: { state: PaymentState }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 font-data text-eyebrow uppercase ${STATE_STYLE[state]}`}
    >
      {STATE_LABEL[state]}
    </span>
  );
}

/* ------------------------------------------------------------ The checkout */

const EXPLAIN: Record<PaymentState, string> = {
  PENDING: 'Nothing has been charged yet. Continue to the payment page to pay for this order.',
  PROCESSING:
    'Your payment is with the provider. This page updates itself — it usually settles within a minute or two. Do not pay again.',
  PAID: 'Payment confirmed. Voltaris and the seller have been notified and will contact you about handover.',
  FAILED:
    'The provider declined this payment and nothing was taken. You can try again, or use a different method.',
  CANCELLED: 'This payment was cancelled. The order is still here if you want to try again.',
  REFUNDED:
    'This payment has been refunded. Allow a few working days for it to reach your account.',
};

/**
 * The frontend never decides that a payment succeeded.
 *
 * Coming back from the provider proves only that a browser was redirected — the
 * provider's webhook may not have landed, the redirect can be forged, and the tab can
 * be reopened from history. So this component ignores the redirect entirely as
 * evidence and polls the backend, which reconciles against the webhook, for the one
 * authoritative answer.
 */
export function CheckoutClient({ order }: { order: Order }) {
  const router = useRouter();
  const toast = useToast();
  const [state, setState] = useState<PaymentState>(order.payment_state);
  const [redirecting, setRedirecting] = useState(false);
  const attempts = useRef(0);

  const isSettling = state === 'PROCESSING' || state === 'PENDING';

  const poll = useCallback(async () => {
    try {
      const snapshot = await getPaymentState(order.id);
      setState((previous) => {
        if (previous === snapshot.state) return previous;
        if (snapshot.state === 'PAID') track('payment_completed', { order_id: order.id });
        if (snapshot.state === 'FAILED') {
          track('payment_failed', { order_id: order.id, reason_code: 'provider_declined' });
        }
        return snapshot.state;
      });
    } catch {
      // A failed poll is not a failed payment. Stay quiet and try again.
    }
  }, [order.id]);

  useEffect(() => {
    if (state !== 'PROCESSING') return;
    // Back off rather than hammering: ~2 minutes of polling, then stop and let the
    // person refresh. An indefinite interval on a settled order is a leak.
    const timer = setInterval(() => {
      attempts.current += 1;
      if (attempts.current > 40) {
        clearInterval(timer);
        return;
      }
      void poll();
    }, 3000);
    return () => clearInterval(timer);
  }, [state, poll]);

  async function startPayment() {
    setRedirecting(true);
    track('payment_started', { order_id: order.id });
    try {
      const session = await createCheckoutSession(order.id);
      // Card details are entered on the provider's own page. This app never sees them.
      window.location.assign(session.redirect_url);
    } catch (cause) {
      setRedirecting(false);
      toast.push('error', displayMessage(cause));
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div>
        <h1 className="font-display text-headline">{order.vehicle.title}</h1>
        <p className="mt-2 font-data text-xs text-steel-muted">Order {order.reference}</p>

        <div className="mt-8">
          <PaymentStatus state={state} />
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-steel">{EXPLAIN[state]}</p>
        </div>

        {state === 'PROCESSING' && (
          <p aria-live="polite" className="mt-4 font-data text-xs text-steel-muted">
            Checking with the payment provider…
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {(state === 'PENDING' || state === 'FAILED' || state === 'CANCELLED') && (
            <Button onClick={startPayment} loading={redirecting}>
              {state === 'PENDING' ? 'Continue to payment' : 'Try payment again'}
            </Button>
          )}
          {!isSettling && (
            <Button variant="ghost" onClick={() => router.refresh()}>
              Refresh status
            </Button>
          )}
          {state === 'PAID' && (
            <Link
              href="/account/orders"
              className="inline-flex items-center border border-chrome px-5 py-3 font-data text-eyebrow uppercase transition-colors hover:bg-chrome hover:text-surface"
            >
              See your orders
            </Link>
          )}
        </div>
      </div>

      <aside className="border border-hairline p-6 lg:sticky lg:top-24 lg:self-start">
        <h2 className="eyebrow">What you are paying</h2>
        <dl className="mt-4 space-y-2">
          {order.lines.map((line) => (
            <div key={line.label} className="flex justify-between gap-4 text-sm">
              <dt className="text-steel">{line.label}</dt>
              <dd className="font-data tabular-nums text-chrome">
                {formatPrice(line.amount, order.currency)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex justify-between gap-4 border-t border-hairline/60 pt-4">
          <span className="font-display text-sm font-semibold">Total</span>
          <span className="font-display text-lg font-semibold tabular-nums">
            {formatPrice(order.total, order.currency)}
          </span>
        </div>
        <p className="mt-5 text-xs leading-relaxed text-steel-muted">
          These amounts come from Voltaris, not from this page. Payment is taken on the provider’s
          secure page — your card details never pass through Voltaris.
        </p>
      </aside>
    </div>
  );
}
