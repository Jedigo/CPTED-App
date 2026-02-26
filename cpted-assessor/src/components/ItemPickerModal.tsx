import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getItemContext,
  buildDescription,
  getPriority,
} from '../services/recommendations';
import type { ItemScore, PropertyType, Recommendation, RecommendationType } from '../types';

interface ItemPickerModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (items: Recommendation[]) => void;
  itemScores: ItemScore[];
  propertyType: PropertyType;
  type: RecommendationType;
  assessmentId: string;
  existingDescriptions: Set<string>;
  slotsAvailable: number;
}

const SCORE_BADGE_COLORS: Record<number, string> = {
  1: 'bg-red-600 text-white',
  2: 'bg-orange-500 text-white',
  3: 'bg-yellow-500 text-white',
  4: 'bg-blue-500 text-white',
  5: 'bg-green-600 text-white',
};

export default function ItemPickerModal({
  open,
  onClose,
  onConfirm,
  itemScores,
  propertyType,
  type,
  assessmentId,
  existingDescriptions,
  slotsAvailable,
}: ItemPickerModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Build scored items grouped by zone
  const contextItems = useMemo(
    () => getItemContext(itemScores, propertyType),
    [itemScores, propertyType],
  );

  // Check if an item's description is already in existing recommendations
  const isAlreadyAdded = useMemo(() => {
    const added = new Set<string>();
    for (const ctx of contextItems) {
      const desc = buildDescription(ctx, propertyType);
      if (existingDescriptions.has(desc)) {
        added.add(ctx.item.id);
      }
    }
    return added;
  }, [contextItems, existingDescriptions, propertyType]);

  // Group by zone, sorted by zone order
  const groupedByZone = useMemo(() => {
    const groups = new Map<string, { zoneName: string; zoneOrder: number; items: typeof contextItems }>();
    for (const ctx of contextItems) {
      if (!groups.has(ctx.item.zone_key)) {
        groups.set(ctx.item.zone_key, {
          zoneName: ctx.zoneName,
          zoneOrder: ctx.zoneOrder,
          items: [],
        });
      }
      groups.get(ctx.item.zone_key)!.items.push(ctx);
    }
    // Sort items within each zone by score ascending (worst first)
    for (const group of groups.values()) {
      group.items.sort((a, b) => (a.item.score ?? 5) - (b.item.score ?? 5));
    }
    return [...groups.entries()].sort((a, b) => a[1].zoneOrder - b[1].zoneOrder);
  }, [contextItems]);

  const atLimit = selected.size >= slotsAvailable;

  function toggleItem(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else if (!atLimit || prev.has(itemId)) {
        next.add(itemId);
      }
      return next;
    });
  }

  function toggleZone(zoneKey: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(zoneKey)) {
        next.delete(zoneKey);
      } else {
        next.add(zoneKey);
      }
      return next;
    });
  }

  function handleConfirm() {
    // Build recommendations from selected items, sorted worst-first
    const selectedContexts = contextItems
      .filter((ctx) => selected.has(ctx.item.id))
      .sort((a, b) => (a.item.score ?? 5) - (b.item.score ?? 5));

    const recs: Recommendation[] = selectedContexts.map((ctx, idx) => ({
      id: uuidv4(),
      assessment_id: assessmentId,
      order: idx + 1, // caller will adjust order numbers
      description: buildDescription(ctx, propertyType),
      priority: getPriority(ctx.item.score!),
      type,
    }));

    onConfirm(recs);
    setSelected(new Set());
  }

  function handleClose() {
    setSelected(new Set());
    onClose();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4">
        <div
          className="bg-surface rounded-2xl shadow-xl border border-ink/10 w-full max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-ink">Pick Checklist Items</h2>
              {selected.size > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-medium text-white">
                  {selected.size} selected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-ink/50 hover:text-ink hover:bg-ink/5 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4 max-h-[calc(100vh-16rem)] overflow-y-auto space-y-3">
            {slotsAvailable <= 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-3 rounded-xl text-sm">
                Maximum items reached. Remove existing items first.
              </div>
            )}

            {groupedByZone.map(([zoneKey, group]) => {
              const isCollapsed = collapsed.has(zoneKey);
              const zoneSelectedCount = group.items.filter((ctx) => selected.has(ctx.item.id)).length;

              return (
                <div key={zoneKey} className="border border-ink/10 rounded-xl overflow-hidden">
                  {/* Zone header */}
                  <button
                    type="button"
                    onClick={() => toggleZone(zoneKey)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-ink/5 hover:bg-ink/8 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink/40 transition-transform duration-200" style={{ display: 'inline-block', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {group.zoneName}
                      </span>
                      <span className="text-xs text-ink/40">
                        {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {zoneSelectedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-medium text-white">
                        {zoneSelectedCount}
                      </span>
                    )}
                  </button>

                  {/* Zone items */}
                  {!isCollapsed && (
                    <div className="divide-y divide-ink/5">
                      {group.items.map((ctx) => {
                        const alreadyAdded = isAlreadyAdded.has(ctx.item.id);
                        const isSelected = selected.has(ctx.item.id);
                        const disabled = alreadyAdded || (atLimit && !isSelected) || slotsAvailable <= 0;

                        return (
                          <button
                            key={ctx.item.id}
                            type="button"
                            onClick={() => !disabled && toggleItem(ctx.item.id)}
                            disabled={disabled}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                              alreadyAdded
                                ? 'opacity-40 cursor-not-allowed'
                                : disabled
                                  ? 'opacity-50 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-blue-medium/10'
                                    : 'hover:bg-ink/3'
                            }`}
                          >
                            {/* Score badge */}
                            <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${SCORE_BADGE_COLORS[ctx.item.score ?? 3] ?? 'bg-ink/20 text-ink/60'}`}>
                              {ctx.item.score}
                            </span>

                            {/* Item text + principle */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-ink line-clamp-2 leading-snug">
                                {ctx.item.item_text}
                              </p>
                              <p className="text-xs text-ink/40 mt-0.5">
                                {ctx.principleName}
                              </p>
                            </div>

                            {/* Status indicator */}
                            {alreadyAdded ? (
                              <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium bg-ink/10 text-ink/40">
                                Added
                              </span>
                            ) : isSelected ? (
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-medium flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </span>
                            ) : (
                              <span className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-ink/20" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {groupedByZone.length === 0 && (
              <p className="text-ink/40 text-sm italic py-4 text-center">
                No scored items available. Score some checklist items first.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-ink/10">
            <p className="text-xs text-ink/40">
              {slotsAvailable > 0
                ? `${slotsAvailable - selected.size} slot${slotsAvailable - selected.size !== 1 ? 's' : ''} remaining`
                : 'No slots available'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-ink/70 hover:text-ink hover:bg-ink/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={selected.size === 0}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-navy text-white hover:bg-navy-light active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add {selected.size} Item{selected.size !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
