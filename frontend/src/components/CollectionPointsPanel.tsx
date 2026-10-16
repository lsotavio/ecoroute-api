import { FormEvent, useEffect, useState } from 'react';
import {
  ALL_WASTE_CATEGORIES,
  CollectionPoint,
  PaginationMeta,
  WASTE_CATEGORY_LABELS,
  WasteCategory,
} from '../api';
import { POPULAR_LOCATIONS, lookupCepLocation } from '../geocoding';
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
  // Coordenadas internas e filtros
  const [latInput, setLatInput] = useState(String(lat));
  const [lngInput, setLngInput] = useState(String(lng));
  const [radiusInput, setRadiusInput] = useState(String(radiusKm));
  const [categoryInput, setCategoryInput] = useState(category);
  const [lookupId, setLookupId] = useState('');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Localização brasileira para usuário final
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatusMessage, setCepStatusMessage] = useState<string | null>(null);
  const [cepStatusType, setCepStatusType] = useState<'success' | 'error' | null>(null);
  const [activeLocationLabel, setActiveLocationLabel] = useState<string>('Rio de Janeiro - RJ (Taquara)');

  // Seleção hierárquica por Estado / Cidade / Bairro
  const [selectedUf, setSelectedUf] = useState('RJ');
  const [selectedCity, setSelectedCity] = useState('Rio de Janeiro');
  const [selectedBairro, setSelectedBairro] = useState('Taquara / Jacarepaguá');

  // Mantém os campos de entrada sincronizados quando as props mudam
  useEffect(() => {
    setLatInput(String(lat));
    setLngInput(String(lng));
    setRadiusInput(String(radiusKm));
  }, [lat, lng, radiusKm]);

  // Lista de UFs disponíveis nas localidades pré-mapeadas
  const availableUfs = Array.from(new Set(POPULAR_LOCATIONS.map((loc) => loc.uf)));

  // Cidades do Estado selecionado
  const availableCities = POPULAR_LOCATIONS.filter((loc) => loc.uf === selectedUf);

  // Bairros da Cidade selecionada
  const currentCityOption =
    availableCities.find((c) => c.cidade === selectedCity) || availableCities[0];
  const availableBairros = currentCityOption ? currentCityOption.bairros : [];

  function handleUfChange(newUf: string) {
    setSelectedUf(newUf);
    const citiesForUf = POPULAR_LOCATIONS.filter((loc) => loc.uf === newUf);
    if (citiesForUf.length > 0) {
      setSelectedCity(citiesForUf[0].cidade);
      if (citiesForUf[0].bairros.length > 0) {
        setSelectedBairro(citiesForUf[0].bairros[0].nome);
      }
    }
  }

  function handleCityChange(newCity: string) {
    setSelectedCity(newCity);
    const cityOpt = availableCities.find((c) => c.cidade === newCity);
    if (cityOpt && cityOpt.bairros.length > 0) {
      setSelectedBairro(cityOpt.bairros[0].nome);
    }
  }

  function handleCepInputChange(rawVal: string) {
    // Permite apenas dígitos e hífen
    let clean = rawVal.replace(/[^\d-]/g, '');
    const digits = clean.replace(/\D/g, '');
    if (digits.length > 5) {
      clean = `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
    } else {
      clean = digits;
    }
    setCepInput(clean);
    setCepStatusMessage(null);

    // Auto-pesquisa se atingiu 8 dígitos completos
    if (digits.length === 8) {
      void executeCepLookup(digits);
    }
  }

  async function executeCepLookup(eightDigits: string) {
    setCepLoading(true);
    setCepStatusMessage(null);
    try {
      const geoResult = await lookupCepLocation(eightDigits);
      setLatInput(String(geoResult.lat));
      setLngInput(String(geoResult.lng));
      setActiveLocationLabel(geoResult.label);
      setCepStatusMessage(geoResult.label);
      setCepStatusType('success');

      // Executa busca imediata na API com os ecopontos do raio
      onSearchChange({
        lat: geoResult.lat,
        lng: geoResult.lng,
        radiusKm: Number(radiusInput) || 25,
        category: categoryInput,
        page: 1,
      });
    } catch (err) {
      setCepStatusMessage(
        err instanceof Error ? err.message : 'Não foi possível localizar o CEP informado.'
      );
      setCepStatusType('error');
    } finally {
      setCepLoading(false);
    }
  }

  function handleSearchByCepClick() {
    const digits = cepInput.replace(/\D/g, '');
    if (digits.length !== 8) {
      setCepStatusMessage('Informe um CEP válido contendo exatamente 8 dígitos (ex: 22775-055).');
      setCepStatusType('error');
      return;
    }
    void executeCepLookup(digits);
  }

  function handleApplyCityNeighborhood() {
    if (!currentCityOption) return;
    const targetBairro =
      currentCityOption.bairros.find((b) => b.nome === selectedBairro) ||
      currentCityOption.bairros[0];

    if (targetBairro) {
      setLatInput(String(targetBairro.lat));
      setLngInput(String(targetBairro.lng));
      const label = `${targetBairro.nome}, ${selectedCity} - ${selectedUf}`;
      setActiveLocationLabel(label);
      setCepStatusMessage(`Localização definida para: ${label}`);
      setCepStatusType('success');

      onSearchChange({
        lat: targetBairro.lat,
        lng: targetBairro.lng,
        radiusKm: Number(radiusInput) || 25,
        category: categoryInput,
        page: 1,
      });
    }
  }

  function handleQuickLocation(
    uf: string,
    cidade: string,
    bairro: string,
    targetLat: number,
    targetLng: number
  ) {
    setSelectedUf(uf);
    setSelectedCity(cidade);
    setSelectedBairro(bairro);
    setLatInput(String(targetLat));
    setLngInput(String(targetLng));
    const label = `${bairro}, ${cidade} - ${uf}`;
    setActiveLocationLabel(label);
    setCepStatusMessage(`Localização definida para: ${label}`);
    setCepStatusType('success');

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
      alert('Geolocalização não suportada neste navegador.');
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
        const label = `GPS do Dispositivo (${currentLat}, ${currentLng})`;
        setActiveLocationLabel(label);
        setCepStatusMessage('Posição obtida com sucesso via GPS do dispositivo.');
        setCepStatusType('success');

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
        alert(
          `Não foi possível obter a localização do dispositivo (${err.message}). Por favor, informe seu CEP ou selecione sua cidade/bairro.`
        );
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
      <div className="card filter-card location-search-card">
        <div className="card-header-row">
          <div>
            <h2>Pontos de Coleta e Descarte de Resíduos</h2>
            <p className="text-muted">
              Localize ecopontos homologados informando seu CEP, sua cidade ou utilizando o GPS do seu dispositivo.
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={onOpenCreatePoint}>
            + Novo Ponto de Coleta
          </button>
        </div>

        {/* Bloco Principal de Localização Brasileira (CEP / Cidade / Bairro) */}
        <div className="location-inputs-grid">
          {/* Opção 1: Busca por CEP */}
          <div className="location-method-box">
            <label htmlFor="cep-search-input" className="location-method-title">
              <span className="location-icon">📮</span> Busca por CEP
            </label>
            <div className="cep-input-group">
              <input
                id="cep-search-input"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="Ex: 22775-055"
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
                className="btn btn-primary"
                onClick={handleSearchByCepClick}
                disabled={cepLoading}
              >
                {cepLoading ? 'Buscando...' : 'Localizar CEP'}
              </button>
            </div>
            <span className="location-help-text">
              Digite os 8 dígitos do seu CEP (ex: 22775-055 no RJ ou 59151-250 no RN).
            </span>
          </div>

          {/* Opção 2: Seleção por Estado, Cidade e Bairro */}
          <div className="location-method-box">
            <span className="location-method-title">
              <span className="location-icon">🏙️</span> Selecionar Estado, Cidade e Bairro
            </span>
            <div className="city-select-group">
              <select
                aria-label="Estado"
                value={selectedUf}
                onChange={(e) => handleUfChange(e.target.value)}
              >
                {availableUfs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>

              <select
                aria-label="Cidade"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                {availableCities.map((city) => (
                  <option key={city.cidade} value={city.cidade}>
                    {city.cidade}
                  </option>
                ))}
              </select>

              <select
                aria-label="Bairro"
                value={selectedBairro}
                onChange={(e) => setSelectedBairro(e.target.value)}
              >
                {availableBairros.map((b) => (
                  <option key={b.nome} value={b.nome}>
                    {b.nome}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleApplyCityNeighborhood}
              >
                Ir para Região
              </button>
            </div>
            <span className="location-help-text">
              Centraliza o radar e a lista de ecopontos na sua região administrativa.
            </span>
          </div>
        </div>

        {/* Feedback visual de resolução do CEP ou Bairro */}
        {cepStatusMessage && (
          <div
            className={`cep-status-banner ${
              cepStatusType === 'error' ? 'cep-status-error' : 'cep-status-success'
            }`}
          >
            <span>{cepStatusType === 'error' ? '⚠️ ' : '📍 '}</span>
            <span>{cepStatusMessage}</span>
          </div>
        )}

        {/* Barra de Atalhos Rápidos para Teste Imediato */}
        <div className="presets-bar">
          <span className="presets-label">Cidades em Destaque:</span>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('RJ', 'Rio de Janeiro', 'Taquara / Jacarepaguá', -22.9231, -43.3641)
            }
          >
            Rio de Janeiro (RJ)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('RN', 'Parnamirim', 'Centro', -5.9156, -35.2628)
            }
          >
            Parnamirim (RN)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('RN', 'Natal', 'Capim Macio', -5.8562, -35.2078)
            }
          >
            Natal (RN)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('SP', 'São Paulo', 'Centro (Sé)', -23.55052, -46.633308)
            }
          >
            São Paulo (SP)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('MG', 'Belo Horizonte', 'Savassi / Centro', -19.9328, -43.9378)
            }
          >
            Belo Horizonte (MG)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('PR', 'Curitiba', 'Batel / Central', -25.4411, -49.2789)
            }
          >
            Curitiba (PR)
          </button>
          <button
            type="button"
            className="btn btn-chip"
            onClick={() =>
              handleQuickLocation('DF', 'Brasília', 'Asa Sul', -15.7989, -47.8828)
            }
          >
            Brasília (DF)
          </button>
          <button
            type="button"
            className="btn btn-chip btn-chip-accent"
            onClick={handleUseBrowserGeolocation}
          >
            Usar Meu GPS
          </button>
        </div>

        {/* Banner de Localização Ativa */}
        <div className="active-location-banner">
          <div className="active-location-info">
            <span className="active-badge">Epicentro de Busca</span>
            <strong className="active-name">{activeLocationLabel}</strong>
          </div>
          <div className="active-location-meta">
            <span>Raio Atual: <strong>{radiusInput} km</strong></span>
            <span className="bullet-sep">•</span>
            <span><strong>{points.length}</strong> ecoponto(s) homologado(s)</span>
          </div>
        </div>

        {/* Filtros Secundários: Raio e Categoria */}
        <form className="secondary-filters-form" onSubmit={handleFilterSubmit}>
          <div className="form-field-radius">
            <label htmlFor="search-radius">Raio de Busca (km)</label>
            <div className="radius-input-wrapper">
              <input
                id="search-radius"
                type="number"
                min="1"
                max="1000"
                step="1"
                required
                value={radiusInput}
                onChange={(e) => setRadiusInput(e.target.value)}
              />
              <span className="radius-unit">km</span>
            </div>
            <div className="radius-quick-chips">
              {[15, 25, 50, 100, 250].map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`btn btn-chip btn-sm ${
                    Number(radiusInput) === r ? 'btn-chip-active' : ''
                  }`}
                  onClick={() => applyRadius(r)}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <div className="form-field-category">
            <label htmlFor="search-category">Filtrar por Categoria de Resíduo</label>
            <select
              id="search-category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
              <option value="">Todas as categorias</option>
              {ALL_WASTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {WASTE_CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-actions-inline">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Filtros'}
            </button>
          </div>
        </form>

        {/* Opções Técnicas Avançadas (Coordenadas Manuais) recolhidas */}
        <details className="advanced-coordinates-accordion">
          <summary>Opções Avançadas: Ajustar Coordenadas Geográficas Manuais (Latitude / Longitude)</summary>
          <div className="advanced-coordinates-body">
            <p className="text-muted">
              As coordenadas são sincronizadas automaticamente ao buscar por CEP ou cidade. Use estes campos apenas caso queira especificar coordenadas geográficas manuais.
            </p>
            <div className="advanced-coords-grid">
              <div className="form-field">
                <label htmlFor="search-lat">Latitude (-90 a 90)</label>
                <input
                  id="search-lat"
                  type="number"
                  step="any"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="search-lng">Longitude (-180 a 180)</label>
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
                className="btn btn-secondary"
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
                Aplicar Coordenadas
              </button>
            </div>
          </div>
        </details>

        {/* Consulta Direta por Identificador */}
        <form className="lookup-bar" onSubmit={handleLookupSubmit}>
          <label htmlFor="lookup-point-id">Consultar ecoponto específico por código identificador (ID):</label>
          <input
            id="lookup-point-id"
            type="text"
            placeholder="Informe o identificador da unidade (ex: 3c4d5e6f-789a-4bc1-9012-3456789abcde)"
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
                  onClick={() =>
                    handleQuickLocation('RJ', 'Rio de Janeiro', 'Taquara / Jacarepaguá', -22.9231, -43.3641)
                  }
                >
                  Ver Ecopontos no Rio de Janeiro
                </button>
                <button
                  type="button"
                  className="btn btn-chip btn-sm"
                  onClick={() =>
                    handleQuickLocation('RN', 'Parnamirim', 'Centro', -5.9156, -35.2628)
                  }
                >
                  Ver Ecopontos em Parnamirim/RN
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
