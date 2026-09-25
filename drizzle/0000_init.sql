-- Hidro Alerta — migration inicial (RECOVERY-3)
-- PostGIS é requisito do documento oficial (§10.2) e do ADR 0006.
CREATE EXTENSION IF NOT EXISTS postgis;
--> statement-breakpoint
CREATE TABLE "alert_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alert_id" uuid NOT NULL,
	"name" text NOT NULL,
	"geometry" geometry(Geometry,4326),
	"geocode" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"source_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"origin" text NOT NULL,
	"event_type" text NOT NULL,
	"severity" smallint NOT NULL,
	"original_severity" text NOT NULL,
	"status" text NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"instruction" text,
	"issued_at" timestamp with time zone,
	"effective_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"is_official" boolean NOT NULL,
	"is_simulated" boolean NOT NULL,
	"source_url" text DEFAULT '' NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alerts_severity_range" CHECK ("alerts"."severity" BETWEEN 0 AND 4),
	CONSTRAINT "alerts_official_not_simulated" CHECK (NOT ("alerts"."is_official" AND "alerts"."is_simulated"))
);
--> statement-breakpoint
CREATE TABLE "data_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"base_url" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" text NOT NULL,
	"description" text NOT NULL,
	"location" geography(Point,4326),
	"location_text" text NOT NULL,
	"water_depth" double precision,
	"road_blocked" boolean DEFAULT false NOT NULL,
	"people_at_risk" integer DEFAULT 0 NOT NULL,
	"anonymous" boolean DEFAULT false NOT NULL,
	"consent" boolean NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"source" text NOT NULL,
	"is_simulated" boolean NOT NULL,
	"reported_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sensor_id" uuid NOT NULL,
	"value" double precision NOT NULL,
	"unit" text NOT NULL,
	"raw_value" text,
	"observed_at" timestamp with time zone NOT NULL,
	"received_at" timestamp with time zone NOT NULL,
	"quality" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sensors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'unprovisioned' NOT NULL,
	"territory_id" uuid,
	"location" geography(Point,4326),
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shelters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"location" geography(Point,4326),
	"capacity" integer NOT NULL,
	"estimated_vacancies" integer NOT NULL,
	"status" text NOT NULL,
	"accessibility" boolean DEFAULT false NOT NULL,
	"accepts_animals" boolean DEFAULT false NOT NULL,
	"food_available" boolean DEFAULT false NOT NULL,
	"medical_support" boolean DEFAULT false NOT NULL,
	"phone" text,
	"source" text NOT NULL,
	"is_simulated" boolean NOT NULL,
	"last_updated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_health" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_id" uuid NOT NULL,
	"status" text NOT NULL,
	"last_attempt_at" timestamp with time zone,
	"last_success_at" timestamp with time zone,
	"latency_ms" integer,
	"error_code" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "territories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'municipality' NOT NULL,
	"parent_id" uuid,
	"ibge_code" text,
	"geometry" geometry(MultiPolygon,4326),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_areas" ADD CONSTRAINT "alert_areas_alert_id_alerts_id_fk" FOREIGN KEY ("alert_id") REFERENCES "public"."alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_sensor_id_sensors_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "public"."sensors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_territory_id_territories_id_fk" FOREIGN KEY ("territory_id") REFERENCES "public"."territories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_health" ADD CONSTRAINT "source_health_source_id_data_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."data_sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "territories" ADD CONSTRAINT "territories_parent_id_territories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."territories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alert_areas_alert_idx" ON "alert_areas" USING btree ("alert_id");--> statement-breakpoint
CREATE INDEX "alert_areas_geometry_gist" ON "alert_areas" USING gist ("geometry");--> statement-breakpoint
CREATE UNIQUE INDEX "alerts_source_external_key" ON "alerts" USING btree ("source_id","external_id");--> statement-breakpoint
CREATE INDEX "alerts_status_active_idx" ON "alerts" USING btree ("status","expires_at");--> statement-breakpoint
CREATE INDEX "alerts_severity_idx" ON "alerts" USING btree ("severity");--> statement-breakpoint
CREATE UNIQUE INDEX "data_sources_code_key" ON "data_sources" USING btree ("code");--> statement-breakpoint
CREATE INDEX "incidents_reported_at_idx" ON "incidents" USING btree ("reported_at");--> statement-breakpoint
CREATE INDEX "incidents_status_idx" ON "incidents" USING btree ("status");--> statement-breakpoint
CREATE INDEX "observations_sensor_observed_idx" ON "observations" USING btree ("sensor_id","observed_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "sensors_external_key" ON "sensors" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "sensors_location_gist" ON "sensors" USING gist ("location");--> statement-breakpoint
CREATE INDEX "shelters_location_gist" ON "shelters" USING gist ("location");--> statement-breakpoint
CREATE INDEX "shelters_status_idx" ON "shelters" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "source_health_source_key" ON "source_health" USING btree ("source_id");--> statement-breakpoint
CREATE INDEX "territories_geometry_gist" ON "territories" USING gist ("geometry");