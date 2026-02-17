import { v4 as uuidv4 } from 'uuid';
import type { ItemScore, Recommendation } from '../types';
import { ZONES } from '../data/zones';

// Principles where fixes tend to be low-cost / quick to implement
const QUICK_WIN_PRINCIPLES = new Set([
  'maintenance',
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
    type: 'recommendation' as const,
  }));
}

// --- Auto-Fence Recommendation ---

const FENCE_TRIGGER_ITEMS = new Set([
  'Rear yard at least partially visible from one or more neighboring properties',
  'Rear fence/gate is secured with quality lock (not just a flip latch)',
  'Rear property boundaries clearly defined',
]);

const FENCE_RECOMMENDATION_TEXT =
  'Install or upgrade rear yard fencing using a CPTED-approved semi-open design (e.g., aluminum picket, wrought iron style, or chain-link with visibility) that maintains natural surveillance from neighboring properties while establishing clear territorial boundaries. Avoid solid 6-foot privacy fences that create concealment opportunities. Ideal height is 4-5 feet with at least 50% visibility through the fence material. Include a self-closing, self-latching gate with a quality lock.';

const HOA_ADDENDUM =
  ' Note: Check with your HOA or local code enforcement for approved fence styles, heights, and materials before installation.';

/**
 * Generate a CPTED fencing recommendation when rear yard fence-related items
 * are scored N/A, 1, or 2. Appended to the recommendations list if triggered.
 */
export function generateFenceRecommendation(
  allItems: ItemScore[],
  assessmentId: string,
  existingRecs: Recommendation[],
): Recommendation | null {
  // Check if existing recommendations already mention fencing
  if (existingRecs.some((r) => /fence/i.test(r.description))) return null;

  const rearYardItems = allItems.filter(
    (item) => item.zone_key === 'rear_yard' && FENCE_TRIGGER_ITEMS.has(item.item_text),
  );

  // Check if any trigger item is scored N/A, 1, or 2
  const triggerItems = rearYardItems.filter(
    (item) => item.is_na || (item.score !== null && item.score <= 2),
  );

  if (triggerItems.length === 0) return null;

  // Priority: high if any scored 1, medium if scored 2 or N/A
  const hasScore1 = triggerItems.some((item) => item.score === 1);
  const priority: 'high' | 'medium' = hasScore1 ? 'high' : 'medium';

  // Check item notes for HOA mention
  const hasHOA = rearYardItems.some(
    (item) => item.notes && /hoa/i.test(item.notes),
  );

  const description = FENCE_RECOMMENDATION_TEXT + (hasHOA ? HOA_ADDENDUM : '');

  return {
    id: uuidv4(),
    assessment_id: assessmentId,
    order: existingRecs.length + 1,
    description: `Rear Yard & Back Entry — Fencing Upgrade: ${description}`,
    priority,
    type: 'recommendation' as const,
  };
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
    type: 'quick_win' as const,
  }));
}
