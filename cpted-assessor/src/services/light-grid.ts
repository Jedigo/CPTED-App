/**
 * Grid layout for parking-lot light surveys.
 *
 * Readings are taken at grid intersections including the edges, so a 50 ft run
 * at 10 ft spacing yields 6 positions (0, 10, 20, 30, 40, 50) — the same
 * convention as the paper VSO Lighting Survey Report form.
 *
 * The paper form subdivides a lot into quadrants because you can't legibly
 * hand-draw a hundred numbered points in a 4-inch box. That constraint doesn't
 * apply here, so a survey is one grid over the whole lot and uniformity is
 * computed across the full surface — which is what a person actually walks and
 * what their eyes adapt to. Quadrant rollups were tried and dropped: the heat
 * map locates a dark region better than four averages, and per-quadrant
 * uniformity invites the reader to mistake it for the verdict.
 */

/** NICP instructional guidance: at least 50 readings per grid. */
export const MIN_READINGS = 50;

/** SDL400 manual-log mode holds 99 positions, so one walk must fit in 99. */
export const METER_MANUAL_CAPACITY = 99;

/**
 * Aim here when recommending a grid: comfortably clear of the 50-reading floor,
 * with headroom under the meter's 99-position ceiling for re-takes.
 */
const TARGET_READINGS = 82;

/**
 * Spacing the assessor can actually pace off in a dark parking lot. Deriving
 * spacing by dividing the lot into equal intervals produces figures like
 * 34.5 ft, which nobody can step out reliably — so the spacing is chosen from
 * this list first and the point count falls out of it.
 *
 * The same spacing is used on both axes, which makes every interior cell square
 * by construction.
 */
const ROUND_SPACINGS_FT = [10, 15, 20, 25, 30, 35, 40, 45, 50];

/**
 * Reading positions along a run at a given spacing: 0, s, 2s, … up to the last
 * full multiple, plus a final position at the lot edge when the leftover strip
 * is big enough to be worth measuring. Edges are where light falls off, so a
 * remainder is covered rather than dropped — the last cell is simply shorter
 * than the rest.
 *
 * Half a step is the cut-off. An edge point costs a whole extra row or column
 * of walking, and one placed a short hop from its neighbour reads almost the
 * same patch of ground twice while the rest of the lot is sampled evenly. Below
 * half a step that trade stops being worth it: the unread strip is narrower
 * than the gap the reading would sit in.
 */
const EDGE_POINT_THRESHOLD = 0.5;

export function pointsAlong(runFt: number, spacingFt: number): number {
  if (!(runFt > 0) || !(spacingFt > 0)) return 0;
  const fullSteps = Math.floor(runFt / spacingFt);
  const remainder = runFt - fullSteps * spacingFt;
  const base = fullSteps + 1;
  return remainder >= EDGE_POINT_THRESHOLD * spacingFt ? base + 1 : base;
}

export interface GridOption {
  /** Reading positions along the length (long axis). */
  cols: number;
  /** Reading positions along the width. */
  rows: number;
  /** The single round spacing used on both axes. */
  spacing_ft: number;
  spacing_length_ft: number;
  spacing_width_ft: number;
  points: number;
  /** True when a short final cell was added to reach the lot edge. */
  short_last_col: boolean;
  short_last_row: boolean;
  /** Fits a single manual-log session on the meter. */
  within_capacity: boolean;
  /** Clears the booklet's 50-reading minimum. */
  meets_minimum: boolean;
  recommended: boolean;
}

export interface Grid {
  cols: number;
  rows: number;
  spacing_length_ft: number;
  spacing_width_ft: number;
  /** Lot dimensions, when known — used to clamp the short edge cell. */
  length_ft?: number;
  width_ft?: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Candidate grids for a lot, best first. Options that clear the 50-reading
 * minimum and fit one logging session are preferred; if the lot is too large
 * for that, over-capacity options are returned so the caller can warn about
 * splitting the walk across files.
 */
export function generateGridOptions(lengthFt: number, widthFt: number): GridOption[] {
  if (!(lengthFt > 0) || !(widthFt > 0)) return [];

  const options: GridOption[] = [];

  for (const spacing of ROUND_SPACINGS_FT) {
    // A grid needs at least two positions on each axis to be a grid at all.
    if (spacing > lengthFt || spacing > widthFt) continue;

    const cols = pointsAlong(lengthFt, spacing);
    const rows = pointsAlong(widthFt, spacing);
    if (cols < 2 || rows < 2) continue;

    const points = cols * rows;
    if (points > METER_MANUAL_CAPACITY * 4) continue;

    options.push({
      cols,
      rows,
      spacing_ft: spacing,
      spacing_length_ft: spacing,
      spacing_width_ft: spacing,
      points,
      short_last_col: lengthFt - (cols - 2) * spacing < spacing,
      short_last_row: widthFt - (rows - 2) * spacing < spacing,
      within_capacity: points <= METER_MANUAL_CAPACITY,
      meets_minimum: points >= MIN_READINGS,
      recommended: false,
    });
  }

  // Usable = fits one session and clears the minimum. Rank those first, then
  // prefer a grid whose cells are all the same size, then by closeness to the
  // target count.
  //
  // A squeezed axis is not just untidy. It adds a whole row or column of
  // readings — 21 of them on a 448 x 165 ft lot — sitting closer together than
  // every other reading, so they cost a quarter more walking and tell you about
  // ground the neighbouring points already covered. Where a spacing exists that
  // divides the lot cleanly and still clears the minimum, that is the better
  // walk even when it lands further from the target count.
  //
  // Set above anything the count term can reach for a usable option — that term
  // is bounded by the gap between the minimum and the target — so an evenly
  // divided grid wins outright rather than only when the counts happen to be
  // close. Fewer readings on a uniform grid is the better walk; a grid still
  // has to clear the minimum to be usable at all, so this cannot trade away
  // coverage the standard requires.
  const SQUEEZE_PENALTY = 100;
  const score = (o: GridOption) => {
    const usable = o.within_capacity && o.meets_minimum;
    const squeezed = (o.short_last_col ? 1 : 0) + (o.short_last_row ? 1 : 0);
    return (
      (usable ? 0 : 1_000_000) +
      squeezed * SQUEEZE_PENALTY +
      Math.abs(o.points - TARGET_READINGS)
    );
  };
  options.sort((a, b) => score(a) - score(b));

  if (options.length > 0) options[0].recommended = true;
  return options;
}

// --- Serpentine walk order -------------------------------------------------
//
// Point 1 sits at the origin corner. Even rows run left-to-right, odd rows
// right-to-left, so the walk never doubles back across the lot.

export interface Cell {
  col: number;
  row: number;
}

export function pointToCell(pointIndex: number, cols: number): Cell {
  const i = pointIndex - 1;
  const row = Math.floor(i / cols);
  const offset = i % cols;
  const col = row % 2 === 0 ? offset : cols - 1 - offset;
  return { col, row };
}

export function cellToPoint(col: number, row: number, cols: number): number {
  const offset = row % 2 === 0 ? col : cols - 1 - col;
  return row * cols + offset + 1;
}

/**
 * Position of a point in feet from the origin corner. The final row/column can
 * sit closer than the nominal spacing when a short edge cell was added, so the
 * position is clamped to the lot boundary.
 */
export function pointPosition(pointIndex: number, grid: Grid): { x_ft: number; y_ft: number } {
  const { col, row } = pointToCell(pointIndex, grid.cols);
  const x = col * grid.spacing_length_ft;
  const y = row * grid.spacing_width_ft;
  return {
    x_ft: round1(grid.length_ft ? Math.min(x, grid.length_ft) : x),
    y_ft: round1(grid.width_ft ? Math.min(y, grid.width_ft) : y),
  };
}

// --- Skips and reconciliation ----------------------------------------------
//
// The meter's Place column is a bare counter with no idea a point was skipped.
// Skip point 23 and the meter's 23rd reading is really grid point 24, silently
// shifting everything after it. The skip list is what re-aligns them.

export interface PointPlan {
  totalPoints: number;
  skipped: number[];
  /** How many readings the meter should hold if the walk went to plan. */
  expectedReadings: number;
  /** walkOrder[k] is the grid point for the (k+1)-th logged reading. */
  walkOrder: number[];
}

export function buildPointPlan(cols: number, rows: number, skipped: number[]): PointPlan {
  const totalPoints = cols * rows;
  const skipSet = new Set(skipped);
  const walkOrder: number[] = [];
  for (let p = 1; p <= totalPoints; p++) {
    if (!skipSet.has(p)) walkOrder.push(p);
  }
  return {
    totalPoints,
    skipped: [...skipSet].filter((p) => p >= 1 && p <= totalPoints).sort((a, b) => a - b),
    expectedReadings: walkOrder.length,
    walkOrder,
  };
}

export type ReconcileStatus = 'match' | 'extra' | 'short';

export interface Reconciliation {
  expected: number;
  received: number;
  status: ReconcileStatus;
  /** Signed: positive means the file holds more readings than the grid wants. */
  difference: number;
  message: string;
}

export function reconcile(plan: PointPlan, received: number): Reconciliation {
  const expected = plan.expectedReadings;
  const difference = received - expected;
  const skipNote = plan.skipped.length > 0
    ? ` (${plan.totalPoints} points less ${plan.skipped.length} marked obstructed)`
    : '';

  if (difference === 0) {
    return {
      expected,
      received,
      status: 'match',
      difference,
      message: `${received} readings for ${expected} points${skipNote} — aligned.`,
    };
  }
  if (difference > 0) {
    return {
      expected,
      received,
      status: 'extra',
      difference,
      message:
        `The file holds ${received} readings but the grid expects ${expected}${skipNote}. ` +
        `The extra ${difference} will be ignored — this usually means the meter was left logging after the last point.`,
    };
  }
  return {
    expected,
    received,
    status: 'short',
    difference,
    message:
      `The file holds ${received} readings but the grid expects ${expected}${skipNote}. ` +
      `The last ${-difference} point${difference === -1 ? '' : 's'} will be left unread — if you skipped points on the walk, mark them below so the rest line up.`,
  };
}

/** Pair each reading with its grid point, in walk order. */
export function assignReadings<T>(readings: T[], plan: PointPlan): Array<{ point_index: number; reading: T }> {
  const n = Math.min(readings.length, plan.walkOrder.length);
  const out: Array<{ point_index: number; reading: T }> = [];
  for (let k = 0; k < n; k++) {
    out.push({ point_index: plan.walkOrder[k], reading: readings[k] });
  }
  return out;
}

// --- Place-based mapping ---------------------------------------------------
//
// The meter's Place value is authoritative about which reading belongs where.
// In manual mode it is the memory position the assessor selected, so a re-take
// repeats a Place and an un-stored position leaves a gap. Mapping by row order
// would shift every reading after the first anomaly and silently draw dark
// spots in the wrong part of the lot; mapping by Place self-corrects.
//
// Auto mode's sequential 1..N is the degenerate case of the same rule.

export interface PlaceReconciliation {
  /** Readings the grid expects — total points less those marked obstructed. */
  expected: number;
  /** Distinct in-range positions that carry a reading. */
  covered: number;
  /** Walk-order positions with no reading at all. */
  missingPlaces: number[];
  /** Positions logged more than once — re-takes. The last one is kept. */
  duplicatePlaces: number[];
  /** Positions past the end of the grid. */
  outOfRangePlaces: number[];
  status: 'match' | 'partial' | 'over';
  message: string;
}

function listNumbers(ns: number[], limit = 8): string {
  if (ns.length <= limit) return ns.join(', ');
  return `${ns.slice(0, limit).join(', ')} and ${ns.length - limit} more`;
}

/**
 * Map readings onto grid points by their Place value. Later readings for the
 * same Place win, since a position is only re-logged when the first attempt
 * was bad.
 */
export function assignReadingsByPlace<T extends { place: number }>(
  readings: T[],
  plan: PointPlan,
): { assigned: Array<{ point_index: number; reading: T }>; reconciliation: PlaceReconciliation } {
  const expected = plan.expectedReadings;
  const byPlace = new Map<number, T>();
  const counts = new Map<number, number>();
  const outOfRange = new Set<number>();

  for (const reading of readings) {
    const p = reading.place;
    if (!Number.isInteger(p) || p < 1 || p > expected) {
      outOfRange.add(p);
      continue;
    }
    counts.set(p, (counts.get(p) ?? 0) + 1);
    byPlace.set(p, reading); // last wins
  }

  const assigned: Array<{ point_index: number; reading: T }> = [];
  const missing: number[] = [];
  for (let place = 1; place <= expected; place++) {
    const reading = byPlace.get(place);
    if (reading === undefined) {
      missing.push(place);
      continue;
    }
    assigned.push({ point_index: plan.walkOrder[place - 1], reading });
  }

  const duplicates = [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([p]) => p)
    .sort((a, b) => a - b);
  const outOfRangeList = [...outOfRange].sort((a, b) => a - b);
  const covered = byPlace.size;

  const parts: string[] = [`${covered} of ${expected} points have a reading.`];
  if (duplicates.length > 0) {
    parts.push(
      `Position${duplicates.length === 1 ? '' : 's'} ${listNumbers(duplicates)} ${duplicates.length === 1 ? 'was' : 'were'} logged more than once — the last reading for each was kept.`,
    );
  }
  if (missing.length > 0) {
    parts.push(
      `No reading stored for position${missing.length === 1 ? '' : 's'} ${listNumbers(missing)} — ${missing.length === 1 ? 'that point is' : 'those points are'} left blank on the map.`,
    );
  }
  if (outOfRangeList.length > 0) {
    parts.push(
      `${outOfRangeList.length} reading${outOfRangeList.length === 1 ? '' : 's'} fell outside the grid (position ${listNumbers(outOfRangeList)}) and ${outOfRangeList.length === 1 ? 'was' : 'were'} ignored.`,
    );
  }

  const status: PlaceReconciliation['status'] =
    outOfRangeList.length > 0 ? 'over' : missing.length > 0 ? 'partial' : 'match';

  return {
    assigned,
    reconciliation: {
      expected,
      covered,
      missingPlaces: missing,
      duplicatePlaces: duplicates,
      outOfRangePlaces: outOfRangeList,
      status,
      message: parts.join(' '),
    },
  };
}
