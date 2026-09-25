/**
 * Route wrapper (RECOVERY-2): every Route Handler goes through here.
 *
 * Responsibilities:
 * - resolve/echo the correlation id (`x-correlation-id` in and out);
 * - structured request logging (route, durationMs, status, code);
 * - centralized error mapping (AppError → standard envelope; unknown →
 *   500 INTERNAL_ERROR) — stack traces never leave the server;
 * - no-store caching for dynamic API responses.
 */

import { NextResponse } from 'next/server';
import {
  CORRELATION_ID_HEADER,
  resolveCorrelationId,
} from '@/server/shared/ids/correlation';
import { toErrorBody } from '@/server/shared/errors/app-error';
import { logger } from '@/server/infrastructure/observability/logger';

export interface RouteContext {
  correlationId: string;
}

type NextParams = Record<string, string>;

export function withRoute(
  route: string,
  handler: (
    request: Request,
    ctx: RouteContext & { params: NextParams }
  ) => Promise<Response>
): (request: Request, segment?: { params: Promise<NextParams> }) => Promise<Response> {
  return async (request, segment) => {
    const correlationId = resolveCorrelationId(request);
    const startedAt = Date.now();
    const method = request.method;

    try {
      const params = (await segment?.params) ?? {};
      const response = await handler(request, { correlationId, params });
      response.headers.set(CORRELATION_ID_HEADER, correlationId);
      response.headers.set('Cache-Control', 'no-store');
      logger.info('http.request', {
        route,
        method,
        status: response.status,
        durationMs: Date.now() - startedAt,
        correlationId,
      });
      return response;
    } catch (error) {
      const { status, body } = toErrorBody(error, correlationId);
      const logFields = {
        route,
        method,
        status,
        code: body.error.code,
        durationMs: Date.now() - startedAt,
        correlationId,
      };
      if (status >= 500) {
        // Server-side detail only (no client exposure, no user data).
        logger.error('http.request.failed', {
          ...logFields,
          detail: error instanceof Error ? error.message : 'unknown',
        });
      } else {
        logger.warn('http.request.rejected', logFields);
      }
      return NextResponse.json(body, {
        status,
        headers: {
          [CORRELATION_ID_HEADER]: correlationId,
          'Cache-Control': 'no-store',
        },
      });
    }
  };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return NextResponse.json(data, { status });
}
