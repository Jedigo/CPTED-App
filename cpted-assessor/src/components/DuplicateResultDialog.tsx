import { useEffect } from 'react';
import type { DuplicateResult } from '../services/duplicate';

interface Props {
  open: boolean;
  result: DuplicateResult | null;
  targetTypeLabel: string;
  onClose: () => void;
  onOpenNew: () => void;
}

export default function DuplicateResultDialog({
  open,
  result,
  targetTypeLabel,
  onClose,
  onOpenNew,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open || !result) return null;

  const hasRehomed = result.rehomedDetails.length > 0;
  const hasDropped = result.droppedItemDetails.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dup-result-title"
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-surface rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] flex flex-col">
        <div className="p-6 pb-4">
          <h3 id="dup-result-title" className="text-lg font-bold text-ink mb-1">
            Duplicated as {targetTypeLabel}
          </h3>
          <p className="text-sm text-ink/60">
            The original assessment is unchanged. Review the new copy before marking it complete.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-700">{result.itemsCarried}</div>
              <div className="text-xs text-green-700/80 font-medium">Scores carried over</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-700">{result.photosCarried}</div>
              <div className="text-xs text-green-700/80 font-medium">Photos carried (exact match)</div>
            </div>
            {result.photosRehomed > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 col-span-2">
                <div className="text-2xl font-bold text-amber-700">{result.photosRehomed}</div>
                <div className="text-xs text-amber-700/80 font-medium">
                  Photos re-homed — original item not in new template, but photo preserved. Review and reattach as needed.
                </div>
              </div>
            )}
            {result.itemsDropped > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 col-span-2">
                <div className="text-2xl font-bold text-amber-700">{result.itemsDropped}</div>
                <div className="text-xs text-amber-700/80 font-medium">
                  Scored items with no equivalent in the new template (scores lost — photos from these items were re-homed)
                </div>
              </div>
            )}
          </div>

          {/* Re-homed photos */}
          {hasRehomed && (
            <details className="bg-ink/5 rounded-xl p-3 text-sm" open>
              <summary className="cursor-pointer font-semibold text-ink">
                Re-homed photos ({result.rehomedDetails.length})
              </summary>
              <ul className="mt-2 space-y-2 text-xs text-ink/70">
                {result.rehomedDetails.map((r, i) => (
                  <li key={i} className="border-l-2 border-amber-400 pl-2">
                    <div className="text-ink/50">From: {r.fromZone}</div>
                    <div className="italic">{r.fromItem}</div>
                    <div className="text-amber-700 font-medium">→ landed in: {r.toZone}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {/* Dropped items */}
          {hasDropped && (
            <details className="bg-ink/5 rounded-xl p-3 text-sm">
              <summary className="cursor-pointer font-semibold text-ink">
                Items without a match ({result.droppedItemDetails.length})
              </summary>
              <ul className="mt-2 space-y-1 text-xs text-ink/70">
                {result.droppedItemDetails.map((d, i) => (
                  <li key={i} className="border-l-2 border-ink/20 pl-2">
                    <div className="text-ink/50">{d.fromZone}</div>
                    <div className="italic">{d.fromItem}</div>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="p-6 pt-4 border-t border-ink/10 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border border-ink/20 text-ink hover:bg-blue-pale active:scale-95 transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onOpenNew}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm bg-navy hover:bg-navy-light active:scale-95 text-white transition-all"
          >
            Open New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}
