CREATE TABLE IF NOT EXISTS "light_surveys" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"area_name" varchar(255) NOT NULL,
	"length_ft" real DEFAULT 0 NOT NULL,
	"width_ft" real DEFAULT 0 NOT NULL,
	"cols" integer DEFAULT 0 NOT NULL,
	"rows" integer DEFAULT 0 NOT NULL,
	"spacing_length_ft" real DEFAULT 0 NOT NULL,
	"spacing_width_ft" real DEFAULT 0 NOT NULL,
	"skipped_points" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"origin_lat" real,
	"origin_lng" real,
	"axis_lat" real,
	"axis_lng" real,
	"width_lat" real,
	"width_lng" real,
	"grid_flipped" boolean DEFAULT false NOT NULL,
	"surveyed_at" varchar(40),
	"observers" text DEFAULT '' NOT NULL,
	"weather" text DEFAULT '' NOT NULL,
	"lamp_type" text DEFAULT '' NOT NULL,
	"fixture_type" text DEFAULT '' NOT NULL,
	"pole_height_ft" real,
	"meter_type" text DEFAULT '' NOT NULL,
	"meter_calibrated_on" varchar(40) DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"aerial_image" text,
	"unit" varchar(10) DEFAULT 'fc' NOT NULL,
	"imported_filename" varchar(255),
	"imported_at" varchar(40)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "light_readings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"survey_id" uuid NOT NULL,
	"assessment_id" uuid NOT NULL,
	"point_index" integer NOT NULL,
	"value_fc" real NOT NULL,
	"raw_value" real NOT NULL,
	"raw_unit" varchar(20) DEFAULT '' NOT NULL,
	"measured_at" varchar(40),
	"meter_place" integer,
	"source" varchar(20) DEFAULT 'imported' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "light_surveys" ADD CONSTRAINT "light_surveys_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "light_readings" ADD CONSTRAINT "light_readings_survey_id_light_surveys_id_fk" FOREIGN KEY ("survey_id") REFERENCES "public"."light_surveys"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "light_readings" ADD CONSTRAINT "light_readings_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "light_surveys_assessment_idx" ON "light_surveys" ("assessment_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "light_readings_survey_idx" ON "light_readings" ("survey_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "light_readings_assessment_idx" ON "light_readings" ("assessment_id");
