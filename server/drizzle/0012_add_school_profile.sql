-- The district's school site profile: roll, capacity, staffing, and an overall
-- photo of the school, printed as the first numbered page of a school report.
--
-- One jsonb blob rather than a dozen columns. It is a single approved page that
-- moves as a unit, every value is text as reported by the school, and jsonb is
-- already how top_recommendations and quick_wins are stored on this table.
--
-- NULL on every assessment recorded before this column existed, and the report
-- omits the page for those, so their output is unchanged.
ALTER TABLE "assessments" ADD COLUMN IF NOT EXISTS "school_profile" jsonb;
