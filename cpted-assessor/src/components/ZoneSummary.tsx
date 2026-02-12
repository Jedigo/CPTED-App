import type { ItemScore } from '../types';

interface ZoneSummaryProps {
  itemScores: ItemScore[];
}

function getScoreColor(score: number): string {
  if (score < 2) return 'text-score-critical';
  if (score < 3) return 'text-score-deficient';
  if (score < 4) return 'text-score-adequate';
  if (score < 5) return 'text-score-good';
  return 'text-score-excellent';
}

export default function ZoneSummary({ itemScores }: ZoneSummaryProps) {
  const scoredItems = itemScores.filter((s) => s.score !== null && !s.is_na);
  const naCount = itemScores.filter((s) => s.is_na).length;
  const total = itemScores.length;
  const addressedCount = scoredItems.length + naCount;

  const avg =
    scoredItems.length > 0
      ? scoredItems.reduce((sum, s) => sum + s.score!, 0) / scoredItems.length
      : null;

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
            {addressedCount}
            <span className="text-sm font-normal text-navy/40 ml-1">/ {total}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-navy/50 mb-0.5">N/A Items</p>
          <p className="text-xl font-semibold text-navy/50">{naCount}</p>
        </div>
      </div>
    </div>
  );
}
