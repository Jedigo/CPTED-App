import Dexie, { type Table } from 'dexie';
import type { Assessment, ZoneScore, ItemScore, Photo } from '../types';

export class CPTEDDatabase extends Dexie {
  assessments!: Table<Assessment, string>;
  zone_scores!: Table<ZoneScore, string>;
  item_scores!: Table<ItemScore, string>;
  photos!: Table<Photo, string>;

  constructor() {
    super('CPTEDAssessments');

    this.version(1).stores({
      assessments: 'id, status, created_at, address',
      zone_scores: 'id, assessment_id, zone_key',
      item_scores: 'id, assessment_id, [zone_key+principle]',
      photos: 'id, assessment_id, item_score_id, zone_key',
    });
  }
}

export const db = new CPTEDDatabase();
