import { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';

describe('Health and System Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health deve retornar status UP com metadados do ODS 11', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.payload);
    expect(body.status).toBe('UP');
    expect(body.service).toBe('EcoRoute API');
    expect(body.ods).toContain('ODS 11');
    expect(body.database).toBeDefined();
  });

  it('GET / deve redirecionar para a documentação Swagger em /api/docs', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('/api/docs');
  });
});
