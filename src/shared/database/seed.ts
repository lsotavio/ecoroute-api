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

export async function seedDatabase(): Promise<void> {
  const isHealthy = await dbProvider.checkConnection();
  if (!isHealthy) {
    console.warn('⚠️ PostgreSQL não disponível. Os dados de semente serão carregados em memória.');
    return;
  }

  console.log('🌱 Populando pontos de coleta de exemplo no PostgreSQL...');

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

  console.log('✅ Seed executado com sucesso no PostgreSQL!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Finalizado.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Erro ao executar seed:', err);
      process.exit(1);
    });
}
