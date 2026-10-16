import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ApiRequestError, createEcoRouteApi } from '../frontend/src/api';
import { buildApp } from '../src/app';
import { InMemoryCollectionPointsRepository } from '../src/modules/collection-points/collection-points.repository';
import { InMemorySchedulesRepository } from '../src/modules/schedules/schedules.repository';

describe('Front-End HTTP Client Integration with Back-End API', () => {
  let app: FastifyInstance;
  let baseUrl: string;
  let client: ReturnType<typeof createEcoRouteApi>;

  beforeAll(async () => {
    const pointsRepo = new InMemoryCollectionPointsRepository();
    const schedulesRepo = new InMemorySchedulesRepository();
    app = await buildApp({ pointsRepo, schedulesRepo, logger: false });
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    baseUrl = address;
    client = createEcoRouteApi(baseUrl);
  });

  afterAll(async () => {
    await app.close();
  });

  it('deve consultar o status de saúde da API via cliente HTTP do Front-End', async () => {
    const health = await client.getHealth();
    expect(health.status).toBe('UP');
    expect(health.service).toBe('EcoRoute API');
    expect(health.database.mode).toBeDefined();
  });

  it('deve executar o ciclo completo de pontos de coleta (GET, POST, PUT, DELETE) via Front-End', async () => {
    const initialSearch = await client.searchPoints({
      lat: -23.55052,
      lng: -46.633308,
      radius_km: 15,
    });
    expect(initialSearch.data.length).toBeGreaterThan(0);

    const created = await client.createPoint({
      name: 'Ecoponto Integração Front-End',
      address: 'Av. Brigadeiro Faria Lima, 2000 - São Paulo/SP',
      latitude: -23.574,
      longitude: -46.689,
      accepted_categories: ['BATTERIES', 'COMPUTERS'],
      max_daily_capacity: 20,
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Ecoponto Integração Front-End');

    const fetched = await client.getPointById(created.id);
    expect(fetched.id).toBe(created.id);

    const updated = await client.updatePoint(created.id, {
      name: 'Ecoponto Faria Lima Homologado',
      address: 'Av. Brigadeiro Faria Lima, 2100 - São Paulo/SP',
      latitude: -23.574,
      longitude: -46.689,
      accepted_categories: ['BATTERIES', 'COMPUTERS', 'DISPLAYS'],
      max_daily_capacity: 45,
    });
    expect(updated.name).toBe('Ecoponto Faria Lima Homologado');
    expect(updated.max_daily_capacity).toBe(45);

    await client.deletePoint(created.id);

    await expect(client.getPointById(created.id)).rejects.toThrowError(ApiRequestError);
  });

  it('deve executar o ciclo completo de agendamentos (POST, GET, PATCH, DELETE) e capturar erros RFC 7807', async () => {
    const points = await client.searchPoints({
      lat: -23.55052,
      lng: -46.633308,
      radius_km: 15,
    });
    const targetPoint = points.data[0];

    const createdSchedule = await client.createSchedule({
      collection_point_id: targetPoint.id,
      user_name: 'Henrique Souza',
      user_email: 'henrique.souza@exemplo.com',
      scheduled_date: '2026-11-15',
      waste_category: targetPoint.accepted_categories[0],
      items_description: '3 baterias estacionárias de nobreak',
    });
    expect(createdSchedule.status).toBe('PENDING');

    const confirmed = await client.updateScheduleStatus(
      createdSchedule.id,
      'CONFIRMED'
    );
    expect(confirmed.status).toBe('CONFIRMED');

    const completed = await client.updateScheduleStatus(
      createdSchedule.id,
      'COMPLETED'
    );
    expect(completed.status).toBe('COMPLETED');

    await expect(
      client.updateScheduleStatus(createdSchedule.id, 'PENDING')
    ).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 400,
    });

    await client.deleteSchedule(createdSchedule.id);
    await expect(client.getScheduleById(createdSchedule.id)).rejects.toMatchObject({
      name: 'ApiRequestError',
      status: 404,
    });
  });
});
