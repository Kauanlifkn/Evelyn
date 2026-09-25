/**
 * Database schema (RECOVERY-3) — Drizzle/PostgreSQL + PostGIS.
 *
 * Covers the ACTIVE domain (doc §12 subset): territories, data_sources,
 * source_health, alerts, alert_areas, shelters, incidents, sensors,
 * observations. Remaining §12 entities (users, missions, routes, etc.)
 * are intentionally deferred — see docs/DATABASE.md §Futuras.
 *
 * Honesty constraints at the DATABASE level:
 * - alerts.severity ∈ [0,4]
 * - alerts: is_official and is_simulated are mutually exclusive
 * - alerts: UNIQUE (source_id, external_id) → INMET upsert/dedupe
 */

import {
  boolean,
  check,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  customType,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

/** PostGIS geography(Point,4326) — app code passes/handles WKT strings. */
const geographyPoint = () =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      return 'geography(Point,4326)';
    },
  })();

const geometryMultiPolygon = () =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      return 'geometry(MultiPolygon,4326)';
    },
  })();

const geometryAny = () =>
  customType<{ data: string; driverData: string }>({
    dataType() {
      return 'geometry(Geometry,4326)';
    },
  })();

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

export const territories = pgTable(
  'territories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    type: text('type').notNull().default('municipality'),
    parentId: uuid('parent_id').references((): AnyPgColumn => territories.id),
    ibgeCode: text('ibge_code'),
    geometry: geometryMultiPolygon(),
    ...timestamps,
  },
  (table) => [index('territories_geometry_gist').using('gist', table.geometry)]
);

export const dataSources = pgTable(
  'data_sources',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    baseUrl: text('base_url'),
    enabled: boolean('enabled').notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex('data_sources_code_key').on(table.code)]
);

export const sourceHealth = pgTable(
  'source_health',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => dataSources.id),
    status: text('status').notNull(),
    lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true }),
    lastSuccessAt: timestamp('last_success_at', { withTimezone: true }),
    latencyMs: integer('latency_ms'),
    errorCode: text('error_code'),
    message: text('message'),
    ...timestamps,
  },
  (table) => [
    // Latest-state model (decision in docs/DATABASE.md §Source health).
    uniqueIndex('source_health_source_key').on(table.sourceId),
  ]
);

export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    externalId: text('external_id').notNull(),
    sourceId: uuid('source_id')
      .notNull()
      .references(() => dataSources.id),
    sourceType: text('source_type').notNull(),
    origin: text('origin').notNull(),
    eventType: text('event_type').notNull(),
    severity: smallint('severity').notNull(),
    originalSeverity: text('original_severity').notNull(),
    status: text('status').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    instruction: text('instruction'),
    issuedAt: timestamp('issued_at', { withTimezone: true }),
    effectiveAt: timestamp('effective_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    isOfficial: boolean('is_official').notNull(),
    isSimulated: boolean('is_simulated').notNull(),
    sourceUrl: text('source_url').notNull().default(''),
    fetchedAt: timestamp('fetched_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    check('alerts_severity_range', sql`${table.severity} BETWEEN 0 AND 4`),
    check(
      'alerts_official_not_simulated',
      sql`NOT (${table.isOfficial} AND ${table.isSimulated})`
    ),
    // INMET dedupe: one row per (source, external alert id).
    uniqueIndex('alerts_source_external_key').on(table.sourceId, table.externalId),
    index('alerts_status_active_idx').on(table.status, table.expiresAt),
    index('alerts_severity_idx').on(table.severity),
  ]
);

export const alertAreas = pgTable(
  'alert_areas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    alertId: uuid('alert_id')
      .notNull()
      .references(() => alerts.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // INMET does not provide geometry — the column stays NULL unless a
    // source provides real polygons (doc §11/§Apêndice E).
    geometry: geometryAny(),
    geocode: text('geocode'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('alert_areas_alert_idx').on(table.alertId),
    index('alert_areas_geometry_gist').using('gist', table.geometry),
  ]
);

export const shelters = pgTable(
  'shelters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    address: text('address').notNull(),
    location: geographyPoint(),
    capacity: integer('capacity').notNull(),
    estimatedVacancies: integer('estimated_vacancies').notNull(),
    status: text('status').notNull(),
    accessibility: boolean('accessibility').notNull().default(false),
    acceptsAnimals: boolean('accepts_animals').notNull().default(false),
    foodAvailable: boolean('food_available').notNull().default(false),
    medicalSupport: boolean('medical_support').notNull().default(false),
    phone: text('phone'),
    source: text('source').notNull(),
    isSimulated: boolean('is_simulated').notNull(),
    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index('shelters_location_gist').using('gist', table.location),
    index('shelters_status_idx').on(table.status),
  ]
);

export const incidents = pgTable(
  'incidents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(),
    description: text('description').notNull(),
    location: geographyPoint(),
    // Human-readable place (from the form); no IP/UA/GPS is ever stored.
    locationText: text('location_text').notNull(),
    waterDepth: doublePrecision('water_depth'),
    roadBlocked: boolean('road_blocked').notNull().default(false),
    peopleAtRisk: integer('people_at_risk').notNull().default(0),
    anonymous: boolean('anonymous').notNull().default(false),
    consent: boolean('consent').notNull(),
    status: text('status').notNull().default('pending'),
    source: text('source').notNull(),
    isSimulated: boolean('is_simulated').notNull(),
    reportedAt: timestamp('reported_at', { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [
    index('incidents_reported_at_idx').on(table.reportedAt),
    index('incidents_status_idx').on(table.status),
  ]
);

export const sensors = pgTable(
  'sensors',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    externalId: text('external_id').notNull(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    status: text('status').notNull().default('unprovisioned'),
    territoryId: uuid('territory_id').references(() => territories.id),
    location: geographyPoint(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex('sensors_external_key').on(table.externalId),
    index('sensors_location_gist').using('gist', table.location),
  ]
);

export const observations = pgTable(
  'observations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sensorId: uuid('sensor_id')
      .notNull()
      .references(() => sensors.id, { onDelete: 'cascade' }),
    value: doublePrecision('value').notNull(),
    unit: text('unit').notNull(),
    rawValue: text('raw_value'),
    observedAt: timestamp('observed_at', { withTimezone: true }).notNull(),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull(),
    quality: text('quality').notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('observations_sensor_observed_idx').on(table.sensorId, table.observedAt.desc()),
  ]
);
