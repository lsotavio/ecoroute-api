import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { InMemoryCollectionPointsRepository } from '../src/modules/collection-points/collection-points.repository';
import { InMemorySchedulesRepository } from '../src/modules/schedules/schedules.repository';

describe('Collection Points Module (/api/v1/collection-points)', () => {
  let app: FastifyInstance;
  let pointsRepo: InMemoryCollectionPointsRepository;
  let schedulesRepo: InMemorySchedulesRepository;

  beforeAll(async () => {
    pointsRepo = new InMemoryCollectionPointsRepository();
    schedulesRepo = new InMemorySchedulesRepository();
    app = await buildApp({ pointsRepo, schedulesRepo, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/collection-points', () => {
    it('deve listar pontos de coleta ordenados pela distância crescente', async () => {
      // Coordenadas próximas a Pinheiros (São Paulo)
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points?lat=-23.567&lng=-46.684&radius_km=10',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('meta');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);

      // Primeiro ponto deve ser o mais próximo (Ecoponto Pinheiros)
      const first = body.data[0];
      expect(first.name).toBe('Ecoponto Pinheiros');
      expect(first.distance_km).toBeDefined();
      expect(first.distance_km).toBeLessThan(1.0);

      // Validar paginação meta
      expect(body.meta.page).toBe(1);
      expect(body.meta.limit).toBe(10);
      expect(body.meta.total_items).toBeGreaterThanOrEqual(1);
    });

    it('deve filtrar pontos por categoria aceita', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points?lat=-23.5505&lng=-46.6333&radius_km=20&category=DISPLAYS',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      for (const point of body.data) {
        expect(point.accepted_categories).toContain('DISPLAYS');
      }
    });

    it('deve retornar erro 422 quando coordenadas forem inválidas', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points?lat=120&lng=0', // lat > 90
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.payload);
      expect(body.title).toBe('Unprocessable Entity');
      expect(body.status).toBe(422);
      expect(body.invalid_params).toBeDefined();
    });

    it('deve retornar erro 422 quando lat ou lng estiverem ausentes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points',
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.payload);
      expect(body.status).toBe(422);
    });
  });

  describe('POST /api/v1/collection-points', () => {
    it('deve criar um novo ponto de coleta com sucesso (201 Created)', async () => {
      const newPointPayload = {
        name: 'Ecoponto Ibirapuera',
        address: 'Avenida Pedro Álvares Cabral, s/n, Moema - São Paulo/SP',
        latitude: -23.5874,
        longitude: -46.6576,
        accepted_categories: ['BATTERIES', 'COMPUTERS', 'CABLES'],
        max_daily_capacity: 40,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/collection-points',
        payload: newPointPayload,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.id).toBeDefined();
      expect(body.name).toBe(newPointPayload.name);
      expect(body.address).toBe(newPointPayload.address);
      expect(body.max_daily_capacity).toBe(40);
      expect(body.accepted_categories).toEqual(['BATTERIES', 'COMPUTERS', 'CABLES']);
    });

    it('deve retornar 422 Unprocessable Entity com RFC 7807 ao tentar criar ponto sem campos obrigatórios', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/collection-points',
        payload: {
          name: 'Ponto Incompleto',
        },
      });

      expect(response.statusCode).toBe(422);
      const body = JSON.parse(response.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/validation-error');
      expect(body.status).toBe(422);
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/v1/collection-points/:id', () => {
    it('deve retornar detalhes do ponto por ID existente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points/7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(body.id).toBe('7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4');
      expect(body.name).toBe('Ecoponto Pinheiros');
    });

    it('deve retornar 404 Not Found para ID inexistente no formato RFC 7807', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/collection-points/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/point-not-found');
      expect(body.title).toBe('Not Found');
      expect(body.status).toBe(404);
    });
  });

  describe('PUT & DELETE /api/v1/collection-points/:id', () => {
    it('deve atualizar um ponto de coleta existente (200 OK) e depois excluí-lo (204 No Content)', async () => {
      const createdRes = await app.inject({
        method: 'POST',
        url: '/api/v1/collection-points',
        payload: {
          name: 'Ecoponto Temporário',
          address: 'Rua Augusta, 1000, Consolação - São Paulo/SP',
          latitude: -23.555,
          longitude: -46.66,
          accepted_categories: ['BATTERIES'],
          max_daily_capacity: 15,
        },
      });
      const created = JSON.parse(createdRes.payload);

      const updateRes = await app.inject({
        method: 'PUT',
        url: `/api/v1/collection-points/${created.id}`,
        payload: {
          name: 'Ecoponto Augusta Atualizado',
          address: 'Rua Augusta, 1050, Consolação - São Paulo/SP',
          latitude: -23.555,
          longitude: -46.66,
          accepted_categories: ['BATTERIES', 'MOBILE_PHONES'],
          max_daily_capacity: 35,
        },
      });

      expect(updateRes.statusCode).toBe(200);
      const updated = JSON.parse(updateRes.payload);
      expect(updated.name).toBe('Ecoponto Augusta Atualizado');
      expect(updated.max_daily_capacity).toBe(35);
      expect(updated.accepted_categories).toEqual(['BATTERIES', 'MOBILE_PHONES']);

      const deleteRes = await app.inject({
        method: 'DELETE',
        url: `/api/v1/collection-points/${created.id}`,
      });
      expect(deleteRes.statusCode).toBe(204);

      const getAfterDelete = await app.inject({
        method: 'GET',
        url: `/api/v1/collection-points/${created.id}`,
      });
      expect(getAfterDelete.statusCode).toBe(404);
    });
  });
});
