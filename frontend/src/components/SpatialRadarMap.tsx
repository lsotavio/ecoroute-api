import { CollectionPoint } from '../api';

interface SpatialRadarMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  points: CollectionPoint[];
  selectedPointId: string | null;
  onSelectPoint: (point: CollectionPoint) => void;
}

export function SpatialRadarMap({
  centerLat,
  centerLng,
  radiusKm,
  points,
  selectedPointId,
  onSelectPoint,
}: SpatialRadarMapProps) {
  const viewSize = 320;
  const center = viewSize / 2;
  const maxPlotRadius = 130;
  const effectiveRadiusKm = Math.max(radiusKm, 1);

  // 1 degree of latitude is approximately 111.32 km; longitude scales by cos(latitude)
  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((centerLat * Math.PI) / 180);

  const plottedPoints = points.map((pt) => {
    const dLatKm = (pt.latitude - centerLat) * kmPerDegLat;
    const dLngKm = (pt.longitude - centerLng) * kmPerDegLng;

    const rawX = center + (dLngKm / effectiveRadiusKm) * maxPlotRadius;
    const rawY = center - (dLatKm / effectiveRadiusKm) * maxPlotRadius;

    const clampedX = Math.max(20, Math.min(viewSize - 20, rawX));
    const clampedY = Math.max(20, Math.min(viewSize - 20, rawY));

    return {
      point: pt,
      x: clampedX,
      y: clampedY,
    };
  });

  return (
    <div className="radar-card">
      <div className="radar-header">
        <div>
          <h3>Radar Espacial (WGS 84)</h3>
          <p className="text-muted">
            Origem: {centerLat.toFixed(4)}, {centerLng.toFixed(4)} | Raio: {radiusKm} km
          </p>
        </div>
        <span className="badge-count">{points.length} PEV(s) no raio</span>
      </div>

      <div className="radar-svg-wrapper">
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="radar-svg"
          role="img"
          aria-label="Mapa de proximidade dos pontos de coleta"
        >
          <circle cx={center} cy={center} r={maxPlotRadius} className="radar-ring-outer" />
          <circle cx={center} cy={center} r={maxPlotRadius * 0.66} className="radar-ring-mid" />
          <circle cx={center} cy={center} r={maxPlotRadius * 0.33} className="radar-ring-inner" />

          <line x1={center} y1={16} x2={center} y2={viewSize - 16} className="radar-axis" />
          <line x1={16} y1={center} x2={viewSize - 16} y2={center} className="radar-axis" />

          <circle cx={center} cy={center} r={6} className="radar-origin-dot" />
          <text x={center + 10} y={center - 8} className="radar-origin-label">
            Sua Posição
          </text>

          {plottedPoints.map(({ point, x, y }) => {
            const isSelected = point.id === selectedPointId;
            return (
              <g
                key={point.id}
                className={`radar-point-group ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectPoint(point)}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 9 : 7}
                  className="radar-point-dot"
                />
                <text x={x} y={y + 18} textAnchor="middle" className="radar-point-label">
                  {point.name.replace('Ecoponto ', '')}
                  {point.distance_km !== undefined ? ` (${point.distance_km}km)` : ''}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="radar-legend">
        <span>
          <i className="legend-dot origin" /> Ponto de Referência
        </span>
        <span>
          <i className="legend-dot pev" /> PEV Homologado (clique para inspecionar)
        </span>
      </div>
    </div>
  );
}
