import { FormEvent, useEffect, useState } from 'react';
import {
  ALL_WASTE_CATEGORIES,
  CollectionPoint,
  PaginationMeta,
  WASTE_CATEGORY_LABELS,
  WasteCategory,
} from '../api';
import { BRAZILIAN_CAPITALS, lookupCepLocation } from '../geocoding';
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

type SearchMode = 'cep' | 'capital';

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
  // Estado dos filtros
  const [latInput, setLatInput] = useState(String(lat));
  const [lngInput, setLngInput] = useState(String(lng));
  const [radiusInput, setRadiusInput] = useState(String(radiusKm));
  const [categoryInput, setCategoryInput] = useState(category);
  const [lookupId, setLookupId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Modo de busca
  const [searchMode, setSearchMode] = useState<SearchMode>('cep');

  // Busca por CEP
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepFeedback, setCepFeedback] = useState<{ text: string; isError: boolean } | null>(null);
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('Rio de Janeiro - RJ (Taquara)');

  // Busca por Capital e Bairro
  const [selectedCapitalUf, setSelectedCapitalUf] = useState('RJ');
  const [selectedBairro, setSelectedBairro] = useState('Taquara / Jacarepaguá');

  // Sincroniza parâmetros quando alterados externamente
  useEffect(() => {
    setLatInput(String(lat));
    setLngInput(String(lng));
    setRadiusInput(String(radiusKm));
  }, [lat, lng, radiusKm]);

  // Capital atualmente selecionada
  const currentCapital =
    BRAZILIAN_CAPITALS.find((c) => c.uf === selectedCapitalUf) || BRAZILIAN_CAPITALS[0];
  const availableBairros = currentCapital.bairros || [];

  // Regiões para optgroup
  const regions: Array<'Sudeste' | 'Sul' | 'Centro-Oeste' | 'Nordeste' | 'Norte'> = [
    'Sudeste',
    'Sul',
    'Centro-Oeste',
    'Nordeste',
    'Norte',
  ];

  function handleCapitalChange(newUf: string) {
    setSelectedCapitalUf(newUf);
    const capital = BRAZILIAN_CAPITALS.find((c) => c.uf === newUf);
    if (capital && capital.bairros && capital.bairros.length > 0) {
      setSelectedBairro(capital.bairros[0].nome);
    } else {
      setSelectedBairro('');
    }
  }

  function handleCepInputChange(rawVal: string) {
    let clean = rawVal.replace(/[^\d-]/g, '');
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 5) {
      clean = `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    } else {
      clean = digits;
    }
    setCepInput(clean);
    setCepFeedback(null);

    // Auto-pesquisa aos 8 dígitos
    if (digits.length === 8) {
      void executeCepLookup(digits);
    }
  }

  async function executeCepLookup(eightDigits: string) {
    setCepLoading(true);
    setCepFeedback(null);
    try {
      const geoResult = await lookupCepLocation(eightDigits);
      setLatInput(String(geoResult.lat));
      setLngInput(String(geoResult.lng));
      setActiveLocationLabel(geoResult.label);
      setCepFeedback({ text: geoResult.label, isError: false });

      onSearchChange({
        lat: geoResult.lat,
        lng: geoResult.lng,
        radiusKm: Number(radiusInput) || 25,
        category: categoryInput,
        page: 1,
      });
    } catch (err) {
      setCepFeedback({
        text: err instanceof Error ? err.message : 'CEP não localizado.',
        isError: true,
      });
    } finally {
      setCepLoading(false);
    }
  }

  function handleSearchByCepClick() {
    const digits = cepInput.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepFeedback({
        text: 'Informe um CEP válido com 8 dígitos (ex: 22775-055).',
        isError: true,
      });
      return;
    }
    void executeCepLookup(digits);
  }

  function handleApplyCapitalNeighborhood() {
    if (!currentCapital) return;
    const targetBairro =
      availableBairros.find((b) => b.nome === selectedBairro) || availableBairros[0];

    const targetLat = targetBairro ? targetBairro.lat : currentCapital.lat;
    const targetLng = targetBairro ? targetBairro.lng : currentCapital.lng;
    const label = targetBairro
      ? `${targetBairro.nome}, ${currentCapital.cidade} - ${currentCapital.uf}`
      : `${currentCapital.cidade} - ${currentCapital.uf}`;

    setLatInput(String(targetLat));
    setLngInput(String(targetLng));
    setActiveLocationLabel(label);
    setCepFeedback({ text: label, isError: false });

    onSearchChange({
      lat: targetLat,
      lng: targetLng,
      radiusKm: Number(radiusInput) || 25,
      category: categoryInput,
      page: 1,
    });
  }

  function handleQuickCapital(capital: (typeof BRAZILIAN_CAPITALS)[0]) {
    setSelectedCapitalUf(capital.uf);
    const firstBairro = capital.bairros && capital.bairros.length > 0 ? capital.bairros[0] : null;
    const targetLat = firstBairro ? firstBairro.lat : capital.lat;
    const targetLng = firstBairro ? firstBairro.lng : capital.lng;
    const label = firstBairro
      ? `${firstBairro.nome}, ${capital.cidade} - ${capital.uf}`
      : `${capital.cidade} - ${capital.uf}`;

    if (firstBairro) {
      setSelectedBairro(firstBairro.nome);
    }

    setLatInput(String(targetLat));
    setLngInput(String(targetLng));
    setActiveLocationLabel(label);
    setCepFeedback({ text: label, isError: false });

    onSearchChange({
      lat: targetLat,
      lng: targetLng,
      radiusKm: Number(radiusInput) || 25,
      category: categoryInput,
      page: 1,
    });
  }

  function handleUseBrowserGeolocation() {
    if (!('geolocation' in navigator)) {
      alert('Geolocalização não suportada neste dispositivo.');
      return;
    }
    setCepLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCepLoading(false);
        const currentLat = Number(pos.coords.latitude.toFixed(6));
        const currentLng = Number(pos.coords.longitude.toFixed(6));
        setLatInput(String(currentLat));
        setLngInput(String(currentLng));
        const label = `GPS Atual (${currentLat}, ${currentLng})`;
        setActiveLocationLabel(label);
        setCepFeedback({ text: 'Posição obtida com sucesso via GPS.', isError: false });

        onSearchChange({
          lat: currentLat,
          lng: currentLng,
          radiusKm: Number(radiusInput) || 25,
          category: categoryInput,
          page: 1,
        });
      },
      (err) => {
        setCepLoading(false);
        alert(`Não foi possível obter o GPS (${err.message}). Utilize a busca por CEP ou Capital.`);
      }
    );
  }

  function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();
    onSearchChange({
      lat: Number(latInput),
      lng: Number(lngInput),
      radiusKm: Number(radiusInput) || 25,
      category: categoryInput,
      page: 1,
    });
  }

  function applyRadius(newRadius: number) {
    setRadiusInput(String(newRadius));
    onSearchChange({
      lat: Number(latInput),
      lng: Number(lngInput),
      radiusKm: newRadius,
      category: categoryInput,
      page: 1,
    });
  }

  async function handleLookupSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lookupId.trim()) {
      return;
    }
    await onLookupById(lookupId.trim());
  }

  return (
    <section className="panel-section">
      <div className="card search-console-card">
        {/* Cabeçalho do Console */}
        <div className="search-console-header">
          <div>
            <h2>Localizador de Pontos de Coleta</h2>
            <p className="text-muted">
              Encontre ecopontos homologados por CEP, capital brasileira ou coordenadas no mapa.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onOpenCreatePoint}>
            + Cadastrar Ponto
          </button>
        </div>

        {/* Barra Unificada de Localização */}
        <div className="location-toolbar">
          <div className="mode-segmented-tabs">
            <button
              type="button"
              className={`segmented-tab ${searchMode === 'cep' ? 'active' : ''}`}
              onClick={() => setSearchMode('cep')}
            >
              Buscar por CEP
            </button>
            <button
              type="button"
              className={`segmented-tab ${searchMode === 'capital' ? 'active' : ''}`}
              onClick={() => setSearchMode('capital')}
            >
              Capitais do Brasil (27)
            </button>
            <button
              type="button"
              className="segmented-tab gps-tab"
              onClick={handleUseBrowserGeolocation}
              disabled={cepLoading}
            >
              Usar GPS
            </button>
          </div>

          {searchMode === 'cep' ? (
            <div className="cep-search-toolbar">
              <div className="cep-input-inline-wrap">
                <input
                  id="cep-search-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="Informe seu CEP (ex: 22775-055)"
                  value={cepInput}
                  onChange={(e) => handleCepInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchByCepClick();
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn btn-primary btn-search-cep"
                  onClick={handleSearchByCepClick}
                  disabled={cepLoading}
                >
                  {cepLoading ? 'Buscando...' : 'Localizar'}
                </button>
              </div>

              {cepFeedback && (
                <div
                  className={`inline-status-badge ${
                    cepFeedback.isError ? 'status-error' : 'status-success'
                  }`}
                >
                  {cepFeedback.isError ? '!' : '✓'} {cepFeedback.text}
                </div>
              )}
            </div>
          ) : (
            <div className="capital-selector-toolbar">
              <div className="capital-select-wrapper">
                <label htmlFor="capital-select-input" className="select-inline-label">
                  Capital:
                </label>
                <select
                  id="capital-select-input"
                  value={selectedCapitalUf}
                  onChange={(e) => handleCapitalChange(e.target.value)}
                >
                  {regions.map((reg) => (
                    <optgroup key={reg} label={`Região ${reg}`}>
                      {BRAZILIAN_CAPITALS.filter((c) => c.regiao === reg).map((cap) => (
                        <option key={cap.uf} value={cap.uf}>
                          {cap.cidade} ({cap.uf})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {availableBairros.length > 0 && (
                <div className="bairro-select-wrapper">
                  <label htmlFor="bairro-select-input" className="select-inline-label">
                    Região:
                  </label>
                  <select
                    id="bairro-select-input"
                    value={selectedBairro}
                    onChange={(e) => setSelectedBairro(e.target.value)}
                  >
                    {availableBairros.map((b) => (
                      <option key={b.nome} value={b.nome}>
                        {b.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="button"
                className="btn btn-secondary btn-apply-capital"
                onClick={handleApplyCapitalNeighborhood}
              >
                Localizar
              </button>
            </div>
          )}
        </div>

        {/* Atalhos Rápidos para Principais Polos */}
        <div className="capitals-quick-row">
          <span className="quick-row-label">Acesso Rápido:</span>
          {BRAZILIAN_CAPITALS.filter((c) =>
            ['RJ', 'SP', 'DF', 'MG', 'BA', 'PR', 'RS', 'PE', 'CE', 'AM'].includes(c.uf)
          ).map((cap) => (
            <button
              key={cap.uf}
              type="button"
              className={`btn btn-chip btn-sm ${
                selectedCapitalUf === cap.uf && activeLocationLabel.includes(cap.cidade)
                  ? 'btn-chip-active'
                  : ''
              }`}
              onClick={() => handleQuickCapital(cap)}
            >
              {cap.cidade} ({cap.uf})
            </button>
          ))}
        </div>

        {/* Barra de Filtros de Apoio e Localização Ativa */}
        <form className="console-filters-bar" onSubmit={handleFilterSubmit}>
          <div className="active-pill-box">
            <span className="pill-dot" />
            <span className="pill-location-text">{activeLocationLabel}</span>
            <span className="pill-count-badge">
              <strong>{points.length}</strong> no raio de {radiusInput} km
            </span>
          </div>

          <div className="filter-controls-group">
            <div className="radius-compact-control">
              <span className="control-label">Raio:</span>
              <div className="radius-chips-mini">
                {[15, 25, 50, 100, 250].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`btn-chip-mini ${
                      Number(radiusInput) === r ? 'active' : ''
                    }`}
                    onClick={() => applyRadius(r)}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>

            <div className="category-compact-control">
              <select
                id="search-category"
                aria-label="Filtrar por Categoria"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
              >
                <option value="">Todas as categorias de resíduos</option>
                {ALL_WASTE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {WASTE_CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-secondary btn-sm" disabled={loading}>
              {loading ? 'Filtrando...' : 'Atualizar'}
            </button>
          </div>
        </form>

        {/* Opções Técnicas Avançadas (recolhidas em uma linha discreta) */}
        <details className="technical-options-details">
          <summary>Ajuste Manual de Coordenadas e Consulta por Código ID</summary>
          <div className="technical-options-body">
            <div className="manual-coords-row">
              <div className="field-group">
                <label htmlFor="search-lat">Latitude</label>
                <input
                  id="search-lat"
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="search-lng">Longitude</label>
                <input
                  id="search-lng"
                  type="number"
                  step="any"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  onSearchChange({
                    lat: Number(latInput),
                    lng: Number(lngInput),
                    radiusKm: Number(radiusInput) || 25,
                    category: categoryInput,
                    page: 1,
                  });
                  setActiveLocationLabel(`Coordenadas manuais (${latInput}, ${lngInput})`);
                }}
              >
                Aplicar Lat/Lng
              </button>
            </div>

            <div className="uuid-search-row">
              <label htmlFor="lookup-point-id">Consultar por ID:</label>
              <input
                id="lookup-point-id"
                type="text"
                placeholder="Informe o identificador UUID da unidade..."
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleLookupSubmit}
              >
                Consultar
              </button>
            </div>
          </div>
        </details>
      </div>

      {/* Grid Principal: Radar Espacial à Esquerda + Lista de Ecopontos à Direita */}
      <div className="explorer-split-layout">
        <SpatialRadarMap
          centerLat={lat}
          centerLng={lng}
          radiusKm={radiusKm}
          points={points}
          selectedPointId={selectedPointId}
          onSelectPoint={(pt) => setSelectedPointId(pt.id)}
          onScheduleAtPoint={onScheduleAtPoint}
          onRadiusChange={applyRadius}
        />

        <div className="points-list-column">
          <div className="list-summary-bar">
            <span>
              Exibindo <strong>{points.length}</strong> de <strong>{meta.total_items}</strong> ecoponto(s) homologado(s)
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
                  onClick={() => applyRadius(50)}
                >
                  Expandir Raio para 50 km
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => applyRadius(250)}
                >
                  Buscar em Raio Regional (250 km)
                </button>
                <button
                  type="button"
                  className="btn btn-chip btn-sm"
                  onClick={() => {
                    const rj = BRAZILIAN_CAPITALS.find((c) => c.uf === 'RJ');
                    if (rj) handleQuickCapital(rj);
                  }}
                >
                  Ver Ecopontos no Rio de Janeiro
                </button>
                <button
                  type="button"
                  className="btn btn-chip btn-sm"
                  onClick={() => {
                    const sp = BRAZILIAN_CAPITALS.find((c) => c.uf === 'SP');
                    if (sp) handleQuickCapital(sp);
                  }}
                >
                  Ver Ecopontos em São Paulo
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
