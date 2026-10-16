import { HealthStatus } from '../api';

export type ActiveTab = 'points' | 'schedules' | 'point-form';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  health: HealthStatus | null;
  healthError: string | null;
  onRefreshHealth: () => void;
  editingPointName: string | null;
}

export function Header({
  activeTab,
  onSelectTab,
  health,
  healthError,
  onRefreshHealth,
  editingPointName,
}: HeaderProps) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-group">
          <div className="brand-mark" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="brand-title-row">
              <h1>EcoRoute</h1>
              <span className="ods-tag">ODS 11 — Meta 11.6</span>
            </div>
            <p className="brand-subtitle">
              Mapeamento Geoespacial de PEVs e Agendamento de Descarte de Resíduos Eletroeletrônicos
            </p>
          </div>
        </div>

        <div className="health-panel">
          {health ? (
            <div className="health-badge health-online">
              <span className="status-dot" />
              <div>
                <strong>API {health.status}</strong>
                <span>{health.database.mode}</span>
              </div>
            </div>
          ) : (
            <div className="health-badge health-offline" title={healthError || 'API indisponível'}>
              <span className="status-dot" />
              <div>
                <strong>API Offline</strong>
                <span>{healthError ? 'Falha de conexão' : 'Verificando...'}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onRefreshHealth}
            title="Verificar status da API (/api/v1/health)"
          >
            Verificar API
          </button>
        </div>
      </div>

      <nav className="nav-tabs" aria-label="Navegação principal">
        <button
          type="button"
          className={`nav-tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => onSelectTab('points')}
        >
          Pontos de Coleta e Mapa Espacial
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'schedules' ? 'active' : ''}`}
          onClick={() => onSelectTab('schedules')}
        >
          Agendamentos de Descarte
        </button>
        <button
          type="button"
          className={`nav-tab ${activeTab === 'point-form' ? 'active' : ''}`}
          onClick={() => onSelectTab('point-form')}
        >
          {editingPointName ? `Editar: ${editingPointName}` : 'Cadastrar Ponto (PEV)'}
        </button>
      </nav>
    </header>
  );
}
