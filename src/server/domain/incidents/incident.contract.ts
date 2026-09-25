/**
 * Incident / CommunityReport domain contracts (RECOVERY-2 — doc §12).
 *
 * Privacy rules for this phase (no database):
 * - The API persists ONLY what the form sends into the in-memory
 *   repository. It never stores IP, User-Agent or GPS.
 * - `consent` is mandatory and recorded as part of the report.
 * - No media upload yet (doc §6.5 protections come with storage, R-3).
 */

import { z } from 'zod';

export const incidentTypeSchema = z.enum([
  'waterlogging',
  'flood',
  'landslide',
  'blocked_road',
  'person_at_risk',
]);
export type IncidentType = z.infer<typeof incidentTypeSchema>;

export const incidentStatusSchema = z.enum([
  'pending',
  'validating',
  'confirmed',
  'rejected',
]);
export type IncidentStatus = z.infer<typeof incidentStatusSchema>;

export const MAX_INCIDENT_DESCRIPTION = 2000;
export const MAX_INCIDENT_LOCATION = 300;

export const createIncidentSchema = z.object({
  type: incidentTypeSchema,
  description: z.string().trim().min(10).max(MAX_INCIDENT_DESCRIPTION),
  location: z.string().trim().min(1).max(MAX_INCIDENT_LOCATION),
  waterDepth: z.number().min(0).max(20).nullable().optional(),
  roadBlocked: z.boolean().default(false),
  peopleAtRisk: z.number().int().min(0).max(9999).default(0),
  anonymous: z.boolean().default(false),
  /** LGPD consent — required (HIDRO-ALERTA.md §6.5/§14). */
  consent: z.literal(true, {
    message: 'Consentimento obrigatório para registrar a ocorrência.',
  }),
});
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

export const incidentSchema = z.object({
  id: z.string().min(1),
  type: incidentTypeSchema,
  description: z.string().min(1),
  location: z.string().min(1),
  waterDepth: z.number().nullable(),
  roadBlocked: z.boolean(),
  peopleAtRisk: z.number().int().min(0),
  anonymous: z.boolean(),
  consent: z.boolean(),
  reportedAt: z.string(),
  status: incidentStatusSchema,
  source: z.string().min(1),
  /**
   * RECOVERY-3: real persistence → real reports are NOT simulated
   * (false). The in-memory demo repository keeps true. The flag always
   * tells the truth about the record's nature.
   */
  isSimulated: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Incident = z.infer<typeof incidentSchema>;

/**
 * CommunityReport — the citizen-facing view of an incident (doc §12 keeps
 * them as related entities; the report is the public projection).
 */
export const communityReportSchema = z.object({
  id: z.string().min(1),
  incidentId: z.string().min(1),
  /** Omitted entirely for anonymous reports — never a guessable handle. */
  reporterHandle: z.string().nullable(),
  description: z.string(),
  reportedAt: z.string(),
  isSimulated: z.literal(true),
});
export type CommunityReport = z.infer<typeof communityReportSchema>;

export const incidentFilterSchema = z
  .object({
    status: incidentStatusSchema.optional(),
    type: incidentTypeSchema.optional(),
  })
  .strict();
export type IncidentFilter = z.infer<typeof incidentFilterSchema>;
