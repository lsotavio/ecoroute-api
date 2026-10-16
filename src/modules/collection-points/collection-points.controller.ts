import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CollectionPointsService } from './collection-points.service';
import {
  CollectionPointResponseSchema,
  CreatePointSchema,
} from './dto/create-point.dto';
import {
  SearchPointsQuerySchema,
  SearchPointsResponseSchema,
} from './dto/search-points-query.dto';

export function createCollectionPointsRoutes(
  service: CollectionPointsService
): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    const pointIdParamsSchema = z.object({
      id: z.string().uuid('O identificador deve ser um UUID válido.'),
    });

    typedApp.get(
      '/',
      {
        schema: {
          summary: 'Listar pontos de coleta próximos',
          description:
            'Busca pontos de coleta homologados próximos a partir de coordenadas geográficas (WGS 84) e raio de distância.',
          tags: ['Pontos de Coleta'],
          querystring: SearchPointsQuerySchema,
          response: {
            200: SearchPointsResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const result = await service.searchNearby(request.query);
        return reply.status(200).send(result);
      }
    );

    typedApp.post(
      '/',
      {
        schema: {
          summary: 'Cadastrar ponto de coleta',
          description: 'Registra uma nova unidade de coleta autorizada no sistema.',
          tags: ['Pontos de Coleta'],
          body: CreatePointSchema,
          response: {
            201: CollectionPointResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const point = await service.createPoint(request.body);
        return reply.status(201).send(point);
      }
    );

    typedApp.get(
      '/:id',
      {
        schema: {
          summary: 'Consultar ponto de coleta por ID',
          description: 'Recupera detalhes cadastrais de um ponto de coleta específico.',
          tags: ['Pontos de Coleta'],
          params: pointIdParamsSchema,
          response: {
            200: CollectionPointResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const point = await service.getPointById(request.params.id);
        return reply.status(200).send(point);
      }
    );

    typedApp.put(
      '/:id',
      {
        schema: {
          summary: 'Atualizar ponto de coleta',
          description: 'Atualiza os dados cadastrais e operacionais de um ponto de coleta.',
          tags: ['Pontos de Coleta'],
          params: pointIdParamsSchema,
          body: CreatePointSchema,
          response: {
            200: CollectionPointResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const updated = await service.updatePoint(request.params.id, request.body);
        return reply.status(200).send(updated);
      }
    );

    typedApp.delete(
      '/:id',
      {
        schema: {
          summary: 'Remover ponto de coleta',
          description: 'Desativa e remove um ponto de coleta das buscas ativas.',
          tags: ['Pontos de Coleta'],
          params: pointIdParamsSchema,
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        await service.deletePoint(request.params.id);
        return reply.status(204).send(null);
      }
    );
  };
}
