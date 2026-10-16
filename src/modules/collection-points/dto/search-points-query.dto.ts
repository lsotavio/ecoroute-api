import { z } from 'zod';
import { CollectionPointResponseSchema } from './create-point.dto';

export const SearchPointsQuerySchema = z.object({
  lat: z.coerce
    .number({ required_error: 'O parâmetro lat (latitude) é obrigatório.' })
    .min(-90, 'A latitude deve estar entre -90 e 90.')
    .max(90, 'A latitude deve estar entre -90 e 90.'),
  lng: z.coerce
    .number({ required_error: 'O parâmetro lng (longitude) é obrigatório.' })
    .min(-180, 'A longitude deve estar entre -180 e 180.')
    .max(180, 'A longitude deve estar entre -180 e 180.'),
  radius_km: z.coerce
    .number()
    .positive('O raio de busca deve ser maior que zero.')
    .max(1000, 'O raio máximo de busca permitido é de 1000 km.')
    .default(5.0),
  category: z
    .string()
    .optional()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  page: z.coerce
    .number()
    .int()
    .min(1, 'A página deve ser maior ou igual a 1.')
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, 'O limite deve ser no mínimo 1.')
    .max(50, 'O limite máximo por página é de 50 itens.')
    .default(10),
});

export type SearchPointsQueryInput = z.infer<typeof SearchPointsQuerySchema>;

export const SearchPointsResponseSchema = z.object({
  data: z.array(CollectionPointResponseSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total_items: z.number(),
    total_pages: z.number(),
  }),
});

export type SearchPointsResponse = z.infer<typeof SearchPointsResponseSchema>;
