/**
 * The date the report is signed.
 *
 * Kept apart from date_of_assessment on purpose. An assessment can be walked
 * over several visits — one half in July, the rest in August — so no single
 * walk date can honestly sit above a signature. This is the day the assessor
 * finished the report and stood behind it.
 */

import { db } from '../db/database';

/**
 * Today as a date-only YYYY-MM-DD string, in the device's own timezone.
 *
 * Deliberately not `new Date().toISOString().slice(0, 10)`: that is UTC, so
 * anywhere west of Greenwich it returns tomorrow's date for most of the
 * evening — the same class of off-by-one that produced two report-date bugs in
 * this project already.
 */
export function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/**
 * Returns the report's signature date, stamping today's the first time.
 *
 * Called once per report generation. The stamp happens only when the field is
 * empty, so regenerating the same report next month prints the date it was
 * actually signed rather than silently re-dating a signature already given.
 * The assessor can still override it in Edit Info.
 */
export async function ensureReportSignedOn(assessmentId: string): Promise<string | null> {
  const assessment = await db.assessments.get(assessmentId);
  if (!assessment) return null;
  if (assessment.report_signed_on) return assessment.report_signed_on;

  const today = todayLocalISO();
  await db.assessments.update(assessmentId, {
    report_signed_on: today,
    updated_at: new Date().toISOString(),
  });
  return today;
}
