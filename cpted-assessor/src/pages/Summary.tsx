import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { ZONES } from '../data/zones';
import {
  persistAllScores,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  getCompletionCounts,
} from '../services/scoring';

const LIABILITY_WAIVER = `This CPTED assessment is provided solely for informational and preventative purposes. The observations and recommendations included in this report are offered as voluntary guidance and do not constitute mandated safety requirements, building code standards, or legal directives. The implementation of any recommendations is entirely at the discretion of the property owner and should be undertaken only with appropriate professional consultation when necessary. The Volusia Sheriff's Office, its employees, agents, and representatives make no warranties, guarantees, or assurances regarding the effectiveness of any recommended security measures. Crime prevention strategies reduce risk but cannot completely eliminate the possibility of criminal activity. By accepting this report, the property owner acknowledges that the Volusia Sheriff's Office shall not be held liable for any actions taken or not taken based on the information provided, nor for any damages, losses, or incidents that may occur on or near the property following this assessment.`;

export default function Summary() {
  const { id } = useParams<{ id: string }>();

  const assessment = useLiveQuery(
    () => (id ? db.assessments.get(id) : undefined),
    [id],
  );

  const zoneScores = useLiveQuery(
    () =>
      id
        ? db.zone_scores
            .where('assessment_id')
            .equals(id)
            .sortBy('zone_order')
        : [],
    [id],
  );

  const itemScores = useLiveQuery(
    () =>
      id ? db.item_scores.where('assessment_id').equals(id).toArray() : [],
    [id],
  );

  // Recalculate all scores on mount for fresh data
  useEffect(() => {
    if (id) {
      persistAllScores(id);
    }
  }, [id]);

  async function handleMarkComplete() {
    if (!id) return;
    await db.assessments.update(id, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    });
  }

  async function handleReopen() {
    if (!id) return;
    await db.assessments.update(id, {
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    });
  }

  // Loading state
  if (
    assessment === undefined ||
    zoneScores === undefined ||
    itemScores === undefined
  ) {
    return (
      <div className="flex items-center justify-center h-screen bg-blue-pale">
        <p className="text-navy/50 text-lg">Loading summary...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-4">
        <p className="text-navy/50 text-lg">Assessment not found</p>
        <Link
          to="/"
          className="text-blue-medium hover:underline font-medium"
        >
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  // Build item counts per zone for the table
  const itemCountsByZone = new Map<
    string,
    { scored: number; total: number }
  >();
  if (itemScores) {
    for (const zone of ZONES) {
      const zoneItems = itemScores.filter((s) => s.zone_key === zone.key);
      const { scored, total } = getCompletionCounts(zoneItems);
      itemCountsByZone.set(zone.key, { scored, total });
    }
  }

  const overall = assessment.overall_score;
  const isComplete = assessment.status === 'completed';

  return (
    <div className="min-h-screen bg-blue-pale">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to={`/assessment/${id}`}
            className="text-white/70 hover:text-white text-sm font-medium flex-shrink-0"
          >
            &larr; Back to Assessment
          </Link>
          <h1 className="text-lg font-bold truncate">
            {assessment.address}, {assessment.city}
          </h1>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
            isComplete
              ? 'bg-green-400/20 text-green-300'
              : 'bg-yellow-400/20 text-yellow-300'
          }`}
        >
          {isComplete ? 'Completed' : 'In Progress'}
        </span>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Overall Score Card */}
        <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-8 text-center">
          <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide mb-2">
            Overall Score
          </h2>
          {overall !== null ? (
            <>
              <p className={`text-5xl font-bold ${getScoreColor(overall)}`}>
                {overall.toFixed(1)}
              </p>
              <p className="text-sm text-navy/40 mt-1">/ 5.0</p>
              <span
                className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold ${getScoreBgColor(overall)} ${getScoreColor(overall)}`}
              >
                {getScoreLabel(overall)}
              </span>
            </>
          ) : (
            <>
              <p className="text-5xl font-bold text-navy/20">&mdash;</p>
              <p className="text-sm text-navy/40 mt-1">No scores yet</p>
            </>
          )}
        </div>

        {/* Zone Scores Table */}
        <div className="bg-white rounded-xl border border-navy/10 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-navy/10">
            <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide">
              Zone Scores
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold text-navy/50 uppercase tracking-wide">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Zone</th>
                <th className="px-6 py-3 text-center">Avg Score</th>
                <th className="px-6 py-3 text-center">Items Scored</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {(zoneScores || []).map((zs) => {
                const counts = itemCountsByZone.get(zs.zone_key);
                return (
                  <tr
                    key={zs.id}
                    className={
                      zs.average_score !== null
                        ? getScoreBgColor(zs.average_score)
                        : ''
                    }
                  >
                    <td className="px-6 py-3 text-sm text-navy/50 font-mono">
                      {zs.zone_order}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-navy">
                      {zs.zone_name}
                    </td>
                    <td className="px-6 py-3 text-center">
                      {zs.average_score !== null ? (
                        <span
                          className={`text-sm font-bold ${getScoreColor(zs.average_score)}`}
                        >
                          {zs.average_score.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-navy/25">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center text-sm text-navy/60">
                      {counts
                        ? `${counts.scored} / ${counts.total}`
                        : '—'}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full ${
                          zs.completed
                            ? 'bg-green-400'
                            : counts && counts.scored > 0
                              ? 'bg-yellow-400'
                              : 'bg-navy/15'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Recommendations Placeholder */}
        <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-6">
          <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide mb-3">
            Recommendations
          </h2>
          <p className="text-navy/40 text-sm italic">
            Recommendations and Quick Wins — coming in Step 8.
          </p>
        </div>

        {/* Liability Waiver */}
        <div className="bg-white rounded-xl border-2 border-navy/20 shadow-sm p-6">
          <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide mb-3">
            Liability Waiver
          </h2>
          <p className="text-sm text-navy/70 leading-relaxed whitespace-pre-line">
            {LIABILITY_WAIVER}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="button"
            disabled
            className="flex-1 px-6 py-4 rounded-xl font-semibold text-sm bg-navy/20 text-navy/40 cursor-not-allowed"
          >
            Generate PDF Report (Step 9)
          </button>
          {isComplete ? (
            <button
              type="button"
              onClick={handleReopen}
              className="flex-1 px-6 py-4 rounded-xl font-semibold text-sm bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            >
              Reopen Assessment
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="flex-1 px-6 py-4 rounded-xl font-semibold text-sm bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Mark Complete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
