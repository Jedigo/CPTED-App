/**
 * Duplicate an assessment as a different property type.
 *
 * Creates a new assessment record with a new UUID and the target property type,
 * then walks every source item_score and photo and attempts to carry them over
 * to the matching item in the new template.
 *
 * Items match by (zone_key + principle_key + item_text). When source and target
 * use different zone_keys (e.g., residential `side_yards` → townhome
 * `shared_boundaries`), a zone-key remap is applied before the match attempt.
 *
 * GUARANTEE: no photo is dropped. If the source item does not match any target
 * item, the photo is re-linked to the first item in the remapped target zone so
 * it remains accessible in the new assessment. Callers can review re-homed
 * photos and reattach them as desired.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { getZonesForType } from '../data/zone-registry';
import { persistAllScores } from './scoring';
import type { Assessment, ItemScore, Photo, PropertyType, ZoneScore } from '../types';

export interface RehomedPhoto {
  fromZone: string;
  fromItem: string;
  toZone: string;
}

export interface DuplicateResult {
  newAssessmentId: string;
  itemsCarried: number;
  itemsDropped: number;
  droppedItemDetails: Array<{ fromZone: string; fromItem: string }>;
  photosCarried: number;
  photosRehomed: number;
  rehomedDetails: RehomedPhoto[];
}

type ZoneKeyMap = Record<string, string>;

const RESIDENTIAL_TO_TOWNHOME: ZoneKeyMap = {
  street_approach: 'street_approach',
  front_yard: 'front_entry',
  side_yards: 'shared_boundaries',
  rear_yard: 'rear_patio',
  garage_driveway: 'garage_parking',
  exterior_lighting: 'exterior_lighting',
  windows_interior: 'windows_interior',
};

const TOWNHOME_TO_RESIDENTIAL: ZoneKeyMap = Object.fromEntries(
  Object.entries(RESIDENTIAL_TO_TOWNHOME).map(([k, v]) => [v, k]),
);

function getZoneKeyMap(source: PropertyType, target: PropertyType): ZoneKeyMap {
  if (source === 'single_family_residential' && target === 'townhome') return RESIDENTIAL_TO_TOWNHOME;
  if (source === 'townhome' && target === 'single_family_residential') return TOWNHOME_TO_RESIDENTIAL;
  return {};
}

export async function duplicateAssessmentAs(
  sourceId: string,
  targetPropertyType: PropertyType,
): Promise<DuplicateResult> {
  const source = await db.assessments.get(sourceId);
  if (!source) throw new Error('Source assessment not found');

  const sourceItems = await db.item_scores.where('assessment_id').equals(sourceId).toArray();
  const sourcePhotos = await db.photos.where('assessment_id').equals(sourceId).toArray();
  const sourceZones = getZonesForType(source.property_type);
  const targetZones = getZonesForType(targetPropertyType);
  const zoneMap = getZoneKeyMap(source.property_type, targetPropertyType);

  const newId = uuidv4();
  const now = new Date().toISOString();

  // Build target item_scores (all blank) and lookup indexes
  const targetItems: ItemScore[] = [];
  const targetItemByKey = new Map<string, ItemScore>(); // `${zone}|${principle}|${text}` → target item
  const targetZoneFirstItemId = new Map<string, string>();

  for (const zone of targetZones) {
    let itemOrder = 0;
    for (const principle of zone.principles) {
      for (const itemText of principle.items) {
        const item: ItemScore = {
          id: uuidv4(),
          assessment_id: newId,
          zone_key: zone.key,
          principle: principle.key,
          item_text: itemText,
          item_order: itemOrder++,
          score: null,
          is_na: false,
          notes: '',
          photo_ids: [],
        };
        targetItems.push(item);
        targetItemByKey.set(`${zone.key}|${principle.key}|${itemText}`, item);
        if (!targetZoneFirstItemId.has(zone.key)) {
          targetZoneFirstItemId.set(zone.key, item.id);
        }
      }
    }
  }

  // Match source item_scores to target items
  const sourceItemToTarget = new Map<string, ItemScore>(); // source.id → target item
  let itemsCarried = 0;
  let itemsDropped = 0;
  const droppedItemDetails: Array<{ fromZone: string; fromItem: string }> = [];

  for (const src of sourceItems) {
    const mappedZoneKey = zoneMap[src.zone_key] ?? src.zone_key;
    const lookupKey = `${mappedZoneKey}|${src.principle}|${src.item_text}`;
    const target = targetItemByKey.get(lookupKey);

    const hasData = src.score !== null || src.is_na || src.notes.trim().length > 0;

    if (target) {
      target.score = src.score;
      target.is_na = src.is_na;
      target.notes = src.notes;
      sourceItemToTarget.set(src.id, target);
      if (hasData) itemsCarried++;
    } else if (hasData) {
      itemsDropped++;
      const srcZone = sourceZones.find((z) => z.key === src.zone_key);
      droppedItemDetails.push({
        fromZone: srcZone?.name ?? src.zone_key,
        fromItem: src.item_text,
      });
    }
  }

  // Duplicate photos — link to matched target item or fall back to first item in mapped zone
  const newPhotos: Photo[] = [];
  let photosCarried = 0;
  let photosRehomed = 0;
  const rehomedDetails: RehomedPhoto[] = [];
  const sourceItemById = new Map(sourceItems.map((i) => [i.id, i]));

  for (const src of sourcePhotos) {
    const newPhotoId = uuidv4();
    const sourceItem = src.item_score_id ? sourceItemById.get(src.item_score_id) : undefined;

    let targetItem: ItemScore | undefined;
    let targetZoneKey = src.zone_key;
    let rehomed = false;

    if (sourceItem && sourceItemToTarget.has(sourceItem.id)) {
      // Clean match
      targetItem = sourceItemToTarget.get(sourceItem.id);
      targetZoneKey = targetItem!.zone_key;
    } else {
      // Fallback: first item in mapped target zone
      const mappedZoneKey = sourceItem
        ? zoneMap[sourceItem.zone_key] ?? sourceItem.zone_key
        : zoneMap[src.zone_key] ?? src.zone_key;
      const firstItemId = targetZoneFirstItemId.get(mappedZoneKey);
      if (firstItemId) {
        targetItem = targetItems.find((t) => t.id === firstItemId);
        targetZoneKey = mappedZoneKey;
      } else {
        // Mapped zone doesn't exist in target at all — last resort: first item of assessment
        targetItem = targetItems[0];
        targetZoneKey = targetItem?.zone_key ?? src.zone_key;
      }
      rehomed = true;
    }

    if (rehomed) {
      photosRehomed++;
      const srcZone = sourceItem ? sourceZones.find((z) => z.key === sourceItem.zone_key) : undefined;
      const tgtZone = targetZones.find((z) => z.key === targetZoneKey);
      rehomedDetails.push({
        fromZone: srcZone?.name ?? sourceItem?.zone_key ?? src.zone_key,
        fromItem: sourceItem?.item_text ?? '(unknown item)',
        toZone: tgtZone?.name ?? targetZoneKey,
      });
    } else {
      photosCarried++;
    }

    const newPhoto: Photo = {
      ...src,
      id: newPhotoId,
      assessment_id: newId,
      item_score_id: targetItem?.id ?? null,
      zone_key: targetZoneKey,
      synced: false,
    };
    // Drop the deprecated blob field if present — only base64 data should persist.
    delete newPhoto.blob;

    newPhotos.push(newPhoto);

    if (targetItem) {
      targetItem.photo_ids.push(newPhotoId);
    }
  }

  // Build new assessment record
  const newAssessment: Assessment = {
    ...source,
    id: newId,
    property_type: targetPropertyType,
    created_at: now,
    updated_at: now,
    status: 'in_progress',
    overall_score: null,
    top_recommendations: [],
    quick_wins: [],
    assessor_signature: null,
    synced_at: null,
  };

  // Build zone_scores for target
  const zoneScores: ZoneScore[] = targetZones.map((zone) => ({
    id: uuidv4(),
    assessment_id: newId,
    zone_key: zone.key,
    zone_name: zone.name,
    zone_order: zone.order,
    average_score: null,
    priority_findings: '',
    notes: '',
    completed: false,
  }));

  await db.transaction(
    'rw',
    [db.assessments, db.zone_scores, db.item_scores, db.photos],
    async () => {
      await db.assessments.add(newAssessment);
      await db.zone_scores.bulkAdd(zoneScores);
      await db.item_scores.bulkAdd(targetItems);
      if (newPhotos.length > 0) await db.photos.bulkAdd(newPhotos);
    },
  );

  await persistAllScores(newId);

  return {
    newAssessmentId: newId,
    itemsCarried,
    itemsDropped,
    droppedItemDetails,
    photosCarried,
    photosRehomed,
    rehomedDetails,
  };
}
