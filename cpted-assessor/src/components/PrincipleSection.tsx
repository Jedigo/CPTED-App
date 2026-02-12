import { useState } from 'react';
import type { ZonePrinciple, ItemScore } from '../types';
import ChecklistItem from './ChecklistItem';

interface PrincipleSectionProps {
  principle: ZonePrinciple;
  itemScores: ItemScore[];
  onScoreChange: (itemId: string, score: number | null, isNa: boolean) => void;
  onNotesChange: (itemId: string, notes: string) => void;
}

export default function PrincipleSection({
  principle,
  itemScores,
  onScoreChange,
  onNotesChange,
}: PrincipleSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const addressed = itemScores.filter(
    (s) => s.score !== null || s.is_na,
  ).length;
  const total = itemScores.length;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-blue-light/50 rounded-lg hover:bg-blue-light transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-navy/50 text-xs w-4">
            {expanded ? '▼' : '▶'}
          </span>
          <span className="text-navy font-semibold text-sm">
            {principle.name}
          </span>
        </div>
        <span
          className={`text-xs font-medium ${
            addressed === total && total > 0
              ? 'text-score-good'
              : 'text-navy/50'
          }`}
        >
          {addressed}/{total} scored
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-2">
          {itemScores.map((itemScore) => (
            <ChecklistItem
              key={itemScore.id}
              itemScore={itemScore}
              onScoreChange={(score, isNa) =>
                onScoreChange(itemScore.id, score, isNa)
              }
              onNotesChange={(notes) => onNotesChange(itemScore.id, notes)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
