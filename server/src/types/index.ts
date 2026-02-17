export type AssessmentStatus = 'in_progress' | 'completed' | 'synced';
export type PropertyType = 'single_family_residential';
export type AssessmentType = 'initial' | 'follow_up' | 're_assessment';
export type TimeOfAssessment = 'daytime' | 'nighttime' | 'both';
export type Priority = 'high' | 'medium' | 'low';
export type RecommendationType = 'recommendation' | 'quick_win';

export interface Recommendation {
  id: string;
  assessment_id: string;
  order: number;
  description: string;
  priority: Priority;
  type: RecommendationType;
}

// Zone definition types (for the static checklist data)
export interface ZonePrinciple {
  key: string;
  name: string;
  items: string[];
}

export interface ZoneDefinition {
  key: string;
  name: string;
  order: number;
  description: string;
  principles: ZonePrinciple[];
}
