import { randomUUID } from 'crypto';
import { dbProvider } from '../../shared/database/database.provider';
import { SEED_SCHEDULES } from '../../shared/database/seed';
import { ScheduleStatus } from './dto/create-schedule.dto';

export interface ScheduleItem {
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

export interface ISchedulesRepository {
  create(
    schedule: Omit<ScheduleItem, 'id' | 'status' | 'created_at'>
  ): Promise<ScheduleItem>;
  findById(id: string): Promise<ScheduleItem | null>;
  countActiveByPointAndDate(pointId: string, date: string): Promise<number>;
  updateStatus(id: string, status: ScheduleStatus): Promise<ScheduleItem>;
  delete(id: string): Promise<boolean>;
  list(filter?: {
    collection_point_id?: string;
    scheduled_date?: string;
    status?: ScheduleStatus;
  }): Promise<ScheduleItem[]>;
}

export class PostgresSchedulesRepository implements ISchedulesRepository {
  async create(
    schedule: Omit<ScheduleItem, 'id' | 'status' | 'created_at'>
  ): Promise<ScheduleItem> {
    const sql = `
      INSERT INTO schedules (
        collection_point_id,
        user_name,
        user_email,
        scheduled_date,
        waste_category,
        items_description,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
      RETURNING
        id,
        collection_point_id,
        user_name,
        user_email,
        TO_CHAR(scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
        waste_category,
        items_description,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at;
    `;

    const res = await dbProvider.query<ScheduleItem>(sql, [
      schedule.collection_point_id,
      schedule.user_name,
      schedule.user_email,
      schedule.scheduled_date,
      schedule.waste_category,
      schedule.items_description,
    ]);

    return res.rows[0];
  }

  async findById(id: string): Promise<ScheduleItem | null> {
    const sql = `
      SELECT
        id,
        collection_point_id,
        user_name,
        user_email,
        TO_CHAR(scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
        waste_category,
        items_description,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM schedules
      WHERE id = $1;
    `;
    const res = await dbProvider.query<ScheduleItem>(sql, [id]);
    return res.rows[0] || null;
  }

  async countActiveByPointAndDate(pointId: string, date: string): Promise<number> {
    const sql = `
      SELECT COUNT(*)::int AS count
      FROM schedules
      WHERE collection_point_id = $1
        AND scheduled_date = $2
        AND status != 'CANCELLED';
    `;
    const res = await dbProvider.query<{ count: number }>(sql, [pointId, date]);
    return res.rows[0]?.count || 0;
  }

  async updateStatus(id: string, status: ScheduleStatus): Promise<ScheduleItem> {
    const sql = `
      UPDATE schedules
      SET status = $2
      WHERE id = $1
      RETURNING
        id,
        collection_point_id,
        user_name,
        user_email,
        TO_CHAR(scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
        waste_category,
        items_description,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at;
    `;
    const res = await dbProvider.query<ScheduleItem>(sql, [id, status]);
    return res.rows[0];
  }

  async delete(id: string): Promise<boolean> {
    const sql = `
      DELETE FROM schedules
      WHERE id = $1
      RETURNING id;
    `;
    const res = await dbProvider.query<{ id: string }>(sql, [id]);
    return res.rows.length > 0;
  }

  async list(filter?: {
    collection_point_id?: string;
    scheduled_date?: string;
    status?: ScheduleStatus;
  }): Promise<ScheduleItem[]> {
    const conditions: string[] = [];
    const values: any[] = [];

    if (filter?.collection_point_id) {
      values.push(filter.collection_point_id);
      conditions.push(`collection_point_id = $${values.length}`);
    }

    if (filter?.scheduled_date) {
      values.push(filter.scheduled_date);
      conditions.push(`scheduled_date = $${values.length}`);
    }

    if (filter?.status) {
      values.push(filter.status);
      conditions.push(`status = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT
        id,
        collection_point_id,
        user_name,
        user_email,
        TO_CHAR(scheduled_date, 'YYYY-MM-DD') AS scheduled_date,
        waste_category,
        items_description,
        status,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS created_at
      FROM schedules
      ${whereClause}
      ORDER BY scheduled_date DESC, created_at DESC;
    `;

    const res = await dbProvider.query<ScheduleItem>(sql, values);
    return res.rows;
  }
}

export class InMemorySchedulesRepository implements ISchedulesRepository {
  private items: ScheduleItem[] = [];

  constructor(initialData: ScheduleItem[] = SEED_SCHEDULES) {
    this.items = initialData.map((item) => ({
      ...item,
      created_at: item.created_at || new Date().toISOString(),
    }));
  }

  async create(
    schedule: Omit<ScheduleItem, 'id' | 'status' | 'created_at'>
  ): Promise<ScheduleItem> {
    const newSchedule: ScheduleItem = {
      id: randomUUID(),
      collection_point_id: schedule.collection_point_id,
      user_name: schedule.user_name,
      user_email: schedule.user_email,
      scheduled_date: schedule.scheduled_date,
      waste_category: schedule.waste_category,
      items_description: schedule.items_description,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    this.items.push(newSchedule);
    return { ...newSchedule };
  }

  async findById(id: string): Promise<ScheduleItem | null> {
    const found = this.items.find((item) => item.id === id);
    return found ? { ...found } : null;
  }

  async countActiveByPointAndDate(pointId: string, date: string): Promise<number> {
    return this.items.filter(
      (item) =>
        item.collection_point_id === pointId &&
        item.scheduled_date === date &&
        item.status !== 'CANCELLED'
    ).length;
  }

  async updateStatus(id: string, status: ScheduleStatus): Promise<ScheduleItem> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error(`Schedule ${id} not found`);
    }
    this.items[index] = {
      ...this.items[index],
      status,
    };
    return { ...this.items[index] };
  }

  async delete(id: string): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    this.items.splice(index, 1);
    return true;
  }

  async list(filter?: {
    collection_point_id?: string;
    scheduled_date?: string;
    status?: ScheduleStatus;
  }): Promise<ScheduleItem[]> {
    let result = [...this.items];
    if (filter?.collection_point_id) {
      result = result.filter(
        (i) => i.collection_point_id === filter.collection_point_id
      );
    }
    if (filter?.scheduled_date) {
      result = result.filter((i) => i.scheduled_date === filter.scheduled_date);
    }
    if (filter?.status) {
      result = result.filter((i) => i.status === filter.status);
    }
    return result.reverse();
  }

  public clear(): void {
    this.items = [];
  }
}

export function createSchedulesRepository(): ISchedulesRepository {
  const useInMemory =
    process.env.USE_IN_MEMORY_DB === 'true' ||
    !process.env.DATABASE_URL ||
    !dbProvider.isHealthy();
  if (useInMemory) {
    return new InMemorySchedulesRepository();
  }
  return new PostgresSchedulesRepository();
}
