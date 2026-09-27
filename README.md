# 🗺️ EcoRoute API

[![Node.js Version](https://img.shields.io/badge/node.js-v20%2B-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-v5.5-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/fastify-v4.28-black.svg)](https://fastify.dev/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue.svg)](https://www.postgresql.org/)
[![PostGIS](https://img.shields.io/badge/spatial-PostGIS-darkblue.svg)](https://postgis.net/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Tests: Vitest](https://img.shields.io/badge/tests-18%20passed-success.svg)](https://vitest.dev/)

API RESTful de alta performance para **mapeamento inteligente e agendamento de descarte responsável de resíduos eletroeletrônicos (e-waste)**, dotada de consultas geoespaciais indexadas via PostGIS e controle estrito de capacidade operacional diária.

---

## 📌 1. Contexto & Alinhamento com os ODS da ONU

* **ODS Selecionado:** **ODS 11 – Cidades e Comunidades Sustentáveis**
* **Meta Impactada:** **Meta 11.6** — *Até 2030, reduzir o impacto ambiental negativo per capita das cidades, inclusive prestando especial atenção à qualidade do ar, gestão de resíduos sólidos urbanos e outros.*

### 🔍 O Problema
O descarte inadequado de lixo eletrônico (*e-waste*) é um dos vetores de poluição urbana mais críticos da atualidade. Dispositivos descartados em aterros comuns liberam metais pesados (chumbo, mercúrio, cádmio, berílio) no solo e no lençol freático, gerando contaminação persistente da cadeia alimentar e riscos graves à saúde pública. 

Paralelamente, os cidadãos que desejam agir corretamente enfrentam grandes barreiras de acesso:
1. **Falta de visibilidade:** Dificuldade em localizar Pontos de Entrega Voluntária (PEV) homologados próximos de suas residências.
2. **Incompatibilidade de materiais:** Deslocamento até postos que não recebem determinados tipos de componentes (ex: pilhas vs. monitores CRT vs. eletrodomésticos).
3. **Sobrecarga operacional:** Centros de coleta recebem volumes desordenados e imprevisíveis, excedendo a capacidade física de armazenamento e triagem.

### 💡 A Solução: EcoRoute API
A **EcoRoute API** soluciona esses gargalos ao prover:
- **Localização Geoespacial Inteligente:** Encontra os PEVs homologados em um raio customizado ($km$) em torno das coordenadas do munícipe, ordenando por menor distância e permitindo filtragem por categoria de resíduo.
- **Agendamento com Quotas Operacionais:** Permite agendar entregas com verificação prévia de compatibilidade de materiais e validação de capacidade máxima diária do posto, evitando filas e sobrecarga de descarte.
- **Padronização RFC 7807:** Tratamento padronizado de exceções e erros de domínio com semântica HTTP clara.

---

## 🏗️ 2. Arquitetura e Decisões de Engenharia

### 2.1. Por que PostGIS em vez de cálculos Haversine em memória?
A aplicação utiliza **PostgreSQL com a extensão espacial PostGIS** e índice espacial `GIST (Generalized Search Tree)` sobre a coluna de dados geográficos:

1. **Escalabilidade Algorítmica:** Enquanto o cálculo de distância em memória (fórmula de Haversine) exige ler todos os registros da base e ordenar via CPU ($O(N \log N)$), o índice `GIST` do PostGIS utiliza árvores espaciais R-Tree ($O(\log N)$), filtrando apenas os pontos contidos na bounding-box antes do cálculo métrico.
2. **Geodésica Real:** O PostGIS opera sobre o elipsoide WGS 84 (`SRID 4326`), garantindo precisão métrica de distâncias esféricas (`ST_DWithin` e `ST_Distance`).
3. **Resiliência e Flexibilidade:** Para facilitar o desenvolvimento, testes e correção acadêmica em ambientes que não disponham de PostGIS instalado, a aplicação conta com um repositório em memória com cálculo geodésico Haversine e chave de alternância automática via variável `USE_IN_MEMORY_DB`.

### 2.2. Estrutura Modular em Camadas
O código é estruturado de acordo com princípios de Clean Architecture e separação de responsabilidades:

```text
src/
├── modules/
│   ├── collection-points/          # Módulo de Pontos de Coleta (PEVs)
│   │   ├── dto/                    # Schemas Zod de validação de entrada/saída
│   │   │   ├── create-point.dto.ts
│   │   │   └── search-points-query.dto.ts
│   │   ├── collection-points.controller.ts # Handlers Fastify e anotações Swagger
│   │   ├── collection-points.service.ts    # Regras de negócio e validações
│   │   └── collection-points.repository.ts # Camada de dados (PostGIS + Fallback)
│   └── schedules/                  # Módulo de Agendamentos
│       ├── dto/
│       │   ├── create-schedule.dto.ts
│       │   └── update-schedule-status.dto.ts
│       ├── schedules.controller.ts
│       ├── schedules.service.ts
│       └── schedules.repository.ts
├── shared/                         # Recursos compartilhados
│   ├── database/                   # Pool pg, DDL PostGIS e Seeders
│   │   ├── database.provider.ts
│   │   ├── init-db.ts
│   │   └── seed.ts
│   ├── errors/                     # Tratamento de exceções e RFC 7807
│   │   ├── app-error.ts
│   │   └── error-handler.filter.ts
│   └── utils/                      # Paginação e utilitários
│       └── pagination.util.ts
├── app.ts                          # Configuração e plugins do Fastify
└── server.ts                       # Bootstrap e inicialização do servidor
```

---

## ⚡ 3. Instruções de Inicialização (Quickstart)

### Opção A: Execução Completa via Docker Compose (Recomendada)
Com um único comando, o Docker inicializa o PostgreSQL com a extensão PostGIS compilada e o container Node.js da API:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/ecoroute-api.git
cd ecoroute-api

# 2. Suba o banco de dados e a API
docker compose up --build -d

# 3. Acompanhe os logs
docker compose logs -f api
```

A API estará acessível em `http://localhost:3000`.

---

### Opção B: Execução Local com Node.js

Requisitos: Node.js 20+ e npm.

```bash
# 1. Instalar as dependências
npm install

# 2. Configurar as variáveis de ambiente
cp .env.example .env

# 3. Rodar em modo de desenvolvimento (hot-reload com tsx)
npm run dev
```

*Obs: Caso o PostgreSQL não esteja rodando na sua máquina local, a API automaticamente opera em modo in-memory resiliente com dados de semente dos ecopontos de São Paulo prontos para uso.*

---

## 🧪 4. Executando os Testes Automatizados

O projeto conta com suíte completa de testes unitários e de integração utilizando **Vitest**:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch
```

Cobertura dos testes:
- ✅ Cálculo geoespacial e ordenação por proximidade crescente
- ✅ Filtragem estrita por categorias de resíduo aceitas
- ✅ Validação de coordenadas geográficas (-90° a +90°, -180° a +180°)
- ✅ Rejeição de agendamentos com data no passado (HTTP 400)
- ✅ Rejeição de categorias não aceitas pelo ponto (HTTP 400)
- ✅ Bloqueio por estouro de capacidade máxima diária (HTTP 409 Conflict)
- ✅ Validação de máquina de estados de ciclo de vida (ex: bloqueio de CANCELLED -> COMPLETED)
- ✅ Conformidade do formato de erros com a norma RFC 7807

---

## 📖 5. Documentação da API (Swagger & Postman)

### 5.1. Swagger UI Interativo
Acesse diretamente no seu navegador com a aplicação em execução:
🔗 **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

No Swagger UI é possível:
- Visualizar todos os schemas de requisição e resposta tipados via Zod
- Executar chamadas em tempo real (`Try it out`)
- Consultar descrições e exemplos de cada código de retorno HTTP

### 5.2. Postman Collection
Na pasta [`/docs`](file:///c:/Users/lsota/Desktop/Reconecta%20-%202026/Atividade%20%E2%80%93%20Projeto%20Back-end%20-%20API/docs) estão disponíveis os arquivos prontos para importação:
1. **Coleção:** `docs/ecoroute_api.postman_collection.json`
2. **Especificação OpenAPI:** `docs/swagger.json`

**Para importar no Postman:**
1. Abra o Postman e clique em **Import** (canto superior esquerdo).
2. Selecione o arquivo `docs/ecoroute_api.postman_collection.json`.
3. A coleção já vem com variáveis pré-configuradas (`baseUrl = http://localhost:3000`) e cenários de sucesso e erro.

---

## 📡 6. Especificação dos Endpoints RESTful

### 6.1. Pontos de Coleta (`/api/v1/collection-points`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/collection-points` | Busca pontos próximos por raio ($km$) e coordenadas |
| `POST` | `/api/v1/collection-points` | Cadastra um novo ponto de coleta homologado |
| `GET` | `/api/v1/collection-points/:id` | Consulta detalhes cadastrais de um ponto por UUID |

#### Exemplo: Buscar Pontos Próximos
`GET /api/v1/collection-points?lat=-23.5678&lng=-46.6845&radius_km=5&page=1&limit=10`

**Resposta (`200 OK`):**
```json
{
  "data": [
    {
      "id": "7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4",
      "name": "Ecoponto Pinheiros",
      "address": "Rua dos Pinheiros, 500, Pinheiros - São Paulo/SP",
      "latitude": -23.5678,
      "longitude": -46.6845,
      "distance_km": 0.0,
      "accepted_categories": ["BATTERIES", "DISPLAYS", "CABLES"],
      "max_daily_capacity": 25,
      "is_active": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1
  }
}
```

---

### 6.2. Agendamentos (`/api/v1/schedules`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/schedules` | Cria agendamento com validação de capacidade e materiais |
| `PATCH` | `/api/v1/schedules/:id/status` | Atualiza status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `GET` | `/api/v1/schedules/:id` | Consulta detalhes de um agendamento |
| `GET` | `/api/v1/schedules` | Lista agendamentos com filtros opcionais |

#### Exemplo: Criar Agendamento
`POST /api/v1/schedules`
```json
{
  "collection_point_id": "7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4",
  "user_name": "Ana Paula Silva",
  "user_email": "ana.silva@exemplo.com",
  "scheduled_date": "2026-10-15",
  "waste_category": "BATTERIES",
  "items_description": "2 notebooks antigos e 6 baterias de celular"
}
```

**Resposta (`201 Created`):**
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "collection_point_id": "7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4",
  "user_name": "Ana Paula Silva",
  "user_email": "ana.silva@exemplo.com",
  "scheduled_date": "2026-10-15",
  "waste_category": "BATTERIES",
  "items_description": "2 notebooks antigos e 6 baterias de celular",
  "status": "PENDING"
}
```

---

### 6.3. Padronização de Erros (RFC 7807)
Quando ocorre uma violação de regra de negócio, a resposta segue a RFC 7807:

```json
{
  "type": "https://api.ecoroute.com/errors/capacity-exceeded",
  "title": "Conflict",
  "status": 409,
  "detail": "O ponto de coleta atingiu sua capacidade máxima de 25 agendamentos para a data 2026-10-15.",
  "timestamp": "2026-09-27T07:16:50.000Z"
}
```

---

## 🚀 7. Publicação no Repositório (GitHub / GitLab)

Para publicar este projeto em um repositório remoto:

```bash
# 1. Adicione a URL do seu repositório remoto
git remote add origin https://github.com/SEU_USUARIO/ecoroute-api.git

# 2. Garanta a branch principal 'main'
git branch -M main

# 3. Envie os arquivos para o repositório
git push -u origin main
```

---

## 📜 8. Licença
Este projeto é distribuído sob os termos da licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
