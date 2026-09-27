import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  CreateScheduleSchema,
  ScheduleResponseSchema,
  ScheduleStatusEnum,
} from './dto/create-schedule.dto';
import {
  UpdateScheduleParamsSchema,
  UpdateScheduleStatusSchema,
} from './dto/update-schedule-status.dto';
import { SchedulesService } from './schedules.service';

export function createSchedulesRoutes(service: SchedulesService): FastifyPluginAsync {
  return async (app: FastifyInstance) => {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/schedules
    typedApp.post(
      '/',
      {
        schema: {
          summary: 'Criar agendamento de descarte',
          description:
            'Registra um agendamento de descarte com validação de capacidade diária e compatibilidade de resíduos.',
          tags: ['Agendamentos'],
          body: CreateScheduleSchema,
          response: {
            201: ScheduleResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const schedule = await service.createSchedule(request.body);
        return reply.status(201).send(schedule);
      }
    );

    // PATCH /api/v1/schedules/:id/status
    typedApp.patch(
      '/:id/status',
      {
        schema: {
          summary: 'Atualizar status do agendamento',
          description:
            'Atualiza o status do ciclo de vida do descarte (PENDING, CONFIRMED, COMPLETED, CANCELLED).',
          tags: ['Agendamentos'],
          params: UpdateScheduleParamsSchema,
          body: UpdateScheduleStatusSchema,
          response: {
            200: ScheduleResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const updated = await service.updateStatus(
          request.params.id,
          request.body.status
        );
        return reply.status(200).send(updated);
      }
    );

    // GET /api/v1/schedules/:id
    typedApp.get(
      '/:id',
      {
        schema: {
          summary: 'Consultar agendamento por ID',
          description: 'Recupera os detalhes de um agendamento específico.',
          tags: ['Agendamentos'],
          params: UpdateScheduleParamsSchema,
          response: {
            200: ScheduleResponseSchema,
          },
        },
      },
      async (request, reply) => {
        const schedule = await service.getScheduleById(request.params.id);
        return reply.status(200).send(schedule);
      }
    );

    // GET /api/v1/schedules
    typedApp.get(
      '/',
      {
        schema: {
          summary: 'Listar agendamentos',
          description: 'Lista agendamentos de descarte com filtros opcionais.',
          tags: ['Agendamentos'],
          querystring: z.object({
            collection_point_id: z.string().uuid().optional(),
            scheduled_date: z
              .string()
              .regex(/^\d{4}-\d{2}-\d{2}$/)
              .optional(),
            status: ScheduleStatusEnum.optional(),
          }),
          response: {
            200: z.array(ScheduleResponseSchema),
          },
        },
      },
      async (request, reply) => {
        const list = await service.listSchedules(request.query);
        return reply.status(200).send(list);
      }
    );
  };
}
