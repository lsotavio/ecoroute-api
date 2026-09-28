# EcoRoute API

API RESTful para mapeamento geoespacial de Pontos de Entrega Voluntária (PEV) e agendamento de descarte responsável de resíduos eletroeletrônicos (e-waste).

O projeto é baseado no **ODS 11 (Cidades e Comunidades Sustentáveis)** da ONU, especificamente na **Meta 11.6**, com foco na redução do impacto ambiental urbano por meio do descarte correto de lixo eletrônico.

---

## Tecnologias

- **Runtime:** Node.js (TypeScript)
- **Framework Web:** Fastify com Zod (validação e tipagem de schemas)
- **Banco de Dados:** PostgreSQL com extensão PostGIS (consultas geoespaciais indexadas)
- **Documentação:** Swagger (OpenAPI 3.0) e Postman
- **Testes:** Vitest
- **Containerização:** Docker e Docker Compose

---

## Estrutura do Projeto

```text
src/
├── modules/
│   ├── collection-points/     # Gestão e busca de pontos de coleta
│   │   ├── dto/
│   │   ├── collection-points.controller.ts
│   │   ├── collection-points.service.ts
│   │   └── collection-points.repository.ts
│   └── schedules/             # Agendamento e validação de capacidade diária
│       ├── dto/
│       ├── schedules.controller.ts
│       ├── schedules.service.ts
│       └── schedules.repository.ts
├── shared/
│   ├── database/              # Conexão, migrations DDL e seeders
│   ├── errors/                # Formato RFC 7807 (Problem Details)
│   └── utils/
├── app.ts
└── server.ts
```

---

## Como Executar

### Opção 1: Via Docker Compose (Recomendado)

Inicia a API e o PostgreSQL com PostGIS configurado:

```bash
docker compose up --build -d
```

A API estará acessível em `http://localhost:3000`.

### Opção 2: Localmente com Node.js

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

*Nota: Caso o PostgreSQL não esteja rodando localmente, a aplicação inicializa automaticamente com um repositório em memória e dados de teste pré-carregados.*

---

## Endpoints

### Pontos de Coleta

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/collection-points` | Busca pontos próximos por latitude, longitude e raio (km) |
| `POST` | `/api/v1/collection-points` | Cadastra novo ponto de coleta |
| `GET` | `/api/v1/collection-points/:id` | Consulta detalhes de um ponto de coleta por ID |

### Agendamentos

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/api/v1/schedules` | Cria agendamento validando cotas diárias e materiais aceitos |
| `PATCH` | `/api/v1/schedules/:id/status` | Atualiza o status (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`) |
| `GET` | `/api/v1/schedules/:id` | Consulta agendamento por ID |
| `GET` | `/api/v1/schedules` | Lista agendamentos cadastrados |

### Sistema

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Status da API e verificação de conexão com o banco |

---

## Documentação

- **Swagger UI:** Disponível em `http://localhost:3000/api/docs` com a API em execução.
- **Postman:** Coleção disponível para importação em `docs/ecoroute_api.postman_collection.json`.
- **OpenAPI Spec:** Arquivo exportado em `docs/swagger.json`.

---

## Testes

Suíte de testes automatizados com cobertura de regras de negócio, cálculos de distância e validações:

```bash
npm test
```

---

## Licença

Distribuído sob a licença MIT. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.
