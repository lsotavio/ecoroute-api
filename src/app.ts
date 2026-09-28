import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastify, { FastifyInstance } from 'fastify';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { createCollectionPointsRoutes } from './modules/collection-points/collection-points.controller';
import {
  createCollectionPointsRepository,
  ICollectionPointsRepository,
} from './modules/collection-points/collection-points.repository';
import { CollectionPointsService } from './modules/collection-points/collection-points.service';
import { createSchedulesRoutes } from './modules/schedules/schedules.controller';
import {
  createSchedulesRepository,
  ISchedulesRepository,
} from './modules/schedules/schedules.repository';
import { SchedulesService } from './modules/schedules/schedules.service';
import { dbProvider } from './shared/database/database.provider';
import { errorHandlerFilter } from './shared/errors/error-handler.filter';

export interface BuildAppOptions {
  pointsRepo?: ICollectionPointsRepository;
  schedulesRepo?: ISchedulesRepository;
  logger?: boolean;
}

export async function buildApp(options: BuildAppOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    logger: options.logger ?? false,
    ignoreTrailingSlash: true,
  });

  // Type provider compilers
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Security Plugins
  await app.register(helmet, {
    contentSecurityPolicy: false, // Allows Swagger UI to load resources
  });

  await app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Swagger Documentation Setup
  await app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'EcoRoute API',
        description:
          'API RESTful para mapeamento inteligente e agendamento de descarte responsável de resíduos eletroeletrônicos (e-waste), com suporte a consultas geoespaciais e controle de capacidade operacional. Projeto alinhado ao ODS 11 (Cidades e Comunidades Sustentáveis) - Meta 11.6.',
        version: '1.0.0',
        contact: {
          name: 'Equipe EcoRoute',
          email: 'suporte@ecoroute.com',
        },
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Servidor Local de Desenvolvimento',
        },
      ],
      tags: [
        {
          name: 'Pontos de Coleta',
          description: 'Gestão e busca geoespacial de Pontos de Entrega Voluntária (PEV)',
        },
        {
          name: 'Agendamentos',
          description: 'Agendamento de descarte com controle de cotas diárias de capacidade',
        },
        {
          name: 'Sistema',
          description: 'Monitoramento de integridade e saúde da aplicação',
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
    staticCSP: true,
  });

  // Global Error Handler (RFC 7807)
  app.setErrorHandler(errorHandlerFilter);

  // Repositories and Services
  const pointsRepository = options.pointsRepo || createCollectionPointsRepository();
  const schedulesRepository = options.schedulesRepo || createSchedulesRepository();

  const pointsService = new CollectionPointsService(pointsRepository);
  const schedulesService = new SchedulesService(schedulesRepository, pointsRepository);

  // Healthcheck Route
  app.get(
    '/api/v1/health',
    {
      schema: {
        summary: 'Verificação de integridade da API',
        description: 'Retorna o status atual do serviço, ambiente e conectividade.',
        tags: ['Sistema'],
      },
    },
    async (request, reply) => {
      const isDbConnected = await dbProvider.checkConnection();
      return reply.status(200).send({
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'EcoRoute API',
        version: '1.0.0',
        ods: 'ODS 11 - Cidades e Comunidades Sustentáveis',
        database: {
          connected: isDbConnected,
          mode: isDbConnected ? 'PostgreSQL + PostGIS' : 'In-Memory / Fallback',
        },
      });
    }
  );

  // Root redirect to docs
  app.get('/', async (request, reply) => {
    return reply.redirect('/api/docs');
  });

  // Register Modules
  await app.register(createCollectionPointsRoutes(pointsService), {
    prefix: '/api/v1/collection-points',
  });

  await app.register(createSchedulesRoutes(schedulesService), {
    prefix: '/api/v1/schedules',
  });

  return app;
}
