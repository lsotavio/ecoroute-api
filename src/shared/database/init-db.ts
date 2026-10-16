import { dbProvider } from './database.provider';

export async function initDatabase(): Promise<void> {
  const isHealthy = await dbProvider.checkConnection();
  if (!isHealthy) {
    console.warn(
      'PostgreSQL indisponível. Inicialização DDL ignorada (operando em modo in-memory).'
    );
    return;
  }

  const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "postgis";

    CREATE TABLE IF NOT EXISTS collection_points (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(120) NOT NULL,
      address VARCHAR(255) NOT NULL,
      location GEOGRAPHY(Point, 4326) NOT NULL,
      accepted_categories TEXT[] NOT NULL,
      max_daily_capacity INTEGER NOT NULL DEFAULT 20,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_collection_points_location ON collection_points USING GIST (location);

    CREATE TABLE IF NOT EXISTS schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      collection_point_id UUID NOT NULL REFERENCES collection_points(id) ON DELETE RESTRICT,
      user_name VARCHAR(100) NOT NULL,
      user_email VARCHAR(120) NOT NULL,
      scheduled_date DATE NOT NULL,
      waste_category VARCHAR(50) NOT NULL,
      items_description TEXT NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_schedules_point_date ON schedules (collection_point_id, scheduled_date);
  `;

  await dbProvider.query(sql);
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro na inicialização do banco:', err);
      process.exit(1);
    });
}
