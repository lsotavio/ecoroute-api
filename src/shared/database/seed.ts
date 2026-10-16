import { dbProvider } from './database.provider';

export const SEED_COLLECTION_POINTS = [
  {
    id: '7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4',
    name: 'Ecoponto Pinheiros',
    address: 'Rua dos Pinheiros, 500, Pinheiros - São Paulo/SP',
    latitude: -23.5678,
    longitude: -46.6845,
    accepted_categories: ['BATTERIES', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '8a9c0f7b-23bc-5d4e-9f56-0ab9c8d7e6f5',
    name: 'Ecoponto Sé',
    address: 'Praça da Sé, 100, Centro - São Paulo/SP',
    latitude: -23.55052,
    longitude: -46.633308,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '9b0d1a8c-34cd-6e5f-0a67-1bc0d9e8f7a6',
    name: 'Ecoponto Vila Mariana',
    address: 'Rua Domingos de Morais, 1200, Vila Mariana - São Paulo/SP',
    latitude: -23.5855,
    longitude: -46.6391,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES', 'CABLES'],
    max_daily_capacity: 20,
    is_active: true,
  },
  {
    id: '0c1e2b9d-45de-7f6a-1b78-2cd1e0f9a8b7',
    name: 'Ecoponto Mooca',
    address: 'Rua dos Trilhos, 800, Mooca - São Paulo/SP',
    latitude: -23.5539,
    longitude: -46.6022,
    accepted_categories: ['LARGE_APPLIANCES', 'SMALL_APPLIANCES', 'DISPLAYS'],
    max_daily_capacity: 15,
    is_active: true,
  },
  {
    id: '1d2f3c0e-56ef-8a7b-2c89-3de2f1a0b9c8',
    name: 'Ecoponto Santana',
    address: 'Avenida Cruzeiro do Sul, 2500, Santana - São Paulo/SP',
    latitude: -23.5042,
    longitude: -46.6262,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'LIGHTING', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
];

export const SEED_SCHEDULES = [
  {
    id: '2a3b4c5d-67ef-4890-8123-4ef5a6b7c8d9',
    collection_point_id: '7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4',
    user_name: 'Beatriz Oliveira',
    user_email: 'beatriz.oliveira@exemplo.com',
    scheduled_date: '2026-10-20',
    waste_category: 'BATTERIES',
    items_description: '4 baterias de notebook e 12 pilhas recarregáveis',
    status: 'CONFIRMED' as const,
  },
  {
    id: '3b4c5d6e-78fa-4901-9234-5fa6b7c8d9e0',
    collection_point_id: '9b0d1a8c-34cd-6e5f-0a67-1bc0d9e8f7a6',
    user_name: 'Rafael Costa',
    user_email: 'rafael.costa@exemplo.com',
    scheduled_date: '2026-10-22',
    waste_category: 'COMPUTERS',
    items_description: '1 gabinete desktop, 2 teclados USB e 1 fonte ATX',
    status: 'PENDING' as const,
  },
];

export async function seedDatabase(): Promise<void> {
  const isHealthy = await dbProvider.checkConnection();
  if (!isHealthy) {
    console.warn('PostgreSQL indisponível. Dados iniciais carregados em memória.');
    return;
  }

  for (const point of SEED_COLLECTION_POINTS) {
    await dbProvider.query(
      `
      INSERT INTO collection_points (id, name, address, location, accepted_categories, max_daily_capacity, is_active)
      VALUES ($1, $2, $3, ST_MakePoint($4, $5)::geography, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        location = EXCLUDED.location,
        accepted_categories = EXCLUDED.accepted_categories,
        max_daily_capacity = EXCLUDED.max_daily_capacity,
        is_active = EXCLUDED.is_active;
      `,
      [
        point.id,
        point.name,
        point.address,
        point.longitude,
        point.latitude,
        point.accepted_categories,
        point.max_daily_capacity,
        point.is_active,
      ]
    );
  }

  for (const schedule of SEED_SCHEDULES) {
    await dbProvider.query(
      `
      INSERT INTO schedules (id, collection_point_id, user_name, user_email, scheduled_date, waste_category, items_description, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO NOTHING;
      `,
      [
        schedule.id,
        schedule.collection_point_id,
        schedule.user_name,
        schedule.user_email,
        schedule.scheduled_date,
        schedule.waste_category,
        schedule.items_description,
        schedule.status,
      ]
    );
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao executar seed:', err);
      process.exit(1);
    });
}
