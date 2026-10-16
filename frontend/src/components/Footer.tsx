import { HealthStatus } from '../api';
import { ActiveTab } from './Header';

interface FooterProps {
  health: HealthStatus | null;
  onSelectTab: (tab: ActiveTab) => void;
}

export function Footer({ health, onSelectTab }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col footer-brand-col">
            <div className="footer-brand">
              <div className="footer-brand-mark" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <div>
                <strong>EcoRoute</strong>
                <span className="footer-ods-badge">ODS 11 — Meta 11.6</span>
              </div>
            </div>
            <p className="footer-desc">
              Plataforma para localização inteligente de Pontos de Entrega Voluntária (PEV) e agendamento de descarte responsável de resíduos eletroeletrônicos (e-waste), promovendo cidades mais limpas e sustentáveis.
            </p>
          </div>

          <div className="footer-col">
            <h4>Módulos da Aplicação</h4>
            <ul className="footer-links">
              <li>
                <button type="button" onClick={() => onSelectTab('points')}>
                  Pontos de Coleta e Radar Espacial
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('schedules')}>
                  Agendamentos de Descarte
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onSelectTab('point-form')}>
                  Cadastrar Ponto de Coleta
                </button>
              </li>
              <li>
                <a
                  href="http://localhost:3000/api/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  Documentação Swagger (OpenAPI)
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Padrões e Sustentabilidade</h4>
            <p className="footer-text-block">
              <strong>ODS 11 da ONU:</strong> Cidades e Comunidades Sustentáveis.
              Foco na gestão e destinação ambientalmente adequada de componentes com metais pesados (chumbo, mercúrio, cádmio).
            </p>
            <p className="footer-text-block">
              <strong>Arquitetura Técnica:</strong> Consultas espaciais geoindexadas com PostGIS, processamento em memória resiliente e padronização RFC 7807 para integridade de dados.
            </p>
          </div>

          <div className="footer-col">
            <h4>Status do Serviço</h4>
            <div className="footer-status-box">
              <div className="status-indicator-line">
                <span className={`status-dot ${health ? 'online' : 'offline'}`} />
                <span>
                  API Back-End: <strong>{health ? health.status : 'Desconectada'}</strong>
                </span>
              </div>
              <div className="status-indicator-line">
                <span>Persistência: <strong>{health?.database.mode || 'Verificando...'}</strong></span>
              </div>
              {health?.timestamp && (
                <div className="status-indicator-line">
                  <span>Última verificação: {new Date(health.timestamp).toLocaleTimeString('pt-BR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>&copy; {new Date().getFullYear()} EcoRoute — Gestão Urbana de E-Waste. Todos os direitos reservados.</span>
          <span>Projeto Final Integrado | Código aberto sob licença MIT</span>
        </div>
      </div>
    </footer>
  );
}
