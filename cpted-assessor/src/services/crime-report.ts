/**
 * Crime-data reports from the crime analysts, merged into the back of the CPTED
 * report so the district receives one document rather than two.
 *
 * The file is kept whole. jsPDF can build pages but cannot read them, so the
 * merge happens after the report is generated (see mergeCrimeReport in pdf.ts):
 * the analyst's pages go in intact, keeping their charts sharp and their text
 * searchable, rather than being flattened to pictures of text.
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import type { CrimeReport } from '../types';

/**
 * Refused above this. Real analyst reports come in under 1 MB, so this is pure
 * headroom rather than a working limit — but base64 inflates by about a third
 * on the way into IndexedDB, and an iPad in the field shares that budget with
 * every photo on every assessment.
 */
export const MAX_CRIME_REPORT_BYTES = 25 * 1024 * 1024;

/**
 * Warned above this. Five times the size of a normal report: still accepted,
 * but far enough off the usual that it's worth a look before it goes over a
 * phone hotspot.
 */
export const LARGE_CRIME_REPORT_BYTES = 5 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.readAsDataURL(file);
  });
}

export async function getCrimeReport(assessmentId: string): Promise<CrimeReport | undefined> {
  const all = await db.crime_reports.where('assessment_id').equals(assessmentId).toArray();
  return all[0];
}

/**
 * Stores an uploaded PDF against an assessment, replacing any previous one —
 * the district sends a single crime report per assessment.
 *
 * The page count is read here rather than at report time so the report can
 * reserve exactly the right number of pages before its page numbers and table
 * of contents are settled.
 */
export async function saveCrimeReport(assessmentId: string, file: File): Promise<CrimeReport> {
  if (file.size > MAX_CRIME_REPORT_BYTES) {
    throw new Error(
      `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_CRIME_REPORT_BYTES)} — ask the analyst for a smaller export.`,
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  let pageCount: number;
  try {
    // Loaded on demand so pdf-lib stays out of the app shell — most assessments
    // never touch it. The service worker still precaches the chunk, so an
    // upload works offline.
    const { PDFDocument } = await import('pdf-lib');
    // Also the validity check: anything pdf-lib cannot open cannot be merged,
    // and finding that out now beats finding out at report time.
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = doc.getPageCount();
  } catch {
    throw new Error('That file could not be read as a PDF. Ask the analyst to re-export it.');
  }

  if (pageCount === 0) throw new Error('That PDF has no pages in it.');

  const data = await readAsDataUrl(file);

  const existing = await getCrimeReport(assessmentId);
  if (existing) await db.crime_reports.delete(existing.id);

  const report: CrimeReport = {
    id: uuidv4(),
    assessment_id: assessmentId,
    filename: file.name,
    data,
    size_bytes: file.size,
    page_count: pageCount,
    uploaded_at: new Date().toISOString(),
    synced: false,
  };

  await db.crime_reports.add(report);
  return report;
}

export async function deleteCrimeReport(id: string): Promise<void> {
  await db.crime_reports.delete(id);
}
