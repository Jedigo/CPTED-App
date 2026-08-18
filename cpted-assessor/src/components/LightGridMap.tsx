import { cellToPoint } from '../services/light-grid';
import { ILLUMINANCE_BANDS as BANDS, bandFor } from '../services/light-stats';

/**
 * The lot grid, in two modes.
 *
 *  - "plan"    — before the walk: tap a cell to mark it obstructed (islands,
 *                curbs, structures). Do this at a desk against satellite
 *                imagery, not at midnight.
 *  - "results" — after import: a heat map. A table of 84 numbers means nothing
 *                to a school district; a black patch at one end of the lot is
 *                understood instantly.
 *
 * Row 0 renders at the top and point 1 sits at the top-left, matching the
 * serpentine walk order the assessor follows.
 */

interface LightGridMapProps {
  cols: number;
  rows: number;
  spacingLengthFt: number;
  spacingWidthFt: number;
  /** Lot dimensions, shown on the rails so the map reads as the real lot. */
  lengthFt: number;
  widthFt: number;
  skipped: Set<number>;
  /** point_index -> footcandles. Only used in results mode. */
  values?: Map<number, number>;
  mode: 'plan' | 'results';
  onToggleSkip?: (pointIndex: number) => void;
}

export default function LightGridMap({
  cols,
  rows,
  spacingLengthFt,
  spacingWidthFt,
  lengthFt,
  widthFt,
  skipped,
  values,
  mode,
  onToggleSkip,
}: LightGridMapProps) {
  if (cols <= 0 || rows <= 0) return null;

  const cells = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const point = cellToPoint(col, row, cols);
      const isSkipped = skipped.has(point);
      const value = values?.get(point);

      let style: React.CSSProperties = {};
      let content: React.ReactNode = point;

      if (isSkipped) {
        style = {
          background:
            'repeating-linear-gradient(45deg, var(--color-blue-light) 0 4px, transparent 4px 8px)',
        };
        content = <span className="opacity-40">{point}</span>;
      } else if (mode === 'results') {
        if (value === undefined) {
          content = <span className="opacity-40">{point}</span>;
        } else {
          const band = bandFor(value);
          style = { background: band.bg, color: band.fg };
          content = (
            <span className="flex flex-col leading-none items-center">
              <span className="font-bold text-[11px]">{value.toFixed(1)}</span>
              <span className="text-[8px] opacity-70">{point}</span>
            </span>
          );
        }
      }

      const interactive = mode === 'plan' && !!onToggleSkip;

      cells.push(
        <button
          key={point}
          type="button"
          disabled={!interactive}
          onClick={interactive ? () => onToggleSkip(point) : undefined}
          style={style}
          title={
            isSkipped
              ? `Point ${point} — obstructed, not read`
              : value !== undefined
                ? `Point ${point} — ${value.toFixed(1)} fc`
                : `Point ${point}`
          }
          className={`aspect-square min-h-0 flex items-center justify-center rounded text-[10px] font-semibold border transition-colors ${
            isSkipped
              ? 'border-ink/20 text-ink'
              : mode === 'results' && value !== undefined
                ? 'border-black/10'
                : 'border-ink/15 bg-surface text-ink/70'
          } ${interactive ? 'hover:border-navy hover:bg-blue-pale active:scale-95 cursor-pointer' : ''}`}
          aria-label={`Point ${point}${isSkipped ? ', obstructed' : ''}`}
          aria-pressed={interactive ? isSkipped : undefined}
        >
          {content}
        </button>,
      );
    }
  }

  return (
    <div>
      {/* Dimension rails so the map reads as the lot, not an abstract table */}
      <div className="text-[10px] font-semibold uppercase tracking-wide text-ink/50 text-center mb-1">
        {Math.round(lengthFt)} ft &mdash; {cols} points across, every {spacingLengthFt} ft
      </div>
      <div className="flex gap-2 items-stretch">
        <div className="flex items-center">
          <span
            className="text-[10px] font-semibold uppercase tracking-wide text-ink/50 whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {Math.round(widthFt)} ft &middot; {rows} points, every {spacingWidthFt} ft
          </span>
        </div>
        <div
          className="grid gap-1 flex-1 min-w-0"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {cells}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 items-center text-[10px] text-ink/60">
        {mode === 'results' ? (
          <>
            <span className="font-semibold uppercase tracking-wide">Footcandles</span>
            {BANDS.map((b) => (
              <span key={b.label} className="inline-flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-sm border border-black/10 inline-block"
                  style={{ background: b.bg }}
                />
                {b.label}
              </span>
            ))}
          </>
        ) : (
          <span>
            Tap any point that can&rsquo;t be stood on &mdash; landscape islands, curbs,
            structures. Skipped points are excluded from the walk and from the statistics.
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm border border-ink/20 inline-block"
            style={{
              background:
                'repeating-linear-gradient(45deg, var(--color-blue-light) 0 3px, transparent 3px 6px)',
            }}
          />
          obstructed
        </span>
      </div>
    </div>
  );
}
