import { VehicleCardSkeleton } from '@/components/VehicleCard';

export default function Loading() {
  return (
    <div className="shell py-8 sm:py-12">
      <div className="h-3 w-40 animate-pulse bg-slab" />
      <div className="mt-6 h-9 w-2/3 max-w-lg animate-pulse bg-slab" />
      <div className="mt-8 h-14 w-full animate-pulse bg-slab" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VehicleCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
