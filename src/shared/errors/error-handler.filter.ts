import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ProblemDetails } from './app-error';

export function errorHandlerFilter(
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  const instance = request.raw.url || request.url;

  // 1. If it's a known domain AppError
  if (error instanceof AppError) {
    const details = error.toProblemDetails(instance);
    reply.status(error.statusCode).send(details);
    return;
  }

  // 2. If it's a Zod validation error
  if (error instanceof ZodError) {
    const invalidParams = error.issues.map((issue) => ({
      name: issue.path.join('.'),
      reason: issue.message,
    }));

    const problem: ProblemDetails = {
      type: 'https://api.ecoroute.com/errors/validation-error',
      title: 'Unprocessable Entity',
      status: 422,
      detail: 'Os dados fornecidos na requisição são inválidos ou incompletos.',
      instance,
      invalid_params: invalidParams,
      timestamp: new Date().toISOString(),
    };

    reply.status(422).send(problem);
    return;
  }

  // 3. If it's a Fastify Schema validation error
  if ('validation' in error && Array.isArray((error as FastifyError).validation)) {
    const fastifyErr = error as FastifyError;
    const invalidParams = (fastifyErr.validation || []).map((v) => ({
      name: (v as any).instancePath || (v as any).params?.missingProperty || 'field',
      reason: v.message || 'Valor inválido',
    }));

    const problem: ProblemDetails = {
      type: 'https://api.ecoroute.com/errors/validation-error',
      title: 'Unprocessable Entity',
      status: 422,
      detail: fastifyErr.message || 'Erro de validação nos campos informados.',
      instance,
      invalid_params: invalidParams,
      timestamp: new Date().toISOString(),
    };

    reply.status(422).send(problem);
    return;
  }

  // 4. Default Internal Server Error
  request.log.error(error);

  const problem: ProblemDetails = {
    type: 'https://api.ecoroute.com/errors/internal-server-error',
    title: 'Internal Server Error',
    status: 500,
    detail:
      process.env.NODE_ENV === 'production'
        ? 'Ocorreu um erro interno inesperado no servidor.'
        : error.message || 'Erro interno no servidor.',
    instance,
    timestamp: new Date().toISOString(),
  };

  reply.status(500).send(problem);
}
