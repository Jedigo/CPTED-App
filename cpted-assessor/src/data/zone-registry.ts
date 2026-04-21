/**
 * Zone Registry — maps PropertyType to the correct zone definitions and item guidance.
 *
 * Every file that needs zone/checklist data should resolve it through this module
 * based on the assessment's property_type rather than importing a hardcoded constant.
 */

import type { ZoneDefinition, PropertyType } from '../types';
import type { ItemGuidance } from './item-guidance';
import { ZONES } from './zones';
import { ITEM_GUIDANCE } from './item-guidance';
import { WORSHIP_ZONES } from './worship-zones';
import { WORSHIP_ITEM_GUIDANCE } from './worship-item-guidance';
import { CHRISTIAN_ZONES } from './christian-zones';
import { CHRISTIAN_ITEM_GUIDANCE } from './christian-item-guidance';
import { TOWNHOME_ZONES } from './townhome-zones';
import { TOWNHOME_ITEM_GUIDANCE } from './townhome-item-guidance';
import {
  ELEMENTARY_SCHOOL_ZONES,
  MIDDLE_SCHOOL_ZONES,
  HIGH_SCHOOL_ZONES,
  COMBINED_SCHOOL_ZONES,
} from './school-zones';
import { SCHOOL_ITEM_GUIDANCE } from './school-item-guidance';

export function getZonesForType(propertyType: PropertyType): ZoneDefinition[] {
  switch (propertyType) {
    case 'places_of_worship':
      return WORSHIP_ZONES;
    case 'christian_church':
      return CHRISTIAN_ZONES;
    case 'townhome':
      return TOWNHOME_ZONES;
    case 'elementary_school':
      return ELEMENTARY_SCHOOL_ZONES;
    case 'middle_school':
      return MIDDLE_SCHOOL_ZONES;
    case 'high_school':
      return HIGH_SCHOOL_ZONES;
    case 'combined_school':
      return COMBINED_SCHOOL_ZONES;
    case 'single_family_residential':
    default:
      return ZONES;
  }
}

export function getItemGuidanceForType(propertyType: PropertyType): Map<string, ItemGuidance> {
  switch (propertyType) {
    case 'places_of_worship':
      return WORSHIP_ITEM_GUIDANCE;
    case 'christian_church':
      return CHRISTIAN_ITEM_GUIDANCE;
    case 'townhome':
      return TOWNHOME_ITEM_GUIDANCE;
    case 'elementary_school':
    case 'middle_school':
    case 'high_school':
    case 'combined_school':
      return SCHOOL_ITEM_GUIDANCE;
    case 'single_family_residential':
    default:
      return ITEM_GUIDANCE;
  }
}

/** Human-readable label for property type */
export function getPropertyTypeLabel(propertyType: PropertyType): string {
  switch (propertyType) {
    case 'places_of_worship':
      return 'Places of Worship (Catholic)';
    case 'christian_church':
      return 'Christian Church';
    case 'townhome':
      return 'Townhome';
    case 'elementary_school':
      return 'Elementary School';
    case 'middle_school':
      return 'Middle School';
    case 'high_school':
      return 'High School';
    case 'combined_school':
      return 'Combined School (K-8 / K-12)';
    case 'single_family_residential':
    default:
      return 'Single Family Residential';
  }
}

/** Returns true for any worship/church property type (not residential) */
export function isWorshipType(propertyType: PropertyType): boolean {
  return propertyType === 'places_of_worship' || propertyType === 'christian_church';
}

/** Returns true for residential-style property types (single-family + townhome) */
export function isResidentialType(propertyType: PropertyType): boolean {
  return propertyType === 'single_family_residential' || propertyType === 'townhome';
}

/** Returns true for any school property type (elementary/middle/high/combined) */
export function isSchoolType(propertyType: PropertyType): boolean {
  return (
    propertyType === 'elementary_school' ||
    propertyType === 'middle_school' ||
    propertyType === 'high_school' ||
    propertyType === 'combined_school'
  );
}
