/**
 * RFC 7807 Problem Details representation
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalid_params?: Array<{
    name: string;
    reason: string;
  }>;
  timestamp: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly title: string;
  public readonly type: string;
  public readonly detail: string;
  public readonly invalidParams?: Array<{ name: string; reason: string }>;

  constructor(
    statusCode: number,
    title: string,
    detail: string,
    type?: string,
    invalidParams?: Array<{ name: string; reason: string }>
  ) {
    super(detail);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.title = title;
    this.detail = detail;
    this.type = type || `https://api.ecoroute.com/errors/${this.slugify(title)}`;
    this.invalidParams = invalidParams;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public toProblemDetails(instance?: string): ProblemDetails {
    const details: ProblemDetails = {
      type: this.type,
      title: this.title,
      status: this.statusCode,
      detail: this.detail,
      timestamp: new Date().toISOString(),
    };

    if (instance) {
      details.instance = instance;
    }

    if (this.invalidParams && this.invalidParams.length > 0) {
      details.invalid_params = this.invalidParams;
    }

    return details;
  }

  public static badRequest(detail: string, type?: string): AppError {
    return new AppError(400, 'Bad Request', detail, type);
  }

  public static notFound(detail: string, type?: string): AppError {
    return new AppError(404, 'Not Found', detail, type);
  }

  public static conflict(detail: string, type?: string): AppError {
    return new AppError(409, 'Conflict', detail, type);
  }

  public static unprocessableEntity(
    detail: string,
    invalidParams?: Array<{ name: string; reason: string }>,
    type?: string
  ): AppError {
    return new AppError(422, 'Unprocessable Entity', detail, type, invalidParams);
  }

  public static internal(detail = 'Ocorreu um erro interno no servidor.'): AppError {
    return new AppError(500, 'Internal Server Error', detail);
  }
}
