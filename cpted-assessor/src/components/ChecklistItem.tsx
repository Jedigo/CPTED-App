import { useState } from 'react';
import type { ItemScore } from '../types';
import ScoreButtons from './ScoreButtons';

interface ChecklistItemProps {
  itemScore: ItemScore;
  onScoreChange: (score: number | null, isNa: boolean) => void;
  onNotesChange: (notes: string) => void;
}

export default function ChecklistItem({
  itemScore,
  onScoreChange,
  onNotesChange,
}: ChecklistItemProps) {
  const [showNote, setShowNote] = useState(!!itemScore.notes);
  const [noteText, setNoteText] = useState(itemScore.notes);

  const isScored = itemScore.score !== null;
  const isNa = itemScore.is_na;

  return (
    <div
      className={`p-4 rounded-lg border transition-colors ${
        isNa
          ? 'bg-gray-50 border-gray-200 opacity-60'
          : isScored
            ? 'border-l-4 border-l-score-good bg-white border-t border-r border-b border-t-navy/10 border-r-navy/10 border-b-navy/10'
            : 'bg-white border-navy/10'
      }`}
    >
      <p
        className={`text-sm leading-relaxed mb-3 ${isNa ? 'text-navy/50' : 'text-navy'}`}
      >
        {itemScore.item_text}
      </p>

      <div className="flex items-center gap-2 flex-wrap">
        <ScoreButtons
          score={itemScore.score}
          isNa={itemScore.is_na}
          onSelect={onScoreChange}
        />

        <button
          type="button"
          onClick={() => setShowNote(!showNote)}
          className={`px-3 h-11 rounded-lg text-sm font-medium border-2 transition-colors ${
            itemScore.notes
              ? 'bg-blue-medium text-white border-blue-medium'
              : 'bg-white border-navy/20 text-navy/50 hover:border-navy/40'
          }`}
        >
          Note
        </button>

        <button
          type="button"
          disabled
          className="px-3 h-11 rounded-lg text-sm font-medium border-2 border-navy/10 text-navy/25 bg-gray-50 cursor-not-allowed"
          title="Photo capture — coming in Step 6"
        >
          Photo
        </button>
      </div>

      {showNote && (
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          onBlur={() => onNotesChange(noteText)}
          placeholder="Add a note..."
          rows={2}
          className="mt-3 w-full rounded-lg border border-navy/20 px-3 py-2 text-sm bg-white outline-none focus:border-blue-medium focus:ring-2 focus:ring-blue-medium/30 resize-y"
        />
      )}
    </div>
  );
}
