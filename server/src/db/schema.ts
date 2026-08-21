import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  real,
  doublePrecision,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';

export const assessments = pgTable('assessments', {
  id: uuid('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'),
  property_type: varchar('property_type', { length: 50 }).notNull().default('single_family_residential'),
  address: varchar('address', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 50 }).notNull(),
  zip: varchar('zip', { length: 10 }).notNull(),
  homeowner_name: varchar('homeowner_name', { length: 255 }).notNull(),
  homeowner_contact: varchar('homeowner_contact', { length: 255 }).notNull().default(''),
  contact_phone: varchar('contact_phone', { length: 50 }).notNull().default(''),
  assessor_name: varchar('assessor_name', { length: 255 }).notNull(),
  assessor_badge_id: varchar('assessor_badge_id', { length: 50 }),
  assessment_type: varchar('assessment_type', { length: 20 }).notNull().default('initial'),
  weather_conditions: varchar('weather_conditions', { length: 255 }).notNull().default(''),
  time_of_assessment: varchar('time_of_assessment', { length: 20 }).notNull().default('daytime'),
  date_of_assessment: varchar('date_of_assessment', { length: 10 }).notNull(),
  // The day the report was signed, kept apart from the day the property was
  // walked — an assessment can span several visits weeks apart. Date-only text
  // for the same reason as the light-survey dates below (see the note above
  // lightSurveys): a date-only value through a timestamp column round-trips as
  // UTC midnight and renders as the previous day in Eastern.
  report_signed_on: varchar('report_signed_on', { length: 10 }),
  overall_score: real('overall_score'),
  top_recommendations: jsonb('top_recommendations').notNull().default([]),
  quick_wins: jsonb('quick_wins').notNull().default([]),
  notes: text('notes').notNull().default(''),
  assessor_signature: text('assessor_signature'),
  // School-only site profile (roll, capacity, staffing, overall photo) as one
  // JSON blob rather than a dozen columns: it is a single approved page that
  // moves as a unit, and jsonb is already how recommendations are stored.
  school_profile: jsonb('school_profile'),
  // The device's own change counter for this assessment: 1 at creation, +1 on
  // every real edit made on that device. The iPads are shared, so a device
  // compares this against the revision it last saw here to tell whether its
  // copy is newer, older, or diverged. Never compared against updated_at, which
  // the sync handler overwrites with the server clock and which therefore means
  // "last synced", not "last edited".
  //
  // NOT NULL with a default of 1, unlike the other columns added since 0003: it
  // is arithmetic (the server increments it itself for clients too old to send
  // one), and NULL + 1 is NULL.
  revision: integer('revision').notNull().default(1),
  // Device name as the device reported it. text rather than varchar(n): a
  // person types it, it has no natural length, and a value-too-long error would
  // roll back the whole sync transaction — losing an assessor's real work to
  // protect a label that is only ever displayed. NULL means the editing device
  // did not identify itself.
  last_edited_by: text('last_edited_by'),
  // When the content was actually changed on the device, straight through from
  // the client — deliberately NOT the sync time, which updated_at and synced_at
  // already record twice over.
  //
  // A real timestamptz, unlike report_signed_on above and the light-survey
  // dates: this is a full instant with an offset, not a date-only string, so it
  // does not hit the UTC-midnight-renders-as-yesterday footgun.
  last_edited_at: timestamp('last_edited_at', { withTimezone: true }),
  synced_at: timestamp('synced_at', { withTimezone: true }),
});

export const zoneScores = pgTable('zone_scores', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  zone_key: varchar('zone_key', { length: 50 }).notNull(),
  zone_name: varchar('zone_name', { length: 255 }).notNull(),
  zone_order: integer('zone_order').notNull(),
  average_score: real('average_score'),
  priority_findings: text('priority_findings').notNull().default(''),
  notes: text('notes').notNull().default(''),
  completed: boolean('completed').notNull().default(false),
});

export const itemScores = pgTable('item_scores', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  zone_key: varchar('zone_key', { length: 50 }).notNull(),
  principle: varchar('principle', { length: 50 }).notNull(),
  item_text: text('item_text').notNull(),
  item_order: integer('item_order').notNull(),
  score: integer('score'),
  rating: varchar('rating', { length: 10 }),
  is_na: boolean('is_na').notNull().default(false),
  notes: text('notes').notNull().default(''),
  photo_ids: jsonb('photo_ids').notNull().default([]),
});

/**
 * Crime-data reports produced by the crime analysts, merged into the back of the
 * CPTED report. One per assessment.
 *
 * The file itself lives on disk like a photo, not in the database: it is a
 * whole PDF, and the report needs it byte-for-byte to merge its pages in.
 */
export const crimeReports = pgTable('crime_reports', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  blob_path: varchar('blob_path', { length: 500 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  size_bytes: integer('size_bytes').notNull().default(0),
  page_count: integer('page_count').notNull().default(0),
  /** Who produced it, printed on the divider page that introduces their pages. */
  source: varchar('source', { length: 255 }).notNull().default(''),
  uploaded_at: varchar('uploaded_at', { length: 40 }).notNull().default(''),
});

export const photos = pgTable('photos', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  item_score_id: uuid('item_score_id'),
  zone_key: varchar('zone_key', { length: 50 }).notNull(),
  captured_at: timestamp('captured_at', { withTimezone: true }).notNull().defaultNow(),
  blob_path: varchar('blob_path', { length: 500 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mime_type: varchar('mime_type', { length: 50 }).notNull().default('image/jpeg'),
  // double precision, not real: float4 holds ~7 significant digits and a
  // latitude needs 9, so a real column rounds a coordinate by up to a metre.
  gps_lat: doublePrecision('gps_lat'),
  gps_lng: doublePrecision('gps_lng'),
  // Device-reported radius of the fix in metres. The PWA discards anything
  // looser than its limit, so a stored coordinate always carries the figure
  // that justified keeping it.
  gps_accuracy_m: real('gps_accuracy_m'),
  compass_heading: real('compass_heading'),
  annotation_data: jsonb('annotation_data'),
  synced: boolean('synced').notNull().default(false),
});

/**
 * Parking-lot light surveys. An independent record hung off an assessment —
 * it never touches checklist scoring — so it is stored alongside rather than
 * folded into the zone tables.
 *
 * Dates the assessor types (surveyed_at, meter_calibrated_on) are kept as text
 * exactly as the device sent them. They are date-only strings, and putting a
 * date-only value through a timestamp column round-trips it as UTC midnight,
 * which renders as the previous day in Eastern time — the same footgun that
 * produced two report-date bugs in this project already.
 */
export const lightSurveys = pgTable('light_surveys', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  area_name: varchar('area_name', { length: 255 }).notNull(),

  length_ft: real('length_ft').notNull().default(0),
  width_ft: real('width_ft').notNull().default(0),
  cols: integer('cols').notNull().default(0),
  rows: integer('rows').notNull().default(0),
  spacing_length_ft: real('spacing_length_ft').notNull().default(0),
  spacing_width_ft: real('spacing_width_ft').notNull().default(0),
  skipped_points: jsonb('skipped_points').notNull().default([]),

  // Double precision, not real: a latitude carries 9 significant digits and
  // float4 holds about 7, so `real` would quietly round the corner by up to a
  // metre — on the same order as the map accuracy the whole method depends on,
  // and it would shift every derived grid point with it.
  origin_lat: doublePrecision('origin_lat'),
  origin_lng: doublePrecision('origin_lng'),
  axis_lat: doublePrecision('axis_lat'),
  axis_lng: doublePrecision('axis_lng'),
  width_lat: doublePrecision('width_lat'),
  width_lng: doublePrecision('width_lng'),
  grid_flipped: boolean('grid_flipped').notNull().default(false),
  // Where readings sit in their cells: 'center' (equal square cells, current
  // method) or 'edge' (original corner-first layout). Null for surveys that
  // predate the field, which were all walked corner-first.
  grid_origin: text('grid_origin'),

  surveyed_at: varchar('surveyed_at', { length: 40 }),
  observers: text('observers').notNull().default(''),
  weather: text('weather').notNull().default(''),
  lamp_type: text('lamp_type').notNull().default(''),
  fixture_type: text('fixture_type').notNull().default(''),
  pole_height_ft: real('pole_height_ft'),
  meter_type: text('meter_type').notNull().default(''),
  meter_calibrated_on: varchar('meter_calibrated_on', { length: 40 }).notNull().default(''),
  notes: text('notes').notNull().default(''),

  /** Base64 JPEG of the grid over satellite imagery. Nullable and often large. */
  aerial_image: text('aerial_image'),
  /** Attribution for that image, printed beneath it in the report. */
  aerial_credit: text('aerial_credit'),
  /**
   * The plain aerial the lot was framed on, with the ground extent it covers,
   * so the walking view can draw points onto it with no network. jsonb rather
   * than separate columns because it is one indivisible thing — an image paired
   * with the wrong bounds puts every point in the wrong place, silently.
   */
  aerial_base: jsonb('aerial_base'),
  /** Which point the walk is on, 1-based in serpentine order. */
  walk_position: integer('walk_position'),

  unit: varchar('unit', { length: 10 }).notNull().default('fc'),
  imported_filename: varchar('imported_filename', { length: 255 }),
  imported_at: varchar('imported_at', { length: 40 }),
});

export const lightReadings = pgTable('light_readings', {
  id: uuid('id').primaryKey(),
  survey_id: uuid('survey_id')
    .notNull()
    .references(() => lightSurveys.id, { onDelete: 'cascade' }),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  point_index: integer('point_index').notNull(),
  value_fc: real('value_fc').notNull(),
  raw_value: real('raw_value').notNull(),
  raw_unit: varchar('raw_unit', { length: 20 }).notNull().default(''),
  measured_at: varchar('measured_at', { length: 40 }),
  meter_place: integer('meter_place'),
  source: varchar('source', { length: 20 }).notNull().default('imported'),
});

export const reports = pgTable('reports', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  blob_path: varchar('blob_path', { length: 500 }).notNull(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mime_type: varchar('mime_type', { length: 50 }).notNull().default('application/pdf'),
  file_size: integer('file_size').notNull(),
  generated_at: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey(),
  assessment_id: uuid('assessment_id')
    .notNull()
    .references(() => assessments.id, { onDelete: 'cascade' }),
  order_num: integer('order_num').notNull(),
  description: text('description').notNull(),
  priority: varchar('priority', { length: 10 }).notNull().default('medium'),
  timeline: varchar('timeline', { length: 255 }).notNull().default(''),
  type: varchar('type', { length: 20 }).notNull().default('recommendation'),
});
