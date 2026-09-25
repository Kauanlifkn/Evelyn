/**
 * Alert domain contract (RECOVERY-2 — HIDRO-ALERTA.md §5/§12).
 *
 * Severity follows the official 0–4 scale:
 *   0 Informativo · 1 Atenção · 2 Perigo · 3 Perigo extremo · 4 Emergência
 * Level 4 (Evacuação/resgate) is NEVER produced automatically — it requires
 * a human-approved official source (doc §13).
 *
 * INMET compatibility: the INMET adapter maps
 *   informative→0, attention→1, danger→2, extreme→3
 * and keeps the original string in `originalSeverity`.
 */

import { z } from 'zod';

export const alertSeveritySchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type AlertSeverity = z.infer<typeof alertSeveritySchema>;

export const alertOriginSchema = z.enum([
  'OFFICIAL',
  'SENSOR',
  'MODEL',
  'OPERATOR',
  'COMMUNITY',
  'PARTNER',
]);
export type AlertOrigin = z.infer<typeof alertOriginSchema>;

export const alertStatusSchema = z.enum([
  'draft',
  'validating',
  'active',
  'updated',
  'closed',
  'cancelled',
  'false_positive',
]);
export type AlertStatus = z.infer<typeof alertStatusSchema>;

export const alertAreaSchema = z.object({
  areaDesc: z.string().min(1),
  /** Optional geometry placeholders for PostGIS (RECOVERY-3). */
  polygon: z.string().optional(),
  circle: z.string().optional(),
  geocode: z.string().optional(),
});
export type AlertArea = z.infer<typeof alertAreaSchema>;

export const alertSchema = z.object({
  id: z.string().min(1),
  externalId: z.string().min(1),
  /** Data source identifier, e.g. "INMET". */
  source: z.string().min(1),
  sourceType: z.string().min(1),
  origin: alertOriginSchema,
  eventType: z.string().min(1),
  severity: alertSeveritySchema,
  originalSeverity: z.string(),
  status: alertStatusSchema,
  title: z.string().min(1),
  description: z.string(),
  instruction: z.string().optional(),
  issuedAt: z.string().optional(),
  effectiveAt: z.string().optional(),
  expiresAt: z.string().optional(),
  areas: z.array(alertAreaSchema),
  isOfficial: z.boolean(),
  isSimulated: z.boolean(),
  sourceUrl: z.string(),
  fetchedAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Alert = z.infer<typeof alertSchema>;

/** Query filters for GET /api/v1/alerts (all validated with Zod).
 *  Boolean filters arrive as 'true'/'false' strings and are normalized by
 *  the service (keeps the parsed type input-shaped). */
export const alertFilterSchema = z
  .object({
    source: z.string().min(1).optional(),
    severity: z.coerce.number().int().min(0).max(4).optional(),
    eventType: z.string().min(1).optional(),
    status: alertStatusSchema.optional(),
    official: z.enum(['true', 'false']).optional(),
    active: z.enum(['true', 'false']).optional(),
  })
  .strict();
export type AlertFilter = z.infer<typeof alertFilterSchema>;

export const alertIdParamSchema = z.object({
  id: z.string().min(1).max(200),
});

/**
 * Port implemented by alert sources (INMET, mock, future IDAP).
 * The application service depends on THIS port, not on any provider.
 */
export interface AlertSourcePort {
  /** Source identifier, e.g. "INMET" or "MOCK". */
  readonly id: string;
  fetchAlerts(): Promise<Alert[]>;
}
