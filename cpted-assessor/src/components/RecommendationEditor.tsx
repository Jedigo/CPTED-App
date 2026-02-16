import { v4 as uuidv4 } from 'uuid';
import type { Recommendation, Priority, RecommendationType } from '../types';

interface RecommendationEditorProps {
  items: Recommendation[];
  type: RecommendationType;
  assessmentId: string;
  maxItems?: number;
  onChange: (items: Recommendation[]) => void;
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

const UNSELECTED = 'bg-white text-navy/50 border-navy/20 hover:border-navy/40';

export default function RecommendationEditor({
  items,
  type,
  assessmentId,
  maxItems,
  onChange,
}: RecommendationEditorProps) {
  const label = type === 'recommendation' ? 'Recommendation' : 'Quick Win';
  const atMax = maxItems !== undefined && items.length >= maxItems;

  function handleAdd() {
    if (atMax) return;
    const newItem: Recommendation = {
      id: uuidv4(),
      assessment_id: assessmentId,
      order: items.length + 1,
      description: '',
      priority: 'medium',
      timeline: '',
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

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-navy/40 text-sm italic py-2">
          No {label.toLowerCase()}s yet. Tap &ldquo;+ Add&rdquo; to begin.
        </p>
      )}

      {items.map((item, index) => (
        <div
          key={item.id}
          className="bg-white rounded-lg border border-navy/10 p-4 space-y-3"
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
                className="w-11 h-11 flex items-center justify-center rounded-lg text-navy/40 hover:text-navy hover:bg-navy/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                aria-label="Move up"
              >
                &#x25B2;
              </button>
              <button
                type="button"
                onClick={() => handleMove(index, 1)}
                disabled={index === items.length - 1}
                className="w-11 h-11 flex items-center justify-center rounded-lg text-navy/40 hover:text-navy hover:bg-navy/5 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
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
            rows={2}
            className="w-full rounded-lg border border-navy/20 px-3 py-2 text-sm bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30 resize-y"
          />

          {/* Priority + Timeline row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-navy/50 uppercase tracking-wide">
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

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs font-bold text-navy/50 uppercase tracking-wide">
                Timeline
              </span>
              <input
                type="text"
                value={item.timeline}
                onChange={(e) =>
                  handleUpdate(index, { timeline: e.target.value })
                }
                placeholder="e.g. Immediate, 1-3 months"
                className="w-48 rounded-lg border border-navy/20 px-3 h-11 text-sm bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={atMax}
        className={`w-full py-3 rounded-lg border-2 border-dashed text-sm font-semibold transition-colors ${
          atMax
            ? 'border-navy/10 text-navy/25 cursor-not-allowed'
            : 'border-navy/20 text-navy/50 hover:border-blue-medium hover:text-blue-medium'
        }`}
      >
        + Add {label}
        {maxItems !== undefined && ` (${items.length}/${maxItems})`}
      </button>
    </div>
  );
}
