'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';
import type { ChargingLocation } from '@/lib/api/charging';

type ChargingMapProps = {
  locations: ChargingLocation[];
};

const VOLTARIS_CENTER: [number, number] = [-1.9403, 29.8739];

const stationIcon = L.divIcon({
  className: 'voltaris-charging-marker',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      border-radius: 9999px;
      background: #000;
      border: 2px solid #fff;
      box-shadow: 0 6px 18px rgba(0,0,0,.28);
      display: grid;
      place-items: center;
    ">
      <span style="
        color: #b8ff00;
        font-size: 17px;
        line-height: 1;
        font-weight: 800;
      ">⚡</span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

function FitStations({ locations }: ChargingMapProps) {
  const map = useMap();

  if (locations.length === 0) return null;

  const bounds = L.latLngBounds(
    locations.map((location) => [location.latitude, location.longitude]),
  );

  map.fitBounds(bounds, {
    padding: [48, 48],
    maxZoom: locations.length === 1 ? 14 : 11,
  });

  return null;
}

function connectorSummary(location: ChargingLocation): string {
  return location.connectors
    .map(
      (connector) =>
        `${connector.type} × ${connector.count} · ${connector.power_kw} kW`,
    )
    .join(' / ');
}

export function ChargingMap({ locations }: ChargingMapProps) {
  return (
    <div className="overflow-hidden border border-hairline bg-slab">
      <div className="border-b border-hairline px-5 py-4 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-data text-[9px] uppercase tracking-[0.2em] text-steel-muted">
              Charging network
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-chrome">
              Charging stations
            </h2>
          </div>

          <span className="font-data text-[10px] uppercase tracking-[0.14em] text-steel">
            {locations.length} {locations.length === 1 ? 'station' : 'stations'}
          </span>
        </div>
      </div>

      <div className="relative h-[480px] w-full sm:h-[560px] lg:h-[620px]">
        <MapContainer
          center={VOLTARIS_CENTER}
          zoom={8}
          scrollWheelZoom
          className="voltaris-charging-map h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitStations locations={locations} />

          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={stationIcon}
            >
              <Popup>
                <div className="min-w-[220px] space-y-2">
                  <div>
                    <p className="text-base font-semibold leading-tight">
                      {location.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {location.operator}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-gray-600">
                    {location.address}
                  </p>

                  <div className="border-t border-gray-200 pt-2 text-xs">
                    <p>
                      <strong>Access:</strong>{' '}
                      {location.access === 'customers_only'
                        ? 'Customers only'
                        : location.access.charAt(0).toUpperCase() +
                          location.access.slice(1)}
                    </p>
                    <p className="mt-1">
                      <strong>Hours:</strong> {location.open_hours}
                    </p>
                    <p className="mt-1">
                      <strong>Connectors:</strong>{' '}
                      {connectorSummary(location)}
                    </p>
                  </div>

                  {location.verified_at && (
                    <p className="border-t border-gray-200 pt-2 text-[10px] uppercase tracking-[0.08em] text-gray-500">
                      Verified{' '}
                      {new Date(location.verified_at).toLocaleDateString(
                        'en-RW',
                        { dateStyle: 'medium' },
                      )}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
