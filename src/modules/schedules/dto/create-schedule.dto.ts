import { z } from 'zod';

export const ScheduleStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'COMPLETED',
  'CANCELLED',
]);

export type ScheduleStatus = z.infer<typeof ScheduleStatusEnum>;

export const CreateScheduleSchema = z.object({
  collection_point_id: z
    .string({ required_error: 'O ID do ponto de coleta é obrigatório.' })
    .uuid('O ID do ponto de coleta deve ser um UUID válido.'),
  user_name: z
    .string({ required_error: 'O nome do usuário é obrigatório.' })
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(100, 'O nome não pode exceder 100 caracteres.'),
  user_email: z
    .string({ required_error: 'O e-mail do usuário é obrigatório.' })
    .email('O e-mail informado é inválido.')
    .max(120, 'O e-mail não pode exceder 120 caracteres.'),
  scheduled_date: z
    .string({ required_error: 'A data do agendamento é obrigatória.' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data deve estar no formato AAAA-MM-DD (ISO 8601).'),
  waste_category: z
    .string({ required_error: 'A categoria do resíduo é obrigatória.' })
    .min(2, 'A categoria deve ser informada.')
    .max(50, 'A categoria não pode exceder 50 caracteres.'),
  items_description: z
    .string({ required_error: 'A descrição dos itens é obrigatória.' })
    .min(3, 'A descrição deve ter no mínimo 3 caracteres.')
    .max(500, 'A descrição não pode exceder 500 caracteres.'),
});

export type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;

export const ScheduleResponseSchema = z.object({
  id: z.string().uuid(),
  collection_point_id: z.string().uuid(),
  user_name: z.string(),
  user_email: z.string().email(),
  scheduled_date: z.string(),
  waste_category: z.string(),
  items_description: z.string(),
  status: ScheduleStatusEnum,
  created_at: z.string().optional(),
});

export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;
