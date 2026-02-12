import type { ItemScore } from '../types';
import { db } from '../db/database';

// --- Pure calculation functions (no DB, testable) ---

/** Filter to items that have a numeric score (not null, not N/A) */
export function getScoredItems(items: ItemScore[]): ItemScore[] {
  return items.filter((s) => s.score !== null && !s.is_na);
}

/** Average of scored items, null if none scored */
export function calculateAverage(items: ItemScore[]): number | null {
  const scored = getScoredItems(items);
  if (scored.length === 0) return null;
  return scored.reduce((sum, s) => sum + s.score!, 0) / scored.length;
}

/** Average of scored items within a specific principle */
export function calculatePrincipleAverage(
  items: ItemScore[],
  principleKey: string,
): number | null {
  return calculateAverage(items.filter((s) => s.principle === principleKey));
}

/** Average of all scored items in a zone (alias for calculateAverage) */
export function calculateZoneAverage(zoneItems: ItemScore[]): number | null {
  return calculateAverage(zoneItems);
}

/**
 * Overall score = average of zone averages (equal weight per zone).
 * Zones with no scored items (all N/A or untouched) are excluded.
 */
export function calculateOverallScore(
  itemsByZone: Map<string, ItemScore[]>,
): number | null {
  const zoneAverages: number[] = [];
  for (const items of itemsByZone.values()) {
    const avg = calculateZoneAverage(items);
    if (avg !== null) {
      zoneAverages.push(avg);
    }
  }
  if (zoneAverages.length === 0) return null;
  return zoneAverages.reduce((sum, a) => sum + a, 0) / zoneAverages.length;
}

/** True when every item in the zone has been scored or marked N/A */
export function isZoneComplete(items: ItemScore[]): boolean {
  if (items.length === 0) return false;
  return items.every((s) => s.score !== null || s.is_na);
}

/** Completion counts for a set of items */
export function getCompletionCounts(items: ItemScore[]): {
  total: number;
  scored: number;
  na: number;
  addressed: number;
  remaining: number;
} {
  const scored = items.filter((s) => s.score !== null && !s.is_na).length;
  const na = items.filter((s) => s.is_na).length;
  const addressed = scored + na;
  return {
    total: items.length,
    scored,
    na,
    addressed,
    remaining: items.length - addressed,
  };
}

/** Tailwind text color class for a score value */
export function getScoreColor(score: number): string {
  if (score < 2) return 'text-score-critical';
  if (score < 3) return 'text-score-deficient';
  if (score < 4) return 'text-score-adequate';
  if (score < 5) return 'text-score-good';
  return 'text-score-excellent';
}

/** Tailwind background color class for a score value (table rows) */
export function getScoreBgColor(score: number): string {
  if (score < 2) return 'bg-red-50';
  if (score < 3) return 'bg-orange-50';
  if (score < 4) return 'bg-yellow-50';
  if (score < 5) return 'bg-green-50';
  return 'bg-emerald-50';
}

/** Human-readable label for a score value */
export function getScoreLabel(score: number): string {
  if (score < 1.5) return 'Critical';
  if (score < 2.5) return 'Deficient';
  if (score < 3.5) return 'Adequate';
  if (score < 4.5) return 'Good';
  return 'Excellent';
}

// --- Persistence functions (read/write DB) ---

/** Update the zone_scores record for a single zone */
export async function persistZoneScore(
  assessmentId: string,
  zoneKey: string,
  zoneItems: ItemScore[],
): Promise<void> {
  const avg = calculateZoneAverage(zoneItems);
  const complete = isZoneComplete(zoneItems);

  const record = await db.zone_scores
    .where({ assessment_id: assessmentId, zone_key: zoneKey })
    .first();

  if (record) {
    await db.zone_scores.update(record.id, {
      average_score: avg,
      completed: complete,
    });
  }
}

/** Recalculate and persist the overall assessment score */
export async function persistOverallScore(
  assessmentId: string,
): Promise<void> {
  const zoneScores = await db.zone_scores
    .where('assessment_id')
    .equals(assessmentId)
    .toArray();

  const averages: number[] = [];
  for (const zs of zoneScores) {
    if (zs.average_score !== null) {
      averages.push(zs.average_score);
    }
  }

  const overall =
    averages.length > 0
      ? averages.reduce((sum, a) => sum + a, 0) / averages.length
      : null;

  await db.assessments.update(assessmentId, { overall_score: overall });
}

/** Full recalculation of all zone scores + overall score */
export async function persistAllScores(assessmentId: string): Promise<void> {
  const allItems = await db.item_scores
    .where('assessment_id')
    .equals(assessmentId)
    .toArray();

  const byZone = new Map<string, ItemScore[]>();
  for (const item of allItems) {
    const list = byZone.get(item.zone_key);
    if (list) {
      list.push(item);
    } else {
      byZone.set(item.zone_key, [item]);
    }
  }

  await db.transaction('rw', [db.zone_scores, db.assessments], async () => {
    for (const [zoneKey, items] of byZone) {
      await persistZoneScore(assessmentId, zoneKey, items);
    }
    await persistOverallScore(assessmentId);
  });
}
