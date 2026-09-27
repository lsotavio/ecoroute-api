import { AppError } from '../../shared/errors/app-error';
import { buildPaginatedResult } from '../../shared/utils/pagination.util';
import {
  CollectionPointItem,
  ICollectionPointsRepository,
} from './collection-points.repository';
import { CreatePointInput } from './dto/create-point.dto';
import {
  SearchPointsQueryInput,
  SearchPointsResponse,
} from './dto/search-points-query.dto';

export class CollectionPointsService {
  constructor(private readonly repository: ICollectionPointsRepository) {}

  async searchNearby(
    params: SearchPointsQueryInput
  ): Promise<SearchPointsResponse> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const radius_km = params.radius_km || 5.0;

    const { points, total } = await this.repository.searchNearby({
      lat: params.lat,
      lng: params.lng,
      radius_km,
      category: params.category,
      page,
      limit,
    });

    const paginated = buildPaginatedResult<CollectionPointItem>(
      points,
      total,
      page,
      limit
    );

    return paginated;
  }

  async createPoint(data: CreatePointInput): Promise<CollectionPointItem> {
    // Coordinate sanity check
    if (data.latitude < -90 || data.latitude > 90) {
      throw AppError.unprocessableEntity(
        'A latitude deve estar no intervalo entre -90 e 90 graus.',
        [{ name: 'latitude', reason: 'Valor fora dos limites geográficos aceitáveis.' }]
      );
    }

    if (data.longitude < -180 || data.longitude > 180) {
      throw AppError.unprocessableEntity(
        'A longitude deve estar no intervalo entre -180 e 180 graus.',
        [{ name: 'longitude', reason: 'Valor fora dos limites geográficos aceitáveis.' }]
      );
    }

    // Capitalize categories
    const normalizedCategories = data.accepted_categories.map((c) =>
      c.trim().toUpperCase()
    );

    const point = await this.repository.create({
      name: data.name.trim(),
      address: data.address.trim(),
      latitude: data.latitude,
      longitude: data.longitude,
      accepted_categories: normalizedCategories,
      max_daily_capacity: data.max_daily_capacity,
    });

    return point;
  }

  async getPointById(id: string): Promise<CollectionPointItem> {
    const point = await this.repository.findById(id);
    if (!point) {
      throw AppError.notFound(
        `Ponto de coleta com ID '${id}' não foi encontrado.`,
        'https://api.ecoroute.com/errors/point-not-found'
      );
    }
    return point;
  }
}
