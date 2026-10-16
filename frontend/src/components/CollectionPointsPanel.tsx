import { FormEvent, useState } from 'react';
import {
  ALL_WASTE_CATEGORIES,
  CollectionPoint,
  PaginationMeta,
  WASTE_CATEGORY_LABELS,
  WasteCategory,
} from '../api';
import { SpatialRadarMap } from './SpatialRadarMap';

interface CollectionPointsPanelProps {
  points: CollectionPoint[];
  meta: PaginationMeta;
  loading: boolean;
  lat: number;
  lng: number;
  radiusKm: number;
  category: string;
  onSearchChange: (params: {
    lat: number;
    lng: number;
    radiusKm: number;
    category: string;
    page?: number;
  }) => void;
  onLookupById: (id: string) => Promise<void>;
  onScheduleAtPoint: (point: CollectionPoint) => void;
  onEditPoint: (point: CollectionPoint) => void;
  onDeletePoint: (point: CollectionPoint) => Promise<void>;
  onOpenCreatePoint: () => void;
}

const LOCATION_PRESETS = [
  // Rio de Janeiro (RJ)
  { label: 'RJ: Taquara / Jacarepaguá', lat: -22.9231, lng: -43.3641 },
  { label: 'RJ: Madureira', lat: -22.8735, lng: -43.3392 },
  { label: 'RJ: Centro (Praça XV)', lat: -22.9028, lng: -43.1729 },
  { label: 'RJ: Copacabana', lat: -22.9691, lng: -43.1864 },
  { label: 'RJ: Barra da Tijuca', lat: -22.9922, lng: -43.3644 },

  // Rio Grande do Norte (RN)
  { label: 'RN: Parnamirim Centro', lat: -5.9156, lng: -35.2628 },
  { label: 'RN: Parnamirim (Cohabinal)', lat: -5.9221, lng: -35.2715 },
  { label: 'RN: Natal (Capim Macio)', lat: -5.8562, lng: -35.2078 },

  // São Paulo (SP)
  { label: 'SP: Centro (Sé)', lat: -23.55052, lng: -46.633308 },
  { label: 'SP: Pinheiros', lat: -23.5678, lng: -46.6845 },
  { label: 'SP: Santana', lat: -23.5042, lng: -46.6262 },

  // Outras Capitais
  { label: 'Belo Horizonte (MG)', lat: -19.9328, lng: -43.9378 },
  { label: 'Curitiba (PR)', lat: -25.4411, lng: -49.2789 },
  { label: 'Brasília (DF)', lat: -15.7989, lng: -47.8828 },
  { label: 'Salvador (BA)', lat: -13.0038, lng: -38.5284 },
  { label: 'Recife (PE)', lat: -8.1189, lng: -34.9036 },
];

export function CollectionPointsPanel({
  points,
  meta,
  loading,
  lat,
  lng,
  radiusKm,
  category,
  onSearchChange,
  onLookupById,
  onScheduleAtPoint,
  onEditPoint,
  onDeletePoint,
  onOpenCreatePoint,
}: CollectionPointsPanelProps) {
  const [latInput, setLatInput] = useState(String(lat));
  const [lngInput, setLngInput] = useState(String(lng));
  const [radiusInput, setRadiusInput] = useState(String(radiusKm));
  const [categoryInput, setCategoryInput] = useState(category);
  const [lookupId, setLookupId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();
    onSearchChange({
      lat: Number(latInput),
      lng: Number(lngInput),
      radiusKm: Number(radiusInput),
      category: categoryInput,
      page: 1,
    });
  }

  function applyPreset(presetLat: number, presetLng: number) {
    setLatInput(String(presetLat));
    setLngInput(String(presetLng));
    onSearchChange({
      lat: presetLat,
      lng: presetLng,
      radiusKm: Number(radiusInput) || 15,
      category: categoryInput,
      page: 1,
    });
  }

  function handleUseBrowserGeolocation() {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = Number(pos.coords.latitude.toFixed(6));
        const currentLng = Number(pos.coords.longitude.toFixed(6));
        applyPreset(currentLat, currentLng);
      },
      (err) => {
        alert(
          `Não foi possível obter a localização do dispositivo (${err.message}). Selecione um dos botões de coordenadas rápidas (RJ, RN, SP, etc.) ou digite as coordenadas manualmente.`
        );
      }
    );
  }

  async function handleLookupSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lookupId.trim()) {
      return;
    }
    await onLookupById(lookupId.trim());
  }

  function handleRadiusChange(newRadius: number) {
    setRadiusInput(String(newRadius));
    onSearchChange({
      lat: Number(latInput),
      lng: Number(lngInput),
      radiusKm: newRadius,
      category: categoryInput,
      page: 1,
    });
  }

  return (
    <section className="panel-section">
      <div className="card filter-card">
        <div className="card-header-row">
          <div>
            <h2>Busca de Pontos de Coleta</h2>
            <p className="text-muted">
              Localize pontos de coleta autorizados por coordenadas geográficas, raio de busca e categoria de resíduo.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onOpenCreatePoint}>
            + Novo Ponto de Coleta
          </button>
        </div>

        <div className="presets-bar">
          <span className="presets-label">Coordenadas rápidas (SP):</span>
          {LOCATION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className="btn btn-chip"
              onClick={() => applyPreset(preset.lat, preset.lng)}
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-chip btn-chip-accent"
            onClick={handleUseBrowserGeolocation}
          >
            Usar GPS do Navegador
          </button>
        </div>

        <form className="search-grid-form" onSubmit={handleFilterSubmit}>
          <div className="form-field">
            <label htmlFor="search-lat">Latitude</label>
            <input
              id="search-lat"
              type="number"
              step="any"
              required
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="search-lng">Longitude</label>
            <input
              id="search-lng"
              type="number"
              step="any"
              required
              value={lngInput}
              onChange={(e) => setLngInput(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="search-radius">Raio de Busca (km)</label>
            <input
              id="search-radius"
              type="number"
              step="0.5"
              min="0.5"
              max="100"
              required
              value={radiusInput}
              onChange={(e) => setRadiusInput(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="search-category">Categoria de E-Waste</label>
            <select
              id="search-category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {ALL_WASTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {WASTE_CATEGORY_LABELS[cat]} ({cat})
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions-inline">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar no Raio'}
            </button>
          </div>
        </form>

        <form className="lookup-bar" onSubmit={handleLookupSubmit}>
          <label htmlFor="lookup-point-id">Buscar ponto por código identificador (ID):</label>
          <input
            id="lookup-point-id"
            type="text"
            placeholder="Informe o identificador da unidade (ex: 7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4)"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary btn-sm">
            Consultar ID
          </button>
        </form>
      </div>

      <div className="explorer-split-layout">
        <SpatialRadarMap
          centerLat={lat}
          centerLng={lng}
          radiusKm={radiusKm}
          points={points}
          selectedPointId={selectedPointId}
          onSelectPoint={(pt) => setSelectedPointId(pt.id)}
          onScheduleAtPoint={onScheduleAtPoint}
          onRadiusChange={handleRadiusChange}
        />

        <div className="points-list-column">
          <div className="list-summary-bar">
            <span>
              Exibindo <strong>{points.length}</strong> de <strong>{meta.total_items}</strong> ponto(s) homologado(s)
            </span>
            {meta.total_pages > 1 && (
              <div className="pagination-controls">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={meta.page <= 1 || loading}
                  onClick={() =>
                    onSearchChange({
                      lat,
                      lng,
                      radiusKm,
                      category,
                      page: meta.page - 1,
                    })
                  }
                >
                  Anterior
                </button>
                <span>
                  Página {meta.page} de {meta.total_pages}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={meta.page >= meta.total_pages || loading}
                  onClick={() =>
                    onSearchChange({
                      lat,
                      lng,
                      radiusKm,
                      category,
                      page: meta.page + 1,
                    })
                  }
                >
                  Próxima
                </button>
              </div>
            )}
          </div>

          {points.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum ponto de coleta homologado encontrado em um raio de {radiusKm} km.</p>
              <div className="empty-state-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setRadiusInput('50');
                    setCategoryInput('');
                    onSearchChange({ lat, lng, radiusKm: 50, category: '', page: 1 });
                  }}
                >
                  Expandir Raio para 50 km
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setRadiusInput('250');
                    setCategoryInput('');
                    onSearchChange({ lat, lng, radiusKm: 250, category: '', page: 1 });
                  }}
                >
                  Buscar em Raio Regional (250 km)
                </button>
              </div>
            </div>
          ) : (
            <div className="points-cards-stack">
              {points.map((point, idx) => {
                const isSelected = point.id === selectedPointId;
                const pointIndex = idx + 1;
                return (
                  <article
                    key={point.id}
                    id={`point-card-${point.id}`}
                    className={`point-card ${isSelected ? 'point-card-selected' : ''}`}
                    onClick={() => setSelectedPointId(point.id)}
                  >
                    <div className="point-card-top">
                      <div className="point-title-group">
                        <span className="point-index-badge">#{pointIndex}</span>
                        <div>
                          <h3>{point.name}</h3>
                          <p className="point-address">{point.address}</p>
                        </div>
                      </div>
                      <div className="point-badges">
                        {point.distance_km !== undefined && (
                          <span className="badge badge-distance">
                            {point.distance_km.toFixed(2)} km
                          </span>
                        )}
                        <span className="badge badge-capacity">
                          Cap. {point.max_daily_capacity}/dia
                        </span>
                      </div>
                    </div>

                    <div className="point-meta-row">
                      <span>
                        Coordenadas: <code>{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</code>
                      </span>
                      <span>
                        Identificador: <code>{point.id}</code>
                      </span>
                    </div>

                    <div className="category-tags">
                      {point.accepted_categories.map((cat) => (
                        <span key={cat} className="category-pill">
                          {WASTE_CATEGORY_LABELS[cat as WasteCategory] || cat}
                        </span>
                      ))}
                    </div>

                    <div className="point-card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onScheduleAtPoint(point)}
                      >
                        Agendar Descarte Aqui
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditPoint(point)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeletePoint(point)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
