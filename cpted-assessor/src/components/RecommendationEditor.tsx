import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Recommendation, Priority, RecommendationType, ItemScore, PropertyType } from '../types';
import ItemPickerModal from './ItemPickerModal';

interface RecommendationEditorProps {
  items: Recommendation[];
  type: RecommendationType;
  assessmentId: string;
  maxItems?: number;
  onChange: (items: Recommendation[]) => void;
  itemScores?: ItemScore[];
  propertyType?: PropertyType;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; colors: string }[] = [
  {
    value: 'high',
    label: 'High',
    colors: 'bg-red-600 text-white border-red-600',
  },
  {
    value: 'medium',
    label: 'Med',
    colors: 'bg-amber-500 text-white border-amber-500',
  },
  {
    value: 'low',
    label: 'Low',
    colors: 'bg-green-600 text-white border-green-600',
  },
];

const UNSELECTED = 'bg-surface text-ink/50 border-ink/20 hover:border-ink/40';

export default function RecommendationEditor({
  items,
  type,
  assessmentId,
  maxItems,
  onChange,
  itemScores,
  propertyType,
}: RecommendationEditorProps) {
  const label = type === 'recommendation' ? 'Recommendation' : 'Quick Win';
  const atMax = maxItems !== undefined && items.length >= maxItems;

  const [pickerOpen, setPickerOpen] = useState(false);

  // Build set of existing descriptions for duplicate detection
  const existingDescriptions = useMemo(
    () => new Set(items.map((item) => item.description)),
    [items],
  );

  const slotsAvailable = maxItems !== undefined ? maxItems - items.length : 99;

  function handleAdd() {
    if (atMax) return;
    const newItem: Recommendation = {
      id: uuidv4(),
      assessment_id: assessmentId,
      order: items.length + 1,
      description: '',
      priority: 'medium',
      type,
    };
    onChange([...items, newItem]);
  }

  function handleUpdate(index: number, patch: Partial<Recommendation>) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, ...patch } : item,
    );
    onChange(updated);
  }

  function handleDelete(index: number) {
    const updated = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i + 1 }));
    onChange(updated);
  }

  function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const updated = [...items];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    onChange(updated.map((item, i) => ({ ...item, order: i + 1 })));
  }

  function handlePickerConfirm(picked: Recommendation[]) {
    // Merge picked items, re-number orders
    const merged = [...items, ...picked].map((item, i) => ({
      ...item,
      order: i + 1,
    }));
    onChange(merged);
    setPickerOpen(false);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-ink/40 text-sm italic py-2">
          No {label.toLowerCase()}s yet. Tap &ldquo;+ Add&rdquo; or &ldquo;Pick from Items&rdquo; to begin.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="bg-surface rounded-lg border border-ink/10 p-4 space-y-3"
        >
          {/* Header row: number badge + move/delete */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy text-white text-xs font-bold">
              {index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleMove(index, -1)}
                disabled={index === 0}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                aria-label="Move up"
              >
                &#x25B2;
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 1)}
                disabled={index === items.length - 1}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                aria-label="Move down"
              >
                &#x25BC;
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete"
              >
                &#x2715;
              </button>
            </div>
          </div>

          {/* Description */}
          <textarea
            value={item.description}
            onChange={(e) =>
              handleUpdate(index, { description: e.target.value })
            }
            placeholder={
              type === 'recommendation'
                ? 'Describe the recommendation...'
                : 'Describe the quick win...'
            }
            rows={4}
            className="w-full rounded-lg border border-ink/20 px-3 py-2 text-sm bg-surface outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30 resize-y"
          />

          {/* Priority + Timeline row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-ink/50 uppercase tracking-wide">
              Priority
            </span>
            <div className="flex gap-1">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleUpdate(index, { priority: opt.value })}
                  className={`px-4 h-11 rounded-lg text-sm font-semibold border-2 transition-colors ${
                    item.priority === opt.value ? opt.colors : UNSELECTED
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAdd}
          disabled={atMax}
          className={`flex-1 py-3 rounded-lg border-2 border-dashed text-sm font-semibold transition-colors ${
            atMax
              ? 'border-ink/10 text-ink/25 cursor-not-allowed'
              : 'border-ink/20 text-ink/50 hover:border-blue-medium hover:text-blue-medium'
          }`}
        >
          + Add {label}
          {maxItems !== undefined && ` (${items.length}/${maxItems})`}
        </button>

        {itemScores && itemScores.length > 0 && propertyType && !atMax && (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="flex-1 py-3 rounded-lg border-2 border-dashed text-sm font-semibold border-blue-medium/30 text-blue-medium hover:border-blue-medium hover:bg-blue-medium/5 transition-colors"
          >
            Pick from Items
          </button>
        )}
      </div>

      {/* Item picker modal */}
      {itemScores && propertyType && (
        <ItemPickerModal
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          onConfirm={handlePickerConfirm}
          itemScores={itemScores}
          propertyType={propertyType}
          type={type}
          assessmentId={assessmentId}
          existingDescriptions={existingDescriptions}
          slotsAvailable={slotsAvailable}
        />
      )}
    </div>
  );
}
