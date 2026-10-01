/**
 * A quiet outline of Rwanda with sized dots per place — enough to show where
 * things are, without a map library or tiles. Coordinates are lon/lat.
 */
const OUTLINE: [number, number][] = [
  [29.37, -1.38],
  [29.6, -1.25],
  [29.85, -1.37],
  [30.05, -1.1],
  [30.33, -1.05],
  [30.47, -1.06],
  [30.7, -1.4],
  [30.83, -1.7],
  [30.89, -2.05],
  [30.8, -2.38],
  [30.57, -2.41],
  [30.42, -2.33],
  [30.15, -2.43],
  [29.95, -2.35],
  [29.75, -2.81],
  [29.32, -2.83],
  [29.05, -2.6],
  [28.86, -2.52],
  [28.88, -2.36],
  [29.13, -2.25],
  [29.13, -1.92],
  [29.25, -1.62],
];

export const PLACES: Record<string, [number, number]> = {
  Kigali: [30.06, -1.95],
  Musanze: [29.63, -1.5],
  Rubavu: [29.26, -1.68],
  Huye: [29.74, -2.6],
  Rwamagana: [30.43, -1.95],
  Nyagatare: [30.33, -1.3],
  Rusizi: [28.95, -2.48],
  Muhanga: [29.75, -2.08],
};

const X = (lon: number) => ((lon - 28.8) / 2.15) * 100;
const Y = (lat: number) => ((-lat - 1.0) / 1.9) * 88;

export function RwandaMap({
  points,
}: {
  points: { place: keyof typeof PLACES | string; value: number }[];
}) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <figure>
      <svg viewBox="0 0 100 88" className="h-auto w-full" role="img" aria-label="Map of Rwanda">
        <polygon
          points={OUTLINE.map(([lon, lat]) => `${X(lon)},${Y(lat)}`).join(' ')}
          fill="#F2F2F2"
          stroke="#BDBDBD"
          strokeWidth="0.4"
        />
        {points.map((p) => {
          const at = PLACES[p.place];
          if (!at) return null;
          const r = 1.4 + (p.value / max) * 3.2;
          return (
            <g key={p.place}>
              <rect x={X(at[0]) - r / 2} y={Y(at[1]) - r / 2} width={r} height={r} fill="#111111" />
              <text x={X(at[0]) + r / 2 + 1} y={Y(at[1]) + 1} fontSize="3" fill="#4A4A4A">
                {p.place} · {p.value}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
