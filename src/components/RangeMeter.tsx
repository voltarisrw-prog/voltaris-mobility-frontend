import { MARKET_MAX_RANGE_KM } from '@/config/site';

/**
 * The range meter. Range is the number EV buyers actually shop on, so every listing
 * plots its real WLTP range against the market ceiling. Two cards side by side become
 * comparable without reading a single figure.
 */
export function RangeMeter({
  rangeKm,
  max = MARKET_MAX_RANGE_KM,
  showLabel = true,
}: {
  rangeKm: number;
  max?: number;
  showLabel?: boolean;
}) {
  const ratio = Math.max(0.04, Math.min(1, rangeKm / max));
  return (
    <div>
      {showLabel && (
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="eyebrow">Range</span>
          <span className="font-data text-sm tabular-nums text-chrome">
            {rangeKm}
            <span className="ml-0.5 text-xs text-steel-muted">km</span>
          </span>
        </div>
      )}
      <div
        className="range-track"
        role="meter"
        aria-valuenow={rangeKm}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`Driving range ${rangeKm} kilometres of a market maximum of ${max}`}
      >
        <div className="range-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
    </div>
  );
}
