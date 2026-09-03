import { EmptyState } from '@/components/EmptyState';
import type { VehicleSummary } from '@/types/vehicle';
import { VehicleCard } from '@/components/VehicleCard';
import { getSavedVehicles } from '@/lib/api/users';

export default async function SavedVehiclesPage() {
  const saved = await getSavedVehicles();
  return (
    <section>
      <h2 className="section-heading">Saved vehicles</h2>
      <div className="mt-8">
        {saved.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            body="Save a vehicle from any listing and it waits here, with its price and availability kept up to date."
            action={{ label: 'Browse electric vehicles', href: '/cars' }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {saved.map((vehicle: VehicleSummary) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
