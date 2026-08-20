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

    // No version 4 for revision tracking, and that is deliberate — do not add
    // one out of habit if you extend this.
    //
    // IndexedDB object stores are schemaless: the .stores() string declares the
    // primary key and the INDEXES, nothing else. The revision fields added to
    // Assessment are never queried or sorted on (the list sorts by created_at),
    // so they need no index and therefore no schema version.
    //
    // Existing rows are given a starting revision by backfillRevisions() in
    // services/touch.ts, which runs as ordinary startup work. An .upgrade()
    // callback would run inside a versionchange transaction, where a throw
    // leaves db.open() rejecting — the app fails to launch, in the field, on a
    // shared iPad, with no recovery. Not worth it for four un-indexed numbers.
  }
}

export const db = new CPTEDDatabase();
