import { useState } from 'react';
import { CollectionPoint, WASTE_CATEGORY_LABELS, WasteCategory } from '../api';

interface SpatialRadarMapProps {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
  points: CollectionPoint[];
  selectedPointId: string | null;
  onSelectPoint: (point: CollectionPoint) => void;
  onScheduleAtPoint?: (point: CollectionPoint) => void;
  onRadiusChange?: (newRadius: number) => void;
}

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): {
  degrees: number;
  direction: string;
} {
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  const normalized = (deg + 360) % 360;

  const directions = [
    'Norte',
    'Nordeste',
    'Leste',
    'Sudeste',
    'Sul',
    'Sudoeste',
    'Oeste',
    'Noroeste',
  ];
  const index = Math.round(normalized / 45) % 8;
  return {
    degrees: Math.round(normalized),
    direction: directions[index],
  };
}

export function SpatialRadarMap({
  centerLat,
  centerLng,
  radiusKm,
  points,
  selectedPointId,
  onSelectPoint,
  onScheduleAtPoint,
  onRadiusChange,
}: SpatialRadarMapProps) {
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  const viewSize = 360;
  const center = viewSize / 2;
  const maxPlotRadius = 140;
  const effectiveRadiusKm = Math.max(radiusKm, 1);

  const kmPerDegLat = 111.32;
  const kmPerDegLng = 111.32 * Math.cos((centerLat * Math.PI) / 180);

  const plottedPoints = points.map((pt, index) => {
    const dLatKm = (pt.latitude - centerLat) * kmPerDegLat;
    const dLngKm = (pt.longitude - centerLng) * kmPerDegLng;

    const rawX = center + (dLngKm / effectiveRadiusKm) * maxPlotRadius;
    const rawY = center - (dLatKm / effectiveRadiusKm) * maxPlotRadius;

    const clampedX = Math.max(24, Math.min(viewSize - 24, rawX));
    const clampedY = Math.max(24, Math.min(viewSize - 24, rawY));

    const bearing = calculateBearing(centerLat, centerLng, pt.latitude, pt.longitude);

    return {
      point: pt,
      index: index + 1,
      x: clampedX,
      y: clampedY,
      bearing,
    };
  });

  const activePointEntry =
    plottedPoints.find((p) => p.point.id === (hoveredPointId || selectedPointId)) ||
    plottedPoints[0] ||
    null;

  const innerRadiusLabel = (radiusKm * 0.33).toFixed(1);
  const midRadiusLabel = (radiusKm * 0.66).toFixed(1);
  const outerRadiusLabel = radiusKm.toFixed(0);

  return (
    <div className="radar-card">
      <div className="radar-header">
        <div>
          <h3>Radar Espacial de Proximidade</h3>
          <p className="text-muted">
            Centro: {centerLat.toFixed(4)}, {centerLng.toFixed(4)}
          </p>
        </div>
        {onRadiusChange && (
          <div className="radar-range-chips" aria-label="Ajustar raio de alcance">
            {[5, 10, 15, 25].map((r) => (
              <button
                key={r}
                type="button"
                className={`btn-range-chip ${radiusKm === r ? 'active' : ''}`}
                onClick={() => onRadiusChange(r)}
              >
                {r}km
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="radar-svg-wrapper">
        <svg
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="radar-svg"
          role="img"
          aria-label="Radar de mapeamento espacial dos pontos de entrega"
        >
          <defs>
            <radialGradient id="radarSweepGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(52, 211, 153, 0.25)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.0)" />
            </radialGradient>
          </defs>

          {/* Anéis de distância concêntricos */}
          <circle cx={center} cy={center} r={maxPlotRadius} className="radar-ring-outer" />
          <circle cx={center} cy={center} r={maxPlotRadius * 0.66} className="radar-ring-mid" />
          <circle cx={center} cy={center} r={maxPlotRadius * 0.33} className="radar-ring-inner" />

          {/* Linhas de grade e eixos cartesianos */}
          <line x1={center} y1={20} x2={center} y2={viewSize - 20} className="radar-axis" />
          <line x1={20} y1={center} x2={viewSize - 20} y2={center} className="radar-axis" />
          <line
            x1={center - maxPlotRadius * 0.707}
            y1={center - maxPlotRadius * 0.707}
            x2={center + maxPlotRadius * 0.707}
            y2={center + maxPlotRadius * 0.707}
            className="radar-axis-diagonal"
          />
          <line
            x1={center - maxPlotRadius * 0.707}
            y1={center + maxPlotRadius * 0.707}
            x2={center + maxPlotRadius * 0.707}
            y2={center - maxPlotRadius * 0.707}
            className="radar-axis-diagonal"
          />

          {/* Feixe rotativo de varredura ativa */}
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - maxPlotRadius}
            className="radar-sweep-scanner"
          />

          {/* Rótulos de orientação geográfica */}
          <text x={center} y={15} textAnchor="middle" className="radar-compass-text">
            N (Norte)
          </text>
          <text x={center} y={viewSize - 6} textAnchor="middle" className="radar-compass-text">
            S (Sul)
          </text>
          <text x={viewSize - 6} y={center + 4} textAnchor="end" className="radar-compass-text">
            L
          </text>
          <text x={6} y={center + 4} textAnchor="start" className="radar-compass-text">
            O
          </text>

          {/* Rótulos métricos de raio ao longo do eixo */}
          <text x={center + 4} y={center - maxPlotRadius * 0.33 + 10} className="radar-distance-text">
            {innerRadiusLabel} km
          </text>
          <text x={center + 4} y={center - maxPlotRadius * 0.66 + 10} className="radar-distance-text">
            {midRadiusLabel} km
          </text>
          <text x={center + 4} y={center - maxPlotRadius + 10} className="radar-distance-text">
            {outerRadiusLabel} km
          </text>

          {/* Marcador central da posição de busca */}
          <circle cx={center} cy={center} r={12} className="radar-origin-pulse" />
          <circle cx={center} cy={center} r={5} className="radar-origin-dot" />

          {/* Pontos de Coleta com índices numéricos legíveis e sem colisões de texto */}
          {plottedPoints.map(({ point, index, x, y }) => {
            const isSelected = point.id === selectedPointId;
            const isHovered = point.id === hoveredPointId;
            const isActive = isSelected || isHovered;

            return (
              <g
                key={point.id}
                className={`radar-marker-group ${isActive ? 'active' : ''}`}
                onClick={() => onSelectPoint(point)}
                onMouseEnter={() => setHoveredPointId(point.id)}
                onMouseLeave={() => setHoveredPointId(null)}
              >
                {isActive && (
                  <circle cx={x} cy={y} r={16} className="radar-marker-pulse" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 11 : 9}
                  className="radar-marker-circle"
                />
                <text x={x} y={y + 3.5} textAnchor="middle" className="radar-marker-number">
                  {index}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Painel Inspetor de Detalhes do Ponto Selecionado no Radar */}
      {activePointEntry ? (
        <div className="radar-inspector-card">
          <div className="inspector-title-row">
            <div className="inspector-badge">#{activePointEntry.index}</div>
            <div>
              <h4>{activePointEntry.point.name}</h4>
              <p className="inspector-bearing">
                <strong>{activePointEntry.point.distance_km?.toFixed(2) ?? '0.00'} km</strong>
                {' '}a {activePointEntry.bearing.direction} ({activePointEntry.bearing.degrees}°)
              </p>
            </div>
          </div>

          <p className="inspector-address">{activePointEntry.point.address}</p>

          <div className="inspector-meta-row">
            <span>Capacidade: <strong>{activePointEntry.point.max_daily_capacity} agendamentos/dia</strong></span>
          </div>

          <div className="category-tags mini">
            {activePointEntry.point.accepted_categories.map((cat) => (
              <span key={cat} className="category-pill">
                {WASTE_CATEGORY_LABELS[cat as WasteCategory] || cat}
              </span>
            ))}
          </div>

          <div className="inspector-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onSelectPoint(activePointEntry.point);
                const el = document.getElementById(`point-card-${activePointEntry.point.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              Destacar na Lista
            </button>
            {onScheduleAtPoint && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onScheduleAtPoint(activePointEntry.point)}
              >
                Agendar Neste Ponto
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="radar-empty-hint">
          Nenhum ponto dentro do raio de alcance. Amplie o raio para visualizar pontos.
        </div>
      )}
    </div>
  );
}
