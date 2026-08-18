-- Photo GPS: record how good the fix was, and stop rounding the fix itself.
--
-- gps_lat/gps_lng were real (float4, ~7 significant digits). A latitude here
-- needs 9 — 29.2668112 — so every stored coordinate would have been silently
-- rounded by up to a metre, the same bug fixed for light_surveys in 0007.
-- Safe to widen in place: every photo on this server predates working
-- geolocation and holds NULL for both columns.
ALTER TABLE "photos" ALTER COLUMN "gps_lat" TYPE double precision;--> statement-breakpoint
ALTER TABLE "photos" ALTER COLUMN "gps_lng" TYPE double precision;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN IF NOT EXISTS "gps_accuracy_m" real;
