'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import type { GaragePartner } from '@/config/garage';

function icon(active: boolean) {
  return L.divIcon({
    className: 'voltaris-garage-marker',
    html: `<div style="width:${active ? 40 : 28}px;height:${active ? 40 : 28}px;border-radius:9999px;background:${active ? '#00030C' : '#fff'};border:2px solid ${active ? '#fff' : '#00030C'};box-shadow:0 6px 18px rgba(0,3,12,.28);display:grid;place-items:center;transition:all .2s"><span style="width:8px;height:8px;border-radius:9999px;background:${active ? '#5CC8FF' : '#00030C'}"></span></div>`,
    iconSize: [active ? 40 : 28, active ? 40 : 28],
    iconAnchor: [active ? 20 : 14, active ? 20 : 14],
  });
}

function Recenter({ partner }: { partner: GaragePartner | null }) {
  const map = useMap();
  useEffect(() => {
    if (partner) map.flyTo([partner.lat, partner.lng], 14, { duration: 0.6 });
  }, [map, partner]);
  return null;
}

/** Partner garages as pins; the chosen one is larger. Clicking a pin selects it. */
export function GarageMap({
  partners,
  selected,
  onSelect,
}: {
  partners: GaragePartner[];
  selected: string | null;
  onSelect: (slug: string) => void;
}) {
  const current = partners.find((p) => p.slug === selected) ?? null;
  return (
    <MapContainer
      center={[-1.9536, 30.0906]}
      zoom={12}
      scrollWheelZoom={false}
      className="h-full w-full"
      attributionControl={false}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
      {partners.map((p) => (
        <Marker
          key={p.slug}
          position={[p.lat, p.lng]}
          icon={icon(p.slug === selected)}
          eventHandlers={{ click: () => onSelect(p.slug) }}
          title={p.name}
        />
      ))}
      <Recenter partner={current} />
    </MapContainer>
  );
}
