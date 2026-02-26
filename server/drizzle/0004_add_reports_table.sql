CREATE TABLE IF NOT EXISTS "reports" (
  "id" uuid PRIMARY KEY NOT NULL,
  "assessment_id" uuid NOT NULL REFERENCES "assessments"("id") ON DELETE CASCADE,
  "blob_path" varchar(500) NOT NULL,
  "filename" varchar(255) NOT NULL,
  "mime_type" varchar(50) NOT NULL DEFAULT 'application/pdf',
  "file_size" integer NOT NULL,
  "generated_at" timestamp with time zone NOT NULL DEFAULT now()
);
