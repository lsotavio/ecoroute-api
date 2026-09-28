import { z } from 'zod';

export const WasteCategoryEnum = z.enum([
  'BATTERIES',
  'DISPLAYS',
  'CABLES',
  'SMALL_APPLIANCES',
  'LARGE_APPLIANCES',
  'COMPUTERS',
  'MOBILE_PHONES',
  'LIGHTING',
  'OTHERS',
]);

export type WasteCategory = z.infer<typeof WasteCategoryEnum>;

export const CreatePointSchema = z.object({
  name: z
    .string({ required_error: 'O nome do ponto de coleta é obrigatório.' })
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(120, 'O nome não pode exceder 120 caracteres.'),
  address: z
    .string({ required_error: 'O endereço é obrigatório.' })
    .min(5, 'O endereço deve ter no mínimo 5 caracteres.')
    .max(255, 'O endereço não pode exceder 255 caracteres.'),
  latitude: z
    .number({ required_error: 'A latitude é obrigatória.' })
    .min(-90, 'A latitude deve estar entre -90 e 90 graus.')
    .max(90, 'A latitude deve estar entre -90 e 90 graus.'),
  longitude: z
    .number({ required_error: 'A longitude é obrigatória.' })
    .min(-180, 'A longitude deve estar entre -180 e 180 graus.')
    .max(180, 'A longitude deve estar entre -180 e 180 graus.'),
  accepted_categories: z
    .array(z.string().min(1), {
      required_error: 'A lista de categorias aceitas é obrigatória.',
    })
    .min(1, 'Informe pelo menos uma categoria aceita de resíduos.'),
  max_daily_capacity: z
    .number()
    .int('A capacidade deve ser um número inteiro.')
    .min(1, 'A capacidade diária mínima é 1.')
    .default(20),
});

export type CreatePointInput = z.infer<typeof CreatePointSchema>;

export const CollectionPointResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distance_km: z.number().optional(),
  accepted_categories: z.array(z.string()),
  max_daily_capacity: z.number(),
  is_active: z.boolean(),
  created_at: z.union([z.string(), z.date()]).optional(),
});

export type CollectionPointResponse = z.infer<typeof CollectionPointResponseSchema>;
