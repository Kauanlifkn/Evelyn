/**
 * Sensor / Observation domain contracts (RECOVERY-2).
 *
 * CONTRACTS ONLY — no Arduino integration and NO public ingestion
 * endpoint yet (that is RECOVERY-5). These types exist so services,
 * repositories and the future ingestion API have a stable target.
 */

import { z } from 'zod';

export const sensorStatusSchema = z.enum([
  'online',
  'offline',
  'maintenance',
  'retired',
]);
export type SensorStatus = z.infer<typeof sensorStatusSchema>;

export const sensorTypeSchema = z.enum([
  'river_level',
  'rain_gauge',
  'soil_moisture',
  'tide_gauge',
  'weather_station',
]);
export type SensorType = z.infer<typeof sensorTypeSchema>;

export const sensorSchema = z.object({
  id: z.string().min(1),
  externalId: z.string().min(1),
  name: z.string().min(1),
  type: sensorTypeSchema,
  status: sensorStatusSchema,
  territoryId: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  lastSeenAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Sensor = z.infer<typeof sensorSchema>;

export const observationQualitySchema = z.enum([
  'raw',
  'validated',
  'suspicious',
  'rejected',
]);
export type ObservationQuality = z.infer<typeof observationQualitySchema>;

export const observationSchema = z.object({
  id: z.string().min(1),
  sensorId: z.string().min(1),
  value: z.number(),
  unit: z.string().min(1),
  rawValue: z.string().optional(),
  observedAt: z.string(),
  receivedAt: z.string(),
  quality: observationQualitySchema,
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});
export type Observation = z.infer<typeof observationSchema>;
