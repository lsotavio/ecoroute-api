# 🗺️ EcoRoute API — Blueprint de Arquitetura e Engenharia

API RESTful para mapeamento inteligente e agendamento de descarte responsável de resíduos eletroeletrônicos (e-waste), com suporte a consultas geoespaciais e controle de capacidade operacional.

---

## 1. Visão Geral e Alinhamento com os ODS

* **ODS Vinculado:** **ODS 11 – Cidades e Comunidades Sustentáveis**
  * *Meta 11.6:* Reduzir o impacto ambiental negativo per capita das cidades, com atenção especial à gestão de resíduos sólidos urbanos.
* **Problema:**
  O descarte inadequado de lixo eletrônico contamina solo e lençóis freáticos com metais pesados (chumbo, mercúrio, cádmio). Cidadãos encontram barreiras para identificar Pontos de Entrega Voluntária (PEV) homologados e os centros de coleta sofrem com descarte desordenado e sobrecarga de capacidade.
* **Solução:**
  Uma API robusta que permite a localização de pontos de coleta homologados via cálculos geoespaciais por raio de proximidade ($km$), filtragem por tipos de materiais aceitos e agendamento prévio com verificação de cotas diárias de capacidade.

---

## 2. Stack Tecnológica Recomendada

| Componente | Opção Node.js (Recomendada) | Opção Python |
| :--- | :--- | :--- |
| **Linguagem / Runtime** | Node.js (v20+) com TypeScript | Python (3.11+) |
| **Framework Web** | NestJS ou Fastify + Zod | FastAPI + Pydantic v2 |
| **Banco de Dados** | PostgreSQL 15+ com extensão PostGIS | PostgreSQL 15+ com extensão PostGIS |
| **ORM / Data Access** | Prisma ORM ou TypeORM | SQLAlchemy 2.0 + GeoAlchemy2 |
| **Documentação** | Swagger / OpenAPI 3.0 via decorators | OpenAPI 3.0 nativo via FastAPI |
| **Ambiente Local** | Docker e Docker Compose | Docker e Docker Compose |

---

## 3. Modelagem do Banco de Dados

### 3.1. Tabela `collection_points` (Pontos de Coleta)

Armazena as informações dos postos autorizados e suas coordenadas espaciais indexadas.

| Campo | Tipo SQL | Modificadores | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Identificador único |
| `name` | `VARCHAR(120)` | `NOT NULL` | Razão social ou nome fantasia do local |
| `address` | `VARCHAR(255)` | `NOT NULL` | Endereço descritivo (rua, número, bairro, CEP) |
| `location` | `GEOGRAPHY(Point, 4326)` | `NOT NULL` | Ponto espacial no padrão WGS 84 (`longitude`, `latitude`) |
| `accepted_categories` | `TEXT[]` | `NOT NULL` | Lista de categorias aceitas (ex: `['BATTERIES', 'DISPLAYS']`) |
| `max_daily_capacity` | `INTEGER` | `NOT NULL, DEFAULT 20` | Volume máximo de agendamentos por dia |
| `is_active` | `BOOLEAN` | `NOT NULL, DEFAULT true` | Estado de operação do ponto |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Carimbo de data/hora de criação |

> **Índice Espacial Obrigatório:**
> ```sql
> CREATE INDEX idx_collection_points_location ON collection_points USING GIST (location);
> ```

---

### 3.2. Tabela `schedules` (Agendamentos de Descarte)

Registra os agendamentos realizados pelos usuários para um ponto específico.

| Campo | Tipo SQL | Modificadores | Descrição |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY, DEFAULT gen_random_uuid()` | Identificador único |
| `collection_point_id` | `UUID` | `NOT NULL, REFERENCES collection_points(id)` | Chave estrangeira do ponto de coleta |
| `user_name` | `VARCHAR(100)` | `NOT NULL` | Nome completo do usuário |
| `user_email` | `VARCHAR(120)` | `NOT NULL` | E-mail para confirmação e contato |
| `scheduled_date` | `DATE` | `NOT NULL` | Data agendada para a entrega |
| `waste_category` | `VARCHAR(50)` | `NOT NULL` | Categoria primária do item a ser descartado |
| `items_description` | `TEXT` | `NOT NULL` | Resumo dos itens (ex: "3 monitores CRT e 2 teclados") |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'PENDING'` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `DEFAULT NOW()` | Carimbo de registro |

---

## 4. Arquitetura Modular em Camadas

```text
src/
├── modules/
│   ├── collection-points/
│   │   ├── dto/
│   │   │   ├── create-point.dto.ts
│   │   │   └── search-points-query.dto.ts
│   │   ├── collection-points.controller.ts
│   │   ├── collection-points.service.ts
│   │   └── collection-points.repository.ts
│   └── schedules/
│       ├── dto/
│       │   ├── create-schedule.dto.ts
│       │   └── update-schedule-status.dto.ts
│       ├── schedules.controller.ts
│       ├── schedules.service.ts
│       └── schedules.repository.ts
├── shared/
│   ├── database/
│   │   └── database.provider.ts
│   ├── errors/
│   │   ├── app-error.ts
│   │   └── error-handler.filter.ts
│   └── utils/
│       └── pagination.util.ts
├── app.ts
└── server.ts
```

---

## 5. Especificação dos Endpoints RESTful

### 5.1. Pontos de Coleta

#### `GET /api/v1/collection-points`
Busca pontos de coleta próximos a partir de coordenadas geográficas e raio definido.

* **Query Parameters:**
  * `lat` *(float, obrigatório)*: Latitude da localização do usuário ($-90 \le \text{lat} \le 90$).
  * `lng` *(float, obrigatório)*: Longitude da localização do usuário ($-180 \le \text{lng} \le 180$).
  * `radius_km` *(float, opcional, default: `5.0`)*: Raio limite de distância em quilômetros.
  * `category` *(string, opcional)*: Filtro por categoria aceita (ex: `BATTERIES`).
  * `page` *(int, opcional, default: `1`)*: Página atual.
  * `limit` *(int, opcional, default: `10`, max: `50`)*: Itens por página.

* **Exemplo de Resposta (`200 OK`):**
```json
{
  "data": [
    {
      "id": "7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4",
      "name": "Ecoponto Pinheiros",
      "address": "Rua dos Pinheiros, 500, Pinheiros - São Paulo/SP",
      "latitude": -23.5678,
      "longitude": -46.6845,
      "distance_km": 1.42,
      "accepted_categories": ["BATTERIES", "DISPLAYS", "CABLES"],
      "max_daily_capacity": 25
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

#### `POST /api/v1/collection-points`
Registra uma nova unidade de coleta autorizada.

* **Payload de Entrada:**
```json
{
  "name": "Ecoponto Sé",
  "address": "Praça da Sé, 100, Centro - São Paulo/SP",
  "latitude": -23.550520,
  "longitude": -46.633308,
  "accepted_categories": ["BATTERIES", "SMALL_APPLIANCES"],
  "max_daily_capacity": 30
}
```
* **Respostas:**
  * `201 Created`: Ponto criado com sucesso.
  * `422 Unprocessable Entity`: Coordenadas inválidas ou campos ausentes.

---

### 5.2. Agendamentos

#### `POST /api/v1/schedules`
Registra um agendamento de descarte com validação de capacidade diária.

* **Payload de Entrada:**
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
* **Respostas:**
  * `201 Created`: Agendamento realizado com sucesso.
  * `400 Bad Request`: Data informada no passado ou categoria não suportada pelo ponto.
  * `404 Not Found`: Ponto de coleta não encontrado ou inativo.
  * `409 Conflict`: Capacidade máxima diária daquele ponto atingida para o dia solicitado.

#### `PATCH /api/v1/schedules/:id/status`
Atualiza o ciclo de vida do descarte (uso interno/gestão).

* **Payload:** `{"status": "COMPLETED"}`
* **Respostas:**
  * `200 OK`: Status alterado com sucesso.
  * `400 Bad Request`: Transição inválida de estado (ex: de `CANCELLED` para `COMPLETED`).

---

## 6. Otimizações de Engenharia

### Consulta Espacial via PostGIS
Em vez de efetuar filtragens e cálculos de distância em memória, a consulta delega o processamento ao índice espacial `GIST`:

```sql
SELECT
    id,
    name,
    address,
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude,
    accepted_categories,
    ROUND((ST_Distance(location, ST_MakePoint(:lng, :lat)::geography) / 1000)::numeric, 2) AS distance_km
FROM collection_points
WHERE is_active = true
  AND (:category IS NULL OR :category = ANY(accepted_categories))
  AND ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
ORDER BY distance_km ASC
LIMIT :limit OFFSET :offset;
```

### Formato Padrão de Erros (RFC 7807)
Respostas de exceções padronizadas para melhor consumo por clientes:

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

## 7. Infraestrutura de Desenvolvimento (`docker-compose.yml`)

Permite a execução do ambiente completo com um único comando:

```yaml
version: '3.8'

services:
  db:
    image: postgis/postgis:15-3.3
    container_name: ecoroute_postgres
    restart: always
    environment:
      POSTGRES_USER: ecoroute
      POSTGRES_PASSWORD: ecoroute_password
      POSTGRES_DB: ecoroute_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  api:
    build: .
    container_name: ecoroute_api
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "postgresql://ecoroute:ecoroute_password@db:5432/ecoroute_db"
      PORT: 3000
    depends_on:
      - db

volumes:
  pgdata:
```

---

## 8. Roteiro para o README do GitHub

1. **Badge Header:** Tecnologias usadas, licença e versão da API.
2. **Contexto & ODS 11:** Justificativa da aplicação, meta da ONU impactada e relevância ambiental.
3. **Decisões de Engenharia:** Justificativa da adoção de PostgreSQL + PostGIS em detrimento de cálculos em memória (ganho em escalabilidade e indexação espacial).
4. **Instruções de Inicialização (Quickstart):**
   ```bash
   git clone https://github.com/seu-usuario/ecoroute-api.git
   cd ecoroute-api
   docker compose up --build -d
   ```
5. **Documentação Interativa:** Link para o Swagger UI (`http://localhost:3000/api/docs`) e instruções de importação da coleção do Postman inclusa na pasta `/docs`.