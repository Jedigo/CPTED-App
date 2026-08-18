/**
 * Parser for Extech SDL400 SD-card exports.
 *
 * The meter writes files named LXB01001.XLS into an LXB01 folder, but despite
 * the extension they are plain tab-delimited text. A real export looks like:
 *
 *   Place<TAB>Date<TAB>Time<TAB>Value<TAB>Unit<CR>
 *   00001<TAB>2000/02/11<TAB>00:11:47<TAB>00014.5<TAB>Ft cd   <CR>
 *
 * Details that bite:
 *  - Line terminator is a bare CR. Splitting on '\n' yields one giant line.
 *  - The header says "Place"; the printed manual says "Position".
 *  - Date is YYYY/MM/DD here, M/D/YYYY in the manual — both are accepted.
 *  - Numbers are zero-padded and the unit is space-padded ("Ft cd   ").
 *  - The meter's dEC setting can emit European decimals (00014,5).
 *
 * Manual logging (SP-t = 0) writes the Place column in a different shape again:
 * the meter's "P-n" memory-position display, dumped raw with embedded NUL
 * padding — `P<NUL> <NUL>1` for position 1, `P<NUL> 10` for position 10. Those
 * NULs are why the file reads as a wall of CJK characters in any editor that
 * auto-detects encoding: regularly spaced NULs are exactly what UTF-16LE ASCII
 * looks like. Stripping them fixes both this case and a genuinely UTF-16 file,
 * since ASCII content in UTF-16 is just the same bytes with NULs interleaved.
 *
 * The manual-mode Place is a MEMORY POSITION, not a running counter: it can
 * repeat (a re-take overwrites the position but appends a row) and it can skip
 * (a position that was never stored). Callers must map by Place value rather
 * than by row order — see assignReadingsByPlace in light-grid.
 */

import type { IlluminanceUnit } from '../types';

/** Exact conversion: 1 footcandle = 1 lumen/ft², 1 lux = 1 lumen/m². */
export const LUX_PER_FC = 10.763910416709722;

export function luxToFc(lux: number): number {
  return lux / LUX_PER_FC;
}

export function fcToLux(fc: number): number {
  return fc * LUX_PER_FC;
}

export interface MeterReading {
  /** The meter's Place column — a bare sequential counter, 1-based. */
  place: number;
  /** Value in the file's own unit. */
  value: number;
  /** Same value normalized to footcandles. */
  value_fc: number;
  /** Unit string as written by the meter, trimmed (e.g. "Ft cd"). */
  raw_unit: string;
  /** ISO 8601 UTC, or null when the row carried no usable date/time. */
  measured_at: string | null;
}

/**
 * Which logging mode produced the file. Manual ("P 1") means Place is a memory
 * position that may repeat or skip; auto ("00001") means Place is a running
 * counter. Mapping is by Place value either way, so this is informational.
 */
export type LogMode = 'manual' | 'auto';

export interface MeterParseResult {
  readings: MeterReading[];
  /** Unit the file is in. Mixed-unit files resolve to the majority unit. */
  unit: IlluminanceUnit;
  delimiter: string;
  log_mode: LogMode;
  warnings: string[];
}

export class MeterParseError extends Error {}

const DELIMITERS = ['\t', ';', ','];

/** Normalize the meter's unit text. Seen: "Ft cd", "Ft-cd", "FC", "LUX". */
function normalizeUnit(raw: string): IlluminanceUnit | null {
  const u = raw.trim().toLowerCase().replace(/[\s-]/g, '');
  if (u === 'ftcd' || u === 'fc' || u === 'footcandle' || u === 'footcandles') {
    return 'fc';
  }
  if (u === 'lux' || u === 'lx') return 'lux';
  return null;
}

/**
 * Parse a numeric field. Handles zero-padding and European decimal commas —
 * a comma is only ever a decimal separator here, since the delimiter has
 * already split the row.
 */
function parseValue(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (cleaned === '') return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/**
 * Build an ISO UTC timestamp from the meter's separate date and time fields.
 * Accepts YYYY/MM/DD, YYYY-MM-DD and M/D/YYYY. The meter clock is free-running
 * local time, so the parts are treated as local and converted.
 */
function parseTimestamp(dateRaw: string, timeRaw: string): string | null {
  const date = dateRaw.trim();
  const time = timeRaw.trim();
  if (!date) return null;

  const parts = date.split(/[/-]/).map((p) => p.trim());
  if (parts.length !== 3) return null;

  let year: number, month: number, day: number;
  if (parts[0].length === 4) {
    [year, month, day] = parts.map(Number);
  } else {
    // M/D/YYYY
    [month, day, year] = parts.map(Number);
  }
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const [h = 0, m = 0, s = 0] = time.split(':').map((p) => Number(p.trim()) || 0);

  const d = new Date(year, month - 1, day, h, m, s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

/** Pick the delimiter that splits the header into the most fields. */
function detectDelimiter(headerLine: string): string {
  let best = '\t';
  let bestCount = 0;
  for (const d of DELIMITERS) {
    const count = headerLine.split(d).length;
    if (count > bestCount) {
      bestCount = count;
      best = d;
    }
  }
  return best;
}

/** True when the row is a header rather than data. */
function isHeaderRow(fields: string[]): boolean {
  const first = fields[0]?.trim().toLowerCase() ?? '';
  return first === 'place' || first === 'position';
}

/**
 * Read the Place field in either shape: auto mode's zero-padded counter
 * ("00001") or manual mode's memory-position display ("P 1", already stripped
 * of its NUL padding). Returns null when neither parses.
 */
function parsePlace(raw: string): { place: number | null; manual: boolean } {
  const s = raw.trim();
  const manual = /^p/i.test(s);
  const digits = manual ? s.replace(/^p/i, '').trim() : s;
  if (digits === '') return { place: null, manual };
  const n = Number(digits);
  return { place: Number.isFinite(n) ? n : null, manual };
}

export function parseMeterFile(text: string): MeterParseResult {
  // Drop a BOM and every NUL byte before anything else. Manual-mode files pad
  // the Place field with NULs, and a true UTF-16 file is ASCII with NULs
  // interleaved — one strip handles both and leaves plain ASCII either way.
  const cleaned = text.replace(/^\uFEFF/, '').split('\u0000').join('');

  // Bare CR is the real-world terminator; handle CRLF and LF too.
  const lines = cleaned
    .split(/\r\n|\r|\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new MeterParseError('The file is empty.');
  }

  const delimiter = detectDelimiter(lines[0]);
  const warnings: string[] = [];
  const readings: MeterReading[] = [];
  const unitCounts: Record<IlluminanceUnit, number> = { fc: 0, lux: 0 };
  let malformed = 0;
  let unknownUnit = 0;
  let manualRows = 0;

  for (let i = 0; i < lines.length; i++) {
    const fields = lines[i].split(delimiter);
    if (i === 0 && isHeaderRow(fields)) continue;

    // Place, Date, Time, Value, Unit
    if (fields.length < 5) {
      malformed++;
      continue;
    }

    const { place, manual } = parsePlace(fields[0]);
    const value = parseValue(fields[3]);
    const unit = normalizeUnit(fields[4]);

    if (place === null || value === null) {
      malformed++;
      continue;
    }
    if (manual) manualRows++;
    if (unit === null) {
      unknownUnit++;
      continue;
    }

    unitCounts[unit]++;
    readings.push({
      place,
      value,
      value_fc: unit === 'fc' ? value : luxToFc(value),
      raw_unit: fields[4].trim(),
      measured_at: parseTimestamp(fields[1], fields[2]),
    });
  }

  if (readings.length === 0) {
    throw new MeterParseError(
      "No readings found. Check that this is an SDL400 export (LXB01001.XLS) and not a spreadsheet re-saved from Excel.",
    );
  }

  if (malformed > 0) {
    warnings.push(`${malformed} row${malformed === 1 ? '' : 's'} could not be read and were skipped.`);
  }
  if (unknownUnit > 0) {
    warnings.push(
      `${unknownUnit} row${unknownUnit === 1 ? '' : 's'} had an unrecognized unit and were skipped.`,
    );
  }

  const unit: IlluminanceUnit = unitCounts.lux > unitCounts.fc ? 'lux' : 'fc';
  if (unitCounts.fc > 0 && unitCounts.lux > 0) {
    warnings.push(
      'This file mixes footcandle and lux readings — the unit was switched mid-session. All values were converted to footcandles.',
    );
  }

  const log_mode: LogMode = manualRows > 0 ? 'manual' : 'auto';

  // The SDL400 clock free-runs and resets to a 2000 epoch when power is lost.
  // A stale clock would date every reading wrongly on the report.
  const firstDated = readings.find((r) => r.measured_at !== null);
  if (firstDated?.measured_at) {
    const year = new Date(firstDated.measured_at).getFullYear();
    if (year < 2010) {
      warnings.push(
        `The meter's clock appears unset — readings are stamped ${year}. Set the clock (SET → dAtE) before the next survey; the survey date below is what the report will use.`,
      );
    }
  }

  // In auto mode Place is a plain counter, so a break in it means the session
  // was paused or the card holds a partial read. In manual mode repeats and
  // gaps are normal (re-takes and un-stored positions) and are reported by the
  // import reconciliation instead, against the actual grid.
  if (log_mode === 'auto') {
    const places = readings.map((r) => r.place);
    const sequential = places.every((p, idx) => idx === 0 || p === places[idx - 1] + 1);
    if (!sequential) {
      warnings.push(
        'The Place column is not consecutive, which usually means logging was paused and resumed. Check the point alignment below.',
      );
    }
  }

  return { readings, unit, delimiter, log_mode, warnings };
}
