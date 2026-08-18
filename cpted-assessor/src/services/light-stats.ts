/**
 * Statistics for parking-lot light surveys.
 *
 * The four figures the NICP booklet asks for: lowest reading, average,
 * uniformity ratio, and the comparison against the parking-lot target. Targets
 * are stated here once, with their source, so the report can cite where the
 * numbers came from rather than asserting an unattributed standard.
 */

import { fcToLux } from './light-meter';

/** NICP instructional guidance for parking lots. */
export const PARKING_TARGET_AVG_FC = 3.0;
export const PARKING_MAX_AVG_MIN_RATIO = 4;

export const STANDARD_CITATION =
  'National Institute of Crime Prevention instructional guidance — parking lots: approximately 3 footcandles (30 lux) average illuminance with a uniformity ratio no worse than 4:1.';

export interface LightStats {
  count: number;
  min_fc: number;
  max_fc: number;
  avg_fc: number;
  /**
   * Average-to-minimum, the conventional parking uniformity figure and the one
   * the 4:1 target applies to. Null when a zero reading makes it undefined.
   */
  avg_min_ratio: number | null;
  /** Max-to-min, which exposes bright-to-dark transitions across the lot. */
  max_min_ratio: number | null;
  /**
   * A point read 0.0 fc — total darkness. Uniformity is mathematically
   * undefined, and practically it's the worst possible result.
   */
  has_zero_reading: boolean;
  meets_average: boolean;
  meets_uniformity: boolean;
}

export function computeStats(valuesFc: number[]): LightStats | null {
  if (valuesFc.length === 0) return null;

  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const v of valuesFc) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  const avg = sum / valuesFc.length;
  const hasZero = min <= 0;

  const avgMin = hasZero ? null : avg / min;
  const maxMin = hasZero ? null : max / min;

  return {
    count: valuesFc.length,
    min_fc: min,
    max_fc: max,
    avg_fc: avg,
    avg_min_ratio: avgMin,
    max_min_ratio: maxMin,
    has_zero_reading: hasZero,
    meets_average: avg >= PARKING_TARGET_AVG_FC,
    // A zero reading fails uniformity outright rather than passing on a null.
    meets_uniformity: avgMin !== null && avgMin <= PARKING_MAX_AVG_MIN_RATIO,
  };
}

// --- Heat-map bands --------------------------------------------------------
//
// Absolute, keyed to the 3 fc parking target rather than to a lot's own range,
// so a uniformly dreadful lot reads as dreadful instead of being rescaled into
// looking fine. Shared by the on-screen map and the PDF so both agree.

export interface IlluminanceBand {
  /** Upper bound, exclusive. */
  max: number;
  /** Fill color. */
  bg: string;
  /** Legible text color on that fill. */
  fg: string;
  label: string;
}

export const ILLUMINANCE_BANDS: IlluminanceBand[] = [
  { max: 0.001, bg: '#0a0a0a', fg: '#f5f5f5', label: '0.0 (dark)' },
  { max: 1, bg: '#b91c1c', fg: '#ffffff', label: '< 1.0' },
  { max: 2, bg: '#ea580c', fg: '#ffffff', label: '1.0 – 1.9' },
  { max: PARKING_TARGET_AVG_FC, bg: '#ca8a04', fg: '#ffffff', label: '2.0 – 2.9' },
  { max: 6, bg: '#16a34a', fg: '#ffffff', label: '3.0 – 5.9' },
  { max: Infinity, bg: '#059669', fg: '#ffffff', label: '6.0 +' },
];

export function bandFor(fc: number): IlluminanceBand {
  return ILLUMINANCE_BANDS.find((b) => fc < b.max) ?? ILLUMINANCE_BANDS[ILLUMINANCE_BANDS.length - 1];
}

export interface PointValue {
  point_index: number;
  value_fc: number;
}

/** The n dimmest points, worst first — the dark spots to photograph and report. */
export function darkestPoints(readings: PointValue[], n = 5): PointValue[] {
  return [...readings].sort((a, b) => a.value_fc - b.value_fc).slice(0, n);
}

// --- Display helpers -------------------------------------------------------

export function formatFc(fc: number): string {
  return `${fc.toFixed(1)} fc`;
}

export function formatLux(fc: number): string {
  return `${Math.round(fcToLux(fc))} lux`;
}

/** "4.2:1", or an explicit undefined marker when a point read zero. */
export function formatRatio(ratio: number | null): string {
  if (ratio === null) return 'undefined (0.0 fc reading)';
  return `${ratio.toFixed(1)}:1`;
}

/**
 * Plain-language reading of a uniformity ratio.
 *
 * The ratio is average ÷ lowest, so a bigger number is worse — which is easy to
 * get backwards when all you see is "26.9:1" next to "4:1". Stating it as a
 * fraction of the average removes the ambiguity: the darkest spot is 1/27 of
 * typical, and eyes adapted to the average are effectively blind there.
 */
function sentenceCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function describeUniformity(ratio: number | null): string {
  if (ratio === null) return 'a point measured 0.0 fc, so the ratio is undefined';
  if (ratio < 1.15) return 'the darkest point is close to the lot average';
  return `the darkest point is 1/${Math.round(ratio)} of the lot average`;
}

export type Verdict = 'pass' | 'fail';

export interface VerdictLine {
  label: string;
  value: string;
  target: string;
  /** Plain-language gloss, so the number isn't read in the wrong direction. */
  detail: string;
  verdict: Verdict;
}

/** The booklet's scorecard: average and uniformity, each against its target. */
export function verdictLines(stats: LightStats): VerdictLine[] {
  return [
    {
      label: 'Average illuminance',
      value: `${formatFc(stats.avg_fc)} (${formatLux(stats.avg_fc)})`,
      target: `at least ${PARKING_TARGET_AVG_FC.toFixed(1)} fc — higher is better`,
      detail: stats.meets_average
        ? 'The lot averages at or above the target level.'
        : `The lot averages ${formatFc(PARKING_TARGET_AVG_FC - stats.avg_fc)} below the target level.`,
      verdict: stats.meets_average ? 'pass' : 'fail',
    },
    {
      label: 'Uniformity (avg:min)',
      value: formatRatio(stats.avg_min_ratio),
      target: `no worse than ${PARKING_MAX_AVG_MIN_RATIO}:1 — lower is better`,
      detail: `${sentenceCase(describeUniformity(stats.avg_min_ratio))}; the target allows no worse than 1/${PARKING_MAX_AVG_MIN_RATIO}.`,
      verdict: stats.meets_uniformity ? 'pass' : 'fail',
    },
  ];
}
