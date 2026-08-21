/**
 * Grid layout for parking-lot light surveys.
 *
 * The lot is tiled in equal square cells and a reading is taken at the centre
 * of each, so a 50 ft run at 10 ft spacing yields 5 positions (5, 15, 25, 35,
 * 45). Every reading then speaks for exactly the same amount of ground, which
 * is what makes the heat map readable and the average honest.
 *
 * Earlier surveys read the grid intersections instead, starting on the corner
 * (0, 10, … 50). That put the outermost readings on the lot boundary, where
 * they own only half a cell — visible on the map as half-width squares down two
 * sides, and quietly over-weighting the edges in the average. Those surveys
 * keep their original layout via grid_origin; only new ones are centred.
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
 * How many whole cells of this spacing fit along a run — which is how many
 * readings it takes, one per cell.
 *
 * The leftover strip past the last whole cell is left unread rather than given
 * a narrow cell of its own. A cell narrower than the rest costs a whole row or
 * column of walking to describe a sliver, and its reading would carry the same
 * weight in the average as readings covering several times the ground.
 */
export function pointsAlong(runFt: number, spacingFt: number): number {
  if (!(runFt > 0) || !(spacingFt > 0)) return 0;
  return Math.floor(runFt / spacingFt);
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
  /**
   * Ground past the last whole cell, left unread. Always less than one spacing
   * on each axis — the price of keeping every cell the same size.
   */
  leftover_length_ft: number;
  leftover_width_ft: number;
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
  /** Lot dimensions, when known. */
  length_ft?: number;
  width_ft?: number;
  /**
   * Where the readings sit. 'center' puts each in the middle of its cell;
   * 'edge' is the original corner-first layout. Absent means edge, because
   * every survey that predates this field was walked that way.
   */
  grid_origin?: GridOrigin;
}

export type GridOrigin = 'edge' | 'center';

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
      leftover_length_ft: round1(lengthFt - cols * spacing),
      leftover_width_ft: round1(widthFt - rows * spacing),
      within_capacity: points <= METER_MANUAL_CAPACITY,
      meets_minimum: points >= MIN_READINGS,
      recommended: false,
    });
  }

  // Usable = fits one session and clears the minimum. Rank those first, then by
  // closeness to the target count.
  //
  // Every grid divides the lot into equal cells now, so there is no longer a
  // squeezed-edge case to rank around: the only thing separating usable options
  // is how much walking they cost.
  const score = (o: GridOption) => {
    const usable = o.within_capacity && o.meets_minimum;
    return (usable ? 0 : 1_000_000) + Math.abs(o.points - TARGET_READINGS);
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
 * Position of a point in feet from the origin corner.
 *
 * Centred layout puts the reading in the middle of its cell, so the walk starts
 * half a step in from the corner and every step after that is a full spacing.
 * The legacy layout starts on the corner itself, where the last row or column
 * could sit closer than a full step, so that one is clamped to the lot.
 */
export function pointPosition(pointIndex: number, grid: Grid): { x_ft: number; y_ft: number } {
  const { col, row } = pointToCell(pointIndex, grid.cols);

  if (grid.grid_origin !== 'edge') {
    return {
      x_ft: round1((col + 0.5) * grid.spacing_length_ft),
      y_ft: round1((row + 0.5) * grid.spacing_width_ft),
    };
  }

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

// --- Walking the grid ------------------------------------------------------
//
// What to say to someone standing in a dark car park holding a light meter.
//
// Never "left" or "right": the app has no idea which way the assessor is
// facing — the iPads are Wi-Fi-only with no compass fix worth trusting — so a
// turn instruction would be a coin flip. Everything here is phrased relative to
// the walk itself, which the assessor can see on the map in front of them.

export interface WalkStep {
  /** Straight-line distance to the next point, in feet. */
  distance_ft: number;
  instruction: string;
}

/**
 * The move from one point to the next, in words.
 *
 * `from` is null at the start of a walk, where there is no previous point and
 * the useful thing to say is where the first reading actually stands — half a
 * cell in from the corner on a centred grid, which surprises people who expect
 * to start on the corner itself.
 */
export function walkStep(from: number | null, to: number, grid: Grid): WalkStep {
  const target = pointPosition(to, grid);

  if (from === null) {
    return {
      distance_ft: 0,
      instruction:
        `Point ${to} stands ${Math.round(target.x_ft)} ft along the long side ` +
        `and ${Math.round(target.y_ft)} ft across from the start corner.`,
    };
  }

  const start = pointPosition(from, grid);
  const distance = Math.round(Math.hypot(target.x_ft - start.x_ft, target.y_ft - start.y_ft));

  const a = pointToCell(from, grid.cols);
  const b = pointToCell(to, grid.cols);

  if (a.row === b.row) {
    return { distance_ft: distance, instruction: `${distance} ft along the row.` };
  }
  if (Math.abs(a.row - b.row) === 1 && a.col === b.col) {
    return b.row > a.row
      ? {
          distance_ft: distance,
          instruction: `End of the row — ${distance} ft across, then back the other way.`,
        }
      : {
          distance_ft: distance,
          instruction: `${distance} ft back across to the previous row.`,
        };
  }
  // A jump, which only happens when a point is tapped directly on the map or a
  // long run of obstructed points is skipped over.
  return { distance_ft: distance, instruction: `About ${distance} ft away.` };
}

/**
 * The next walkable point after `current`, honouring the skip list.
 *
 * Returns null at either end of the walk. Obstructed points are stepped over
 * rather than stopped on: they are never read, so pausing on one would just be
 * a tap that does nothing.
 */
export function stepPoint(current: number, direction: 1 | -1, plan: PointPlan): number | null {
  const at = plan.walkOrder.indexOf(current);
  if (at !== -1) return plan.walkOrder[at + direction] ?? null;

  // Standing on a point that has since been marked obstructed. Fall to the
  // nearest walkable point in the direction of travel. walkOrder is ascending,
  // so backwards means the last one below rather than the first.
  if (direction === 1) return plan.walkOrder.find((p) => p > current) ?? null;
  let below: number | null = null;
  for (const p of plan.walkOrder) {
    if (p >= current) break;
    below = p;
  }
  return below;
}
