// Pure scoring functions — ported from cpted-assessor/src/services/scoring.ts

interface ScoredItem {
  score: number | null;
  is_na: boolean;
  principle: string;
}

/** Filter to items that have a numeric score (not null, not N/A) */
export function getScoredItems<T extends ScoredItem>(items: T[]): T[] {
  return items.filter((s) => s.score !== null && !s.is_na);
}

/** Average of scored items, null if none scored */
export function calculateAverage(items: ScoredItem[]): number | null {
  const scored = getScoredItems(items);
  if (scored.length === 0) return null;
  return scored.reduce((sum, s) => sum + s.score!, 0) / scored.length;
}

/** Average of scored items within a specific principle */
export function calculatePrincipleAverage(
  items: ScoredItem[],
  principleKey: string,
): number | null {
  return calculateAverage(items.filter((s) => s.principle === principleKey));
}

/** Average of all scored items in a zone */
export function calculateZoneAverage(zoneItems: ScoredItem[]): number | null {
  return calculateAverage(zoneItems);
}

/**
 * Overall score = average of zone averages (equal weight per zone).
 * Zones with no scored items are excluded.
 */
export function calculateOverallScore(
  itemsByZone: Map<string, ScoredItem[]>,
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
export function isZoneComplete(items: ScoredItem[]): boolean {
  if (items.length === 0) return false;
  return items.every((s) => s.score !== null || s.is_na);
}

/** Completion counts for a set of items */
export function getCompletionCounts(items: ScoredItem[]): {
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

/** Human-readable label for a score value */
export function getScoreLabel(score: number): string {
  if (score < 1.5) return 'Critical';
  if (score < 2.5) return 'Deficient';
  if (score < 3.5) return 'Adequate';
  if (score < 4.5) return 'Good';
  return 'Excellent';
}
