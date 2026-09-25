/**
 * DataSource / SourceHealth domain contracts (RECOVERY-2 — doc §12).
 * The INMET provider adapts into these contracts.
 */

import { z } from 'zod';

export const sourceStatusSchema = z.enum(['ONLINE', 'STALE', 'OFFLINE']);
export type SourceStatus = z.infer<typeof sourceStatusSchema>;

export const sourceTypeSchema = z.enum([
  'OFFICIAL_WEATHER',
  'OFFICIAL_HYDRO',
  'SENSOR',
  'COMMUNITY',
  'DEMO',
]);
export type SourceType = z.infer<typeof sourceTypeSchema>;

export interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  createdAt: string;
  updatedAt: string;
}

export interface SourceHealth {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  latencyMs: number | null;
  errorCode: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

export const sourceHealthSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: sourceTypeSchema,
  status: sourceStatusSchema,
  lastAttemptAt: z.string().nullable(),
  lastSuccessAt: z.string().nullable(),
  latencyMs: z.number().nullable(),
  errorCode: z.string().nullable(),
  message: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
