import Dexie, { type Table } from 'dexie';
import type {
  Assessment,
  ZoneScore,
  ItemScore,
  Photo,
  LightSurvey,
  LightReading,
  CrimeReport,
} from '../types';

export class CPTEDDatabase extends Dexie {
  assessments!: Table<Assessment, string>;
  zone_scores!: Table<ZoneScore, string>;
  item_scores!: Table<ItemScore, string>;
  photos!: Table<Photo, string>;
  light_surveys!: Table<LightSurvey, string>;
  light_readings!: Table<LightReading, string>;
  crime_reports!: Table<CrimeReport, string>;

  constructor() {
    super('CPTEDAssessments');

    this.version(1).stores({
      assessments: 'id, status, created_at, address',
      zone_scores: 'id, assessment_id, zone_key',
      item_scores: 'id, assessment_id, [zone_key+principle]',
      photos: 'id, assessment_id, item_score_id, zone_key',
    });

    // v2 — parking-lot light surveys. Purely additive: existing stores are
    // unchanged, so assessments created before this upgrade open untouched.
    this.version(2).stores({
      light_surveys: 'id, assessment_id, created_at',
      light_readings: 'id, survey_id, assessment_id, [survey_id+point_index]',
    });

    // v3 — crime analyst reports merged into the back of the CPTED report.
    // Additive in the same way: nothing existing is touched.
    this.version(3).stores({
      crime_reports: 'id, assessment_id',
    });
  }
}

export const db = new CPTEDDatabase();
