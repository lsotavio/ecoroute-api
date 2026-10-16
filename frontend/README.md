# EcoRoute Front-End

## Visão Geral

Interface web em React e TypeScript para consulta geoespacial de Pontos de Entrega Voluntária (PEV), visualização em radar espacial e gerenciamento do ciclo de vida de agendamentos de descarte de lixo eletrônico integrada à EcoRoute API.

## Início Rápido

```bash
npm install
npm run dev
npm run build
```

## Configuração

| Variável | Tipo | Obrigatório | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `string` | Não | `http://localhost:3000` | Endereço base da API Back-End para requisições HTTP (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) |
| `VITE_API_PROXY_TARGET` | `string` | Não | `http://localhost:3000` | Alvo de proxy do servidor de desenvolvimento Vite para rotas `/api` |

## Decisões de Arquitetura

- **Zero Dependências de Runtime Excedentes:** Utiliza exclusivamente `react`, `react-dom` e APIs nativas do navegador (`fetch`, `URLSearchParams`, `navigator.geolocation`, SVG nativo), evitando bibliotecas externas para HTTP, estilização ou gerenciamento de estado.
- **Componentização Coesa:** A interface é dividida nos módulos `Header`, `FeedbackBanner`, `SpatialRadarMap`, `CollectionPointsPanel`, `CollectionPointForm` e `SchedulesPanel`, isolando responsabilidades de apresentação e formulários do cliente de rede (`api.ts`).
- **Validação Estrita de Fronteira:** Todas as respostas JSON da API são verificadas em tempo de execução no módulo `api.ts`, convertendo falhas HTTP no formato RFC 7807 em instâncias de `ApiRequestError` com preservação de causa e parâmetros inválidos.
