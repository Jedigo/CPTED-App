/**
 * Volusia County aerial imagery and address lookup.
 *
 * The county publishes 3-inch orthoimagery (2024, flown by EagleView) and an
 * address geocoder on a public ArcGIS server — no key, no account, no billing,
 * and CORS is open, so the browser fetches both directly.
 *
 * Why this and not Google or Esri: the picture ends up embedded in a report
 * that goes to schools and property owners, which is redistribution. County
 * imagery is public record and this is a county agency, so there is nothing to
 * license. It is also sharper than anything the commercial basemaps show here —
 * at 3 inches per pixel the painted stall stripes are legible, which is what
 * makes tapping a lot corner accurate enough to survey from.
 *
 * Everything is done in Web Mercator (EPSG:3857) rather than degrees, so that a
 * pixel is square and pixel-to-ground conversion stays linear. Mercator inflates
 * distance by 1/cos(latitude) — about 14% at Volusia's latitude — which is
 * harmless as long as it is applied consistently and undone on the way out.
 *
 * One deliberate imprecision: EPSG:3857 models the earth as a sphere, while the
 * grid maths in light-geo works on the WGS84 ellipsoid. At this latitude the two
 * disagree by about 0.5%, so a view requested as 600 ft wide is really 600 ± 3 ft
 * and a scale bar is off by the same fraction. Corner accuracy is unaffected: a
 * tap is converted by the exact inverse of the projection the server rendered
 * with, so the coordinates it produces are true WGS84, and the lot's dimensions
 * are then derived ellipsoidally exactly as a pasted coordinate would be.
 */

import type { LatLng } from './light-geo';

const SERVER = 'https://maps5.vcgov.org/arcgis/rest/services';
const IMAGERY = `${SERVER}/Aerials/2024_Aerial/ImageServer/exportImage`;
const GEOCODER = `${SERVER}/Geocoders/Composite_AddStrParcels2/GeocodeServer/findAddressCandidates`;

/** Shown wherever the imagery is displayed or printed. */
export const IMAGERY_CREDIT = 'Aerial imagery: Volusia County Property Appraiser, 2024 (3-inch)';

const EARTH_HALF_CIRCUMFERENCE_M = 20037508.342789244;
const M_PER_FT = 0.3048;

export interface MercatorPoint {
  x: number;
  y: number;
}

export function toMercator(p: LatLng): MercatorPoint {
  const x = (p.lng * EARTH_HALF_CIRCUMFERENCE_M) / 180;
  const y =
    (Math.log(Math.tan(((90 + p.lat) * Math.PI) / 360)) / (Math.PI / 180)) *
    (EARTH_HALF_CIRCUMFERENCE_M / 180);
  return { x, y };
}

export function fromMercator(p: MercatorPoint): LatLng {
  const lng = (p.x * 180) / EARTH_HALF_CIRCUMFERENCE_M;
  const lat =
    (Math.atan(Math.exp((p.y * Math.PI) / EARTH_HALF_CIRCUMFERENCE_M)) * 360) / Math.PI - 90;
  return { lat, lng };
}

/**
 * A fetched aerial: the image itself plus the ground extent it covers, which is
 * what makes a tap on it meaningful. Kept together deliberately — an image
 * without its bounding box is just a picture, and pairing the wrong box with an
 * image would put every corner in the wrong place with no visible symptom.
 */
export interface AerialView {
  /** EPSG:3857 bounds. */
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  widthPx: number;
  heightPx: number;
  /** base64 JPEG data URL. */
  image: string;
  /** Ground width in feet, for the scale bar. */
  spanFt: number;
  center: LatLng;
}

export type AerialBounds = Omit<AerialView, 'image' | 'spanFt' | 'center'>;

/** Bounds covering `spanFt` of real ground across, centred on a point. */
export function viewBounds(
  center: LatLng,
  spanFt: number,
  widthPx: number,
  heightPx: number,
): AerialBounds {
  const c = toMercator(center);
  // Undo the Mercator stretch so spanFt is true ground distance, not map units.
  const halfWidthM = (spanFt * M_PER_FT) / Math.cos((center.lat * Math.PI) / 180) / 2;
  const halfHeightM = (halfWidthM * heightPx) / widthPx;
  return {
    minX: c.x - halfWidthM,
    maxX: c.x + halfWidthM,
    minY: c.y - halfHeightM,
    maxY: c.y + halfHeightM,
    widthPx,
    heightPx,
  };
}

/** Where a point on the ground falls in the image, in pixels from top-left. */
export function latLngToPixel(view: AerialBounds, p: LatLng): { x: number; y: number } {
  const m = toMercator(p);
  return {
    x: ((m.x - view.minX) / (view.maxX - view.minX)) * view.widthPx,
    // Image rows run downward; northings run upward.
    y: ((view.maxY - m.y) / (view.maxY - view.minY)) * view.heightPx,
  };
}

/** What a tap at a pixel corresponds to on the ground. */
export function pixelToLatLng(view: AerialBounds, px: number, py: number): LatLng {
  return fromMercator({
    x: view.minX + (px / view.widthPx) * (view.maxX - view.minX),
    y: view.maxY - (py / view.heightPx) * (view.maxY - view.minY),
  });
}

/**
 * The centre a view needs so that `focus` lands at relative position
 * (rx, ry) — 0..1 across and down — rather than in the middle.
 *
 * This is what stops a pinch from jumping: the point between the fingers is
 * usually not the centre of the screen, so re-centring the new view on it would
 * shift the ground sideways at the exact moment the sharp image appears.
 */
export function centreForFocus(
  focus: LatLng,
  rx: number,
  ry: number,
  spanFt: number,
  widthPx: number,
  heightPx: number,
): LatLng {
  const f = toMercator(focus);
  const spanX = (spanFt * M_PER_FT) / Math.cos((focus.lat * Math.PI) / 180);
  const spanY = (spanX * heightPx) / widthPx;
  return fromMercator({
    x: f.x + (0.5 - rx) * spanX,
    // Screen y grows downward, northings upward.
    y: f.y - (0.5 - ry) * spanY,
  });
}


/**
 * Ground feet per image pixel at the view's centre — the accuracy ceiling for
 * tapping a corner, and the basis for the scale bar.
 *
 * Mercator scale varies with latitude, so this is exact at the centre and drifts
 * by roughly 0.4% at the top and bottom of a 600 ft view — about 2 ft. That
 * affects only a distance read off the scale bar; a tapped corner is converted
 * through the exact inverse projection and carries no such error.
 */
export function feetPerPixel(view: AerialView): number {
  const m = (view.maxX - view.minX) / view.widthPx;
  return (m * Math.cos((view.center.lat * Math.PI) / 180)) / M_PER_FT;
}

export function aerialImageUrl(bounds: AerialBounds): string {
  const params = new URLSearchParams({
    bbox: `${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY}`,
    bboxSR: '3857',
    imageSR: '3857',
    size: `${bounds.widthPx},${bounds.heightPx}`,
    format: 'jpg',
    f: 'image',
  });
  return `${IMAGERY}?${params}`;
}

export class ImageryError extends Error {}

/**
 * Recently fetched views, so panning back or stepping through zoom levels is
 * instant instead of another round trip. The county server answers in under a
 * second, which is fine once and sluggish when it happens on every gesture.
 * Small and in-memory on purpose: the survey stores the one view it needs for
 * the report, and this is only here to make the picking feel immediate.
 */
const viewCache = new Map<string, AerialView>();
const VIEW_CACHE_LIMIT = 16;

function cacheKey(bounds: AerialBounds): string {
  // Rounded to the metre — finer than that is a different picture anyway.
  return [bounds.minX, bounds.minY, bounds.maxX, bounds.maxY]
    .map((n) => Math.round(n))
    .join(',') + `@${bounds.widthPx}x${bounds.heightPx}`;
}

/**
 * Fetch the aerial as a data URL. Stored rather than linked so the lot stays
 * visible during the walk — the iPads are Wi-Fi only and tether to a phone,
 * so assuming a live connection in a parking lot is assuming too much.
 */
export async function fetchAerial(
  center: LatLng,
  spanFt: number,
  widthPx = 1200,
  heightPx = 900,
): Promise<AerialView> {
  const bounds = viewBounds(center, spanFt, widthPx, heightPx);

  const key = cacheKey(bounds);
  const cached = viewCache.get(key);
  if (cached) return cached;

  let res: Response;
  try {
    res = await fetch(aerialImageUrl(bounds));
  } catch {
    throw new ImageryError(
      'Could not reach the county imagery server. Check the connection and try again.',
    );
  }
  if (!res.ok) throw new ImageryError(`County imagery server returned ${res.status}.`);

  const blob = await res.blob();
  if (!blob.type.startsWith('image/')) {
    // ArcGIS reports failures as a JSON body with a 200, so the type is the tell.
    throw new ImageryError('The county imagery server did not return an image.');
  }

  const image = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new ImageryError('Could not read the aerial image.'));
    reader.readAsDataURL(blob);
  });

  const view: AerialView = { ...bounds, image, spanFt, center };

  viewCache.set(key, view);
  if (viewCache.size > VIEW_CACHE_LIMIT) {
    viewCache.delete(viewCache.keys().next().value as string);
  }
  return view;
}

export interface AddressCandidate {
  address: string;
  score: number;
  location: LatLng;
}

/** Look up a street address against the county's own address points. */
export async function geocodeAddress(query: string): Promise<AddressCandidate[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    SingleLine: trimmed,
    f: 'json',
    outSR: '4326',
    maxLocations: '5',
  });

  let res: Response;
  try {
    res = await fetch(`${GEOCODER}?${params}`);
  } catch {
    throw new ImageryError('Could not reach the county address lookup.');
  }
  if (!res.ok) throw new ImageryError(`Address lookup returned ${res.status}.`);

  const data = await res.json();
  if (data?.error) throw new ImageryError(data.error.message || 'Address lookup failed.');

  interface RawCandidate {
    address?: string;
    score?: number;
    location?: { x?: number; y?: number };
  }

  return ((data?.candidates as RawCandidate[]) || [])
    .map((c) => ({
      address: String(c.address ?? ''),
      score: Number(c.score ?? 0),
      location: { lat: Number(c.location?.y), lng: Number(c.location?.x) },
    }))
    .filter((c) => Number.isFinite(c.location.lat) && Number.isFinite(c.location.lng));
}
