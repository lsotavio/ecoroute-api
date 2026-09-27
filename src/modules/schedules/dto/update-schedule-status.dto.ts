import { z } from 'zod';
import { ScheduleResponseSchema, ScheduleStatusEnum } from './create-schedule.dto';

export const UpdateScheduleStatusSchema = z.object({
  status: ScheduleStatusEnum,
});

export type UpdateScheduleStatusInput = z.infer<typeof UpdateScheduleStatusSchema>;

export const UpdateScheduleParamsSchema = z.object({
  id: z.string().uuid('O ID do agendamento deve ser um UUID válido.'),
});

export type UpdateScheduleParams = z.infer<typeof UpdateScheduleParamsSchema>;
