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
    <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-5 mt-6">
      <h3 className="text-sm font-bold text-navy/70 uppercase tracking-wide mb-3">
        Zone Summary
      </h3>
      <div className="flex items-center gap-8">
        <div>
          <p className="text-xs text-navy/50 mb-0.5">Average Score</p>
          <p
            className={`text-2xl font-bold ${avg !== null ? getScoreColor(avg) : 'text-navy/25'}`}
          >
            {avg !== null ? avg.toFixed(1) : '—'}
            <span className="text-sm font-normal text-navy/40 ml-1">/ 5.0</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-navy/50 mb-0.5">Addressed</p>
          <p className="text-xl font-semibold text-navy">
            {addressed}
            <span className="text-sm font-normal text-navy/40 ml-1">/ {total}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-navy/50 mb-0.5">N/A Items</p>
          <p className="text-xl font-semibold text-navy/50">{na}</p>
        </div>
      </div>
    </div>
  );
}
