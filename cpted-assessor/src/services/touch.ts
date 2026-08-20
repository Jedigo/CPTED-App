/**
 * Recording that an assessment changed.
 *
 * One invariant governs everything here: **revision names the exact bytes
 * currently in this device's IndexedDB for this assessment.** Every rule below
 * falls out of that sentence.
 *
 *  - The bump happens in the same write as the change it describes, so there is
 *    no window in which the data has moved and the number has not.
 *  - Derived recalculations must NOT bump. persistZoneScore/persistOverallScore
 *    in scoring.ts are functions of item_scores, which already bumped — and
 *    persistAllScores() runs on mount from both Assessment and Summary, so
 *    bumping there would mean that merely OPENING an assessment made this iPad
 *    look edited, and the next comparison would cry conflict when nobody
 *    touched anything. A warning that fires when nothing happened is worse than
 *    no warning: people learn to tap through it, and then it fails on the one
 *    occasion it was right.
 *  - Sync must NOT bump. Sync moves bytes; it does not change them.
 */

import { db } from '../db/database';
import { getDeviceName } from './device';
import type { Assessment } from '../types';

/** Fields this module owns. Callers pass everything else through `patch`. */
type ManagedField =
  | 'id'
  | 'revision'
  | 'synced_revision'
  | 'last_edited_by'
  | 'last_edited_at'
  | 'updated_at';

/**
 * Record an edit: apply `patch` (if any) and move the revision, the editing
 * device, and the edit time in the same write.
 *
 * A read-modify-write inside a transaction rather than a bare update, because
 * Dexie has no atomic increment: two quick taps would otherwise both read n and
 * both write n+1, and a lost bump is a missed conflict warning.
 *
 * Callers already inside a `db.transaction('rw', ...)` must include
 * `db.assessments` in their scope, or Dexie throws
 * "Table assessments not part of transaction".
 */
export async function touchAssessment(
  assessmentId: string,
  patch?: Partial<Omit<Assessment, ManagedField>>,
): Promise<void> {
  await db.transaction('rw', db.assessments, async () => {
    const current = await db.assessments.get(assessmentId);
    if (!current) return;
    const now = new Date().toISOString();
    await db.assessments.update(assessmentId, {
      ...patch,
      revision: (current.revision ?? 1) + 1,
      last_edited_by: getDeviceName(),
      last_edited_at: now,
      // Kept in step with last_edited_at so the old field stops drifting. It
      // stays for existing readers; last_edited_at is the one that is honest
      // about being an edit rather than a sync.
      updated_at: now,
    });
  });
}

/**
 * Same, for the call sites that hold an item_score id but not the assessment
 * id — score taps, item notes, and photo add/delete/move.
 */
export async function touchAssessmentForItem(itemScoreId: string): Promise<void> {
  const item = await db.item_scores.get(itemScoreId);
  if (!item) return;
  await touchAssessment(item.assessment_id);
}

/**
 * Give assessments written before this feature a starting revision.
 *
 * Deliberately NOT a Dexie `.upgrade()`. IndexedDB object stores are
 * schemaless — the .stores() string declares the primary key and indexes only —
 * so none of these fields need a schema version at all. And an upgrade callback
 * runs inside a versionchange transaction where a throw leaves db.open()
 * rejecting: the app would fail to launch, in the field, on a shared iPad, with
 * no way for the assessor to recover. Not a risk worth taking for four
 * un-indexed numbers.
 *
 * So this runs as ordinary work at startup, is idempotent, and is safe to fail:
 * every reader also defaults a missing revision to 1, which is correct on the
 * very first paint before this has had a chance to run.
 *
 * The `synced_at ? 1 : null` line is the load-bearing one. It stops the entire
 * back catalogue reporting as diverged on the first launch: a row that has
 * synced before has a known common ancestor — revision 1, which is also what
 * the server's column default stamps on its own existing rows — while a row
 * that has never synced has no ancestor, and null says so honestly.
 *
 * last_edited_at is left null rather than seeded from updated_at: that field is
 * already contaminated by sync, and laundering a sync timestamp into one whose
 * entire purpose is "the last real edit" would poison it on day one. It fills
 * in on the first genuine edit.
 */
export async function backfillRevisions(): Promise<void> {
  await db.assessments
    .filter((a) => a.revision === undefined)
    .modify((a) => {
      a.revision = 1;
      a.synced_revision = a.synced_at ? 1 : null;
      a.last_edited_by = null;
      a.last_edited_at = null;
    });
}
