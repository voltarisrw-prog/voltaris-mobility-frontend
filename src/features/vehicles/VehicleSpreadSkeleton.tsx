/** Placeholder for the exterior spread while a vehicle page streams in. */
export function VehicleSpreadSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="skeleton min-h-[72svh] sm:min-h-[78svh] lg:min-h-[82svh]" />
      <div className="shell mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,0.8fr)]">
        <div className="space-y-4">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-12 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}
