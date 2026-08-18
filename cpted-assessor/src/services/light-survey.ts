/**
 * Storage operations for parking-lot light surveys.
 *
 * A survey hangs off an assessment but is otherwise independent: creating,
 * importing, or deleting one never touches item scores, zone scores, or the
 * assessment's status. That's deliberate — the night lighting walk is a
 * separate visit, often by a different assessor, and it has to be attachable
 * to an assessment that was already completed.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { LightSurvey, LightReading, IlluminanceUnit } from '../types';
import type { MeterReading } from './light-meter';
import {
  buildPointPlan,
  assignReadingsByPlace,
  type PlaceReconciliation,
} from './light-grid';

export function newLightSurvey(assessmentId: string, areaName: string): LightSurvey {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    assessment_id: assessmentId,
    created_at: now,
    updated_at: now,
    area_name: areaName.trim() || 'Parking Lot',

    length_ft: 0,
    width_ft: 0,
    cols: 0,
    rows: 0,
    spacing_length_ft: 0,
    spacing_width_ft: 0,
    skipped_points: [],

    origin_lat: null,
    origin_lng: null,
    axis_lat: null,
    axis_lng: null,
    width_lat: null,
    width_lng: null,
    grid_flipped: false,

    surveyed_at: null,
    observers: '',
    weather: '',
    lamp_type: '',
    fixture_type: '',
    pole_height_ft: null,
    meter_type: 'Extech SDL400',
    meter_calibrated_on: '',
    notes: '',

    aerial_image: null,

    unit: 'fc',
    imported_filename: null,
    imported_at: null,
  };
}

export async function createLightSurvey(assessmentId: string, areaName: string): Promise<string> {
  const survey = newLightSurvey(assessmentId, areaName);
  await db.light_surveys.add(survey);
  return survey.id;
}

export async function updateLightSurvey(
  id: string,
  patch: Partial<Omit<LightSurvey, 'id' | 'assessment_id' | 'created_at'>>,
): Promise<void> {
  await db.light_surveys.update(id, { ...patch, updated_at: new Date().toISOString() });
}

export async function deleteLightSurvey(id: string): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, async () => {
    await db.light_readings.where('survey_id').equals(id).delete();
    await db.light_surveys.delete(id);
  });
}

export async function clearReadings(surveyId: string): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, async () => {
    await db.light_readings.where('survey_id').equals(surveyId).delete();
    await db.light_surveys.update(surveyId, {
      imported_filename: null,
      imported_at: null,
      updated_at: new Date().toISOString(),
    });
  });
}

export interface ImportResult {
  imported: number;
  reconciliation: PlaceReconciliation;
}

/**
 * Replace a survey's readings with a freshly parsed meter file.
 *
 * Readings are matched to grid points by the meter's Place value, walked
 * through the skip list: Place N is the N-th point that isn't marked
 * obstructed. Manual-mode Place numbers can repeat (a re-take) and skip (a
 * position never stored), so matching on row order instead would shift every
 * later reading and put dark spots in the wrong place on the map.
 */
export async function importMeterReadings(
  survey: LightSurvey,
  readings: MeterReading[],
  unit: IlluminanceUnit,
  filename: string,
): Promise<ImportResult> {
  const plan = buildPointPlan(survey.cols, survey.rows, survey.skipped_points);
  const { assigned, reconciliation } = assignReadingsByPlace(readings, plan);
  const now = new Date().toISOString();

  const records: LightReading[] = assigned.map(({ point_index, reading }) => ({
    id: uuidv4(),
    survey_id: survey.id,
    assessment_id: survey.assessment_id,
    point_index,
    value_fc: reading.value_fc,
    raw_value: reading.value,
    raw_unit: reading.raw_unit,
    measured_at: reading.measured_at,
    meter_place: reading.place,
    source: 'imported',
  }));

  await db.transaction('rw', db.light_surveys, db.light_readings, async () => {
    await db.light_readings.where('survey_id').equals(survey.id).delete();
    if (records.length > 0) await db.light_readings.bulkAdd(records);
    await db.light_surveys.update(survey.id, {
      unit,
      imported_filename: filename,
      imported_at: now,
      updated_at: now,
    });
  });

  return { imported: records.length, reconciliation };
}

/** True once a grid has been chosen and the survey can be walked. */
export function hasGrid(survey: LightSurvey): boolean {
  return survey.cols > 0 && survey.rows > 0;
}
