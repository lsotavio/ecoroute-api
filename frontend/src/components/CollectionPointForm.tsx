import { FormEvent, useEffect, useState } from 'react';
import {
  ALL_WASTE_CATEGORIES,
  CollectionPoint,
  CreatePointPayload,
  WASTE_CATEGORY_LABELS,
  WasteCategory,
} from '../api';

interface CollectionPointFormProps {
  editingPoint: CollectionPoint | null;
  submitting: boolean;
  onSubmit: (payload: CreatePointPayload, editingId?: string) => Promise<void>;
  onCancel: () => void;
}

export function CollectionPointForm({
  editingPoint,
  submitting,
  onSubmit,
  onCancel,
}: CollectionPointFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('-23.5614');
  const [longitude, setLongitude] = useState('-46.6559');
  const [maxDailyCapacity, setMaxDailyCapacity] = useState('25');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'BATTERIES',
    'COMPUTERS',
  ]);

  useEffect(() => {
    if (editingPoint) {
      setName(editingPoint.name);
      setAddress(editingPoint.address);
      setLatitude(String(editingPoint.latitude));
      setLongitude(String(editingPoint.longitude));
      setMaxDailyCapacity(String(editingPoint.max_daily_capacity));
      setSelectedCategories(editingPoint.accepted_categories);
    } else {
      setName('');
      setAddress('');
      setLatitude('-23.5614');
      setLongitude('-46.6559');
      setMaxDailyCapacity('25');
      setSelectedCategories(['BATTERIES', 'COMPUTERS']);
    }
  }, [editingPoint]);

  function toggleCategory(cat: WasteCategory) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit(
      {
        name: name.trim(),
        address: address.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        accepted_categories: selectedCategories,
        max_daily_capacity: Number(maxDailyCapacity),
      },
      editingPoint?.id
    );
  }

  return (
    <section className="panel-section">
      <div className="card form-container-card">
        <div className="card-header-row">
          <div>
            <h2>
              {editingPoint
                ? `Atualizar Ponto de Coleta (${editingPoint.name})`
                : 'Cadastrar Novo Ponto de Coleta (PEV)'}
            </h2>
            <p className="text-muted">
              {editingPoint
                ? 'Atualize as informações cadastrais, localização e capacidade diária desta unidade.'
                : 'Cadastre uma nova unidade homologada para recebimento de resíduos eletrônicos.'}
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Voltar para Lista
          </button>
        </div>

        <form className="vertical-form" onSubmit={handleSubmit}>
          <div className="form-row-2col">
            <div className="form-field">
              <label htmlFor="point-name">Nome da Unidade (PEV / Ecoponto)</label>
              <input
                id="point-name"
                type="text"
                required
                minLength={3}
                maxLength={120}
                placeholder="Ex: Ecoponto Paulista"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="point-capacity">Capacidade Máxima Diária (Agendamentos)</label>
              <input
                id="point-capacity"
                type="number"
                required
                min={1}
                max={500}
                value={maxDailyCapacity}
                onChange={(e) => setMaxDailyCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="point-address">Endereço Completo</label>
            <input
              id="point-address"
              type="text"
              required
              minLength={5}
              maxLength={255}
              placeholder="Ex: Avenida Paulista, 1578, Bela Vista - São Paulo/SP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-field">
              <label htmlFor="point-lat">Latitude</label>
              <input
                id="point-lat"
                type="number"
                step="any"
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="point-lng">Longitude</label>
              <input
                id="point-lng"
                type="number"
                step="any"
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>
          </div>

          <div className="form-field">
            <label>Categorias de Resíduos Aceitas (selecione ao menos uma)</label>
            <div className="category-selector-grid">
              {ALL_WASTE_CATEGORIES.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`category-toggle-btn ${active ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    <span>{WASTE_CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="form-footer-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? 'Processando...'
                : editingPoint
                ? 'Salvar Alterações'
                : 'Cadastrar Ponto de Coleta'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
