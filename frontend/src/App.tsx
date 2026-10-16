import { useCallback, useEffect, useState } from 'react';
import {
  ApiRequestError,
  CollectionPoint,
  CreatePointPayload,
  CreateSchedulePayload,
  HealthStatus,
  PaginationMeta,
  Schedule,
  ScheduleStatus,
  ecorouteApi,
} from './api';
import { CollectionPointForm } from './components/CollectionPointForm';
import { CollectionPointsPanel } from './components/CollectionPointsPanel';
import { FeedbackBanner, FeedbackState } from './components/FeedbackBanner';
import { Footer } from './components/Footer';
import { ActiveTab, Header } from './components/Header';
import { SchedulesPanel } from './components/SchedulesPanel';

function toFeedbackError(error: unknown, fallbackTitle: string): FeedbackState {
  if (error instanceof ApiRequestError) {
    return {
      kind: 'error',
      title: error.title || fallbackTitle,
      detail: error.detail,
      status: error.status || undefined,
      invalidParams: error.invalidParams,
    };
  }
  if (error instanceof Error) {
    return {
      kind: 'error',
      title: fallbackTitle,
      detail: error.message,
    };
  }
  return {
    kind: 'error',
    title: fallbackTitle,
    detail: 'Erro inesperado na operação.',
  };
}

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('points');
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const [lat, setLat] = useState(-22.9231);
  const [lng, setLng] = useState(-43.3641);
  const [radiusKm, setRadiusKm] = useState(25);
  const [category, setCategory] = useState('');

  const [points, setPoints] = useState<CollectionPoint[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1,
  });
  const [loadingPoints, setLoadingPoints] = useState(false);

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingPoint, setEditingPoint] = useState<CollectionPoint | null>(null);
  const [preselectedPointId, setPreselectedPointId] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    try {
      const status = await ecorouteApi.getHealth();
      setHealth(status);
      setHealthError(null);
    } catch (err) {
      setHealth(null);
      setHealthError(err instanceof Error ? err.message : 'Falha de conexão');
    }
  }, []);

  const fetchPoints = useCallback(
    async (params: {
      lat: number;
      lng: number;
      radiusKm: number;
      category: string;
      page?: number;
    }) => {
      setLoadingPoints(true);
      try {
        const res = await ecorouteApi.searchPoints({
          lat: params.lat,
          lng: params.lng,
          radius_km: params.radiusKm,
          category: params.category || undefined,
          page: params.page ?? 1,
          limit: 10,
        });
        setPoints(res.data);
        setMeta(res.meta);
      } catch (err) {
        setFeedback(toFeedbackError(err, 'Falha ao buscar pontos de coleta'));
      } finally {
        setLoadingPoints(false);
      }
    },
    []
  );

  const fetchSchedules = useCallback(
    async (filter?: {
      collection_point_id?: string;
      scheduled_date?: string;
      status?: string;
    }) => {
      setLoadingSchedules(true);
      try {
        const list = await ecorouteApi.listSchedules(filter);
        setSchedules(list);
      } catch (err) {
        setFeedback(toFeedbackError(err, 'Falha ao listar agendamentos'));
      } finally {
        setLoadingSchedules(false);
      }
    },
    []
  );

  useEffect(() => {
    void fetchHealth();
    void fetchPoints({ lat: -22.9231, lng: -43.3641, radiusKm: 25, category: '', page: 1 });
    void fetchSchedules();
  }, [fetchHealth, fetchPoints, fetchSchedules]);

  function handleSearchChange(params: {
    lat: number;
    lng: number;
    radiusKm: number;
    category: string;
    page?: number;
  }) {
    setLat(params.lat);
    setLng(params.lng);
    setRadiusKm(params.radiusKm);
    setCategory(params.category);
    void fetchPoints(params);
  }

  async function handleLookupPointById(id: string) {
    setLoadingPoints(true);
    try {
      const point = await ecorouteApi.getPointById(id);
      setPoints([point]);
      setMeta({ page: 1, limit: 10, total_items: 1, total_pages: 1 });
      setFeedback({
        kind: 'success',
        title: 'Ponto Localizado',
        detail: `Detalhes da unidade '${point.name}' carregados com sucesso.`,
      });
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Ponto de Coleta Não Encontrado'));
    } finally {
      setLoadingPoints(false);
    }
  }

  async function handleSavePoint(payload: CreatePointPayload, editingId?: string) {
    setSubmitting(true);
    try {
      if (editingId) {
        const updated = await ecorouteApi.updatePoint(editingId, payload);
        setFeedback({
          kind: 'success',
          title: 'Ponto de Coleta Atualizado',
          detail: `Unidade '${updated.name}' atualizada com sucesso.`,
        });
      } else {
        const created = await ecorouteApi.createPoint(payload);
        setFeedback({
          kind: 'success',
          title: 'Ponto de Coleta Cadastrado',
          detail: `Unidade '${created.name}' cadastrada com sucesso.`,
        });
      }
      setEditingPoint(null);
      setActiveTab('points');
      await fetchPoints({ lat, lng, radiusKm, category, page: 1 });
    } catch (err) {
      setFeedback(
        toFeedbackError(
          err,
          editingId ? 'Erro ao Atualizar Ponto' : 'Erro ao Cadastrar Ponto'
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeletePoint(point: CollectionPoint) {
    try {
      await ecorouteApi.deletePoint(point.id);
      setFeedback({
        kind: 'success',
        title: 'Ponto de Coleta Removido',
        detail: `A unidade '${point.name}' foi desativada com sucesso.`,
      });
      await fetchPoints({ lat, lng, radiusKm, category, page: meta.page });
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Erro ao Excluir Ponto de Coleta'));
    }
  }

  async function handleCreateSchedule(payload: CreateSchedulePayload): Promise<boolean> {
    setSubmitting(true);
    try {
      const created = await ecorouteApi.createSchedule(payload);
      setFeedback({
        kind: 'success',
        title: 'Agendamento Confirmado',
        detail: `Descarte agendado com sucesso para ${created.scheduled_date}. Código: ${created.id}`,
      });
      await fetchSchedules();
      return true;
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Não Foi Possível Realizar o Agendamento'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLookupScheduleById(id: string) {
    setLoadingSchedules(true);
    try {
      const found = await ecorouteApi.getScheduleById(id);
      setSchedules([found]);
      setFeedback({
        kind: 'success',
        title: 'Agendamento Localizado',
        detail: `Agendamento de ${found.user_name} recuperado com sucesso.`,
      });
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Agendamento Não Encontrado'));
    } finally {
      setLoadingSchedules(false);
    }
  }

  async function handleUpdateScheduleStatus(id: string, status: ScheduleStatus) {
    try {
      const updated = await ecorouteApi.updateScheduleStatus(id, status);
      setSchedules((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setFeedback({
        kind: 'success',
        title: 'Status Atualizado',
        detail: `Status do agendamento alterado para '${updated.status}'.`,
      });
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Transição de Status Inválida'));
    }
  }

  async function handleDeleteSchedule(id: string) {
    try {
      await ecorouteApi.deleteSchedule(id);
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      setFeedback({
        kind: 'success',
        title: 'Agendamento Excluído',
        detail: `Registro de agendamento removido com sucesso.`,
      });
    } catch (err) {
      setFeedback(toFeedbackError(err, 'Erro ao Excluir Agendamento'));
    }
  }

  const totalCapacityInRadius = points.reduce(
    (acc, pt) => acc + pt.max_daily_capacity,
    0
  );
  const activeSchedulesCount = schedules.filter(
    (s) => s.status !== 'CANCELLED'
  ).length;
  const completedSchedulesCount = schedules.filter(
    (s) => s.status === 'COMPLETED'
  ).length;

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'point-form') {
            setEditingPoint(null);
          }
          setActiveTab(tab);
        }}
        health={health}
        healthError={healthError}
        onRefreshHealth={fetchHealth}
        editingPointName={editingPoint?.name ?? null}
      />

      <main className="main-container">
        <section className="kpi-strip" aria-label="Indicadores operacionais">
          <div className="kpi-card">
            <span className="kpi-label">PEVs no Raio ({radiusKm} km)</span>
            <strong className="kpi-value">{meta.total_items}</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Capacidade Diária Ofertada</span>
            <strong className="kpi-value">{totalCapacityInRadius} entregas/dia</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Agendamentos Ativos</span>
            <strong className="kpi-value">{activeSchedulesCount}</strong>
          </div>
          <div className="kpi-card">
            <span className="kpi-label">Descartes Concluídos</span>
            <strong className="kpi-value">{completedSchedulesCount}</strong>
          </div>
        </section>

        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />

        {activeTab === 'points' && (
          <CollectionPointsPanel
            points={points}
            meta={meta}
            loading={loadingPoints}
            lat={lat}
            lng={lng}
            radiusKm={radiusKm}
            category={category}
            onSearchChange={handleSearchChange}
            onLookupById={handleLookupPointById}
            onScheduleAtPoint={(point) => {
              setPreselectedPointId(point.id);
              setActiveTab('schedules');
            }}
            onEditPoint={(point) => {
              setEditingPoint(point);
              setActiveTab('point-form');
            }}
            onDeletePoint={handleDeletePoint}
            onOpenCreatePoint={() => {
              setEditingPoint(null);
              setActiveTab('point-form');
            }}
          />
        )}

        {activeTab === 'point-form' && (
          <CollectionPointForm
            editingPoint={editingPoint}
            submitting={submitting}
            onSubmit={handleSavePoint}
            onCancel={() => {
              setEditingPoint(null);
              setActiveTab('points');
            }}
          />
        )}

        {activeTab === 'schedules' && (
          <SchedulesPanel
            points={points}
            schedules={schedules}
            loading={loadingSchedules}
            submitting={submitting}
            preselectedPointId={preselectedPointId}
            onCreateSchedule={handleCreateSchedule}
            onFilterSchedules={fetchSchedules}
            onLookupScheduleById={handleLookupScheduleById}
            onUpdateStatus={handleUpdateScheduleStatus}
            onDeleteSchedule={handleDeleteSchedule}
          />
        )}
      </main>

      <Footer
        health={health}
        onSelectTab={(tab) => {
          if (tab !== 'point-form') {
            setEditingPoint(null);
          }
          setActiveTab(tab);
        }}
      />
    </div>
  );
}
