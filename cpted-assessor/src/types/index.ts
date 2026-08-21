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

/**
 * Site facts for a school assessment, transcribed from what the school tells
 * the assessor. Every value is text, not a number: the approved page writes
 * "1,500", and the assessor is recording what they were told rather than
 * deriving it. The staff figures in particular are never added up: the school's
 * own total counts categories this page doesn't itemise, so a sum would
 * contradict it.
 *
 * The one exception is the student-to-teacher ratio, which is computed from the
 * roll and the teacher count — see studentTeacherRatio().
 */
export interface SchoolProfile {
  /** Overall shot of the school. Base64 data URL, same rule as photos. */
  photo: string | null
  /** The line under the photo — when the building went up, what it replaced. */
  build_history: string
  student_population: string
  max_occupancy: string
  teachers_staff_total: string
  admin_positions: string
  counselors: string
  office_staff: string
  teachers: string
  support_staff: string
  kitchen_staff: string
}

/**
 * A crime-data report produced by a crime analyst and merged into the back of
 * the CPTED report, so the district receives one document instead of two.
 *
 * One per assessment. The file is kept whole rather than rasterised — its pages
 * go into the report intact and untouched, so charts stay sharp, the text stays
 * searchable, and nothing of ours is printed over their layout.
 */
export interface CrimeReport {
  id: string
  assessment_id: string
  /** Original filename, shown in the UI and used for attribution. */
  filename: string
  /** Base64 data URL. Same storage rule as photos — Safari detaches Blobs. */
  data: string
  /** Bytes of the original PDF, for the size warning and the UI. */
  size_bytes: number
  /** Page count, known at upload so the report can reserve exactly that many. */
  page_count: number
  uploaded_at: string
  /** Whether the server already holds this file. Mirrors Photo.synced. */
  synced: boolean
}

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
  /**
   * School-only site profile, printed as the first numbered page of the report.
   * Absent until an assessor fills it in; the report simply omits the page.
   */
  school_profile?: SchoolProfile | null
  synced_at: string | null

  // --- Revision tracking -----------------------------------------------------
  //
  // Bookkeeping for the assessors, not for the homeowner — never printed on a
  // report. If you ever want one of these in the PDF, put it there deliberately.
  //
  // The iPads are shared and sync is last-write-wins in both directions, so a
  // device needs to know whether the server's copy is the work it pushed this
  // morning or a colleague's from this afternoon. updated_at cannot answer
  // that: it is bumped by syncing and was historically not bumped by score
  // taps, notes, or photos at all.

  /**
   * This device's change counter for this assessment: 1 at creation, +1 on
   * every real edit made here. Absent on records written before this field
   * existed, which read as 1.
   *
   * The invariant the whole feature rests on: **revision names the exact bytes
   * currently in this device's IndexedDB for this assessment.** So it is bumped
   * in the same write as the change it describes, never by a derived
   * recalculation, and never by sync.
   */
  revision?: number
  /**
   * The revision that was in the payload the server last accepted from this
   * device — the common ancestor. Client-only; never sent to the server.
   *
   * This is what makes real conflict detection possible with two integers and
   * no content hashing: if the local revision and the server's have both moved
   * past this, the two copies changed independently.
   *
   * Null means this device has never completed a sync of this assessment, so
   * there is no ancestor to diff against.
   */
  synced_revision?: number | null
  /** Name of the device that made the last edit. Null = unidentified device. */
  last_edited_by?: string | null
  /**
   * ISO instant of the last real edit — deliberately not the sync time, which
   * synced_at already records.
   */
  last_edited_at?: string | null
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

  /**
   * The plain aerial the lot was framed on, kept with the ground extent it
   * covers so points can be drawn onto it later.
   *
   * Distinct from aerial_image, which is a finished picture for the report with
   * the grid already burned in and no bounds attached — you cannot highlight
   * anything on it. This one exists so the walking view works with no network:
   * the county imagery server is a fetch away, and the lot being walked may
   * have no signal at all.
   */
  aerial_base: CachedAerial | null

  /**
   * Which point the walk is on, 1-based in serpentine order. Persisted because
   * an iPad that sleeps in a pocket between readings must not lose the place.
   * Absent means the walk has not been started.
   */
  walk_position?: number | null

  // Import provenance
  unit: IlluminanceUnit
  imported_filename: string | null
  imported_at: string | null
}

/**
 * An aerial image plus the EPSG:3857 ground extent it covers.
 *
 * Structurally the same as AerialBounds in services/county-imagery, which is
 * what latLngToPixel takes — declared here rather than imported so the type
 * layer keeps depending on nothing.
 */
export interface CachedAerial {
  /** base64 JPEG data URL. */
  image: string
  minX: number
  minY: number
  maxX: number
  maxY: number
  widthPx: number
  heightPx: number
  /** Attribution, carried with the image so it can never be paired wrongly. */
  credit: string
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
