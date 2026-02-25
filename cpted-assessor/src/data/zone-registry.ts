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

export function getZonesForType(propertyType: PropertyType): ZoneDefinition[] {
  switch (propertyType) {
    case 'places_of_worship':
      return WORSHIP_ZONES;
    case 'single_family_residential':
    default:
      return ZONES;
  }
}

export function getItemGuidanceForType(propertyType: PropertyType): Map<string, ItemGuidance> {
  switch (propertyType) {
    case 'places_of_worship':
      return WORSHIP_ITEM_GUIDANCE;
    case 'single_family_residential':
    default:
      return ITEM_GUIDANCE;
  }
}

/** Human-readable label for property type */
export function getPropertyTypeLabel(propertyType: PropertyType): string {
  switch (propertyType) {
    case 'places_of_worship':
      return 'Places of Worship';
    case 'single_family_residential':
    default:
      return 'Single Family Residential';
  }
}
