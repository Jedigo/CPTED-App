export type AssessmentStatus = 'in_progress' | 'completed' | 'synced'
export type PropertyType =
  | 'single_family_residential'
  | 'townhome'
  | 'places_of_worship'
  | 'christian_church'
  | 'elementary_school'
  | 'middle_school'
  | 'high_school'
  | 'combined_school'
  | 'commercial_office'
export type AssessmentType = 'initial' | 'follow_up' | 're_assessment'
// School assessments use a Yes/No/UTO (Unable To Observe) checklist rating
// instead of the 1-5 numeric scale. Stored in ItemScore.score for school
// property types; numeric scores are used for every other property type.
export type SchoolRating = 'yes' | 'no' | 'uto'
export type TimeOfAssessment = 'daytime' | 'nighttime' | 'both'
export type Priority = 'high' | 'medium' | 'low'
export type RecommendationType = 'recommendation' | 'quick_win'

export interface Assessment {
  id: string
  created_at: string
  updated_at: string
  status: AssessmentStatus
  property_type: PropertyType
  address: string
  city: string
  state: string
  zip: string
  homeowner_name: string
  homeowner_contact: string
  contact_phone: string
  assessor_name: string
  assessor_badge_id?: string
  assessment_type: AssessmentType
  weather_conditions: string
  time_of_assessment: TimeOfAssessment
  date_of_assessment: string
  /**
   * The day the report was completed and signed, as a date-only YYYY-MM-DD
   * string. Distinct from date_of_assessment: an assessment can be walked over
   * several visits weeks apart, and the signature attests to when the assessor
   * stood behind the finished report, not to when the property was walked.
   *
   * Optional. Absent on every assessment created before this field existed, and
   * the report falls back to date_of_assessment for those, so their output is
   * unchanged. Stamped with today's date the first time the report is generated
   * or marked complete, then left alone.
   *
   * Null rather than undefined once an assessor deliberately clears it: the
   * server distinguishes "this device has no such field" (an older PWA, key
   * absent — keep what you have) from "cleared on purpose" (explicit null).
   */
  report_signed_on?: string | null
  overall_score: number | null
  top_recommendations: Recommendation[]
  quick_wins: Recommendation[]
  notes: string
  assessor_signature: string | null
  synced_at: string | null
}

export interface ZoneScore {
  id: string
  assessment_id: string
  zone_key: string
  zone_name: string
  zone_order: number
  average_score: number | null
  priority_findings: string
  notes: string
  completed: boolean
}

export interface ItemScore {
  id: string
  assessment_id: string
  zone_key: string
  principle: string
  item_text: string
  item_order: number
  // Numeric 1-5 for most property types; a SchoolRating string for schools.
  // null = not yet scored. is_na stays false for school items (UTO is a value).
  score: number | SchoolRating | null
  is_na: boolean
  notes: string
  photo_ids: string[]
}

export interface Photo {
  id: string
  assessment_id: string
  item_score_id: string | null
  zone_key: string
  captured_at: string
  data: string              // base64 data URL (e.g. "data:image/jpeg;base64,...")
  blob?: Blob               // deprecated — old records may still have this
  filename: string
  mime_type: string
  gps_lat: number | null
  gps_lng: number | null
  gps_accuracy_m: number | null   // device-reported radius in metres; see GPS_ACCURACY_LIMIT_M
  compass_heading: number | null
  annotation_data: Record<string, unknown> | null
  synced: boolean
}

export interface Recommendation {
  id: string
  assessment_id: string
  order: number
  description: string
  priority: Priority
  type: RecommendationType
}

// ---------------------------------------------------------------------------
// Parking-lot light surveys
//
// A light survey is an independent record hung off an assessment: a night visit
// that can be attached to an already-created (even completed) assessment
// without touching checklist progress or the report gate. Schools only for now.
//
// Method follows the NICP instructional guidance: lay a grid over the lot, take
// one horizontal reading per grid point (minimum 50), then report the lowest
// reading, the average, and the uniformity ratio.
// ---------------------------------------------------------------------------

export type IlluminanceUnit = 'fc' | 'lux'

export interface LightSurvey {
  id: string
  assessment_id: string
  created_at: string
  updated_at: string
  /** Which lot this covers, e.g. "Main Lot" or "Bus Loop". */
  area_name: string

  // Grid geometry. length runs along the lot's long axis (the form's D-1),
  // width along the short axis (D-2). Spacing is derived, not entered.
  length_ft: number
  width_ft: number
  /** Reading positions along the length — intervals + 1, edges included. */
  cols: number
  /** Reading positions along the width. */
  rows: number
  spacing_length_ft: number
  spacing_width_ft: number
  /**
   * Where readings sit within their cells. 'center' is the current method —
   * equal square cells with a reading in the middle of each. 'edge' is the
   * original corner-first layout, kept so surveys already walked that way keep
   * the geometry they were walked with. Absent means 'edge'.
   */
  grid_origin?: 'edge' | 'center'
  /**
   * 1-based point indices (serpentine order) that can't be stood on —
   * landscape islands, curbs, structures. Skipped points are never logged, so
   * this list is what keeps the meter's sequential Place column aligned to the
   * grid. Mark them from satellite imagery before the walk.
   */
  skipped_points: number[]

  /**
   * Optional georeference: the start corner (grid point 1) and the far end of
   * the length axis. Two points give an origin, a bearing, and a length, which
   * is enough to place every reading on satellite imagery. Null until set.
   */
  origin_lat: number | null
  origin_lng: number | null
  axis_lat: number | null
  axis_lng: number | null
  /**
   * Third corner, across the short side from the origin. Optional, but with it
   * the three corners fully determine the rectangle — length, width, bearing,
   * and which side the lot lies on — so no dimension has to be typed.
   */
  width_lat: number | null
  width_lng: number | null
  /**
   * Which side of the origin-to-axis line the lot occupies. Derived from the
   * third corner when there is one; otherwise a manual toggle, since two points
   * alone leave it ambiguous.
   */
  grid_flipped: boolean

  // Survey metadata the NICP booklet asks to be recorded.
  surveyed_at: string | null
  observers: string
  weather: string
  lamp_type: string
  fixture_type: string
  pole_height_ft: number | null
  meter_type: string
  meter_calibrated_on: string
  notes: string

  /**
   * A screenshot of the exported grid on satellite imagery, as a base64 JPEG
   * data URL (same storage rule as photos — Safari detaches Blobs kept in
   * IndexedDB). Optional; the report renders the drawn heat map either way.
   *
   * The app can't fetch satellite tiles itself without an API key and a billing
   * account, so the picture comes back the way it went out: the assessor opens
   * the KML in Google Earth and screenshots it.
   */
  aerial_image: string | null
  /**
   * Attribution for whatever is in aerial_image, printed under it in the
   * report. Stored rather than derived because the picture can come from two
   * places — county imagery drawn in-app, or a screenshot the assessor took —
   * and a report that credits the wrong source is worse than one that credits
   * none.
   */
  aerial_credit: string | null

  // Import provenance
  unit: IlluminanceUnit
  imported_filename: string | null
  imported_at: string | null
}

export interface LightReading {
  id: string
  survey_id: string
  assessment_id: string
  /** 1-based position in the serpentine walk order. Grid cell is derived. */
  point_index: number
  /** Always footcandles — the comparison unit. Converted on import. */
  value_fc: number
  /** Value exactly as the meter wrote it, in raw_unit. */
  raw_value: number
  raw_unit: string
  /** Meter clock reading. Unreliable if the clock was never set. */
  measured_at: string | null
  /** The meter's Place column, kept for tracing a value back to the file. */
  meter_place: number | null
  source: 'imported' | 'manual'
}

// Zone definition types (for the static checklist data)
export interface ZonePrinciple {
  key: string
  name: string
  items: string[]
}

export interface ZoneDefinition {
  key: string
  name: string
  order: number
  description: string
  principles: ZonePrinciple[]
}
