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
import { touchAssessment } from './touch';
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
    aerial_credit: null,
    aerial_base: null,
    walk_position: null,

    unit: 'fc',
    imported_filename: null,
    imported_at: null,
  };
}

export async function createLightSurvey(assessmentId: string, areaName: string): Promise<string> {
  const survey = newLightSurvey(assessmentId, areaName);
  await db.light_surveys.add(survey);
  // Light surveys ride the assessment's sync payload, so an edit to one is an
  // edit to the assessment. Without this bump, a grid plotted at the desk on
  // one iPad gets wiped by a push from another with no warning at all.
  await touchAssessment(assessmentId);
  return survey.id;
}

export async function updateLightSurvey(
  id: string,
  patch: Partial<Omit<LightSurvey, 'id' | 'assessment_id' | 'created_at'>>,
): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.assessments, async () => {
    const survey = await db.light_surveys.get(id);
    if (!survey) return;
    await db.light_surveys.update(id, { ...patch, updated_at: new Date().toISOString() });
    await touchAssessment(survey.assessment_id);
  });
}

export async function deleteLightSurvey(id: string): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, db.assessments, async () => {
    // Read the parent before the delete takes the only reference to it.
    const survey = await db.light_surveys.get(id);
    await db.light_readings.where('survey_id').equals(id).delete();
    await db.light_surveys.delete(id);
    if (survey) await touchAssessment(survey.assessment_id);
  });
}

export async function clearReadings(surveyId: string): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, db.assessments, async () => {
    const survey = await db.light_surveys.get(surveyId);
    await db.light_readings.where('survey_id').equals(surveyId).delete();
    await db.light_surveys.update(surveyId, {
      imported_filename: null,
      imported_at: null,
      updated_at: new Date().toISOString(),
    });
    if (survey) await touchAssessment(survey.assessment_id);
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

  await db.transaction('rw', db.light_surveys, db.light_readings, db.assessments, async () => {
    await db.light_readings.where('survey_id').equals(survey.id).delete();
    if (records.length > 0) await db.light_readings.bulkAdd(records);
    await db.light_surveys.update(survey.id, {
      unit,
      imported_filename: filename,
      imported_at: now,
      updated_at: now,
    });
    await touchAssessment(survey.assessment_id);
  });

  return { imported: records.length, reconciliation };
}

/**
 * Record a reading typed at the point, during the walk.
 *
 * The alternative to the meter's SD card, not a replacement for it: a lot filled
 * in this way never touches the SDL400's 99-position limit, the card transfer,
 * or the multi-session merge that silently overwrites one lot with the next.
 * The cost is typing in the dark, which is why it is offered rather than
 * imposed.
 *
 * Upserts on point_index, so re-reading a point overwrites instead of leaving
 * two values for one cell and letting the statistics pick one.
 *
 * measured_at comes from the device clock, which — unlike the meter's, which
 * stamps the year 2000 until someone sets it — is actually right.
 */
export async function enterReading(
  surveyId: string,
  pointIndex: number,
  valueFc: number,
): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, db.assessments, async () => {
    const survey = await db.light_surveys.get(surveyId);
    if (!survey) return;

    await db.light_readings
      .where('survey_id')
      .equals(surveyId)
      .and((r) => r.point_index === pointIndex)
      .delete();

    await db.light_readings.add({
      id: uuidv4(),
      survey_id: surveyId,
      assessment_id: survey.assessment_id,
      point_index: pointIndex,
      value_fc: valueFc,
      raw_value: valueFc,
      raw_unit: 'Ft cd',
      measured_at: new Date().toISOString(),
      // No meter Place to trace back to: the number came off the display, not
      // out of a file.
      meter_place: null,
      source: 'manual',
    });

    await db.light_surveys.update(surveyId, { updated_at: new Date().toISOString() });
    await touchAssessment(survey.assessment_id);
  });
}

/** Undo a reading typed at a point, leaving the cell unread. */
export async function clearReading(surveyId: string, pointIndex: number): Promise<void> {
  await db.transaction('rw', db.light_surveys, db.light_readings, db.assessments, async () => {
    const survey = await db.light_surveys.get(surveyId);
    if (!survey) return;
    const removed = await db.light_readings
      .where('survey_id')
      .equals(surveyId)
      .and((r) => r.point_index === pointIndex)
      .delete();
    if (removed === 0) return;
    await db.light_surveys.update(surveyId, { updated_at: new Date().toISOString() });
    await touchAssessment(survey.assessment_id);
  });
}

/**
 * How many of a survey's readings were typed rather than imported.
 *
 * Asked before an import, which replaces every reading the survey holds: typed
 * readings exist nowhere else, so wiping them without saying so would destroy
 * the only copy of a night's work.
 */
export async function countTypedReadings(surveyId: string): Promise<number> {
  return db.light_readings
    .where('survey_id')
    .equals(surveyId)
    .and((r) => r.source === 'manual')
    .count();
}

/**
 * Remember which point the walk is on.
 *
 * Deliberately does NOT go through updateLightSurvey, and so does not touch the
 * assessment's revision. A walk position is a bookmark, not content: nothing
 * measured has changed, and bumping here would add a revision per tap of Next —
 * seventy of them for one lot — so an assessment that was merely navigated
 * would look heavily edited and start crying conflict at the next sync. Same
 * rule that keeps persistAllScores() from bumping.
 *
 * updated_at is left alone for the same reason.
 */
export async function setWalkPosition(surveyId: string, pointIndex: number | null): Promise<void> {
  await db.light_surveys.update(surveyId, { walk_position: pointIndex });
}

/** True once a grid has been chosen and the survey can be walked. */
export function hasGrid(survey: LightSurvey): boolean {
  return survey.cols > 0 && survey.rows > 0;
}
