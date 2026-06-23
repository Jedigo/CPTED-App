import type { SchoolRating } from '../types';

interface RatingButtonsProps {
  score: number | SchoolRating | null;
  onSelect: (rating: SchoolRating) => void;
}

// School Yes/No/UTO checklist rating. Mirrors the printed Volusia school CPTED
// survey: each statement is marked Yes (compliant), No (deficient), or UTO
// (Unable To Observe). Replaces the 1-5 ScoreButtons for school property types.
const RATINGS: {
  value: SchoolRating;
  label: string;
  activeBg: string;
  border: string;
  text: string;
}[] = [
  {
    value: 'yes',
    label: 'Yes',
    activeBg: 'bg-green-600 border-green-600',
    border: 'border-green-600',
    text: 'text-green-700',
  },
  {
    value: 'no',
    label: 'No',
    activeBg: 'bg-red-600 border-red-600',
    border: 'border-red-600',
    text: 'text-red-700',
  },
  {
    value: 'uto',
    label: 'UTO',
    activeBg: 'bg-ink/50 border-ink/50',
    border: 'border-ink/30',
    text: 'text-ink/50',
  },
];

export default function RatingButtons({ score, onSelect }: RatingButtonsProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {RATINGS.map(({ value, label, activeBg, border, text }) => {
        const isActive = score === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-label={value === 'uto' ? 'Unable to observe' : label}
            aria-pressed={isActive}
            className={`px-4 h-11 min-w-[3rem] rounded-lg font-bold text-sm border-2 transition-all active:scale-90 ${
              isActive
                ? `${activeBg} text-white`
                : `bg-surface ${border} ${text} hover:bg-ink/5`
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
