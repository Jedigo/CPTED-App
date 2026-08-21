import { useEffect, useMemo, useRef, useState } from 'react';
import { latLngToPixel } from '../services/county-imagery';
import { gridPointLatLng, hasGeoreference, lotCorners } from '../services/light-geo';
import { buildPointPlan, pointPosition, type PointPlan } from '../services/light-grid';
import type { LightSurvey } from '../types';

/**
 * The lot, the numbered grid, and where you are on it — for use while standing
 * in the car park.
 *
 * Two layouts, one coordinate space. When the lot was framed on county imagery
 * the map is that imagery with the points projected onto it; when it was typed
 * in as dimensions there is no picture to show, so the same points are drawn on
 * a plain rectangle. Everything downstream — panning, zooming, hit-testing —
 * works in "map pixels" and neither layout is a special case past line one.
 *
 * Nothing here touches the network. The imagery is whatever was cached when the
 * lot was framed at a desk, because the county server is a fetch away and the
 * lot being walked is where a Wi-Fi-only iPad on a phone hotspot is least
 * likely to reach it.
 *
 * There is no blue dot and there never will be: these iPads have no GNSS
 * receiver, and a Wi-Fi position fix in an open car park is tens of feet out —
 * far enough to point at the wrong cell. The assessor tells the app where they
 * are by tapping, not the other way round.
 */

/** Ground shown across the map when it first opens, and the zoom limits. */
const DEFAULT_VIEW_FT = 160;
const MIN_VIEW_FT = 40;
const MAX_VIEW_FT = 1400;

/** How close a tap has to land, in screen pixels, to count as picking a point. */
const TAP_RADIUS_PX = 34;
/** Movement past this during a tap makes it a pan instead. */
const TAP_SLOP_PX = 10;

const M_PER_FT = 0.3048;

interface MapPoint {
  index: number;
  x: number;
  y: number;
}

interface Layout {
  widthPx: number;
  heightPx: number;
  /** Ground feet per map pixel — what turns a zoom level into a real distance. */
  ftPerPx: number;
  points: MapPoint[];
  outline: Array<{ x: number; y: number }>;
  image: string | null;
  credit: string | null;
}

/**
 * Place every grid point in map-pixel space.
 *
 * Aerial layout is used only when the cached picture actually covers the lot.
 * A base cached before the corners were moved can end up framing somewhere
 * else entirely, and a map showing the wrong ground is worse than no map: the
 * points would still be drawn, still be numbered, and still be wrong.
 */
function buildLayout(survey: LightSurvey, plan: PointPlan): Layout {
  const base = survey.aerial_base;
  const corners = lotCorners(survey);

  if (base && corners && hasGeoreference(survey)) {
    const outline = corners.map((c) => latLngToPixel(base, c));
    const inside = outline.every(
      (p) => p.x >= 0 && p.y >= 0 && p.x <= base.widthPx && p.y <= base.heightPx,
    );
    if (inside) {
      const points: MapPoint[] = [];
      for (let i = 1; i <= plan.totalPoints; i++) {
        const ll = gridPointLatLng(survey, i);
        if (!ll) continue;
        const p = latLngToPixel(base, ll);
        points.push({ index: i, x: p.x, y: p.y });
      }
      // Undo the Mercator stretch so a zoom expressed in feet is real ground.
      const centreLat = (corners[0].lat + corners[2].lat) / 2;
      const groundFt =
        ((base.maxX - base.minX) * Math.cos((centreLat * Math.PI) / 180)) / M_PER_FT;
      return {
        widthPx: base.widthPx,
        heightPx: base.heightPx,
        ftPerPx: groundFt / base.widthPx,
        points,
        outline,
        image: base.image,
        credit: base.credit,
      };
    }
  }

  // No usable imagery: draw the lot itself. One map pixel is one tenth of a
  // foot, which keeps a 600 ft lot inside a sane canvas and the arithmetic
  // identical to the aerial case.
  const ftPerPx = 0.1;
  const pad = 200;
  const grid = {
    cols: survey.cols,
    rows: survey.rows,
    spacing_length_ft: survey.spacing_length_ft,
    spacing_width_ft: survey.spacing_width_ft,
    length_ft: survey.length_ft,
    width_ft: survey.width_ft,
    grid_origin: survey.grid_origin,
  };
  const toPx = (ft: number) => pad + ft / ftPerPx;
  const points: MapPoint[] = [];
  for (let i = 1; i <= plan.totalPoints; i++) {
    const { x_ft, y_ft } = pointPosition(i, grid);
    points.push({ index: i, x: toPx(x_ft), y: toPx(y_ft) });
  }
  return {
    widthPx: toPx(survey.length_ft) + pad,
    heightPx: toPx(survey.width_ft) + pad,
    ftPerPx,
    points,
    outline: [
      { x: toPx(0), y: toPx(0) },
      { x: toPx(survey.length_ft), y: toPx(0) },
      { x: toPx(survey.length_ft), y: toPx(survey.width_ft) },
      { x: toPx(0), y: toPx(survey.width_ft) },
    ],
    image: null,
    credit: null,
  };
}

export default function WalkMap({
  survey,
  current,
  values,
  onPickPoint,
}: {
  survey: LightSurvey;
  /** The point the assessor is standing on. */
  current: number;
  /** point_index -> footcandles, for points already read. */
  values?: Map<number, number>;
  onPickPoint: (pointIndex: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  /** Set while the assessor has panned away, so auto-centring stops fighting them. */
  const [freeLook, setFreeLook] = useState(false);

  const plan = useMemo(
    () => buildPointPlan(survey.cols, survey.rows, survey.skipped_points),
    [survey.cols, survey.rows, survey.skipped_points],
  );
  const layout = useMemo(() => buildLayout(survey, plan), [survey, plan]);
  const skipped = useMemo(() => new Set(survey.skipped_points), [survey.skipped_points]);
  const walkIndex = useMemo(() => {
    const m = new Map<number, number>();
    plan.walkOrder.forEach((p, i) => m.set(p, i));
    return m;
  }, [plan]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentPoint = layout.points.find((p) => p.index === current);

  /** Put a map coordinate under the middle of the container. */
  function centreOn(x: number, y: number, s: number) {
    setOffset({ x: size.w / 2 - x * s, y: size.h / 2 - y * s });
  }

  // Open at a walking-scale zoom, then follow the current point unless the
  // assessor has deliberately panned off it.
  const initialised = useRef(false);
  useEffect(() => {
    if (!size.w || !size.h || !currentPoint) return;
    if (!initialised.current) {
      initialised.current = true;
      const s = size.w / (DEFAULT_VIEW_FT / layout.ftPerPx);
      setScale(s);
      centreOn(currentPoint.x, currentPoint.y, s);
      return;
    }
    if (!freeLook) centreOn(currentPoint.x, currentPoint.y, scale);
    // Following the current point is the whole job; re-centring on every scale
    // change as well would fight the pinch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, size.w, size.h, freeLook, layout.ftPerPx]);

  function recentre() {
    if (!currentPoint) return;
    setFreeLook(false);
    centreOn(currentPoint.x, currentPoint.y, scale);
  }

  // --- Gestures ------------------------------------------------------------
  //
  // One finger pans, two pinch about the point between them so the ground under
  // the fingers stays put. A press that barely moves is a tap, which picks the
  // point nearest to it.

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startOffset: { x: number; y: number };
    startScale: number;
    startCentre: { x: number; y: number };
    startSpread: number;
    moved: number;
  } | null>(null);

  function centroid() {
    const list = [...pointers.current.values()];
    const x = list.reduce((a, p) => a + p.x, 0) / list.length;
    const y = list.reduce((a, p) => a + p.y, 0) / list.length;
    return { x, y };
  }

  function spread() {
    const list = [...pointers.current.values()];
    if (list.length < 2) return 0;
    return Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
  }

  function beginGesture() {
    gesture.current = {
      startOffset: { ...offset },
      startScale: scale,
      startCentre: centroid(),
      startSpread: spread(),
      moved: 0,
    };
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    beginGesture();
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;

    const now = centroid();
    g.moved = Math.max(g.moved, Math.hypot(now.x - g.startCentre.x, now.y - g.startCentre.y));

    let nextScale = g.startScale;
    if (pointers.current.size >= 2 && g.startSpread > 0) {
      const raw = (spread() / g.startSpread) * g.startScale;
      const min = size.w / (MAX_VIEW_FT / layout.ftPerPx);
      const max = size.w / (MIN_VIEW_FT / layout.ftPerPx);
      nextScale = Math.min(max, Math.max(min, raw));
    }

    // Hold the ground under the fingers: the map point that was beneath the
    // starting centroid must still be beneath the current one.
    const rect = containerRef.current?.getBoundingClientRect();
    const ox = rect ? g.startCentre.x - rect.left : g.startCentre.x;
    const oy = rect ? g.startCentre.y - rect.top : g.startCentre.y;
    const mapX = (ox - g.startOffset.x) / g.startScale;
    const mapY = (oy - g.startOffset.y) / g.startScale;
    const nx = rect ? now.x - rect.left : now.x;
    const ny = rect ? now.y - rect.top : now.y;

    setScale(nextScale);
    setOffset({ x: nx - mapX * nextScale, y: ny - mapY * nextScale });
    if (g.moved > TAP_SLOP_PX) setFreeLook(true);
  }

  function onPointerUp(e: React.PointerEvent) {
    const g = gesture.current;
    const wasSingle = pointers.current.size === 1;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) {
      beginGesture();
      return;
    }
    gesture.current = null;
    if (!g || !wasSingle || g.moved > TAP_SLOP_PX) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    let best: MapPoint | null = null;
    let bestDist = Infinity;
    for (const p of layout.points) {
      if (skipped.has(p.index)) continue;
      const d = Math.hypot(p.x * scale + offset.x - sx, p.y * scale + offset.y - sy);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    if (best && bestDist <= TAP_RADIUS_PX) onPickPoint(best.index);
  }

  const inv = 1 / (scale || 1);
  const viewFt = size.w ? (size.w / scale) * layout.ftPerPx : DEFAULT_VIEW_FT;
  const nextPoint = plan.walkOrder[(walkIndex.get(current) ?? -1) + 1];

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden bg-black touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: layout.widthPx,
          height: layout.heightPx,
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        }}
      >
        {layout.image ? (
          <img
            src={layout.image}
            alt=""
            draggable={false}
            className="absolute top-0 left-0 w-full h-full"
          />
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        )}

        <svg
          className="absolute top-0 left-0 pointer-events-none"
          width={layout.widthPx}
          height={layout.heightPx}
        >
          <polygon
            points={layout.outline.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke="#22d3ee"
            strokeWidth={3 * inv}
          />
        </svg>

        {layout.points.map((p) => {
          const isSkipped = skipped.has(p.index);
          const isCurrent = p.index === current;
          const isNext = p.index === nextPoint;
          const value = values?.get(p.index);
          const done = value !== undefined || (walkIndex.get(p.index) ?? 0) < (walkIndex.get(current) ?? 0);

          return (
            <div
              key={p.index}
              className="absolute pointer-events-none flex items-center justify-center rounded-full font-bold"
              style={{
                left: p.x,
                top: p.y,
                width: isCurrent ? 52 : 26,
                height: isCurrent ? 52 : 26,
                marginLeft: isCurrent ? -26 : -13,
                marginTop: isCurrent ? -26 : -13,
                fontSize: isCurrent ? 20 : 12,
                transform: `scale(${inv})`,
                transformOrigin: 'center',
                background: isCurrent
                  ? '#facc15'
                  : isSkipped
                    ? 'transparent'
                    : done
                      ? 'rgba(34,197,94,0.85)'
                      : 'rgba(15,23,42,0.75)',
                border: isSkipped
                  ? '2px dashed rgba(255,255,255,0.5)'
                  : isNext
                    ? '3px solid #facc15'
                    : '2px solid rgba(255,255,255,0.55)',
                color: isCurrent ? '#1B3A5C' : '#ffffff',
                textDecoration: isSkipped ? 'line-through' : undefined,
              }}
            >
              {/* Always the point number, never the reading. The number is what
                  answers "which point am I on"; a marker reading "0.0" is a
                  value where an identity should be, and the keypad shows the
                  value anyway. */}
              {p.index}
            </div>
          );
        })}
      </div>

      {/* Scale readout and recentre, both out of the gesture's way. */}
      <div className="absolute bottom-2 left-2 text-[11px] text-white/70 bg-black/50 rounded px-2 py-1 pointer-events-none">
        {Math.round(viewFt)} ft across
        {layout.credit && <span className="ml-2 hidden sm:inline">{layout.credit}</span>}
        {!layout.image && <span className="ml-2">No aerial cached — showing the lot outline</span>}
      </div>

      {freeLook && (
        <button
          onClick={recentre}
          className="absolute bottom-2 right-2 bg-navy text-white text-sm font-semibold rounded-lg px-4 py-3 shadow-lg"
        >
          Back to point {current}
        </button>
      )}
    </div>
  );
}
