-- Crime-analyst PDFs, merged into the back of the CPTED report so a district
-- receives one document instead of two. One per assessment.
--
-- The file lives on disk beside the photos (/data/crime-reports); only its
-- metadata is stored here, because the report merges the analyst's pages in
-- byte-for-byte and base64 in a JSON column would inflate it for no gain.
--
-- uploaded_at is text, like the other assessor-supplied dates on this schema:
-- it is recorded on the device and round-tripped rather than interpreted.
CREATE TABLE IF NOT EXISTS "crime_reports" (
  "id" uuid PRIMARY KEY NOT NULL,
  "assessment_id" uuid NOT NULL REFERENCES "assessments"("id") ON DELETE CASCADE,
  "blob_path" varchar(500) NOT NULL,
  "filename" varchar(255) NOT NULL,
  "size_bytes" integer DEFAULT 0 NOT NULL,
  "page_count" integer DEFAULT 0 NOT NULL,
  "source" varchar(255) DEFAULT '' NOT NULL,
  "uploaded_at" varchar(40) DEFAULT '' NOT NULL
);
