/**
 * Standard application error (RECOVERY-2).
 *
 * Every API error response uses this envelope — never a raw stack trace:
 * {
 *   "error": {
 *     "code": "NOT_FOUND",
 *     "message": "...",
 *     "correlationId": "...",
 *     "details": ...
 *   }
 * }
 */

export const AppErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  UPSTREAM_ERROR: 'UPSTREAM_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type AppErrorCodeValue =
  (typeof AppErrorCode)[keyof typeof AppErrorCode];

const HTTP_STATUS: Record<AppErrorCodeValue, number> = {
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  UPSTREAM_ERROR: 502,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export interface AppErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCodeValue;
  readonly details?: AppErrorDetails;

  constructor(
    code: AppErrorCodeValue,
    message: string,
    details?: AppErrorDetails
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }

  get httpStatus(): number {
    return HTTP_STATUS[this.code];
  }

  static validation(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.VALIDATION_ERROR, message, details);
  }

  static notFound(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.NOT_FOUND, message, details);
  }

  static conflict(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.CONFLICT, message, details);
  }

  static rateLimited(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.RATE_LIMITED, message, details);
  }

  static upstream(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.UPSTREAM_ERROR, message, details);
  }

  static internal(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.INTERNAL_ERROR, message, details);
  }

  static unavailable(message: string, details?: AppErrorDetails): AppError {
    return new AppError(AppErrorCode.SERVICE_UNAVAILABLE, message, details);
  }
}

export interface ErrorResponseBody {
  error: {
    code: AppErrorCodeValue;
    message: string;
    correlationId: string;
    details?: AppErrorDetails;
  };
}

/**
 * Map any thrown value to the standard error body.
 * Stack traces NEVER leave the server.
 */
export function toErrorBody(
  error: unknown,
  correlationId: string
): { status: number; body: ErrorResponseBody } {
  if (error instanceof AppError) {
    return {
      status: error.httpStatus,
      body: {
        error: {
          code: error.code,
          message: error.message,
          correlationId,
          ...(error.details ? { details: error.details } : {}),
        },
      },
    };
  }

  return {
    status: 500,
    body: {
      error: {
        code: AppErrorCode.INTERNAL_ERROR,
        message: 'Erro interno inesperado.',
        correlationId,
      },
    },
  };
}
