/**
 * Georeferencing for light-survey grids, and KML export.
 *
 * The grid is placed from three corners: the start corner (grid point 1), the
 * far end of the long side, and the corner across the short side. The first two
 * give an origin, a bearing, and a length; the third gives the width and
 * resolves which side of that line the lot occupies, so nothing has to be
 * measured by hand and there is no flip toggle to get wrong. Two corners still
 * work when the width is already known and typed in.
 *
 * Capture the corners either at the desk (right-click in Google Maps →
 * copy coordinates, which is ~1 m) or in the field from device GPS (~5-10 m on
 * an iPad, so the desk route is meaningfully more accurate).
 *
 * Distances here are small — a few hundred feet — so a local flat-earth
 * approximation around the origin latitude is used rather than full geodesics.
 * The error over 500 ft is far below the accuracy of the source coordinates.
 */

import type { LightSurvey } from '../types';
import { pointPosition, buildPointPlan, pointToCell } from './light-grid';
import {
  bandFor,
  formatFc,
  darkestPoints,
  ILLUMINANCE_BANDS,
  PARKING_TARGET_AVG_FC,
  PARKING_MAX_AVG_MIN_RATIO,
} from './light-stats';

const FT_PER_M = 3.280839895013123;
export const M_PER_FT = 1 / FT_PER_M;

export interface LatLng {
  lat: number;
  lng: number;
}

/** Metres per degree of latitude and longitude at a given latitude. */
export function metersPerDegree(latDeg: number): { lat: number; lng: number } {
  const p = (latDeg * Math.PI) / 180;
  return {
    lat: 111132.92 - 559.82 * Math.cos(2 * p) + 1.175 * Math.cos(4 * p) - 0.0023 * Math.cos(6 * p),
    lng: 111412.84 * Math.cos(p) - 93.5 * Math.cos(3 * p) + 0.118 * Math.cos(5 * p),
  };
}

/** Offset a coordinate by a local east/north displacement in metres. */
export function offsetLatLng(origin: LatLng, eastM: number, northM: number): LatLng {
  const m = metersPerDegree(origin.lat);
  return {
    lat: origin.lat + northM / m.lat,
    lng: origin.lng + eastM / m.lng,
  };
}

/** Local east/north displacement in metres from `a` to `b`. */
export function displacementM(a: LatLng, b: LatLng): { east: number; north: number } {
  const m = metersPerDegree((a.lat + b.lat) / 2);
  return {
    east: (b.lng - a.lng) * m.lng,
    north: (b.lat - a.lat) * m.lat,
  };
}

export function distanceFt(a: LatLng, b: LatLng): number {
  const d = displacementM(a, b);
  return Math.hypot(d.east, d.north) * FT_PER_M;
}

/** Compass bearing in degrees (0 = north, 90 = east) from `a` to `b`. */
export function bearingDeg(a: LatLng, b: LatLng): number {
  const d = displacementM(a, b);
  const deg = (Math.atan2(d.east, d.north) * 180) / Math.PI;
  return (deg + 360) % 360;
}

export function compassPoint(bearing: number): string {
  const names = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return names[Math.round(bearing / 22.5) % 16];
}

/**
 * One half of a coordinate pair, in any of the shapes a phone or a map site
 * puts on the clipboard: bare decimal, decimal with a degree sign and a
 * hemisphere letter, or degrees/minutes/seconds.
 */
function parseComponent(text: string): { value: number; hemi: 'N' | 'S' | 'E' | 'W' | null } | null {
  const t = text.trim();
  if (!t) return null;

  const hemiMatch = t.match(/([NSEW])\s*$/i) ?? t.match(/^\s*([NSEW])/i);
  const hemi = hemiMatch ? (hemiMatch[1].toUpperCase() as 'N' | 'S' | 'E' | 'W') : null;
  const body = t.replace(/[NSEW]/gi, '').trim();

  // Degrees / minutes / seconds, e.g. 29°12'40.4" — minutes and seconds optional.
  const dms = body.match(
    /^([+-]?\d+(?:\.\d+)?)\s*°?\s*(?:(\d+(?:\.\d+)?)\s*['′]?\s*(?:(\d+(?:\.\d+)?)\s*(?:["″]|'')?\s*)?)?$/,
  );
  if (!dms) return null;

  const deg = Number(dms[1]);
  const min = dms[2] === undefined ? 0 : Number(dms[2]);
  const sec = dms[3] === undefined ? 0 : Number(dms[3]);
  if (!Number.isFinite(deg) || !Number.isFinite(min) || !Number.isFinite(sec)) return null;
  if (min >= 60 || sec >= 60) return null;

  const magnitude = Math.abs(deg) + min / 60 + sec / 3600;
  return { value: deg < 0 ? -magnitude : magnitude, hemi };
}

/**
 * Parse a pasted coordinate pair.
 *
 * Google Maps right-click → "copy coordinates" gives plain decimals
 * ("29.211234, -81.023456"), but the place card and the iOS share sheet hand
 * over DMS with hemisphere letters instead (29°12'40.4"N 81°01'24.4"W), and a
 * field assessor pastes whichever one they happened to land on. Both read the
 * same on screen, so rejecting one as unparseable looks like a broken app.
 */
export function parseLatLng(input: string): LatLng | null {
  // iOS keyboards and map sites emit non-breaking spaces and a real minus sign.
  const cleaned = input.replace(/[\u00a0\u2007\u202f]/g, ' ').replace(/[\u2212\u2012-\u2015]/g, '-').trim();
  if (!cleaned) return null;

  // Split on a comma when there is one; otherwise on the gap between the two
  // halves — which for DMS is the space after the hemisphere letter.
  let halves: string[];
  if (cleaned.includes(',')) {
    halves = cleaned.split(',');
    // "29.0215, -81.0234" splits in two; DMS with a comma inside is not a thing.
    if (halves.length !== 2) return null;
  } else {
    const split = cleaned.match(/^(.*?[NS])\s+(.*)$/i) ?? cleaned.match(/^(\S+)\s+(\S+)$/);
    if (!split) return null;
    halves = [split[1], split[2]];
  }

  const a = parseComponent(halves[0]);
  const b = parseComponent(halves[1]);
  if (!a || !b) return null;

  // Hemisphere letters win over position when both are present, so a pair
  // pasted longitude-first still lands right.
  let latPart = a;
  let lngPart = b;
  if ((a.hemi === 'E' || a.hemi === 'W') && (b.hemi === 'N' || b.hemi === 'S')) {
    latPart = b;
    lngPart = a;
  }

  let lat = latPart.value;
  let lng = lngPart.value;
  if (latPart.hemi === 'S') lat = -Math.abs(lat);
  else if (latPart.hemi === 'N') lat = Math.abs(lat);
  if (lngPart.hemi === 'W') lng = -Math.abs(lng);
  else if (lngPart.hemi === 'E') lng = Math.abs(lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  return { lat, lng };
}

export function formatLatLng(p: LatLng): string {
  return `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`;
}

// Surveys created before georeferencing existed simply lack these fields, so
// the guards test for a number rather than for null.
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function surveyOrigin(survey: LightSurvey): LatLng | null {
  if (!isNum(survey.origin_lat) || !isNum(survey.origin_lng)) return null;
  return { lat: survey.origin_lat, lng: survey.origin_lng };
}

export function surveyAxisPoint(survey: LightSurvey): LatLng | null {
  if (!isNum(survey.axis_lat) || !isNum(survey.axis_lng)) return null;
  return { lat: survey.axis_lat, lng: survey.axis_lng };
}

export function surveyWidthPoint(survey: LightSurvey): LatLng | null {
  if (!isNum(survey.width_lat) || !isNum(survey.width_lng)) return null;
  return { lat: survey.width_lat, lng: survey.width_lng };
}

export function hasGeoreference(survey: LightSurvey): boolean {
  return surveyOrigin(survey) !== null && surveyAxisPoint(survey) !== null;
}

export interface DerivedRectangle {
  /** Distance from the start corner to the far end of the long side. */
  length_ft: number;
  /** Perpendicular distance to the third corner, or null without one. */
  width_ft: number | null;
  bearing: number;
  /** True when the lot lies to the left of the origin→axis line. */
  flipped: boolean;
  /**
   * How far the third corner sits *along* the length axis. A true corner gives
   * roughly zero; a large value means the clicked point wasn't square to the
   * first two, so the derived width is a projection rather than an edge.
   */
  skew_ft: number | null;
}

/**
 * Turn corner coordinates into lot dimensions.
 *
 * This is the intended way to size a lot: the corners you pick off satellite
 * imagery are the measurement, so nothing has to be typed and then reconciled.
 * The third corner is projected onto the perpendicular, which keeps the width
 * sensible even when the click wasn't perfectly square to the long side.
 */
export function deriveRectangle(p1: LatLng, p2: LatLng, p3?: LatLng | null): DerivedRectangle | null {
  const d = displacementM(p1, p2);
  const len = Math.hypot(d.east, d.north);
  if (len === 0) return null;

  const along = { east: d.east / len, north: d.north / len };
  const perpRight = { east: along.north, north: -along.east };

  const base: DerivedRectangle = {
    length_ft: len * FT_PER_M,
    width_ft: null,
    bearing: bearingDeg(p1, p2),
    flipped: false,
    skew_ft: null,
  };
  if (!p3) return base;

  const v = displacementM(p1, p3);
  const cross = v.east * perpRight.east + v.north * perpRight.north;
  const alongComp = v.east * along.east + v.north * along.north;

  return {
    ...base,
    width_ft: Math.abs(cross) * FT_PER_M,
    flipped: cross < 0,
    skew_ft: alongComp * FT_PER_M,
  };
}

/**
 * Unit vectors for the grid's own axes, in local east/north metres.
 * `along` runs from the start corner down the length; `across` is perpendicular,
 * on whichever side the lot sits (grid_flipped picks the other one).
 */
function gridBasis(survey: LightSurvey): { along: { east: number; north: number }; across: { east: number; north: number } } | null {
  const origin = surveyOrigin(survey);
  const axis = surveyAxisPoint(survey);
  if (!origin || !axis) return null;

  const d = displacementM(origin, axis);
  const len = Math.hypot(d.east, d.north);
  if (len === 0) return null;

  const along = { east: d.east / len, north: d.north / len };
  // Rotate 90°. Un-flipped puts the lot to the RIGHT of the origin→axis line —
  // walk the long side from point 1 and the lot is on your right hand. Flipping
  // takes the other perpendicular.
  const across = survey.grid_flipped
    ? { east: -along.north, north: along.east }
    : { east: along.north, north: -along.east };
  return { along, across };
}

/** Real-world coordinate of a grid point, or null when not georeferenced. */
export function gridPointLatLng(survey: LightSurvey, pointIndex: number): LatLng | null {
  const origin = surveyOrigin(survey);
  const basis = gridBasis(survey);
  if (!origin || !basis) return null;

  const pos = pointPosition(pointIndex, survey);
  const xM = pos.x_ft * M_PER_FT;
  const yM = pos.y_ft * M_PER_FT;

  return offsetLatLng(
    origin,
    basis.along.east * xM + basis.across.east * yM,
    basis.along.north * xM + basis.across.north * yM,
  );
}

/** The lot's four corners, for drawing its outline. */
export function lotCorners(survey: LightSurvey): LatLng[] | null {
  const origin = surveyOrigin(survey);
  const basis = gridBasis(survey);
  if (!origin || !basis) return null;

  const L = survey.length_ft * M_PER_FT;
  const W = survey.width_ft * M_PER_FT;
  const at = (x: number, y: number) =>
    offsetLatLng(
      origin,
      basis.along.east * x + basis.across.east * y,
      basis.along.north * x + basis.across.north * y,
    );
  return [at(0, 0), at(L, 0), at(L, W), at(0, W), at(0, 0)];
}

// --- KML ---------------------------------------------------------------------

/** #aabbggrr — KML's byte order is the reverse of CSS hex. */
function kmlColor(cssHex: string, alpha = 'ff'): string {
  const h = cssHex.replace('#', '');
  return `${alpha}${h.slice(4, 6)}${h.slice(2, 4)}${h.slice(0, 2)}`.toLowerCase();
}

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface KmlReading {
  point_index: number;
  value_fc: number;
}

/**
 * Cell edges along one axis, in feet: the midpoints between reading positions,
 * so every cell is the ground each reading actually speaks for. The first and
 * last cells stop at the lot edge rather than running half a spacing past it,
 * and a short final row/column produces a correspondingly narrow cell.
 */
function cellEdges(positions: number[], runFt: number): Array<[number, number]> {
  return positions.map((pos, i) => {
    const lo = i === 0 ? 0 : (positions[i - 1] + pos) / 2;
    const hi = i === positions.length - 1 ? runFt : (pos + positions[i + 1]) / 2;
    return [lo, hi] as [number, number];
  });
}

/** Reading positions along one axis, matching how pointPosition lays them out. */
function axisPositions(count: number, spacingFt: number, runFt: number): number[] {
  return Array.from({ length: count }, (_, i) => Math.min(i * spacingFt, runFt));
}

/**
 * A KML document placing the grid on satellite imagery. Google Earth renders it
 * to scale on its own imagery, which sidesteps needing an API key, a network
 * round-trip at report time, or any image licensing question — and it can be
 * panned and zoomed, which a static picture can't.
 *
 * The readings are drawn as filled cells rather than pins. A pin says a reading
 * happened somewhere; what the assessor needs to see is the shape and extent of
 * the dark region, which only reads when the ground itself is coloured. Point
 * markers are kept as a separate folder that can be switched off, and their
 * labels stay hidden — ninety labels at once is a wall of text — except on the
 * darkest points, which are the ones worth walking back to.
 */
export interface KmlOptions {
  /**
   * Label every point rather than only the darkest few. What the labels cost in
   * clutter they buy back when the map is being used to *find* points — reading
   * "43" off the imagery is the only way to mark point 43 obstructed. Defaults
   * on when there are no readings, since that is a planning export by
   * definition.
   */
  labelEveryPoint?: boolean;
}

export function buildGridKml(
  survey: LightSurvey,
  readings: KmlReading[],
  propertyLabel: string,
  options: KmlOptions = {},
): string {
  const origin = surveyOrigin(survey);
  const basis = gridBasis(survey);
  if (!origin || !basis || !hasGeoreference(survey)) {
    throw new Error('This survey has no map location set.');
  }

  const valueByPoint = new Map(readings.map((r) => [r.point_index, r.value_fc]));
  const plan = buildPointPlan(survey.cols, survey.rows, survey.skipped_points);
  const skipped = new Set(survey.skipped_points);

  const at = (xFt: number, yFt: number): LatLng => {
    const x = xFt * M_PER_FT;
    const y = yFt * M_PER_FT;
    return offsetLatLng(
      origin,
      basis.along.east * x + basis.across.east * y,
      basis.along.north * x + basis.across.north * y,
    );
  };

  const xEdges = cellEdges(
    axisPositions(survey.cols, survey.spacing_length_ft, survey.length_ft),
    survey.length_ft,
  );
  const yEdges = cellEdges(
    axisPositions(survey.rows, survey.spacing_width_ft, survey.width_ft),
    survey.width_ft,
  );

  // With readings, label only the worst handful, so the numbers that do show are
  // the ones worth walking back to. Without them this is a planning map, and
  // every number matters — it is the only way to say "point 43 is on an island".
  const labelEveryPoint = options.labelEveryPoint ?? readings.length === 0;
  const labelled = labelEveryPoint
    ? null
    : new Set(
        darkestPoints(
          readings.filter((r) => !skipped.has(r.point_index)),
          DARK_LABEL_COUNT,
        ).map((r) => r.point_index),
      );

  const styles: string[] = [];
  const emitted = new Set<string>();

  const cellStyleFor = (fc: number | undefined, isSkipped: boolean): string => {
    const id = isSkipped ? 'cellSkip' : fc === undefined ? 'cellNone' : `cell${ILLUMINANCE_STYLE_IDS.indexOf(bandFor(fc).bg)}`;
    if (!emitted.has(id)) {
      emitted.add(id);
      const fill =
        isSkipped ? kmlColor('#6b7280', SKIP_ALPHA)
        : fc === undefined ? kmlColor('#9ca3af', UNREAD_ALPHA)
        : kmlColor(bandFor(fc).bg, FILL_ALPHA);
      styles.push(
        `  <Style id="${id}"><PolyStyle><color>${fill}</color><fill>1</fill><outline>1</outline></PolyStyle>` +
          `<LineStyle><color>${kmlColor('#ffffff', '40')}</color><width>1</width></LineStyle></Style>`,
      );
    }
    return id;
  };

  const pointStyleFor = (fc: number | undefined, isSkipped: boolean, showLabel: boolean): string => {
    const base = isSkipped ? 'dotSkip' : fc === undefined ? 'dotNone' : `dot${ILLUMINANCE_STYLE_IDS.indexOf(bandFor(fc).bg)}`;
    const id = showLabel ? `${base}L` : base;
    if (!emitted.has(id)) {
      emitted.add(id);
      const color = isSkipped ? '#6b7280' : fc === undefined ? '#e5e7eb' : bandFor(fc).bg;
      const icon = isSkipped ? 'placemark_square' : 'shaded_dot';
      styles.push(
        `  <Style id="${id}"><IconStyle><color>${kmlColor(color)}</color><scale>${showLabel ? (labelEveryPoint ? 0.8 : 1.1) : 0.6}</scale>` +
          `<Icon><href>http://maps.google.com/mapfiles/kml/shapes/${icon}.png</href></Icon></IconStyle>` +
          `<LabelStyle><scale>${showLabel ? (labelEveryPoint ? 0.7 : 0.9) : 0}</scale></LabelStyle></Style>`,
      );
    }
    return id;
  };

  const cells: string[] = [];
  const dots: string[] = [];

  for (let p = 1; p <= plan.totalPoints; p++) {
    const { col, row } = pointToCell(p, survey.cols);
    const [x0, x1] = xEdges[col];
    const [y0, y1] = yEdges[row];
    const isSkipped = skipped.has(p);
    const fc = valueByPoint.get(p);

    // "no reading" earns its place on a readings map, where it marks a point
    // that was missed. On a planning map nothing has been read yet, so it is 90
    // repetitions of something the reader already knows — the number alone.
    const label = isSkipped
      ? `${p} — obstructed`
      : fc !== undefined
        ? `${p} — ${formatFc(fc)}`
        : labelEveryPoint
          ? `${p}`
          : `${p} — no reading`;

    const ring = [at(x0, y0), at(x1, y0), at(x1, y1), at(x0, y1), at(x0, y0)]
      .map((c) => `${c.lng.toFixed(7)},${c.lat.toFixed(7)},0`)
      .join(' ');

    cells.push(
      `    <Placemark>\n` +
        `      <name>${xmlEscape(label)}</name>\n` +
        `      <styleUrl>#${cellStyleFor(fc, isSkipped)}</styleUrl>\n` +
        `      <Polygon><tessellate>1</tessellate><outerBoundaryIs><LinearRing>` +
        `<coordinates>${ring}</coordinates>` +
        `</LinearRing></outerBoundaryIs></Polygon>\n` +
        `    </Placemark>`,
    );

    const coord = gridPointLatLng(survey, p);
    if (coord) {
      const showLabel = labelled === null || labelled.has(p);
      dots.push(
        `    <Placemark>\n` +
          `      <name>${xmlEscape(showLabel ? label : String(p))}</name>\n` +
          `      <styleUrl>#${pointStyleFor(fc, isSkipped, showLabel)}</styleUrl>\n` +
          `      <Point><coordinates>${coord.lng.toFixed(7)},${coord.lat.toFixed(7)},0</coordinates></Point>\n` +
          `    </Placemark>`,
      );
    }
  }

  const corners = lotCorners(survey);
  const outline = corners
    ? `    <Placemark>\n` +
      `      <name>${xmlEscape(survey.area_name)} boundary</name>\n` +
      `      <styleUrl>#lotOutline</styleUrl>\n` +
      `      <LineString><tessellate>1</tessellate><coordinates>` +
      corners.map((c) => `${c.lng.toFixed(7)},${c.lat.toFixed(7)},0`).join(' ') +
      `</coordinates></LineString>\n` +
      `    </Placemark>`
    : '';

  const folder = (name: string, open: boolean, body: string) =>
    body
      ? `  <Folder>\n    <name>${xmlEscape(name)}</name>\n    <open>${open ? 1 : 0}</open>\n${body}\n  </Folder>`
      : '';

  const docName = `${survey.area_name} — lighting grid (${propertyLabel})`;

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<kml xmlns="http://www.opengis.net/kml/2.2">\n` +
    `<Document>\n` +
    `  <name>${xmlEscape(docName)}</name>\n` +
    `  <description><![CDATA[${legendHtml(survey, labelEveryPoint)}]]></description>\n` +
    `  <Style id="lotOutline"><LineStyle><color>ff0fa5f5</color><width>3</width></LineStyle>` +
    `<PolyStyle><fill>0</fill></PolyStyle></Style>\n` +
    styles.join('\n') +
    (styles.length ? '\n' : '') +
    folder('Light levels', true, cells.join('\n')) +
    '\n' +
    folder('Reading points', labelEveryPoint, dots.join('\n')) +
    '\n' +
    folder('Lot boundary', true, outline) +
    `\n</Document>\n</kml>\n`
  );
}

/** Fill opacity: dark enough to read as a band, sheer enough to see the asphalt. */
const FILL_ALPHA = '8c';
const SKIP_ALPHA = '70';
const UNREAD_ALPHA = '30';
const DARK_LABEL_COUNT = 5;

/**
 * The legend, as the document description. KML can only put a graphic on screen
 * by referencing an image file, which would mean shipping a KMZ archive; the
 * description panel needs no such thing and Google Earth renders its HTML.
 */
function legendHtml(survey: LightSurvey, labelEvery: boolean): string {
  // Band labels carry a literal "<" ("< 1.0"), and the description is rendered
  // as HTML — unescaped it opens a tag and eats the rest of the row.
  const htmlEscape = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const swatch = (band: (typeof ILLUMINANCE_BANDS)[number]) =>
    `<tr><td style="background:${band.bg};width:34px">&nbsp;</td>` +
    `<td style="padding-left:8px">${htmlEscape(band.label)} fc</td></tr>`;

  return (
    `<p><b>${survey.cols} &times; ${survey.rows} grid at ${survey.spacing_length_ft} ft spacing` +
    ` over ${survey.length_ft} &times; ${survey.width_ft} ft.</b><br/>` +
    `Each square is the ground one reading covers. Point 1 is the start corner.</p>` +
    `<table cellspacing="0" cellpadding="2">${ILLUMINANCE_BANDS.map(swatch).join('')}` +
    `<tr><td style="background:#6b7280">&nbsp;</td><td style="padding-left:8px">obstructed</td></tr>` +
    `<tr><td style="background:#9ca3af">&nbsp;</td><td style="padding-left:8px">not read</td></tr></table>` +
    `<p>Target: ${PARKING_TARGET_AVG_FC.toFixed(1)} fc average, uniformity no worse than ` +
    `${PARKING_MAX_AVG_MIN_RATIO}:1.<br/>` +
    `${
      labelEvery
        ? 'Every point is numbered — use the numbers to mark obstructed points back in the app.'
        : 'Switch on <i>Reading points</i> to see individual point numbers.'
    }</p>`
  );
}

// Band fill colors, indexed so each gets a stable KML style id.
const ILLUMINANCE_STYLE_IDS = [
  '#0a0a0a',
  '#b91c1c',
  '#ea580c',
  '#ca8a04',
  '#16a34a',
  '#059669',
];

const KML_MIME = 'application/vnd.google-earth.kml+xml';

/**
 * iPad included — iPadOS reports itself as a Mac, so touch points settle it.
 *
 * Exported because the difference is user-facing, not just a delivery detail:
 * Google Earth Web does not run in iOS Safari, so on an iPad the file has to go
 * to the Google Earth *app* through the share sheet. Pointing an iPad at
 * earth.google.com sends the assessor somewhere that cannot work.
 */
export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

/** How the file actually reached the user, so the page can say the right thing. */
export type KmlDelivery = 'share' | 'download' | 'newtab';

/**
 * Hand the KML to the user.
 *
 * A plain `<a download>` on a blob URL is the obvious route and it is the one
 * that fails on the target device: iOS Safari honours it inconsistently, and in
 * a standalone PWA — which is how the assessors run this app — the tap does
 * nothing at all, with no error to show. So on iOS the file goes to the share
 * sheet instead, where "Save to Files" puts it somewhere Google Earth can open
 * it. The anchor stays as the desktop path and the fallback.
 */
export async function downloadKml(filename: string, kml: string): Promise<KmlDelivery> {
  if (isIOS() && typeof File === 'function' && typeof navigator.canShare === 'function') {
    const file = new File([kml], filename, { type: KML_MIME });
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: filename });
        return 'share';
      } catch (err) {
        // Dismissing the sheet is a choice, not a failure — don't then dump the
        // file through a second route the user didn't ask for.
        if (err instanceof Error && err.name === 'AbortError') return 'share';
      }
    }
  }

  // Saved as a plain byte stream rather than the KML media type. The extension
  // still says .kml, which is all Google Earth's importer reads — but declaring
  // the real type invites the browser and the desktop to negotiate a handler
  // for it, and on a machine with no Google Earth installed that negotiation is
  // an "open with what?" dialog the user has to dismiss. Nothing opens this
  // file locally; it gets uploaded.
  const blob = new Blob([kml], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  // Long enough that a slow save still has the blob; the page is not
  // long-lived enough for this to matter as a leak.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);

  const a = document.createElement('a');
  if ('download' in a) {
    a.href = url;
    a.download = filename;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return 'download';
  }

  window.open(url, '_blank');
  return 'newtab';
}
