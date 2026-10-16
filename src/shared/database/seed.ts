import { dbProvider } from './database.provider';

export const SEED_COLLECTION_POINTS = [
  // São Paulo (SP)
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

  // Rio de Janeiro (RJ)
  {
    id: '3c4d5e6f-789a-4bc1-9012-3456789abcde',
    name: 'Ecoponto COMLURB Taquara (Jacarepaguá)',
    address: 'Estrada do Tindiba, 2100, Taquara - Rio de Janeiro/RJ',
    latitude: -22.9231,
    longitude: -43.3641,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'COMPUTERS', 'CABLES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '4d5e6f7a-89ab-4cd2-0123-456789abcdef',
    name: 'Ecoponto COMLURB Madureira',
    address: 'Rua Carvalho de Souza, 200, Madureira - Rio de Janeiro/RJ',
    latitude: -22.8735,
    longitude: -43.3392,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'CABLES', 'DISPLAYS'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '5e6f7a8b-9abc-4de3-1234-56789abcdef0',
    name: 'Ecoponto COMLURB Barra da Tijuca',
    address: 'Avenida Ayrton Senna, 2541, Barra da Tijuca - Rio de Janeiro/RJ',
    latitude: -22.9922,
    longitude: -43.3644,
    accepted_categories: ['COMPUTERS', 'DISPLAYS', 'LARGE_APPLIANCES', 'BATTERIES'],
    max_daily_capacity: 40,
    is_active: true,
  },
  {
    id: '6f7a8b9c-abcd-4ef4-2345-6789abcdef01',
    name: 'Ecoponto COMLURB Tijuca',
    address: 'Rua Conde de Bonfim, 700, Tijuca - Rio de Janeiro/RJ',
    latitude: -22.9338,
    longitude: -43.2435,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '7a8b9c0d-bcde-4f05-3456-789abcdef012',
    name: 'Ecoponto COMLURB Centro (Praça XV)',
    address: 'Praça XV de Novembro, s/n, Centro - Rio de Janeiro/RJ',
    latitude: -22.9028,
    longitude: -43.1729,
    accepted_categories: ['BATTERIES', 'DISPLAYS', 'SMALL_APPLIANCES', 'CABLES'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '8b9c0d1e-cdef-4016-4567-89abcdef0123',
    name: 'Ecoponto COMLURB Botafogo',
    address: 'Rua General Polidoro, 100, Botafogo - Rio de Janeiro/RJ',
    latitude: -22.9535,
    longitude: -43.1873,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'COMPUTERS'],
    max_daily_capacity: 25,
    is_active: true,
  },

  // Rio Grande do Norte (Parnamirim e Natal)
  {
    id: '9c0d1e2f-def0-4127-5678-9abcdef01234',
    name: 'Ecoponto Parnamirim Centro',
    address: 'Avenida Brigadeiro Everaldo Breves, 450, Centro - Parnamirim/RN',
    latitude: -5.9156,
    longitude: -35.2628,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '0d1e2f3a-ef01-4238-6789-abcdef012345',
    name: 'Ponto Verde Parnamirim (Cohabinal)',
    address: 'Rua Átila de Paiva, s/n, Cohabinal - Parnamirim/RN',
    latitude: -5.9221,
    longitude: -35.2715,
    accepted_categories: ['SMALL_APPLIANCES', 'BATTERIES', 'DISPLAYS'],
    max_daily_capacity: 20,
    is_active: true,
  },
  {
    id: '1e2f3a4b-f012-4349-789a-bcdef0123456',
    name: 'Ecoponto Natal (Capim Macio)',
    address: 'Avenida Engenheiro Roberto Freire, 3000, Capim Macio - Natal/RN',
    latitude: -5.8562,
    longitude: -35.2078,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'LARGE_APPLIANCES', 'CABLES'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '2f3a4b5c-0123-445a-89ab-cdef01234567',
    name: 'Ecoponto Natal (Tirol / Central)',
    address: 'Avenida Hermes da Fonseca, 1100, Tirol - Natal/RN',
    latitude: -5.7995,
    longitude: -35.2014,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'COMPUTERS', 'LIGHTING'],
    max_daily_capacity: 30,
    is_active: true,
  },

  // Outras Capitais Estratégicas
  {
    id: '3a4b5c6d-1234-456b-9abc-def012345678',
    name: 'Ecoponto Savassi / Centro - Belo Horizonte/MG',
    address: 'Avenida do Contorno, 6000, Savassi - Belo Horizonte/MG',
    latitude: -19.9328,
    longitude: -43.9378,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '4b5c6d7e-2345-467c-abcd-ef0123456789',
    name: 'Ecoponto Central - Curitiba/PR',
    address: 'Rua Brigadeiro Franco, 2200, Batel - Curitiba/PR',
    latitude: -25.4411,
    longitude: -49.2789,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'COMPUTERS'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '5c6d7e8f-3456-478d-bcde-f0123456789a',
    name: 'Ecoponto Asa Sul - Brasília/DF',
    address: 'EQS 208/408, Asa Sul - Brasília/DF',
    latitude: -15.7989,
    longitude: -47.8828,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES', 'LIGHTING'],
    max_daily_capacity: 40,
    is_active: true,
  },
  {
    id: '6d7e8f9a-4567-489e-cdef-0123456789ab',
    name: 'Ecoponto Salvador (Barra)',
    address: 'Avenida Oceânica, 1200, Barra - Salvador/BA',
    latitude: -13.0038,
    longitude: -38.5284,
    accepted_categories: ['BATTERIES', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '7e8f9a0b-5678-49af-def0-123456789abc',
    name: 'Ecoponto Recife (Boa Viagem)',
    address: 'Avenida Engenheiro Domingos Ferreira, 2000, Boa Viagem - Recife/PE',
    latitude: -8.1189,
    longitude: -34.9036,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'SMALL_APPLIANCES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  // Região Sul
  {
    id: '8f9a0b1c-6789-4ab0-ef01-23456789abcd',
    name: 'Ecoponto DMLU Porto Alegre (Menino Deus)',
    address: 'Avenida Érico Veríssimo, 800, Menino Deus - Porto Alegre/RS',
    latitude: -30.0538,
    longitude: -51.2225,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '9a0b1c2d-789a-4bc1-f012-3456789abcde',
    name: 'Ecoponto COMCAP Florianópolis (Itacorubi)',
    address: 'Rodovia Amaro Antônio Vieira, 1500, Itacorubi - Florianópolis/SC',
    latitude: -27.5755,
    longitude: -48.5115,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'COMPUTERS'],
    max_daily_capacity: 30,
    is_active: true,
  },
  // Região Sudeste
  {
    id: '0b1c2d3e-89ab-4cd2-0123-456789abcdef',
    name: 'Ecoponto Vitória (Ilha de Santa Maria)',
    address: 'Rua Hermes Curry Carneiro, 250, Ilha de Santa Maria - Vitória/ES',
    latitude: -20.3155,
    longitude: -40.3128,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'LIGHTING'],
    max_daily_capacity: 25,
    is_active: true,
  },
  // Região Centro-Oeste
  {
    id: '1c2d3e4f-9abc-4de3-1234-56789abcdef0',
    name: 'Ecoponto COMURG Goiânia (Setor Sul)',
    address: 'Rua 84, s/n, Setor Sul - Goiânia/GO',
    latitude: -16.6869,
    longitude: -49.2648,
    accepted_categories: ['BATTERIES', 'DISPLAYS', 'COMPUTERS'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '2d3e4f5a-abcd-4ef4-2345-6789abcdef01',
    name: 'Ecoponto Cuiabá (Bosque da Saúde)',
    address: 'Avenida Aclimação, 600, Bosque da Saúde - Cuiabá/MT',
    latitude: -15.6014,
    longitude: -56.0979,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '3e4f5a6b-bcde-4f05-3456-789abcdef012',
    name: 'Ecoponto Campo Grande (Amambaí)',
    address: 'Avenida Afonso Pena, 1200, Amambaí - Campo Grande/MS',
    latitude: -20.4697,
    longitude: -54.6201,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  // Região Nordeste
  {
    id: '4f5a6b7c-cdef-4016-4567-89abcdef0123',
    name: 'Ecoponto Fortaleza (Aldeota)',
    address: 'Avenida Santos Dumont, 2500, Aldeota - Fortaleza/CE',
    latitude: -3.7319,
    longitude: -38.5267,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '5a6b7c8d-def0-4127-5678-9abcdef01234',
    name: 'Ecoponto São Luís (Renascença)',
    address: 'Avenida Colares Moreira, 400, Renascença - São Luís/MA',
    latitude: -2.5307,
    longitude: -44.3068,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'COMPUTERS'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '6b7c8d9e-ef01-4238-6789-abcdef012345',
    name: 'Ecoponto João Pessoa (Tambaú)',
    address: 'Avenida Epitácio Pessoa, 3500, Tambaú - João Pessoa/PB',
    latitude: -7.1195,
    longitude: -34.845,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'MOBILE_PHONES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '7c8d9e0f-f012-4349-789a-bcdef0123456',
    name: 'Ecoponto Maceió (Pajuçara)',
    address: 'Rua Jangadeiros Alagoanos, 800, Pajuçara - Maceió/AL',
    latitude: -9.6658,
    longitude: -35.7351,
    accepted_categories: ['BATTERIES', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '8d9e0f1a-0123-445a-89ab-cdef01234567',
    name: 'Ecoponto Teresina (Jóquei)',
    address: 'Avenida Nossa Senhora de Fátima, 1200, Jóquei - Teresina/PI',
    latitude: -5.092,
    longitude: -42.8038,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'SMALL_APPLIANCES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '9e0f1a2b-1234-456b-9abc-def012345678',
    name: 'Ecoponto Aracaju (Atalaia)',
    address: 'Avenida Santos Dumont, 1000, Atalaia - Aracaju/SE',
    latitude: -10.9472,
    longitude: -37.0731,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'CABLES'],
    max_daily_capacity: 25,
    is_active: true,
  },
  // Região Norte
  {
    id: '0f1a2b3c-2345-467c-abcd-ef0123456789',
    name: 'Ecoponto SEMULSP Manaus (Adrianópolis)',
    address: 'Avenida Mário Ypiranga, 1500, Adrianópolis - Manaus/AM',
    latitude: -3.119,
    longitude: -60.0217,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'DISPLAYS', 'CABLES'],
    max_daily_capacity: 35,
    is_active: true,
  },
  {
    id: '1a2b3c4d-3456-478d-bcde-f0123456789a',
    name: 'Ecoponto Belém (Nazaré)',
    address: 'Avenida Nazaré, 800, Nazaré - Belém/PA',
    latitude: -1.4558,
    longitude: -48.4902,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'SMALL_APPLIANCES'],
    max_daily_capacity: 30,
    is_active: true,
  },
  {
    id: '2b3c4d5e-4567-489e-cdef-0123456789ab',
    name: 'Ecoponto Porto Velho (Olaria)',
    address: 'Avenida Farquar, 1200, Olaria - Porto Velho/RO',
    latitude: -8.7619,
    longitude: -63.9039,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'CABLES'],
    max_daily_capacity: 20,
    is_active: true,
  },
  {
    id: '3c4d5e6f-5678-49af-def0-123456789abc',
    name: 'Ecoponto Palmas (Plano Diretor Sul)',
    address: 'Quadra 104 Sul, Avenida LO 3, Palmas/TO',
    latitude: -10.2491,
    longitude: -48.3243,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'LIGHTING'],
    max_daily_capacity: 25,
    is_active: true,
  },
  {
    id: '4d5e6f7a-6789-4ab0-ef01-23456789abcd',
    name: 'Ecoponto Rio Branco (Bosque)',
    address: 'Avenida Getúlio Vargas, 1400, Bosque - Rio Branco/AC',
    latitude: -9.9753,
    longitude: -67.8249,
    accepted_categories: ['BATTERIES', 'SMALL_APPLIANCES', 'CABLES'],
    max_daily_capacity: 20,
    is_active: true,
  },
  {
    id: '5e6f7a8b-789a-4bc1-f012-3456789abcde',
    name: 'Ecoponto Macapá (Central)',
    address: 'Rua Leopoldo Machado, 1100, Central - Macapá/AP',
    latitude: 0.0355,
    longitude: -51.0705,
    accepted_categories: ['BATTERIES', 'MOBILE_PHONES', 'COMPUTERS'],
    max_daily_capacity: 20,
    is_active: true,
  },
  {
    id: '6f7a8b9c-89ab-4cd2-0123-456789abcdef',
    name: 'Ecoponto Boa Vista (São Francisco)',
    address: 'Avenida Major Williams, 900, São Francisco - Boa Vista/RR',
    latitude: 2.8235,
    longitude: -60.6758,
    accepted_categories: ['BATTERIES', 'COMPUTERS', 'CABLES'],
    max_daily_capacity: 20,
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
