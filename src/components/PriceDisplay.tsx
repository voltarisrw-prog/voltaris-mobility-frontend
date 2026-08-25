import { cn, formatPrice } from '@/lib/format';

/**
 * Renders only the customer-facing price the backend returned. Seller price,
 * commission, margin, and settlement values are never sent to this surface.
 */
export function PriceDisplay({
  amount,
  currency,
  perDay,
  size = 'md',
}: {
  amount: number | null;
  currency: string;
  perDay?: number | null;
  size?: 'md' | 'lg';
}) {
  return (
    <div>
      <p
        className={cn(
          'font-display font-semibold tracking-tight text-chrome tabular-nums',
          size === 'lg' ? 'text-3xl sm:text-4xl' : 'text-lg',
        )}
      >
        {formatPrice(amount, currency)}
      </p>
      {perDay ? (
        <p className="mt-0.5 font-data text-xs text-steel">
          or {formatPrice(perDay, currency)} / day
        </p>
      ) : null}
    </div>
  );
}
