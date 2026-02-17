export type AssessmentStatus = 'in_progress' | 'completed' | 'synced'
export type PropertyType = 'single_family_residential'
export type AssessmentType = 'initial' | 'follow_up' | 're_assessment'
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
  assessor_name: string
  assessor_badge_id?: string
  assessment_type: AssessmentType
  weather_conditions: string
  time_of_assessment: TimeOfAssessment
  date_of_assessment: string
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
  score: number | null
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
