# EcoRoute

## Visão Geral

Aplicação full-stack composta por API RESTful (Node.js, Fastify, PostgreSQL/PostGIS) e interface web (React, TypeScript) para localização geoespacial de Pontos de Entrega Voluntária (PEV) e agendamento de descarte de resíduos eletroeletrônicos. O sistema atende à Meta 11.6 do ODS 11 da ONU por meio de controle de capacidade diária de coleta e validação de compatibilidade por categoria de resíduo.

## Início Rápido

```bash
npm install
npm --prefix frontend install
npm test
npm run dev
```

Em um segundo terminal, inicie a interface Front-End:

```bash
npm run dev:frontend
```

Execução alternativa via containers Docker (PostgreSQL + PostGIS + API):

```bash
docker compose up --build -d
```

## Configuração

| Variável | Tipo | Obrigatório | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | `number` | Não | `3000` | Porta TCP de escuta do servidor HTTP da API |
| `HOST` | `string` | Não | `0.0.0.0` | Endereço de interface de rede vinculado pelo Fastify |
| `NODE_ENV` | `string` | Não | `development` | Ambiente de execução (`development`, `test`, `production`) |
| `DATABASE_URL` | `string` | Não | `""` | URI de conexão PostgreSQL com extensão PostGIS |
| `USE_IN_MEMORY_DB` | `boolean` | Não | `true` | Ativa repositório em memória com cálculo Haversine quando PostgreSQL não está configurado |
| `VITE_API_BASE_URL` | `string` | Não | `http://localhost:3000` | URL base da API consumida pelo cliente HTTP do Front-End |

## Decisões de Arquitetura

- **Polimorfismo de Repositório (PostGIS e In-Memory):** A camada de persistência implementa consultas espaciais via índice `GIST` (`ST_DWithin` e `ST_Distance`) no PostgreSQL/PostGIS e mantém implementação equivalente em memória baseada na fórmula de Haversine para execução local e testes determinísticos sem dependência obrigatória de container externo.
- **Cliente HTTP Nativo com Validação de Perímetro (Fail Fast):** O Front-End utiliza a API nativa `fetch` sem bibliotecas HTTP de terceiros, validando os esquemas de entrada e saída na fronteira de rede antes de atualizar o estado da interface.
- **Padronização de Erros RFC 7807 (Problem Details):** Erros de validação (HTTP 422), conflitos de cota diária (HTTP 409), transições de estado inválidas (HTTP 400) e recursos inexistentes (HTTP 404) retornam objetos tipados consumidos diretamente pelo componente de feedback do Front-End.
- **Exclusão Lógica em Pontos de Coleta:** A operação `DELETE /api/v1/collection-points/:id` desativa o ponto (`is_active = false`) para preservar a integridade referencial do histórico de agendamentos vinculados.
