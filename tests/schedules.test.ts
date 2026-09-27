import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { InMemoryCollectionPointsRepository } from '../src/modules/collection-points/collection-points.repository';
import { InMemorySchedulesRepository } from '../src/modules/schedules/schedules.repository';

describe('Schedules Module (/api/v1/schedules)', () => {
  let app: FastifyInstance;
  let pointsRepo: InMemoryCollectionPointsRepository;
  let schedulesRepo: InMemorySchedulesRepository;

  // Use a future date for valid tests
  const futureDate = '2026-10-15';
  const validPointId = '7f8b9e6a-12ab-4c3d-8e45-f9a8b7c6d5e4'; // Ecoponto Pinheiros (BATTERIES, DISPLAYS, CABLES, cap: 25)

  beforeAll(async () => {
    pointsRepo = new InMemoryCollectionPointsRepository();
    schedulesRepo = new InMemorySchedulesRepository();
    app = await buildApp({ pointsRepo, schedulesRepo, logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/v1/schedules', () => {
    it('deve registrar um agendamento com sucesso (201 Created)', async () => {
      const payload = {
        collection_point_id: validPointId,
        user_name: 'Ana Paula Silva',
        user_email: 'ana.silva@exemplo.com',
        scheduled_date: futureDate,
        waste_category: 'BATTERIES',
        items_description: '2 notebooks antigos e 6 baterias de celular',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body.id).toBeDefined();
      expect(body.collection_point_id).toBe(validPointId);
      expect(body.user_name).toBe(payload.user_name);
      expect(body.user_email).toBe(payload.user_email);
      expect(body.scheduled_date).toBe(futureDate);
      expect(body.waste_category).toBe('BATTERIES');
      expect(body.status).toBe('PENDING');
    });

    it('deve rejeitar agendamento com data no passado (400 Bad Request)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: validPointId,
          user_name: 'Carlos Mendes',
          user_email: 'carlos@exemplo.com',
          scheduled_date: '2020-01-01',
          waste_category: 'BATTERIES',
          items_description: 'Itens antigos',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/past-date');
      expect(body.title).toBe('Bad Request');
      expect(body.detail).toContain('anterior à data de hoje');
    });

    it('deve rejeitar agendamento com categoria de resíduo não suportada pelo ponto (400 Bad Request)', async () => {
      // Ecoponto Pinheiros aceita BATTERIES, DISPLAYS, CABLES, mas NÃO aceita LARGE_APPLIANCES
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: validPointId,
          user_name: 'Mariana Lima',
          user_email: 'mariana@exemplo.com',
          scheduled_date: futureDate,
          waste_category: 'LARGE_APPLIANCES',
          items_description: '1 geladeira antiga',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/unsupported-waste-category');
      expect(body.detail).toContain('não aceita a categoria');
    });

    it('deve retornar 404 Not Found se o ponto de coleta não existir', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: '11111111-1111-1111-1111-111111111111',
          user_name: 'Mariana Lima',
          user_email: 'mariana@exemplo.com',
          scheduled_date: futureDate,
          waste_category: 'BATTERIES',
          items_description: 'Pilhas alcalinas',
        },
      });

      expect(response.statusCode).toBe(404);
      const body = JSON.parse(response.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/point-not-found');
    });

    it('deve retornar 409 Conflict no formato RFC 7807 quando exceder a capacidade diária', async () => {
      // Cria um ponto temporário com capacidade máxima de 1 agendamento
      const testPoint = await pointsRepo.create({
        name: 'Ponto Pequeno',
        address: 'Rua Teste, 10',
        latitude: -23.55,
        longitude: -46.63,
        accepted_categories: ['BATTERIES'],
        max_daily_capacity: 1,
      });

      const dateToTest = '2026-11-20';

      // 1º agendamento: deve ser aceito
      const res1 = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: testPoint.id,
          user_name: 'Usuário 1',
          user_email: 'user1@teste.com',
          scheduled_date: dateToTest,
          waste_category: 'BATTERIES',
          items_description: 'Notebook estragado',
        },
      });
      expect(res1.statusCode).toBe(201);

      // 2º agendamento para o mesmo dia e ponto: deve estourar a capacidade (409 Conflict)
      const res2 = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: testPoint.id,
          user_name: 'Usuário 2',
          user_email: 'user2@teste.com',
          scheduled_date: dateToTest,
          waste_category: 'BATTERIES',
          items_description: 'Tablet quebrado',
        },
      });

      expect(res2.statusCode).toBe(409);
      const body = JSON.parse(res2.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/capacity-exceeded');
      expect(body.title).toBe('Conflict');
      expect(body.status).toBe(409);
      expect(body.detail).toBe(
        `O ponto de coleta atingiu sua capacidade máxima de 1 agendamentos para a data ${dateToTest}.`
      );
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('PATCH /api/v1/schedules/:id/status', () => {
    it('deve atualizar o status do agendamento para CONFIRMED e depois COMPLETED (200 OK)', async () => {
      // Criar agendamento
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: validPointId,
          user_name: 'Lucas Teste',
          user_email: 'lucas@teste.com',
          scheduled_date: '2026-12-01',
          waste_category: 'CABLES',
          items_description: 'Massa de fios antigos',
        },
      });
      const created = JSON.parse(createRes.payload);

      // Atualizar para CONFIRMED
      const updateRes1 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/schedules/${created.id}/status`,
        payload: { status: 'CONFIRMED' },
      });
      expect(updateRes1.statusCode).toBe(200);
      expect(JSON.parse(updateRes1.payload).status).toBe('CONFIRMED');

      // Atualizar para COMPLETED
      const updateRes2 = await app.inject({
        method: 'PATCH',
        url: `/api/v1/schedules/${created.id}/status`,
        payload: { status: 'COMPLETED' },
      });
      expect(updateRes2.statusCode).toBe(200);
      expect(JSON.parse(updateRes2.payload).status).toBe('COMPLETED');
    });

    it('deve rejeitar transição inválida de CANCELLED para COMPLETED (400 Bad Request)', async () => {
      // Criar e cancelar
      const createRes = await app.inject({
        method: 'POST',
        url: '/api/v1/schedules',
        payload: {
          collection_point_id: validPointId,
          user_name: 'Teste Cancel',
          user_email: 'cancel@teste.com',
          scheduled_date: '2026-12-05',
          waste_category: 'CABLES',
          items_description: 'Cabos',
        },
      });
      const created = JSON.parse(createRes.payload);

      await app.inject({
        method: 'PATCH',
        url: `/api/v1/schedules/${created.id}/status`,
        payload: { status: 'CANCELLED' },
      });

      // Tentar passar de CANCELLED para COMPLETED
      const invalidRes = await app.inject({
        method: 'PATCH',
        url: `/api/v1/schedules/${created.id}/status`,
        payload: { status: 'COMPLETED' },
      });

      expect(invalidRes.statusCode).toBe(400);
      const body = JSON.parse(invalidRes.payload);
      expect(body.type).toBe('https://api.ecoroute.com/errors/invalid-status-transition');
      expect(body.detail).toContain('Não é permitida a transição de estado');
    });
  });

  describe('GET /api/v1/schedules', () => {
    it('deve listar agendamentos existentes', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/schedules',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.payload);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });
  });
});
