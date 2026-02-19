import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  real,
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
  assessor_name: varchar('assessor_name', { length: 255 }).notNull(),
  assessor_badge_id: varchar('assessor_badge_id', { length: 50 }),
  assessment_type: varchar('assessment_type', { length: 20 }).notNull().default('initial'),
  weather_conditions: varchar('weather_conditions', { length: 255 }).notNull().default(''),
  time_of_assessment: varchar('time_of_assessment', { length: 20 }).notNull().default('daytime'),
  date_of_assessment: varchar('date_of_assessment', { length: 10 }).notNull(),
  overall_score: real('overall_score'),
  top_recommendations: jsonb('top_recommendations').notNull().default([]),
  quick_wins: jsonb('quick_wins').notNull().default([]),
  notes: text('notes').notNull().default(''),
  assessor_signature: text('assessor_signature'),
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
  is_na: boolean('is_na').notNull().default(false),
  notes: text('notes').notNull().default(''),
  photo_ids: jsonb('photo_ids').notNull().default([]),
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
  gps_lat: real('gps_lat'),
  gps_lng: real('gps_lng'),
  compass_heading: real('compass_heading'),
  annotation_data: jsonb('annotation_data'),
  synced: boolean('synced').notNull().default(false),
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
