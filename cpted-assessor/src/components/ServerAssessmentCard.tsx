import { getScoreColor, getScoreLabel } from '../services/scoring';
import type { ServerAssessmentSummary, PullProgress } from '../services/sync';

interface ServerAssessmentCardProps {
  assessment: ServerAssessmentSummary;
  isLocal: boolean;
  pulling: boolean;
  pullProgress: PullProgress | null;
  disabled: boolean;
  onPull: (id: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ServerAssessmentCard({
  assessment,
  isLocal,
  pulling,
  pullProgress,
  disabled,
  onPull,
}: ServerAssessmentCardProps) {
  const progressPct =
    pullProgress && pullProgress.total > 0
      ? Math.round((pullProgress.current / pullProgress.total) * 100)
      : 0;

  return (
    <div className="bg-surface rounded-xl border border-ink/10 shadow-sm">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Property info */}
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-ink truncate">
              {assessment.address}
            </h3>
            <p className="text-sm text-ink/50 mt-0.5">
              {assessment.city}, {assessment.state} {assessment.zip}
            </p>
            <div className="flex items-center gap-3 mt-2 text-sm text-ink/40">
              <span>{assessment.assessor_name}</span>
              <span>&middot;</span>
              <span>{formatDate(assessment.date_of_assessment || assessment.created_at)}</span>
            </div>
          </div>

          {/* Right: Score */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {isLocal && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Downloaded
              </span>
            )}
            {assessment.overall_score !== null ? (
              <div className="text-right">
                <span className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}>
                  {assessment.overall_score.toFixed(1)}
                </span>
                <span className="text-xs text-ink/30 ml-0.5">/5</span>
                <p className={`text-xs font-medium ${getScoreColor(assessment.overall_score)}`}>
                  {getScoreLabel(assessment.overall_score)}
                </p>
              </div>
            ) : (
              <span className="text-sm text-ink/25">No score</span>
            )}
          </div>
        </div>

        {/* Progress bar during pull */}
        {pulling && pullProgress && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-600">{pullProgress.message}</span>
              {pullProgress.phase === 'photos' && (
                <span className="text-xs text-ink/30">{progressPct}%</span>
              )}
            </div>
            <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 bg-blue-medium ${
                  pullProgress.phase === 'metadata' ? 'animate-pulse' : ''
                }`}
                style={{
                  width: pullProgress.phase === 'metadata' ? '30%' : `${progressPct}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer with action button */}
      <div className="border-t border-ink/5 px-5 py-2.5 flex items-center justify-end">
        <button
          type="button"
          onClick={() => onPull(assessment.id)}
          disabled={disabled || pulling}
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-all ${
            pulling
              ? 'bg-blue-50 text-blue-400 cursor-wait'
              : disabled
                ? 'bg-ink/5 text-ink/25 cursor-not-allowed'
                : isLocal
                  ? 'text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 active:scale-95'
                  : 'text-white bg-navy hover:bg-navy-light active:scale-95'
          }`}
          aria-label={
            isLocal
              ? `Update assessment for ${assessment.address}`
              : `Download assessment for ${assessment.address}`
          }
        >
          {pulling ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              Downloading...
            </span>
          ) : isLocal ? (
            'Update'
          ) : (
            'Download'
          )}
        </button>
      </div>
    </div>
  );
}
