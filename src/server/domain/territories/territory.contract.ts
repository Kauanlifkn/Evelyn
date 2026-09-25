/**
 * Territory domain contract (RECOVERY-2 — doc §12).
 * Minimal shape for now: referenced by sensors/alerts; geometry arrives
 * with PostGIS in RECOVERY-3.
 */

import { z } from 'zod';

export const territorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  /** IBGE-like code when known. */
  externalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Territory = z.infer<typeof territorySchema>;
