import { Pool, QueryResult, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseProvider {
  private static instance: DatabaseProvider;
  private pool: Pool | null = null;
  private isConnected = false;

  private constructor() {
    const isInMemory = process.env.USE_IN_MEMORY_DB === 'true';
    const connectionString = process.env.DATABASE_URL;

    if (!isInMemory && connectionString) {
      this.pool = new Pool({
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      this.pool.on('error', (err) => {
        console.error('Erro inesperado no cliente do pool PostgreSQL:', err);
      });
    }
  }

  public static getInstance(): DatabaseProvider {
    if (!DatabaseProvider.instance) {
      DatabaseProvider.instance = new DatabaseProvider();
    }
    return DatabaseProvider.instance;
  }

  public async checkConnection(): Promise<boolean> {
    if (!this.pool) {
      return false;
    }

    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      this.isConnected = true;
      return true;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  public async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error(
        'Pool do PostgreSQL não inicializado. O sistema está operando em modo sem banco relacional ativo.'
      );
    }
    return this.pool.query<T>(text, params);
  }

  public getPool(): Pool | null {
    return this.pool;
  }

  public isUsingPool(): boolean {
    return this.pool !== null;
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
    }
  }
}

export const dbProvider = DatabaseProvider.getInstance();
