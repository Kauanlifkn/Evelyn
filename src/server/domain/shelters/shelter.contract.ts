/**
 * Shelter domain contract (RECOVERY-2 — doc §6.6/§12).
 * No database yet: an InMemory repository seeds from the (simulated)
 * mock dataset; every entity keeps isSimulated = true.
 */

import { z } from 'zod';

export const shelterStatusSchema = z.enum([
  'open',
  'crowded',
  'closed',
  'unknown',
]);
export type ShelterStatus = z.infer<typeof shelterStatusSchema>;

export const shelterSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  address: z.string().min(1),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  /** Distance from the user, when known (km). Not provided by a source. */
  distanceKm: z.number().optional(),
  capacity: z.number().int().min(0),
  estimatedVacancies: z.number().int().min(0),
  status: shelterStatusSchema,
  accessibility: z.boolean(),
  acceptsAnimals: z.boolean(),
  foodAvailable: z.boolean(),
  medicalSupport: z.boolean(),
  phone: z.string().nullable(),
  lastUpdatedAt: z.string(),
  source: z.string().min(1),
  isSimulated: z.literal(true),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Shelter = z.infer<typeof shelterSchema>;

export const shelterIdParamSchema = z.object({
  id: z.string().min(1).max(100),
});

export const shelterFilterSchema = z
  .object({
    status: shelterStatusSchema.optional(),
    city: z.string().min(1).max(120).optional(),
    /** Free-text name/address match (case-insensitive contains). */
    search: z.string().min(1).max(120).optional(),
    accessible: z.enum(['true', 'false']).optional(),
    acceptsAnimals: z.enum(['true', 'false']).optional(),
  })
  .strict();
export type ShelterFilter = z.infer<typeof shelterFilterSchema>;
