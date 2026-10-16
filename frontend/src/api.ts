export type WasteCategory =
  | 'BATTERIES'
  | 'DISPLAYS'
  | 'CABLES'
  | 'SMALL_APPLIANCES'
  | 'LARGE_APPLIANCES'
  | 'COMPUTERS'
  | 'MOBILE_PHONES'
  | 'LIGHTING'
  | 'OTHERS';

export type ScheduleStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export const WASTE_CATEGORY_LABELS: Record<WasteCategory, string> = {
  BATTERIES: 'Pilhas e Baterias',
  DISPLAYS: 'Monitores e Telas',
  CABLES: 'Cabos e Fios',
  SMALL_APPLIANCES: 'Eletroportáteis',
  LARGE_APPLIANCES: 'Linha Branca / Grande Porte',
  COMPUTERS: 'Computadores e Informática',
  MOBILE_PHONES: 'Celulares e Tablets',
  LIGHTING: 'Lâmpadas e Iluminação',
  OTHERS: 'Outros Eletrônicos',
};

export const ALL_WASTE_CATEGORIES = Object.keys(WASTE_CATEGORY_LABELS) as WasteCategory[];

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km?: number;
  accepted_categories: string[];
  max_daily_capacity: number;
  is_active: boolean;
  created_at?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedPoints {
  data: CollectionPoint[];
  meta: PaginationMeta;
}

export interface Schedule {
  id: string;
  collection_point_id: string;
  user_name: string;
  user_email: string;
  scheduled_date: string;
  waste_category: string;
  items_description: string;
  status: ScheduleStatus;
  created_at?: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  ods: string;
  database: {
    connected: boolean;
    mode: string;
  };
}

export interface InvalidParam {
  name: string;
  reason: string;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalid_params?: InvalidParam[];
  timestamp?: string;
}

export interface SearchPointsParams {
  lat: number;
  lng: number;
  radius_km?: number;
  category?: string;
  page?: number;
  limit?: number;
}

export interface CreatePointPayload {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  accepted_categories: string[];
  max_daily_capacity: number;
}

export interface CreateSchedulePayload {
  collection_point_id: string;
  user_name: string;
  user_email: string;
  scheduled_date: string;
  waste_category: string;
  items_description: string;
}

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly title: string;
  public readonly detail: string;
  public readonly type?: string;
  public readonly invalidParams: InvalidParam[];

  constructor(problem: ProblemDetails, cause?: unknown) {
    super(problem.detail || problem.title, cause ? { cause } : undefined);
    this.name = 'ApiRequestError';
    this.status = problem.status;
    this.title = problem.title;
    this.detail = problem.detail;
    this.type = problem.type;
    this.invalidParams = problem.invalid_params ?? [];
  }
}

function assertRecord(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Violação de contrato na fronteira de rede (${context}): objeto esperado.`);
  }
  return value as Record<string, unknown>;
}

function assertString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Violação de contrato na fronteira de rede: campo '${field}' inválido.`);
  }
  return value;
}

function assertNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Violação de contrato na fronteira de rede: número esperado em '${field}'.`);
  }
  return value;
}

function parseCollectionPoint(raw: unknown): CollectionPoint {
  const obj = assertRecord(raw, 'CollectionPoint');
  if (!Array.isArray(obj.accepted_categories)) {
    throw new Error("Violação de contrato: 'accepted_categories' deve ser uma lista.");
  }

  return {
    id: assertString(obj.id, 'id'),
    name: assertString(obj.name, 'name'),
    address: assertString(obj.address, 'address'),
    latitude: assertNumber(obj.latitude, 'latitude'),
    longitude: assertNumber(obj.longitude, 'longitude'),
    distance_km: typeof obj.distance_km === 'number' ? obj.distance_km : undefined,
    accepted_categories: obj.accepted_categories.map((item) => assertString(item, 'category')),
    max_daily_capacity: assertNumber(obj.max_daily_capacity, 'max_daily_capacity'),
    is_active: Boolean(obj.is_active),
    created_at: typeof obj.created_at === 'string' ? obj.created_at : undefined,
  };
}

function parsePaginatedPoints(raw: unknown): PaginatedPoints {
  const obj = assertRecord(raw, 'PaginatedPoints');
  if (!Array.isArray(obj.data)) {
    throw new Error("Violação de contrato: 'data' deve ser uma lista de pontos.");
  }
  const meta = assertRecord(obj.meta, 'PaginationMeta');

  return {
    data: obj.data.map(parseCollectionPoint),
    meta: {
      page: assertNumber(meta.page, 'meta.page'),
      limit: assertNumber(meta.limit, 'meta.limit'),
      total_items: assertNumber(meta.total_items, 'meta.total_items'),
      total_pages: assertNumber(meta.total_pages, 'meta.total_pages'),
    },
  };
}

function parseSchedule(raw: unknown): Schedule {
  const obj = assertRecord(raw, 'Schedule');
  const status = assertString(obj.status, 'status') as ScheduleStatus;
  if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
    throw new Error(`Status de agendamento desconhecido: ${status}`);
  }

  return {
    id: assertString(obj.id, 'id'),
    collection_point_id: assertString(obj.collection_point_id, 'collection_point_id'),
    user_name: assertString(obj.user_name, 'user_name'),
    user_email: assertString(obj.user_email, 'user_email'),
    scheduled_date: assertString(obj.scheduled_date, 'scheduled_date').slice(0, 10),
    waste_category: assertString(obj.waste_category, 'waste_category'),
    items_description: assertString(obj.items_description, 'items_description'),
    status,
    created_at: typeof obj.created_at === 'string' ? obj.created_at : undefined,
  };
}

function parseHealthStatus(raw: unknown): HealthStatus {
  const obj = assertRecord(raw, 'HealthStatus');
  const db = assertRecord(obj.database, 'HealthStatus.database');

  return {
    status: assertString(obj.status, 'status'),
    timestamp: assertString(obj.timestamp, 'timestamp'),
    service: assertString(obj.service, 'service'),
    version: assertString(obj.version, 'version'),
    ods: assertString(obj.ods, 'ods'),
    database: {
      connected: Boolean(db.connected),
      mode: assertString(db.mode, 'database.mode'),
    },
  };
}

const DEFAULT_API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
  import.meta.env &&
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
    : '') || 'http://localhost:3000';

export function createEcoRouteApi(baseUrl: string = DEFAULT_API_BASE_URL) {
  const normalizedBase = baseUrl.replace(/\/$/, '');

  async function requestJson<T>(
    path: string,
    options: RequestInit,
    parser: (data: unknown) => T
  ): Promise<T> {
    const headers = new Headers(options.headers);
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    let response: Response;
    try {
      response = await fetch(`${normalizedBase}${path}`, {
        ...options,
        headers,
      });
    } catch (networkError) {
      throw new ApiRequestError(
        {
          title: 'Falha de Conexão com a API',
          status: 0,
          detail: `Não foi possível estabelecer comunicação com o Back-End em ${normalizedBase}. Verifique se o servidor está em execução.`,
        },
        networkError
      );
    }

    if (response.status === 204) {
      return parser(null);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (parseError) {
      throw new ApiRequestError(
        {
          title: 'Resposta Inválida',
          status: response.status,
          detail: `O servidor retornou status ${response.status} com corpo não-JSON.`,
        },
        parseError
      );
    }

    if (!response.ok) {
      const errObj =
        typeof payload === 'object' && payload !== null
          ? (payload as Record<string, unknown>)
          : {};
      throw new ApiRequestError({
        type: typeof errObj.type === 'string' ? errObj.type : undefined,
        title:
          typeof errObj.title === 'string'
            ? errObj.title
            : `Erro HTTP ${response.status}`,
        status: typeof errObj.status === 'number' ? errObj.status : response.status,
        detail:
          typeof errObj.detail === 'string'
            ? errObj.detail
            : 'A requisição foi recusada pelo servidor.',
        invalid_params: Array.isArray(errObj.invalid_params)
          ? (errObj.invalid_params as InvalidParam[])
          : undefined,
      });
    }

    return parser(payload);
  }

  return {
    getHealth(): Promise<HealthStatus> {
      return requestJson('/api/v1/health', { method: 'GET' }, parseHealthStatus);
    },

    searchPoints(params: SearchPointsParams): Promise<PaginatedPoints> {
      if (Number.isNaN(params.lat) || params.lat < -90 || params.lat > 90) {
        throw new ApiRequestError({
          title: 'Parâmetro Inválido',
          status: 422,
          detail: 'A latitude de busca deve ser um número entre -90 e 90.',
        });
      }
      if (Number.isNaN(params.lng) || params.lng < -180 || params.lng > 180) {
        throw new ApiRequestError({
          title: 'Parâmetro Inválido',
          status: 422,
          detail: 'A longitude de busca deve ser um número entre -180 e 180.',
        });
      }

      const query = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        radius_km: String(params.radius_km ?? 15),
        page: String(params.page ?? 1),
        limit: String(params.limit ?? 10),
      });

      if (params.category && params.category.trim().length > 0) {
        query.set('category', params.category.trim());
      }

      return requestJson(
        `/api/v1/collection-points?${query.toString()}`,
        { method: 'GET' },
        parsePaginatedPoints
      );
    },

    getPointById(id: string): Promise<CollectionPoint> {
      return requestJson(
        `/api/v1/collection-points/${encodeURIComponent(id.trim())}`,
        { method: 'GET' },
        parseCollectionPoint
      );
    },

    createPoint(payload: CreatePointPayload): Promise<CollectionPoint> {
      return requestJson(
        '/api/v1/collection-points',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        parseCollectionPoint
      );
    },

    updatePoint(id: string, payload: CreatePointPayload): Promise<CollectionPoint> {
      return requestJson(
        `/api/v1/collection-points/${encodeURIComponent(id.trim())}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
        parseCollectionPoint
      );
    },

    deletePoint(id: string): Promise<null> {
      return requestJson(
        `/api/v1/collection-points/${encodeURIComponent(id.trim())}`,
        { method: 'DELETE' },
        () => null
      );
    },

    listSchedules(filter?: {
      collection_point_id?: string;
      scheduled_date?: string;
      status?: string;
    }): Promise<Schedule[]> {
      const query = new URLSearchParams();
      if (filter?.collection_point_id) {
        query.set('collection_point_id', filter.collection_point_id);
      }
      if (filter?.scheduled_date) {
        query.set('scheduled_date', filter.scheduled_date);
      }
      if (filter?.status) {
        query.set('status', filter.status);
      }

      const queryString = query.toString();
      const path = queryString ? `/api/v1/schedules?${queryString}` : '/api/v1/schedules';

      return requestJson(path, { method: 'GET' }, (raw) => {
        if (!Array.isArray(raw)) {
          throw new Error('Violação de contrato: lista de agendamentos esperada.');
        }
        return raw.map(parseSchedule);
      });
    },

    getScheduleById(id: string): Promise<Schedule> {
      return requestJson(
        `/api/v1/schedules/${encodeURIComponent(id.trim())}`,
        { method: 'GET' },
        parseSchedule
      );
    },

    createSchedule(payload: CreateSchedulePayload): Promise<Schedule> {
      return requestJson(
        '/api/v1/schedules',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
        parseSchedule
      );
    },

    updateScheduleStatus(id: string, status: ScheduleStatus): Promise<Schedule> {
      return requestJson(
        `/api/v1/schedules/${encodeURIComponent(id.trim())}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
        parseSchedule
      );
    },

    deleteSchedule(id: string): Promise<null> {
      return requestJson(
        `/api/v1/schedules/${encodeURIComponent(id.trim())}`,
        { method: 'DELETE' },
        () => null
      );
    },
  };
}

export const ecorouteApi = createEcoRouteApi();
