interface ScoreButtonsProps {
  score: number | null;
  isNa: boolean;
  onSelect: (score: number | null, isNa: boolean) => void;
}

const SCORES = [
  { value: 1, label: '1', bg: 'bg-score-critical', border: 'border-score-critical', text: 'text-score-critical' },
  { value: 2, label: '2', bg: 'bg-score-deficient', border: 'border-score-deficient', text: 'text-score-deficient' },
  { value: 3, label: '3', bg: 'bg-score-adequate', border: 'border-score-adequate', text: 'text-score-adequate' },
  { value: 4, label: '4', bg: 'bg-score-good', border: 'border-score-good', text: 'text-score-good' },
  { value: 5, label: '5', bg: 'bg-score-excellent', border: 'border-score-excellent', text: 'text-score-excellent' },
] as const;

export default function ScoreButtons({ score, isNa, onSelect }: ScoreButtonsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {SCORES.map(({ value, label, bg, border, text }) => {
        const isActive = score === value && !isNa;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(isActive ? null : value, false)}
            aria-label={`Score ${value}`}
            aria-pressed={isActive}
            className={`w-11 h-11 rounded-lg font-bold text-base border-2 transition-all active:scale-90 ${
              isActive
                ? `${bg} text-white ${border}`
                : `bg-white ${border} ${text} hover:bg-gray-50`
            }`}
          >
            {label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={() => onSelect(null, !isNa)}
        aria-label="Not applicable"
        aria-pressed={isNa}
        className={`px-3 h-11 rounded-lg font-bold text-sm border-2 transition-all active:scale-90 ${
          isNa
            ? 'bg-gray-500 text-white border-gray-500'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
        }`}
      >
        N/A
      </button>
    </div>
  );
}
