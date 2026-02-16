import { v4 as uuidv4 } from 'uuid';
import type { ItemScore, Recommendation } from '../types';
import { ZONES } from '../data/zones';

// Principles where fixes tend to be low-cost / quick to implement
const QUICK_WIN_PRINCIPLES = new Set([
  'maintenance',
  'lighting_controls',
  'fixture_glare',
  'behavioral',
]);

interface ScoredItemContext {
  item: ItemScore;
  zoneName: string;
  zoneOrder: number;
  principleName: string;
}

function getItemContext(items: ItemScore[]): ScoredItemContext[] {
  const results: ScoredItemContext[] = [];

  for (const item of items) {
    if (item.score === null || item.is_na) continue;

    const zone = ZONES.find((z) => z.key === item.zone_key);
    if (!zone) continue;

    const principle = zone.principles.find((p) => p.key === item.principle);
    if (!principle) continue;

    results.push({
      item,
      zoneName: zone.name,
      zoneOrder: zone.order,
      principleName: principle.name,
    });
  }

  return results;
}

function getPriority(score: number): 'high' | 'medium' | 'low' {
  if (score <= 1) return 'high';
  if (score <= 2) return 'medium';
  return 'low';
}

function getTimeline(score: number): string {
  if (score <= 1) return 'Immediate';
  if (score <= 2) return '1-3 months';
  return '3-6 months';
}

function getQuickWinTimeline(score: number): string {
  if (score <= 2) return 'Immediate';
  return '1-4 weeks';
}

/**
 * Generate top recommendations from the worst-scoring items.
 * Picks the lowest-scored items (1s first, then 2s), up to `count`.
 */
export function generateRecommendations(
  allItems: ItemScore[],
  assessmentId: string,
  count = 5,
): Recommendation[] {
  const contextItems = getItemContext(allItems);

  // Get items scored 1-3 (Critical, Deficient, Adequate), sorted worst first
  const candidates = contextItems
    .filter((c) => c.item.score !== null && c.item.score <= 3)
    .sort((a, b) => {
      // Sort by score ascending (worst first), then by zone order
      if (a.item.score! !== b.item.score!) return a.item.score! - b.item.score!;
      return a.zoneOrder - b.zoneOrder;
    });

  return candidates.slice(0, count).map((c, idx) => ({
    id: uuidv4(),
    assessment_id: assessmentId,
    order: idx + 1,
    description: `${c.zoneName} — ${c.principleName}: ${c.item.item_text}`,
    priority: getPriority(c.item.score!),
    timeline: getTimeline(c.item.score!),
    type: 'recommendation' as const,
  }));
}

/**
 * Generate quick wins — items that are easy to fix.
 * Prioritizes maintenance/lighting/behavioral items scored 2-3,
 * then falls back to any items scored 3.
 */
export function generateQuickWins(
  allItems: ItemScore[],
  assessmentId: string,
  count = 5,
): Recommendation[] {
  const contextItems = getItemContext(allItems);

  // Items scored 2-3 from quick-win principles (maintenance, lighting, behavioral)
  const easyFixes = contextItems.filter(
    (c) =>
      c.item.score !== null &&
      c.item.score >= 2 &&
      c.item.score <= 3 &&
      QUICK_WIN_PRINCIPLES.has(c.item.principle),
  );

  // Fallback: any item scored 3 (adequate — room for improvement, not urgent)
  const adequateItems = contextItems.filter(
    (c) =>
      c.item.score !== null &&
      c.item.score === 3 &&
      !QUICK_WIN_PRINCIPLES.has(c.item.principle),
  );

  // Combine: easy fixes first, then fallback, deduplicated
  const seen = new Set<string>();
  const combined: ScoredItemContext[] = [];

  for (const c of [...easyFixes, ...adequateItems]) {
    if (!seen.has(c.item.id)) {
      seen.add(c.item.id);
      combined.push(c);
    }
  }

  // Sort: lowest score first, then by zone order
  combined.sort((a, b) => {
    if (a.item.score! !== b.item.score!) return a.item.score! - b.item.score!;
    return a.zoneOrder - b.zoneOrder;
  });

  return combined.slice(0, count).map((c, idx) => ({
    id: uuidv4(),
    assessment_id: assessmentId,
    order: idx + 1,
    description: `${c.zoneName} — ${c.principleName}: ${c.item.item_text}`,
    priority: c.item.score! <= 2 ? 'medium' as const : 'low' as const,
    timeline: getQuickWinTimeline(c.item.score!),
    type: 'quick_win' as const,
  }));
}
