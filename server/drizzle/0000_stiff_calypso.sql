CREATE TABLE "assessments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"property_type" varchar(50) DEFAULT 'single_family_residential' NOT NULL,
	"address" varchar(255) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip" varchar(10) NOT NULL,
	"homeowner_name" varchar(255) NOT NULL,
	"homeowner_contact" varchar(255) DEFAULT '' NOT NULL,
	"assessor_name" varchar(255) NOT NULL,
	"assessor_badge_id" varchar(50),
	"assessment_type" varchar(20) DEFAULT 'initial' NOT NULL,
	"weather_conditions" varchar(255) DEFAULT '' NOT NULL,
	"time_of_assessment" varchar(20) DEFAULT 'daytime' NOT NULL,
	"date_of_assessment" varchar(10) NOT NULL,
	"overall_score" real,
	"top_recommendations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"quick_wins" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"synced_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "item_scores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"zone_key" varchar(50) NOT NULL,
	"principle" varchar(50) NOT NULL,
	"item_text" text NOT NULL,
	"item_order" integer NOT NULL,
	"score" integer,
	"is_na" boolean DEFAULT false NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"photo_ids" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"item_score_id" uuid,
	"zone_key" varchar(50) NOT NULL,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL,
	"blob_path" varchar(500) NOT NULL,
	"filename" varchar(255) NOT NULL,
	"mime_type" varchar(50) DEFAULT 'image/jpeg' NOT NULL,
	"gps_lat" real,
	"gps_lng" real,
	"compass_heading" real,
	"annotation_data" jsonb,
	"synced" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recommendations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"order_num" integer NOT NULL,
	"description" text NOT NULL,
	"priority" varchar(10) DEFAULT 'medium' NOT NULL,
	"timeline" varchar(255) DEFAULT '' NOT NULL,
	"type" varchar(20) DEFAULT 'recommendation' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zone_scores" (
	"id" uuid PRIMARY KEY NOT NULL,
	"assessment_id" uuid NOT NULL,
	"zone_key" varchar(50) NOT NULL,
	"zone_name" varchar(255) NOT NULL,
	"zone_order" integer NOT NULL,
	"average_score" real,
	"priority_findings" text DEFAULT '' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"completed" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_scores" ADD CONSTRAINT "item_scores_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "photos" ADD CONSTRAINT "photos_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zone_scores" ADD CONSTRAINT "zone_scores_assessment_id_assessments_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessments"("id") ON DELETE cascade ON UPDATE no action;