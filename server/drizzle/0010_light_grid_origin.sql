-- Where a light survey's readings sit within their cells.
--
-- New surveys tile the lot in equal squares and read the centre of each.
-- Surveys recorded before this column exists were walked corner-first, where
-- the outermost readings stand on the lot boundary and own half a cell — so
-- NULL is read as 'edge' and those keep the geometry they were walked with.
ALTER TABLE "light_surveys" ADD COLUMN IF NOT EXISTS "grid_origin" text;
