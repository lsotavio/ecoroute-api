import { FormEvent, useEffect, useState } from 'react';
import {
  ALL_WASTE_CATEGORIES,
  CollectionPoint,
  CreateSchedulePayload,
  SCHEDULE_STATUS_LABELS,
  Schedule,
  ScheduleStatus,
  WASTE_CATEGORY_LABELS,
  WasteCategory,
} from '../api';

interface SchedulesPanelProps {
  points: CollectionPoint[];
  schedules: Schedule[];
  loading: boolean;
  submitting: boolean;
  preselectedPointId: string | null;
  onCreateSchedule: (payload: CreateSchedulePayload) => Promise<boolean>;
  onFilterSchedules: (filter: {
    collection_point_id?: string;
    scheduled_date?: string;
    status?: string;
  }) => Promise<void>;
  onLookupScheduleById: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ScheduleStatus) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
}

function getTomorrowIsoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function SchedulesPanel({
  points,
  schedules,
  loading,
  submitting,
  preselectedPointId,
  onCreateSchedule,
  onFilterSchedules,
  onLookupScheduleById,
  onUpdateStatus,
  onDeleteSchedule,
}: SchedulesPanelProps) {
  const [collectionPointId, setCollectionPointId] = useState(
    preselectedPointId || points[0]?.id || ''
  );
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTomorrowIsoDate());
  const [wasteCategory, setWasteCategory] = useState('BATTERIES');
  const [itemsDescription, setItemsDescription] = useState('');

  const [filterPointId, setFilterPointId] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [lookupId, setLookupId] = useState('');

  useEffect(() => {
    if (preselectedPointId) {
      setCollectionPointId(preselectedPointId);
      const matched = points.find((pt) => pt.id === preselectedPointId);
      if (matched && matched.accepted_categories.length > 0) {
        setWasteCategory(matched.accepted_categories[0]);
      }
    } else if (!collectionPointId && points.length > 0) {
      setCollectionPointId(points[0].id);
      if (points[0].accepted_categories.length > 0) {
        setWasteCategory(points[0].accepted_categories[0]);
      }
    }
  }, [preselectedPointId, points, collectionPointId]);

  const selectedPoint = points.find((pt) => pt.id === collectionPointId) || null;

  function handlePointSelectionChange(newPointId: string) {
    setCollectionPointId(newPointId);
    const point = points.find((pt) => pt.id === newPointId);
    if (point && point.accepted_categories.length > 0) {
      setWasteCategory(point.accepted_categories[0]);
    }
  }

  async function handleCreateSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await onCreateSchedule({
      collection_point_id: collectionPointId,
      user_name: userName.trim(),
      user_email: userEmail.trim(),
      scheduled_date: scheduledDate,
      waste_category: wasteCategory,
      items_description: itemsDescription.trim(),
    });

    if (ok) {
      setUserName('');
      setUserEmail('');
      setItemsDescription('');
    }
  }

  async function handleFilterSubmit(e: FormEvent) {
    e.preventDefault();
    await onFilterSchedules({
      collection_point_id: filterPointId || undefined,
      scheduled_date: filterDate || undefined,
      status: filterStatus || undefined,
    });
  }

  async function handleClearFilters() {
    setFilterPointId('');
    setFilterDate('');
    setFilterStatus('');
    await onFilterSchedules({});
  }

  async function handleLookupSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lookupId.trim()) {
      return;
    }
    await onLookupScheduleById(lookupId.trim());
  }

  function resolvePointName(pointId: string): string {
    const found = points.find((pt) => pt.id === pointId);
    return found ? found.name : `Ponto ${pointId.slice(0, 8)}...`;
  }

  return (
    <section className="panel-section schedules-grid-layout">
      <div className="card schedule-form-card">
        <h2>Novo Agendamento de Descarte</h2>
        <p className="text-muted">
          Registra entrega (<code>POST /api/v1/schedules</code>) validando capacidade diária e compatibilidade de categoria.
        </p>

        <form className="vertical-form" onSubmit={handleCreateSubmit}>
          <div className="form-field">
            <label htmlFor="sched-point">Ponto de Coleta (PEV)</label>
            <select
              id="sched-point"
              required
              value={collectionPointId}
              onChange={(e) => handlePointSelectionChange(e.target.value)}
            >
              <option value="" disabled>
                Selecione um ponto de coleta...
              </option>
              {points.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} (Cap: {pt.max_daily_capacity}/dia)
                </option>
              ))}
            </select>
          </div>

          {selectedPoint && (
            <div className="selected-point-hint">
              <strong>Categorias aceitas por {selectedPoint.name}:</strong>
              <div className="category-tags">
                {selectedPoint.accepted_categories.map((cat) => (
                  <span key={cat} className="category-pill">
                    {WASTE_CATEGORY_LABELS[cat as WasteCategory] || cat} ({cat})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="form-field">
            <label htmlFor="sched-name">Nome Completo do Cidadão</label>
            <input
              id="sched-name"
              type="text"
              required
              minLength={3}
              maxLength={100}
              placeholder="Ex: Ana Paula Silva"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label htmlFor="sched-email">E-mail de Contato</label>
            <input
              id="sched-email"
              type="email"
              required
              maxLength={120}
              placeholder="Ex: ana.silva@exemplo.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
          </div>

          <div className="form-row-2col">
            <div className="form-field">
              <label htmlFor="sched-date">Data Programada</label>
              <input
                id="sched-date"
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="sched-category">Categoria Principal</label>
              <select
                id="sched-category"
                required
                value={wasteCategory}
                onChange={(e) => setWasteCategory(e.target.value)}
              >
                {ALL_WASTE_CATEGORIES.map((cat) => {
                  const isAccepted =
                    !selectedPoint || selectedPoint.accepted_categories.includes(cat);
                  return (
                    <option key={cat} value={cat}>
                      {WASTE_CATEGORY_LABELS[cat]} {isAccepted ? '✓' : '(Não aceito no PEV)'}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="sched-desc">Descrição dos Resíduos Eletroeletrônicos</label>
            <textarea
              id="sched-desc"
              rows={3}
              required
              minLength={3}
              maxLength={500}
              placeholder="Ex: 2 notebooks antigos e 6 baterias de íon-lítio"
              value={itemsDescription}
              onChange={(e) => setItemsDescription(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Enviando...' : 'Confirmar Agendamento (POST)'}
          </button>
        </form>
      </div>

      <div className="schedules-list-column">
        <div className="card">
          <div className="card-header-row">
            <div>
              <h2>Gestão de Agendamentos</h2>
              <p className="text-muted">
                Consulte (<code>GET</code>), atualize status (<code>PATCH</code>) ou remova (<code>DELETE</code>) agendamentos.
              </p>
            </div>
            <span className="badge-count">{schedules.length} registro(s)</span>
          </div>

          <form className="search-grid-form schedules-filter-form" onSubmit={handleFilterSubmit}>
            <div className="form-field">
              <label htmlFor="filter-point">Ponto de Coleta</label>
              <select
                id="filter-point"
                value={filterPointId}
                onChange={(e) => setFilterPointId(e.target.value)}
              >
                <option value="">Todos os pontos</option>
                {points.map((pt) => (
                  <option key={pt.id} value={pt.id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="filter-date">Data</label>
              <input
                id="filter-date"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="filter-status">Status</label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendente (PENDING)</option>
                <option value="CONFIRMED">Confirmado (CONFIRMED)</option>
                <option value="COMPLETED">Concluído (COMPLETED)</option>
                <option value="CANCELLED">Cancelado (CANCELLED)</option>
              </select>
            </div>

            <div className="form-actions-inline">
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                Filtrar
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClearFilters}
                disabled={loading}
              >
                Limpar
              </button>
            </div>
          </form>

          <form className="lookup-bar" onSubmit={handleLookupSubmit}>
            <label htmlFor="lookup-schedule-id">Buscar agendamento por UUID (`GET /:id`):</label>
            <input
              id="lookup-schedule-id"
              type="text"
              placeholder="Ex: 2a3b4c5d-67ef-4890-8123-4ef5a6b7c8d9"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              Consultar ID
            </button>
          </form>
        </div>

        {schedules.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum agendamento encontrado para os critérios selecionados.</p>
          </div>
        ) : (
          <div className="schedules-cards-stack">
            {schedules.map((sched) => (
              <article key={sched.id} className="schedule-card">
                <div className="schedule-card-header">
                  <div>
                    <span className={`status-pill status-${sched.status.toLowerCase()}`}>
                      {SCHEDULE_STATUS_LABELS[sched.status]} ({sched.status})
                    </span>
                    <h3>{resolvePointName(sched.collection_point_id)}</h3>
                  </div>
                  <div className="schedule-date-box">
                    <span>Data de Entrega</span>
                    <strong>{sched.scheduled_date}</strong>
                  </div>
                </div>

                <div className="schedule-body-grid">
                  <div>
                    <strong>Solicitante:</strong> {sched.user_name} ({sched.user_email})
                  </div>
                  <div>
                    <strong>Resíduo:</strong>{' '}
                    <span className="category-pill">
                      {WASTE_CATEGORY_LABELS[sched.waste_category as WasteCategory] ||
                        sched.waste_category}
                    </span>
                  </div>
                  <div className="schedule-items-desc">
                    <strong>Itens declarados:</strong> {sched.items_description}
                  </div>
                  <div className="schedule-id-line">
                    <span>
                      ID: <code>{sched.id}</code>
                    </span>
                  </div>
                </div>

                <div className="schedule-actions-bar">
                  <span className="actions-label">Transição de Status (PATCH):</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    disabled={
                      sched.status === 'CONFIRMED' ||
                      sched.status === 'COMPLETED' ||
                      sched.status === 'CANCELLED'
                    }
                    onClick={() => onUpdateStatus(sched.id, 'CONFIRMED')}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={sched.status === 'COMPLETED' || sched.status === 'CANCELLED'}
                    onClick={() => onUpdateStatus(sched.id, 'COMPLETED')}
                  >
                    Concluir Entrega
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning btn-sm"
                    disabled={sched.status === 'COMPLETED' || sched.status === 'CANCELLED'}
                    onClick={() => onUpdateStatus(sched.id, 'CANCELLED')}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeleteSchedule(sched.id)}
                  >
                    Excluir (DELETE)
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
