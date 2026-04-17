import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { getZonesForType } from '../data/zone-registry';

interface Props {
  open: boolean;
  assessmentId: string;
  currentItemScoreId: string;
  onClose: () => void;
  onSelect: (targetItemScoreId: string, targetZoneKey: string) => void | Promise<void>;
}

export default function PhotoMoveModal({
  open,
  assessmentId,
  currentItemScoreId,
  onClose,
  onSelect,
}: Props) {
  const [moving, setMoving] = useState(false);

  const assessment = useLiveQuery(
    () => db.assessments.get(assessmentId),
    [assessmentId],
  );

  const itemScores = useLiveQuery(
    () => db.item_scores.where('assessment_id').equals(assessmentId).toArray(),
    [assessmentId],
  );

  const zones = useMemo(
    () => (assessment ? getZonesForType(assessment.property_type) : []),
    [assessment?.property_type],
  );

  // Group items by zone in the zone order defined by the template
  const groupedByZone = useMemo(() => {
    if (!itemScores || zones.length === 0) return [];
    const byKey = new Map<string, typeof itemScores>();
    for (const score of itemScores) {
      const list = byKey.get(score.zone_key);
      if (list) list.push(score);
      else byKey.set(score.zone_key, [score]);
    }
    return zones
      .map((zone) => ({
        zone,
        items: (byKey.get(zone.key) ?? []).slice().sort((a, b) => a.item_order - b.item_order),
      }))
      .filter((group) => group.items.length > 0);
  }, [itemScores, zones]);

  async function handleSelect(targetId: string, targetZoneKey: string) {
    if (targetId === currentItemScoreId || moving) return;
    setMoving(true);
    try {
      await onSelect(targetId, targetZoneKey);
    } finally {
      setMoving(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[61] flex items-start justify-center overflow-y-auto py-8 px-4">
        <div
          className="bg-surface rounded-2xl shadow-xl border border-ink/10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="move-photo-title"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
            <h2 id="move-photo-title" className="text-lg font-bold text-ink">
              Move Photo to...
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-4 py-3 max-h-[calc(100vh-12rem)] overflow-y-auto space-y-3">
            {groupedByZone.length === 0 && (
              <p className="text-center text-ink/50 text-sm py-8">Loading items...</p>
            )}
            {groupedByZone.map(({ zone, items }) => (
              <div key={zone.key} className="border border-ink/10 rounded-xl overflow-hidden">
                <div className="px-4 py-2 bg-ink/5 text-sm font-semibold text-ink">
                  {zone.name}
                </div>
                <div className="divide-y divide-ink/5">
                  {items.map((item) => {
                    const isCurrent = item.id === currentItemScoreId;
                    const photoCount = item.photo_ids.length;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        disabled={isCurrent || moving}
                        onClick={() => handleSelect(item.id, item.zone_key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                          isCurrent
                            ? 'opacity-40 cursor-not-allowed bg-blue-medium/5'
                            : 'hover:bg-blue-medium/5 active:bg-blue-medium/10'
                        }`}
                      >
                        {/* Score badge */}
                        <span
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            item.is_na
                              ? 'bg-ink/10 text-ink/40'
                              : item.score === null
                                ? 'bg-ink/5 text-ink/30 border border-ink/10'
                                : item.score <= 2
                                  ? 'bg-red-500 text-white'
                                  : item.score === 3
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-green-600 text-white'
                          }`}
                        >
                          {item.is_na ? 'N/A' : item.score ?? '–'}
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ink leading-snug line-clamp-2">
                            {item.item_text}
                          </p>
                          {photoCount > 0 && (
                            <p className="text-xs text-ink/40 mt-0.5">
                              {photoCount} photo{photoCount !== 1 ? 's' : ''} attached
                            </p>
                          )}
                        </div>

                        {isCurrent && (
                          <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-ink/10 text-ink/40">
                            Current
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end px-6 py-3 border-t border-ink/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
