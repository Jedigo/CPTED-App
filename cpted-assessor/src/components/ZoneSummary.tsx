import type { ItemScore } from '../types';
import {
  calculateZoneAverage,
  getCompletionCounts,
  getScoreColor,
} from '../services/scoring';

interface ZoneSummaryProps {
  itemScores: ItemScore[];
}

export default function ZoneSummary({ itemScores }: ZoneSummaryProps) {
  const { addressed, total, na } = getCompletionCounts(itemScores);
  const avg = calculateZoneAverage(itemScores);

  return (
    <div className="bg-surface rounded-xl border border-ink/10 shadow-sm p-5 mt-6">
      <h3 className="text-sm font-bold text-ink/70 uppercase tracking-wide mb-3">
        Zone Summary
      </h3>
      <div className="flex items-center gap-8">
        <div>
          <p className="text-xs text-ink/50 mb-0.5">Average Score</p>
          <p
            className={`text-2xl font-bold ${avg !== null ? getScoreColor(avg) : 'text-ink/25'}`}
          >
            {avg !== null ? avg.toFixed(1) : '—'}
            <span className="text-sm font-normal text-ink/40 ml-1">/ 5.0</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-ink/50 mb-0.5">Addressed</p>
          <p className="text-xl font-semibold text-ink">
            {addressed}
            <span className="text-sm font-normal text-ink/40 ml-1">/ {total}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-ink/50 mb-0.5">N/A Items</p>
          <p className="text-xl font-semibold text-ink/50">{na}</p>
        </div>
      </div>
    </div>
  );
}
