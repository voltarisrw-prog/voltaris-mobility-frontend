'use client';

import { Scale } from 'lucide-react';
import { COMPARE_MAX, toggleCompare, useCompareIds } from '@/lib/compare/useCompare';
import { useToast } from '@/components/ui';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/format';

/**
 * The one on-ramp into /compare that isn't a hand-built URL. `variant="icon"` sits on
 * the vehicle card image; `variant="button"` sits in the detail-page action list next
 * to "Ask about this vehicle". Both read and write the same basket (see
 * lib/compare/store.ts), so adding a car from a card and finishing the comparison
 * from its detail page work identically.
 */
export function CompareToggleButton({
  vehicleId,
  mode = 'sale',
  variant = 'icon',
  className,
}: {
  vehicleId: string;
  mode?: 'sale' | 'rental';
  variant?: 'icon' | 'button';
  className?: string;
}) {
  const ids = useCompareIds();
  const active = ids.includes(vehicleId);
  const toast = useToast();

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    // The card itself is a stretched link (see VehicleCard); without these this
    // click would also navigate to the vehicle page.
    event.preventDefault();
    event.stopPropagation();

    const result = toggleCompare(vehicleId, mode);
    if (result.modeMismatch) {
      toast.push(
        'error',
        mode === 'rental'
          ? 'Rental vehicles can only be compared with other rental vehicles.'
          : 'Vehicles for sale can only be compared with other vehicles for sale.',
      );
      return;
    }

    if (result.capped) {
      toast.push(
        'error',
        `You can compare up to ${COMPARE_MAX} vehicles at a time. Remove one to add another.`,
      );
      return;
    }

    if (result.ids.includes(vehicleId)) {
      track('compare_add', { vehicle_id: vehicleId, count: result.ids.length });
    } else {
      track('compare_remove', { vehicle_id: vehicleId, count: result.ids.length });
    }
  }

  const label = active ? 'Remove from comparison' : 'Add to comparison';

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={cn(
          'flex w-full items-center justify-center gap-2 border px-5 py-3 font-data text-eyebrow uppercase transition-colors',
          active
            ? 'border-volt text-volt hover:bg-volt-wash'
            : 'border-hairline text-steel hover:border-chrome hover:text-chrome',
          className,
        )}
      >
        <Scale aria-hidden="true" className="h-4 w-4" />
        {active ? 'Added to compare' : 'Add to compare'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center border transition-colors',
        active
          ? 'border-volt bg-volt text-surface'
          : 'border-hairline/80 bg-surface/70 text-chrome backdrop-blur-sm hover:border-chrome',
        className,
      )}
    >
      <Scale aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
