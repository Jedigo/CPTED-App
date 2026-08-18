import Dexie, { type Table } from 'dexie';
import type {
  Assessment,
  ZoneScore,
  ItemScore,
  Photo,
  LightSurvey,
  LightReading,
} from '../types';

export class CPTEDDatabase extends Dexie {
  assessments!: Table<Assessment, string>;
  zone_scores!: Table<ZoneScore, string>;
  item_scores!: Table<ItemScore, string>;
  photos!: Table<Photo, string>;
  light_surveys!: Table<LightSurvey, string>;
  light_readings!: Table<LightReading, string>;

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
  }
}

export const db = new CPTEDDatabase();
