/**
 * Structured server-side logger (RECOVERY-2).
 *
 * Every line is single-line JSON with: timestamp, level, event,
 * correlationId, plus event-specific fields (route, durationMs, status,
 * source, upstreamStatus, attempt, latencyMs).
 *
 * NEVER log: personal data, incident descriptions, tokens, authorization
 * headers, or stack traces of user-facing requests (stacks go to the
 * server console only on internal errors, without user data).
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogFields {
  [key: string]: string | number | boolean | null | undefined;
}

function write(level: LogLevel, event: string, fields: LogFields): void {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v !== undefined)
    ),
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  debug: (event: string, fields: LogFields = {}) => write('debug', event, fields),
  info: (event: string, fields: LogFields = {}) => write('info', event, fields),
  warn: (event: string, fields: LogFields = {}) => write('warn', event, fields),
  error: (event: string, fields: LogFields = {}) => write('error', event, fields),
};
