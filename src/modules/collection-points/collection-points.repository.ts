import { randomUUID } from 'crypto';
import { dbProvider } from '../../shared/database/database.provider';
import { SEED_COLLECTION_POINTS } from '../../shared/database/seed';

export interface CollectionPointItem {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  accepted_categories: string[];
  max_daily_capacity: number;
  is_active: boolean;
  distance_km?: number;
  created_at?: string;
}

export interface SearchNearbyParams {
  lat: number;
  lng: number;
  radius_km: number;
  category?: string;
  page: number;
  limit: number;
}

export interface ICollectionPointsRepository {
  searchNearby(
    params: SearchNearbyParams
  ): Promise<{ points: CollectionPointItem[]; total: number }>;
  findById(id: string): Promise<CollectionPointItem | null>;
  create(
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem>;
  update(
    id: string,
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<number>;
}

export class PostgresCollectionPointsRepository implements ICollectionPointsRepository {
  async searchNearby(
    params: SearchNearbyParams
  ): Promise<{ points: CollectionPointItem[]; total: number }> {
    const { lat, lng, radius_km, category, page, limit } = params;
    const offset = (page - 1) * limit;
    const radiusMeters = radius_km * 1000;

    const querySql = `
      SELECT
          id,
          name,
          address,
          ST_Y(location::geometry)::float AS latitude,
          ST_X(location::geometry)::float AS longitude,
          accepted_categories,
          max_daily_capacity,
          is_active,
          TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at,
          ROUND((ST_Distance(location, ST_MakePoint($1, $2)::geography) / 1000)::numeric, 2)::float AS distance_km
      FROM collection_points
      WHERE is_active = true
        AND ($3::text IS NULL OR $3 = ANY(accepted_categories))
        AND ST_DWithin(location, ST_MakePoint($1, $2)::geography, $4)
      ORDER BY distance_km ASC
      LIMIT $5 OFFSET $6;
    `;

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM collection_points
      WHERE is_active = true
        AND ($3::text IS NULL OR $3 = ANY(accepted_categories))
        AND ST_DWithin(location, ST_MakePoint($1, $2)::geography, $4);
    `;

    const categoryParam = category || null;

    const [rowsResult, countResult] = await Promise.all([
      dbProvider.query<CollectionPointItem>(querySql, [
        lng,
        lat,
        categoryParam,
        radiusMeters,
        limit,
        offset,
      ]),
      dbProvider.query<{ total: number }>(countSql, [
        lng,
        lat,
        categoryParam,
        radiusMeters,
      ]),
    ]);

    return {
      points: rowsResult.rows,
      total: countResult.rows[0]?.total || 0,
    };
  }

  async findById(id: string): Promise<CollectionPointItem | null> {
    const sql = `
      SELECT
        id,
        name,
        address,
        ST_Y(location::geometry)::float AS latitude,
        ST_X(location::geometry)::float AS longitude,
        accepted_categories,
        max_daily_capacity,
        is_active,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM collection_points
      WHERE id = $1 AND is_active = true;
    `;
    const res = await dbProvider.query<CollectionPointItem>(sql, [id]);
    return res.rows[0] || null;
  }

  async create(
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem> {
    const sql = `
      INSERT INTO collection_points (name, address, location, accepted_categories, max_daily_capacity, is_active)
      VALUES ($1, $2, ST_MakePoint($3, $4)::geography, $5, $6, true)
      RETURNING
        id,
        name,
        address,
        ST_Y(location::geometry)::float AS latitude,
        ST_X(location::geometry)::float AS longitude,
        accepted_categories,
        max_daily_capacity,
        is_active,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at;
    `;
    const res = await dbProvider.query<CollectionPointItem>(sql, [
      point.name,
      point.address,
      point.longitude,
      point.latitude,
      point.accepted_categories,
      point.max_daily_capacity,
    ]);
    return res.rows[0];
  }

  async update(
    id: string,
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem | null> {
    const sql = `
      UPDATE collection_points
      SET
        name = $2,
        address = $3,
        location = ST_MakePoint($4, $5)::geography,
        accepted_categories = $6,
        max_daily_capacity = $7
      WHERE id = $1 AND is_active = true
      RETURNING
        id,
        name,
        address,
        ST_Y(location::geometry)::float AS latitude,
        ST_X(location::geometry)::float AS longitude,
        accepted_categories,
        max_daily_capacity,
        is_active,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at;
    `;
    const res = await dbProvider.query<CollectionPointItem>(sql, [
      id,
      point.name,
      point.address,
      point.longitude,
      point.latitude,
      point.accepted_categories,
      point.max_daily_capacity,
    ]);
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    // Soft-delete preserves foreign key integrity for existing schedules referencing this point
    const sql = `
      UPDATE collection_points
      SET is_active = false
      WHERE id = $1 AND is_active = true
      RETURNING id;
    `;
    const res = await dbProvider.query<{ id: string }>(sql, [id]);
    return res.rows.length > 0;
  }

  async count(): Promise<number> {
    const res = await dbProvider.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM collection_points WHERE is_active = true'
    );
    return parseInt(res.rows[0].count, 10);
  }
}

export class InMemoryCollectionPointsRepository implements ICollectionPointsRepository {
  private items: CollectionPointItem[] = [];

  constructor(initialData: CollectionPointItem[] = SEED_COLLECTION_POINTS) {
    this.items = initialData.map((item) => ({
      ...item,
      created_at: item.created_at || new Date().toISOString(),
    }));
  }

  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const earthRadiusKm = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((earthRadiusKm * c).toFixed(2));
  }

  async searchNearby(
    params: SearchNearbyParams
  ): Promise<{ points: CollectionPointItem[]; total: number }> {
    const { lat, lng, radius_km, category, page, limit } = params;

    let filtered = this.items.filter((pt) => pt.is_active);

    if (category) {
      filtered = filtered.filter((pt) =>
        pt.accepted_categories.some(
          (c) => c.toUpperCase() === category.toUpperCase()
        )
      );
    }

    const withDistance = filtered
      .map((pt) => {
        const distance = this.calculateHaversineDistance(
          lat,
          lng,
          pt.latitude,
          pt.longitude
        );
        return {
          ...pt,
          distance_km: distance,
        };
      })
      .filter((pt) => pt.distance_km <= radius_km);

    withDistance.sort((a, b) => a.distance_km - b.distance_km);

    const total = withDistance.length;
    const offset = (page - 1) * limit;
    const points = withDistance.slice(offset, offset + limit);

    return { points, total };
  }

  async findById(id: string): Promise<CollectionPointItem | null> {
    const found = this.items.find((pt) => pt.id === id && pt.is_active);
    return found ? { ...found } : null;
  }

  async create(
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem> {
    const newPoint: CollectionPointItem = {
      id: randomUUID(),
      name: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      accepted_categories: point.accepted_categories,
      max_daily_capacity: point.max_daily_capacity,
      is_active: true,
      created_at: new Date().toISOString(),
    };
    this.items.push(newPoint);
    return { ...newPoint };
  }

  async update(
    id: string,
    point: Omit<CollectionPointItem, 'id' | 'is_active' | 'created_at'>
  ): Promise<CollectionPointItem | null> {
    const index = this.items.findIndex((pt) => pt.id === id && pt.is_active);
    if (index === -1) {
      return null;
    }

    const updated: CollectionPointItem = {
      ...this.items[index],
      name: point.name,
      address: point.address,
      latitude: point.latitude,
      longitude: point.longitude,
      accepted_categories: point.accepted_categories,
      max_daily_capacity: point.max_daily_capacity,
    };

    this.items[index] = updated;
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    const index = this.items.findIndex((pt) => pt.id === id && pt.is_active);
    if (index === -1) {
      return false;
    }
    this.items[index] = { ...this.items[index], is_active: false };
    return true;
  }

  async count(): Promise<number> {
    return this.items.filter((pt) => pt.is_active).length;
  }

  public clear(): void {
    this.items = [];
  }

  public reset(data: CollectionPointItem[] = SEED_COLLECTION_POINTS): void {
    this.items = data.map((item) => ({ ...item }));
  }
}

export function createCollectionPointsRepository(): ICollectionPointsRepository {
  const useInMemory =
    process.env.USE_IN_MEMORY_DB === 'true' ||
    !process.env.DATABASE_URL ||
    !dbProvider.isHealthy();
  if (useInMemory) {
    return new InMemoryCollectionPointsRepository();
  }
  return new PostgresCollectionPointsRepository();
}
