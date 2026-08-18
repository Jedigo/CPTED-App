import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchAerial,
  geocodeAddress,
  pixelToLatLng,
  latLngToPixel,
  centreForFocus,
  feetPerPixel,
  ImageryError,
  IMAGERY_CREDIT,
  type AerialView,
} from '../services/county-imagery';
import { deriveRectangle, type LatLng } from '../services/light-geo';

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
}: {
  initialAddress: string;
  corners: PickedCorners;
  onChange: (next: PickedCorners) => void;
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

  const load = useCallback(async (c: LatLng, span: number) => {
    setBusy(true);
    setError(null);
    try {
      const v = await fetchAerial(c, span);
      // These three must land in the same render. Clearing the transform in a
      // later commit draws the new image once under the old offset or scale,
      // which is the snap-back you see on release.
      setView(v);
      setPan(null);
      setZoomPreview(null);
      onImage?.(v);
    } catch (err) {
      setError(err instanceof ImageryError ? err.message : 'Could not load the aerial image.');
      setPan(null);
      setZoomPreview(null);
    } finally {
      setBusy(false);
    }
  }, [onImage]);

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
    setSpanFt(nextSpan);
    load(center, nextSpan);
  }

  function place(clientX: number, clientY: number) {
    const el = imgRef.current;
    if (!el || !view) return;
    const rect = el.getBoundingClientRect();
    // The image is displayed scaled; convert back to its own pixel grid first.
    const px = ((clientX - rect.left) / rect.width) * view.widthPx;
    const py = ((clientY - rect.top) / rect.height) * view.heightPx;
    const p = pixelToLatLng(view, px, py);

    const updated = { ...corners, [next]: p };
    onChange(updated);
    const remaining = ORDER.filter((k) => !updated[k]);
    setNext(remaining[0] ?? next);
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

    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.moved = Math.max(d.moved, Math.hypot(dx, dy));
    if (d.moved >= DRAG_THRESHOLD_PX) setPan({ x: dx, y: dy });
  }
  function onPointerUp(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);

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
      if (preview && view && imgRef.current) {
        const nextSpan = Math.min(
          MAX_SPAN_FT,
          Math.max(MIN_SPAN_FT, p.startSpan / preview.scale),
        );
        const rect = imgRef.current.getBoundingClientRect();
        const rx = p.originX / rect.width;
        const ry = p.originY / rect.height;
        const focus = pixelToLatLng(view, rx * view.widthPx, ry * view.heightPx);
        // Keep the pinched ground point at the same place on screen. Centring
        // the new view on it instead would slide the lot sideways at the moment
        // the sharp image appears.
        const nextCentre = centreForFocus(focus, rx, ry, nextSpan, view.widthPx, view.heightPx);
        setSpanFt(nextSpan);
        setCenter(nextCentre);
        load(nextCentre, nextSpan);
      } else {
        setZoomPreview(null);
      }
      return;
    }

    const d = drag.current;
    drag.current = null;
    if (!d || !view || !center) { setPan(null); return; }

    if (d.moved < DRAG_THRESHOLD_PX) {
      setPan(null);
      place(e.clientX, e.clientY);
      return;
    }
    // A drag re-centres the view on whatever was dragged to the middle.
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dxPx = ((e.clientX - d.x) / rect.width) * view.widthPx;
    const dyPx = ((e.clientY - d.y) / rect.height) * view.heightPx;
    const newCentre = pixelToLatLng(view, view.widthPx / 2 - dxPx, view.heightPx / 2 - dyPx);
    setCenter(newCentre);
    // Hold the dragged position until the replacement arrives, so the view does
    // not snap back to where it was and then jump forward again.
    load(newCentre, spanFt);
  }

  const rect =
    corners.origin && corners.axis ? deriveRectangle(corners.origin, corners.axis, corners.width) : null;

  const toPx = (p: LatLng) => (view ? latLngToPixel(view, p) : { x: 0, y: 0 });
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
        {placed.length > 0 && (
          <button
            type="button"
            onClick={() => { onChange({ origin: null, axis: null, width: null }); setNext('origin'); }}
            className="px-3 py-2 rounded-lg text-xs font-semibold border border-score-critical/40 text-score-critical"
          >
            Clear corners
          </button>
        )}
      </div>

      <p className="text-xs text-ink/60 mb-2">
        Tap the <strong className="text-ink">{LABEL[next].toLowerCase()}</strong> on the picture.
        Drag to move, pinch to zoom.{' '}
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
          setZoomPreview(null);
          setPan(null);
        }}
        className="relative w-full rounded-lg overflow-hidden border border-ink/20 bg-ink/5 touch-none select-none"
        style={{ aspectRatio: view ? `${view.widthPx} / ${view.heightPx}` : '4 / 3' }}
      >
        {view && (
          <>
            <img
              src={view.image}
              alt="County aerial imagery of the lot"
              className="w-full h-full object-cover"
              draggable={false}
              style={panStyle}
            />
            <svg
              viewBox={`0 0 ${view.widthPx} ${view.heightPx}`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={panStyle}
            >
              {rect && corners.origin && corners.axis && corners.width && (
                <polygon
                  points={(() => {
                    const o = toPx(corners.origin!);
                    const a = toPx(corners.axis!);
                    const w = toPx(corners.width!);
                    const fourth = { x: a.x + (w.x - o.x), y: a.y + (w.y - o.y) };
                    return `${o.x},${o.y} ${a.x},${a.y} ${fourth.x},${fourth.y} ${w.x},${w.y}`;
                  })()}
                  fill="rgba(34,211,238,0.15)"
                  stroke="#22d3ee"
                  strokeWidth={3}
                />
              )}
              {ORDER.map((k) => {
                const c = corners[k];
                if (!c) return null;
                const p = toPx(c);
                return (
                  <g key={k}>
                    <circle cx={p.x} cy={p.y} r={14} fill="none" stroke={COLOR[k]} strokeWidth={5} />
                    <circle cx={p.x} cy={p.y} r={3} fill={COLOR[k]} />
                  </g>
                );
              })}
            </svg>
          </>
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
