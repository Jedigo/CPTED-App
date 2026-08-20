import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAerial,
  geocodeAddress,
  pixelToLatLng,
  latLngToPixel,
  centreForFocus,
  feetPerPixel,
  cropView,
  viewportFor,
  screenToImagePx,
  covers,
  OVERSCAN,
  VIEW_W,
  VIEW_H,
  ImageryError,
  IMAGERY_CREDIT,
  type AerialView,
} from '../services/county-imagery';
import {
  deriveRectangle,
  displacementM,
  offsetLatLng,
  projectWidthPoint,
  rectangleCorners,
  signedWidthM,
  widthPointFrom,
  M_PER_FT,
  type LatLng,
} from '../services/light-geo';

/**
 * Pick a lot's corners by tapping county aerial imagery.
 *
 * This exists because the accurate route — right-clicking corners in Google Maps
 * — needs a desktop, and the field iPads are the only machines most assessors
 * have. Their built-in positioning is Wi-Fi lookup with no GNSS at all, so
 * standing on a corner and pressing a button cannot work. Tapping a corner on
 * 3-inch imagery is accurate to roughly half a foot per pixel, which beats a
 * handheld GPS fix by two orders of magnitude and needs no hardware.
 */

const SPAN_STEPS_FT = [200, 300, 450, 600, 900, 1400];
const DEFAULT_SPAN_FT = 600;
/** Below this much movement a pointer gesture is a tap, not a pan. */
const DRAG_THRESHOLD_PX = 8;
/**
 * Pinch limits. The floor is set by the imagery itself — below about 120 ft
 * across, a 3-inch pixel is being enlarged past what it actually resolves, so
 * zooming further shows bigger blur rather than more detail.
 */
const MIN_SPAN_FT = 120;
const MAX_SPAN_FT = 2500;

/**
 * How far the view may drift from the middle of the fetched image before a
 * replacement is fetched behind it — half the available margin, which leaves
 * the other half as room to keep panning while that fetch is in flight.
 */
const RECENTRE_AT = 0.5;

/**
 * How close a finger must land to a corner to grab it, in SCREEN pixels — a
 * fingertip is about 44px, so this is a little under half that, which is close
 * enough to be deliberate without demanding precision the finger cannot give.
 * Converted to image pixels at use, so the grab area stays the same physical
 * size whatever the zoom.
 */
const HANDLE_GRAB_PX = 26;

/** Magnification of the loupe, relative to what is already on screen. */
const LOUPE_ZOOM = 2.5;
const LOUPE_SIZE_PX = 132;

/**
 * A default rectangle to drag into place, as a fraction of the visible span.
 * Deliberately not square, so which side is the long one is obvious at a glance.
 */
const SEED_LENGTH_FRAC = 0.45;
const SEED_WIDTH_FRAC = 0.22;

export interface PickedCorners {
  origin: LatLng | null;
  axis: LatLng | null;
  width: LatLng | null;
}

type CornerKey = keyof PickedCorners;

const ORDER: CornerKey[] = ['origin', 'width', 'axis'];
const LABEL: Record<CornerKey, string> = {
  origin: 'Start corner',
  width: 'Short-side corner',
  axis: 'Long-side corner',
};
const COLOR: Record<CornerKey, string> = {
  origin: '#22d3ee',
  width: '#a3e635',
  axis: '#f97316',
};

export default function AerialCornerPicker({
  initialAddress,
  corners,
  onChange,
  onImage,
  readingCount = 0,
}: {
  initialAddress: string;
  corners: PickedCorners;
  onChange: (next: PickedCorners) => void;
  /**
   * How many readings this survey already holds.
   *
   * Corners are what every grid point is derived from, so moving one after the
   * lot has been walked silently relocates readings that were taken at real
   * places. Dragging makes that far easier to do by accident than tapping did,
   * so once there are readings the corners are held until deliberately unlocked.
   */
  readingCount?: number;
  /** Handed the displayed aerial so it can be stored for the report. */
  onImage?: (view: AerialView) => void;
}) {
  const [view, setView] = useState<AerialView | null>(null);
  const [center, setCenter] = useState<LatLng | null>(null);
  const [spanFt, setSpanFt] = useState(DEFAULT_SPAN_FT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState(initialAddress);
  const [next, setNext] = useState<CornerKey>('origin');

  /**
   * Corners as they look mid-drag, before anything is committed.
   *
   * onChange writes through to the database, so firing it on every pointer move
   * would be a write per frame — and now a revision bump per frame with it.
   * The draft is what the overlay and the dimensions read from while a finger
   * is down; onChange is called once, on lift.
   */
  const [draft, setDraft] = useState<PickedCorners | null>(null);
  // Pointer handlers close over the render they were created in, so the commit
  // reads the draft through a ref rather than a value that may be a frame old.
  const draftRef = useRef<PickedCorners | null>(null);
  const handleDrag = useRef<
    | { kind: 'corner'; key: CornerKey; widthM: number | null }
    | { kind: 'body'; start: LatLng; from: PickedCorners }
    | null
  >(null);
  /** Magnified view under the finger, so the corner is not hidden by it. */
  const [loupe, setLoupe] = useState<
    { imgX: number; imgY: number; screenX: number; screenY: number; mag: number } | null
  >(null);
  /**
   * Container width in screen pixels.
   *
   * Needed to draw the grab ring at the size the finger actually grabs: the
   * overlay's units are image pixels, and the conversion between the two is the
   * container width, not the fetched image width. Without measuring it, the
   * ring shown and the area hit-tested are different sizes on every screen but
   * one — which is worse than drawing no ring at all, because it looks precise.
   */
  const [containerW, setContainerW] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const locked = readingCount > 0 && !unlocked;
  const imgRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; moved: number } | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number } | null>(null);
  // Live pointers, so a second finger can turn a drag into a pinch mid-gesture.
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<
    { startDist: number; startSpan: number; originX: number; originY: number } | null
  >(null);
  const [zoomPreview, setZoomPreview] = useState<
    { scale: number; originX: number; originY: number } | null
  >(null);
  /** One fetch at a time, so a slow drag cannot queue a request per settle. */
  const onImageRef = useRef(onImage);
  onImageRef.current = onImage;
  const fetching = useRef(false);
  const lastRequest = useRef<string | null>(null);
  /**
   * Only the newest request may draw. A background fetch started before an
   * urgent one can easily answer after it — the county server's render time
   * varies by seconds with the size asked for — and applying it would throw
   * the view back to where it used to be.
   */
  const requestSeq = useRef(0);

  /**
   * Fetch imagery for a view.
   *
   * Foreground means there is nothing correct on screen for where the assessor
   * is going: it takes the spinner, and it fetches without the margin because
   * that is the fast one (about 0.75 s against 2.5 s) — the margin is no use if
   * it is not there yet. It commits the centre and span it fetched, so the
   * caller can leave the gesture transform holding the dragged position until
   * this lands and everything moves together in one commit.
   *
   * Background means the screen already shows the right ground and this is only
   * widening or sharpening it. No spinner, and the live gesture transform is
   * deliberately left alone, because the swap shows the same ground and so the
   * transform stays valid. Only this kind fetches the margin.
   */
  const load = useCallback(
    async (c: LatLng, span: number, opts: { background?: boolean } = {}) => {
      const background = opts.background ?? false;
      const scale = background ? OVERSCAN : 1;
      const mine = ++requestSeq.current;
      if (!background) setBusy(true);
      setError(null);
      try {
        const v = await fetchAerial(c, span * scale, VIEW_W * scale, VIEW_H * scale);
        if (requestSeq.current !== mine) return;
        if (background) {
          setView(v);
        } else {
          // Image, position and transform in one commit: anything left over
          // from the gesture is dropped in the same render that draws where it
          // was dragged to, so there is nothing to spring back from.
          setView(v);
          setCenter(c);
          setSpanFt(span);
          setPan(null);
          setZoomPreview(null);
        }
      } catch (err) {
        if (!background && requestSeq.current === mine) {
          setError(err instanceof ImageryError ? err.message : 'Could not load the aerial image.');
          setPan(null);
          setZoomPreview(null);
        }
      } finally {
        if (!background) setBusy(false);
        if (requestSeq.current === mine) fetching.current = false;
      }
    },
    [],
  );

  // First load: an already-placed start corner wins over the address, so
  // reopening a survey shows the lot rather than the front door of the school.
  useEffect(() => {
    if (center) return;
    if (corners.origin) {
      setCenter(corners.origin);
      load(corners.origin, spanFt);
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const found = await geocodeAddress(initialAddress);
        if (cancelled) return;
        if (found.length === 0) {
          setError('That address was not found in the county address list. Search for it below.');
          setBusy(false);
          return;
        }
        setCenter(found[0].location);
        await load(found[0].location, spanFt);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ImageryError ? err.message : 'Address lookup failed.');
          setBusy(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [center, corners.origin, initialAddress, load, spanFt]);

  async function runSearch() {
    if (!search.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const found = await geocodeAddress(search);
      if (found.length === 0) {
        setError('No match for that address in the county address list.');
        setBusy(false);
        return;
      }
      setCenter(found[0].location);
      await load(found[0].location, spanFt);
    } catch (err) {
      setError(err instanceof ImageryError ? err.message : 'Address lookup failed.');
      setBusy(false);
    }
  }

  /**
   * Keep the imagery ahead of the view.
   *
   * Panning and zooming only move state; nothing here blocks them. This decides
   * afterwards whether what is on screen needs replacing, and crucially whether
   * the assessor has to watch that happen: if the fetched image still covers the
   * view, the refresh is invisible.
   */
  useEffect(() => {
    if (!view || !center) return;

    const wanted = spanFt / feetPerPixel(view);
    const fits = covers(view, center, spanFt);
    // Within 5% the difference is invisible; chasing it would refetch forever.
    const sharp = Math.abs(wanted - VIEW_W) / VIEW_W <= 0.05;
    const hasMargin = view.widthPx / wanted >= OVERSCAN * 0.9;

    const c = latLngToPixel(view, center);
    const slackX = (view.widthPx - wanted) / 2;
    const slackY = (view.heightPx - (wanted * VIEW_H) / VIEW_W) / 2;
    const drifted =
      Math.abs(c.x - view.widthPx / 2) > slackX * RECENTRE_AT ||
      Math.abs(c.y - view.heightPx / 2) > slackY * RECENTRE_AT;

    if (fits && sharp && hasMargin && !drifted) return;

    const key = `${center.lat.toFixed(7)},${center.lng.toFixed(7)}@${Math.round(spanFt)}`;
    // A background refresh in flight must not hold up a view with nothing
    // correct to show; only another background refresh waits its turn.
    if ((fetching.current && fits) || lastRequest.current === key) return;
    lastRequest.current = key;
    fetching.current = true;
    // A view that is already covered is only being improved, so it can be
    // fetched behind the assessor's back.
    load(center, spanFt, { background: fits });
  }, [view, center, spanFt, load]);

  // What is on screen, derived rather than stored: centre and span are the only
  // truth, so a pan or a zoom is a state change with no fetch attached.
  const viewport = view && center ? viewportFor(view, center, spanFt) : null;

  // Hand the report the picture the assessor framed. The fetch covers more
  // ground than the screen shows, so the stored image is the cropped window —
  // otherwise the lot would print smaller than it was framed. Cropping costs a
  // canvas encode, so it waits for the gesture to settle rather than running
  // on every pan.
  useEffect(() => {
    if (!view || !center) return;
    const vp = viewportFor(view, center, spanFt);
    let cancelled = false;
    const t = setTimeout(() => {
      cropView(view, vp.x, vp.y, vp.w, vp.h)
        .then((cropped) => { if (!cancelled) onImageRef.current?.(cropped); })
        .catch(() => { /* the picture on screen is still valid; the report can retry */ });
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [view, center, spanFt]);

  /** A point in the container, 0..1 across and down, as a pixel in the image. */
  function toImagePx(rx: number, ry: number): { x: number; y: number } {
    if (!viewport) return { x: 0, y: 0 };
    return { x: viewport.x + rx * viewport.w, y: viewport.y + ry * viewport.h };
  }

  function changeSpan(delta: number) {
    if (!center) return;
    // A pinch leaves the span on an arbitrary value, so step from the nearest
    // preset rather than looking for an exact match that will not be there.
    const nearest = SPAN_STEPS_FT.reduce(
      (best, s, i) => (Math.abs(s - spanFt) < Math.abs(SPAN_STEPS_FT[best] - spanFt) ? i : best),
      0,
    );
    const nextSpan =
      SPAN_STEPS_FT[Math.min(SPAN_STEPS_FT.length - 1, Math.max(0, nearest + delta))];
    if (nextSpan === spanFt) return;
    if (view && covers(view, center, nextSpan)) {
      // The window resizes over pixels already held; the effect decides
      // afterwards whether a sharper one is worth requesting.
      setSpanFt(nextSpan);
      return;
    }
    load(center, nextSpan);
  }

  /**
   * Screen point -> the image's own pixel grid.
   *
   * Shared by tapping, dragging and hit-testing, so the three cannot disagree
   * about where a finger is. The gesture compensation is the load-bearing part:
   * a pan or pinch can still be held on screen while its replacement is
   * fetched, leaving the picture offset or scaled from where the coordinate
   * maths puts it. Undo that first, or a corner placed during the wait lands
   * somewhere else entirely with nothing about it looking wrong.
   */
  function clientToImagePx(
    clientX: number,
    clientY: number,
  ): { x: number; y: number; rect: DOMRect } | null {
    const el = imgRef.current;
    if (!el || !view || !viewport) return null;
    const rect = el.getBoundingClientRect();
    const { x, y } = screenToImagePx(
      clientX - rect.left,
      clientY - rect.top,
      rect.width,
      rect.height,
      viewport,
      { pan, zoom: zoomPreview },
    );
    return { x, y, rect };
  }

  function clientToLatLng(clientX: number, clientY: number): LatLng | null {
    const at = clientToImagePx(clientX, clientY);
    if (!at || !view) return null;
    return pixelToLatLng(view, at.x, at.y);
  }

  function place(clientX: number, clientY: number) {
    if (locked) return;
    const p = clientToLatLng(clientX, clientY);
    if (!p) return;

    const updated = { ...corners, [next]: p };
    onChange(updated);
    const remaining = ORDER.filter((k) => !updated[k]);
    setNext(remaining[0] ?? next);
  }

  /**
   * The unentered fourth corner, in ground coordinates.
   *
   * The rectangle is defined by three corners; the fourth is wherever the other
   * two sides meet. Derived rather than stored, so it cannot disagree with them.
   */
  function lotOutline(c: PickedCorners): LatLng[] | null {
    if (!c.origin || !c.axis) return null;
    return rectangleCorners(c.origin, c.axis, c.width);
  }

  /** Image pixels per screen pixel, so a finger-sized radius stays finger-sized. */
  function imagePxPerScreenPx(rect: DOMRect): number {
    if (!viewport || rect.width === 0) return 1;
    return viewport.w / rect.width;
  }

  /** Is this image-pixel point inside the lot outline? */
  function insideLot(c: PickedCorners, x: number, y: number): boolean {
    const outline = lotOutline(c);
    if (!outline || !view) return false;
    const poly = outline.map((p) => latLngToPixel(view, p));
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const a = poly[i];
      const b = poly[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
        hit = !hit;
      }
    }
    return hit;
  }

  /**
   * What a finger landing here would grab: a corner, the lot body, or nothing
   * (in which case the gesture is a pan, exactly as before).
   *
   * Corners win over the body, and the nearest corner wins, so overlapping grab
   * areas on a small lot still resolve to what the finger is closest to.
   */
  function hitTest(clientX: number, clientY: number): CornerKey | 'body' | null {
    if (locked || !view) return null;
    const at = clientToImagePx(clientX, clientY);
    if (!at) return null;
    const grab = HANDLE_GRAB_PX * imagePxPerScreenPx(at.rect);

    let best: { key: CornerKey; d: number } | null = null;
    for (const k of ORDER) {
      const c = corners[k];
      if (!c) continue;
      const p = latLngToPixel(view, c);
      const d = Math.hypot(p.x - at.x, p.y - at.y);
      if (d <= grab && (!best || d < best.d)) best = { key: k, d };
    }
    if (best) return best.key;
    return insideLot(corners, at.x, at.y) ? 'body' : null;
  }

  /**
   * Drop a rectangle in the middle of the view to drag onto the lot.
   *
   * Removes the blank "now tap three things" state, which is the part that
   * reads as fiddly. Laid out north-up because there is nothing yet to infer a
   * bearing from — rotating it is what dragging the corners is for.
   */
  function seedBox() {
    if (!center || locked) return;
    const halfLen = (spanFt * SEED_LENGTH_FRAC * M_PER_FT) / 2;
    const halfWid = (spanFt * SEED_WIDTH_FRAC * M_PER_FT) / 2;
    const seeded: PickedCorners = {
      origin: offsetLatLng(center, -halfLen, halfWid),
      axis: offsetLatLng(center, halfLen, halfWid),
      width: offsetLatLng(center, -halfLen, -halfWid),
    };
    onChange(seeded);
    setNext('origin');
  }

  useEffect(() => {
    const el = imgRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    setContainerW(el.getBoundingClientRect().width);
    const ro = new ResizeObserver(([entry]) => {
      setContainerW(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /** Position the magnifier on the point being moved, away from the finger. */
  function updateLoupe(clientX: number, clientY: number, at: LatLng) {
    const conv = clientToImagePx(clientX, clientY);
    if (!conv || !view) return;
    const p = latLngToPixel(view, at);
    const perScreen = imagePxPerScreenPx(conv.rect);
    setLoupe({
      imgX: p.x,
      imgY: p.y,
      screenX: clientX - conv.rect.left,
      screenY: clientY - conv.rect.top,
      // Magnify relative to what is already displayed, not to the raw image, so
      // the loupe is always the same amount closer than the picture behind it.
      mag: LOUPE_ZOOM / perScreen,
    });
  }

  /** Write the dragged position through, once, on lift. */
  function commitDraft() {
    const d = draftRef.current;
    handleDrag.current = null;
    setLoupe(null);
    setDraft(null);
    if (d) onChange(d);
  }

  function pointerDistance(): number {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function pointerMidpoint(): { x: number; y: number } {
    const [a, b] = [...pointers.current.values()];
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && imgRef.current) {
      // A pinch supersedes whatever drag was in progress; dropping it here is
      // what stops the second finger landing from being read as a tap later.
      drag.current = null;
      setPan(null);
      // A corner already moved under the finger stays where it was put — the
      // assessor can see where it is, and silently springing it back would be
      // the more surprising outcome.
      commitDraft();
      const rect = imgRef.current.getBoundingClientRect();
      const mid = pointerMidpoint();
      pinch.current = {
        startDist: pointerDistance(),
        startSpan: spanFt,
        originX: mid.x - rect.left,
        originY: mid.y - rect.top,
      };
      return;
    }
    if (pointers.current.size === 1) {
      // A finger on a corner (or inside the lot) moves the rectangle instead of
      // the map. Anywhere else and this is the pan it always was.
      const hit = hitTest(e.clientX, e.clientY);
      if (hit) {
        const start = clientToLatLng(e.clientX, e.clientY);
        if (start) {
          handleDrag.current =
            hit === 'body'
              ? { kind: 'body', start, from: corners }
              : {
                  kind: 'corner',
                  key: hit,
                  // The lot's width, captured before it moves, so dragging the
                  // far end rotates the rectangle without also resizing it.
                  widthM:
                    corners.origin && corners.axis && corners.width
                      ? signedWidthM(corners.origin, corners.axis, corners.width)
                      : null,
                };
          draftRef.current = corners;
          setDraft(corners);
          if (hit !== 'body') setNext(hit);
          updateLoupe(e.clientX, e.clientY, hit === 'body' ? start : corners[hit]!);
          return;
        }
      }
      drag.current = { x: e.clientX, y: e.clientY, moved: 0 };
    }
  }
  function onPointerMove(e: React.PointerEvent) {
    if (pointers.current.has(e.pointerId)) {
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (pinch.current && pointers.current.size >= 2) {
      const scale = pointerDistance() / pinch.current.startDist;
      if (Number.isFinite(scale) && scale > 0) {
        setZoomPreview({
          scale,
          originX: pinch.current.originX,
          originY: pinch.current.originY,
        });
      }
      return;
    }

    const h = handleDrag.current;
    if (h) {
      const p = clientToLatLng(e.clientX, e.clientY);
      if (!p) return;
      let updated: PickedCorners;
      if (h.kind === 'corner') {
        const base = draftRef.current ?? corners;
        // The width handle controls how wide the lot is and nothing else: the
        // grid only ever uses the perpendicular distance, so snapping here
        // means the box drawn on screen is the box that gets walked.
        const moved =
          h.key === 'width' && base.origin && base.axis
            ? projectWidthPoint(base.origin, base.axis, p)
            : p;
        updated = { ...base, [h.key]: moved };

        // Moving either end of the long side swings the perpendicular, so the
        // width point has to be carried round with it — otherwise the handle
        // drifts off the corner it controls and the lot silently changes width
        // while the assessor is only trying to line up the length.
        if (h.key !== 'width' && h.widthM !== null && updated.origin && updated.axis) {
          updated.width = widthPointFrom(updated.origin, updated.axis, h.widthM);
        }
      } else {
        // Slide the whole rectangle by the ground distance the finger covered,
        // measured from where it went down — so the lot keeps its shape and
        // bearing exactly, and rounding cannot accumulate across the drag.
        const move = displacementM(h.start, p);
        updated = {
          origin: h.from.origin ? offsetLatLng(h.from.origin, move.east, move.north) : null,
          axis: h.from.axis ? offsetLatLng(h.from.axis, move.east, move.north) : null,
          width: h.from.width ? offsetLatLng(h.from.width, move.east, move.north) : null,
        };
      }
      draftRef.current = updated;
      setDraft(updated);
      updateLoupe(e.clientX, e.clientY, h.kind === 'corner' ? p : (updated.origin ?? p));
      return;
    }

    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    if (d.moved >= DRAG_THRESHOLD_PX) setPan({ x: dx, y: dy });
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);

    if (handleDrag.current) {
      commitDraft();
      return;
    }

    if (pinch.current) {
      // Finish on the first lift; a lingering finger must not restart a drag
      // from wherever it happens to be resting.
      const p = pinch.current;
      const preview = zoomPreview;
      pinch.current = null;
      drag.current = null;
      // Deliberately NOT clearing zoomPreview here: the scaled image stays put
      // until the replacement is ready, so the view never rebounds to its old
      // size and then re-zooms.
      if (preview && view && viewport && imgRef.current) {
        const nextSpan = Math.min(
          MAX_SPAN_FT,
          Math.max(MIN_SPAN_FT, p.startSpan / preview.scale),
        );
        const rect = imgRef.current.getBoundingClientRect();
        const rx = p.originX / rect.width;
        const ry = p.originY / rect.height;
        const at = toImagePx(rx, ry);
        const focus = pixelToLatLng(view, at.x, at.y);
        // Keep the pinched ground point at the same place on screen. Centring
        // the new view on it instead would slide the lot sideways at the moment
        // the sharp image appears.
        const nextCentre = centreForFocus(focus, rx, ry, nextSpan, VIEW_W, VIEW_H);
        if (covers(view, nextCentre, nextSpan)) {
          // The window resizes on pixels already held, so these land together
          // and the preview scale is dropped in the same commit — no fetch.
          setSpanFt(nextSpan);
          setCenter(nextCentre);
          setZoomPreview(null);
        } else {
          // Zoomed out past what was fetched: hold the pinch scale until the
          // replacement lands rather than rebounding to the old size first.
          load(nextCentre, nextSpan);
        }
      } else {
        setZoomPreview(null);
      }
      return;
    }

    const d = drag.current;
    drag.current = null;
    if (!d || !view || !center || !viewport) { setPan(null); return; }

    if (d.moved < DRAG_THRESHOLD_PX) {
      setPan(null);
      place(e.clientX, e.clientY);
      return;
    }
    // A drag re-centres the view on whatever was dragged to the middle. Within
    // the fetched margin that is pure arithmetic, so the image lands in the
    // same commit that drops the drag transform and the move looks immediate.
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dxPx = ((e.clientX - d.x) / rect.width) * viewport.w;
    const dyPx = ((e.clientY - d.y) / rect.height) * viewport.h;
    const newCentre = pixelToLatLng(
      view,
      viewport.x + viewport.w / 2 - dxPx,
      viewport.y + viewport.h / 2 - dyPx,
    );

    if (covers(view, newCentre, spanFt)) {
      setCenter(newCentre);
      setPan(null);
      return;
    }
    // Dragged past what was fetched. The window can only slide as far as the
    // image goes, so dropping the transform now would spring the view back from
    // where the finger left it — and once it is against the edge, back to
    // exactly where the drag started. Hold the dragged position and let the
    // replacement commit the move.
    load(newCentre, spanFt);
  }

  // What the overlay and the readout show: the drag in progress if there is
  // one, otherwise the committed corners.
  const live = draft ?? corners;
  const rect =
    live.origin && live.axis ? deriveRectangle(live.origin, live.axis, live.width) : null;

  const toPx = (p: LatLng) => (view ? latLngToPixel(view, p) : { x: 0, y: 0 });
  /**
   * Place the fetched image so the viewport window fills the container. The
   * image is wider than the box on purpose, so it is sized past 100% and slid
   * left — max-w-none because Tailwind's reset would otherwise cap it at the
   * container and quietly undo the margin.
   */
  const frameStyle: React.CSSProperties | undefined =
    view && viewport
      ? {
          width: `${(view.widthPx / viewport.w) * 100}%`,
          height: `${(view.heightPx / viewport.h) * 100}%`,
          left: `${(-viewport.x / viewport.w) * 100}%`,
          top: `${(-viewport.y / viewport.h) * 100}%`,
        }
      : undefined;
  const panStyle: React.CSSProperties | undefined = zoomPreview
    ? {
        transform: `scale(${zoomPreview.scale})`,
        transformOrigin: `${zoomPreview.originX}px ${zoomPreview.originY}px`,
      }
    : pan
      ? { transform: `translate(${pan.x}px, ${pan.y}px)` }
      : undefined;
  const placed = ORDER.filter((k) => corners[k]);

  return (
    <div>
      <div className="flex gap-2 mb-3 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); runSearch(); } }}
          placeholder="Search an address"
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-sm"
        />
        <button
          type="button"
          onClick={runSearch}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold disabled:opacity-50"
        >
          Find
        </button>
        <button type="button" onClick={() => changeSpan(-1)} disabled={busy || !center}
          className="px-4 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-sm font-semibold disabled:opacity-40">
          Zoom in
        </button>
        <button type="button" onClick={() => changeSpan(1)} disabled={busy || !center}
          className="px-4 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-sm font-semibold disabled:opacity-40">
          Zoom out
        </button>
      </div>

      <div className="flex gap-2 mb-2 flex-wrap items-center">
        {ORDER.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setNext(k)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              next === k ? 'border-navy bg-blue-pale text-navy' : 'border-ink/20 bg-surface text-ink/70'
            }`}
          >
            <span
              className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
              style={{ background: COLOR[k], opacity: corners[k] ? 1 : 0.25 }}
            />
            {LABEL[k]}
            {corners[k] ? ' ✓' : ''}
          </button>
        ))}
        {placed.length === 0 && (
          <button
            type="button"
            onClick={seedBox}
            disabled={busy || !center || locked}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-navy bg-navy text-white disabled:opacity-40"
          >
            Draw a box
          </button>
        )}
        {placed.length > 0 && !locked && (
          <button
            type="button"
            onClick={() => { onChange({ origin: null, axis: null, width: null }); setNext('origin'); }}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-score-critical/40 text-score-critical"
          >
            Clear corners
          </button>
        )}
      </div>

      {locked && (
        <p className="text-xs mb-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-lg p-3">
          This lot already has {readingCount} reading{readingCount === 1 ? '' : 's'}. Every grid
          point is worked out from these corners, so moving one now would relocate readings that
          were taken at real places on the ground.{' '}
          <button
            type="button"
            onClick={() => setUnlocked(true)}
            className="underline font-semibold"
          >
            Unlock corners anyway
          </button>
        </p>
      )}

      <p className="text-xs text-ink/60 mb-2">
        {locked ? (
          <>Corners are held while this lot has readings. Drag to pan, pinch to zoom.</>
        ) : placed.length === 0 ? (
          <>
            Tap <strong className="text-ink">Draw a box</strong> and drag it onto the lot, or tap
            the <strong className="text-ink">{LABEL[next].toLowerCase()}</strong> on the picture.
          </>
        ) : placed.length < ORDER.length ? (
          <>
            Tap the <strong className="text-ink">{LABEL[next].toLowerCase()}</strong> on the
            picture. Corners already placed can be dragged.
          </>
        ) : (
          <>
            Drag a <strong className="text-ink">corner</strong> to reshape the lot, or drag{' '}
            <strong className="text-ink">inside</strong> it to move the whole box. Drag outside to
            pan, pinch to zoom.
          </>
        )}{' '}
        {view && <>Each pixel is about {feetPerPixel(view).toFixed(2)} ft.</>}
      </p>

      <div
        ref={imgRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => {
          pointers.current.delete(e.pointerId);
          pinch.current = null;
          drag.current = null;
          commitDraft();
          setZoomPreview(null);
          setPan(null);
        }}
        className="relative w-full rounded-lg overflow-hidden border border-ink/20 bg-ink/5 touch-none select-none"
        style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      >
        {view && viewport && (
          <div className="absolute inset-0" style={panStyle}>
            <img
              src={view.image}
              alt="County aerial imagery of the lot"
              className="absolute max-w-none"
              draggable={false}
              style={frameStyle}
            />
            <svg
              viewBox={`0 0 ${view.widthPx} ${view.heightPx}`}
              className="absolute pointer-events-none"
              style={frameStyle}
            >
              {(() => {
                // The rectangle the grid is actually laid out on — not a
                // parallelogram through the three taps, which is what this drew
                // before and which differs the moment the picks are off square.
                const outline = lotOutline(live);
                if (!outline) return null;
                return (
                  <polygon
                    points={outline.map((p) => { const q = toPx(p); return `${q.x},${q.y}`; }).join(' ')}
                    fill="rgba(34,211,238,0.15)"
                    stroke="#22d3ee"
                    strokeWidth={3}
                  />
                );
              })()}
              {ORDER.map((k) => {
                const c = live[k];
                if (!c) return null;
                const p = toPx(c);
                const dragging = handleDrag.current?.kind === 'corner' && handleDrag.current.key === k;
                // The ring is drawn at the size the finger actually grabs, so
                // what looks tappable is what is tappable.
                // Screen pixels -> image pixels, which is what the overlay is
                // drawn in. Falls back to no ring rather than a wrong one.
                const grab =
                  viewport && containerW > 0
                    ? HANDLE_GRAB_PX * (viewport.w / containerW)
                    : 0;
                return (
                  <g key={k}>
                    {!locked && grab > 0 && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={grab}
                        fill={COLOR[k]}
                        opacity={dragging ? 0.28 : 0.12}
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={14}
                      fill="none"
                      stroke={COLOR[k]}
                      strokeWidth={dragging ? 7 : 5}
                    />
                    <circle cx={p.x} cy={p.y} r={3} fill={COLOR[k]} />
                  </g>
                );
              })}
            </svg>
          </div>
        )}
        {/* Magnifier. Half a foot per pixel is the whole reason this beats a
            GPS fix, and a fingertip covers about 44px of it — so the corner
            being placed is exactly what the hand is hiding. Parked in whichever
            top corner the finger is not near. */}
        {loupe && view && (
          <div
            className="absolute rounded-full border-2 border-white shadow-lg overflow-hidden pointer-events-none"
            style={{
              width: LOUPE_SIZE_PX,
              height: LOUPE_SIZE_PX,
              top: 8,
              left: loupe.screenX < LOUPE_SIZE_PX + 24 ? undefined : 8,
              right: loupe.screenX < LOUPE_SIZE_PX + 24 ? 8 : undefined,
              backgroundImage: `url(${view.image})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${view.widthPx * loupe.mag}px ${view.heightPx * loupe.mag}px`,
              backgroundPosition: `${LOUPE_SIZE_PX / 2 - loupe.imgX * loupe.mag}px ${
                LOUPE_SIZE_PX / 2 - loupe.imgY * loupe.mag
              }px`,
            }}
          >
            <svg className="absolute inset-0" width={LOUPE_SIZE_PX} height={LOUPE_SIZE_PX}>
              <line x1={LOUPE_SIZE_PX / 2} y1={0} x2={LOUPE_SIZE_PX / 2} y2={LOUPE_SIZE_PX}
                stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              <line x1={0} y1={LOUPE_SIZE_PX / 2} x2={LOUPE_SIZE_PX} y2={LOUPE_SIZE_PX / 2}
                stroke="rgba(255,255,255,0.7)" strokeWidth={1} />
              <circle cx={LOUPE_SIZE_PX / 2} cy={LOUPE_SIZE_PX / 2} r={5}
                fill="none" stroke="#22d3ee" strokeWidth={2} />
            </svg>
          </div>
        )}
        {busy && (
          <div className="absolute top-2 right-2 px-3 py-1.5 rounded-full bg-ink/70 text-white text-xs font-semibold">
            {view ? 'Updating…' : 'Loading imagery…'}
          </div>
        )}
      </div>

      <p className="text-[10px] text-ink/40 mt-1">{IMAGERY_CREDIT}</p>

      {rect && (
        <p className="text-sm text-ink/80 mt-2">
          That gives{' '}
          <strong className="text-ink">
            {Math.round(rect.length_ft)} ft
            {rect.width_ft !== null && <> × {Math.round(rect.width_ft)} ft</>}
          </strong>
          .
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}
