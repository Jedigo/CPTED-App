import { useEffect, useState, useCallback, useRef } from 'react';
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
import { generatePDF } from '../services/pdf';
import { generateRecommendations, generateQuickWins } from '../services/recommendations';
import { syncAssessment, checkServerHealth } from '../services/sync';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import RecommendationEditor from '../components/RecommendationEditor';
import type { Recommendation } from '../types';

const LIABILITY_WAIVER = `This CPTED assessment is provided solely for informational and preventative purposes. The observations and recommendations included in this report are offered as voluntary guidance and do not constitute mandated safety requirements, building code standards, or legal directives. The implementation of any recommendations is entirely at the discretion of the property owner and should be undertaken only with appropriate professional consultation when necessary. The Volusia Sheriff's Office, its employees, agents, and representatives make no warranties, guarantees, or assurances regarding the effectiveness of any recommended security measures. Crime prevention strategies reduce risk but cannot completely eliminate the possibility of criminal activity. By accepting this report, the property owner acknowledges that the Volusia Sheriff's Office shall not be held liable for any actions taken or not taken based on the information provided, nor for any damages, losses, or incidents that may occur on or near the property following this assessment.`;

export default function Summary() {
  const { id } = useParams<{ id: string }>();
  const online = useOnlineStatus();

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

  // --- Recommendations & Quick Wins state ---
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [quickWins, setQuickWins] = useState<Recommendation[]>([]);
  const [recsInitialized, setRecsInitialized] = useState(false);

  // Seed local state from assessment on first load
  useEffect(() => {
    if (assessment && !recsInitialized) {
      setRecommendations(assessment.top_recommendations ?? []);
      setQuickWins(assessment.quick_wins ?? []);
      setRecsInitialized(true);
    }
  }, [assessment, recsInitialized]);

  // Debounced persistence
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistRecs = useCallback(
    (recs: Recommendation[], qw: Recommendation[]) => {
      if (!id) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        db.assessments.update(id, {
          top_recommendations: recs,
          quick_wins: qw,
          updated_at: new Date().toISOString(),
        });
      }, 500);
    },
    [id],
  );

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleRecsChange = useCallback(
    (items: Recommendation[]) => {
      setRecommendations(items);
      persistRecs(items, quickWins);
    },
    [quickWins, persistRecs],
  );

  const handleQuickWinsChange = useCallback(
    (items: Recommendation[]) => {
      setQuickWins(items);
      persistRecs(recommendations, items);
    },
    [recommendations, persistRecs],
  );

  const handleAutoGenerate = useCallback(() => {
    if (!id || !itemScores) return;
    const recs = generateRecommendations(itemScores, id, 5);
    const qw = generateQuickWins(itemScores, id, 5);
    setRecommendations(recs);
    setQuickWins(qw);
    persistRecs(recs, qw);
  }, [id, itemScores, persistRecs]);

  const [generating, setGenerating] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [serverReachable, setServerReachable] = useState<boolean | null>(null);

  // Check server reachability when component mounts
  useEffect(() => {
    checkServerHealth().then(setServerReachable);
  }, []);

  async function handleSync() {
    if (!id) return;
    setSyncing(true);
    setSyncError(null);
    setSyncSuccess(null);
    try {
      const result = await syncAssessment(id);
      setSyncSuccess(
        `Synced successfully${result.photosUploaded > 0 ? ` (${result.photosUploaded} photos uploaded)` : ''}`
      );
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  }

  async function handleGeneratePDF() {
    if (!id) return;
    setGenerating(true);
    setPdfError(null);
    try {
      await generatePDF(id);
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  }

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
      <div className="flex flex-col items-center justify-center h-screen bg-blue-pale gap-3">
        <div className="loading-spinner" />
        <p className="text-navy/50 text-sm">Loading summary...</p>
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
      <header className="bg-navy text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Link
            to={`/assessment/${id}`}
            className="text-white/70 hover:text-white text-sm font-medium flex-shrink-0"
          >
            &larr; Assessment
          </Link>
          <h1 className="text-base sm:text-lg font-bold truncate">
            {assessment.address}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}
            aria-label={online ? 'Online' : 'Offline'}
          />
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isComplete
                ? 'bg-green-400/20 text-green-300'
                : 'bg-yellow-400/20 text-yellow-300'
            }`}
          >
            {isComplete ? 'Completed' : 'In Progress'}
          </span>
        </div>
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

        {/* Auto-generate button */}
        {itemScores && itemScores.some((s) => s.score !== null) && (
          <div className="bg-blue-light/50 rounded-xl border border-blue-medium/20 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-navy">
                Auto-Generate Recommendations
              </p>
              <p className="text-xs text-navy/50 mt-0.5">
                Analyzes scores to pick the top issues and quick wins. You can edit them after.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAutoGenerate}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-medium text-white hover:bg-blue-medium/80 active:scale-95 transition-all flex-shrink-0"
            >
              {recommendations.length > 0 || quickWins.length > 0
                ? 'Regenerate'
                : 'Generate'}
            </button>
          </div>
        )}

        {/* Top 5 Recommendations */}
        <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-6">
          <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide mb-3">
            Top 5 Recommendations
          </h2>
          {id && (
            <RecommendationEditor
              items={recommendations}
              type="recommendation"
              assessmentId={id}
              maxItems={5}
              onChange={handleRecsChange}
            />
          )}
        </div>

        {/* Quick Wins */}
        <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-6">
          <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wide mb-3">
            Quick Wins
          </h2>
          {id && (
            <RecommendationEditor
              items={quickWins}
              type="quick_win"
              assessmentId={id}
              onChange={handleQuickWinsChange}
            />
          )}
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
        {pdfError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {pdfError}
          </div>
        )}
        {syncError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            {syncError}
          </div>
        )}
        {syncSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
            {syncSuccess}
          </div>
        )}
        <div className="flex items-center gap-4 pb-8">
          <button
            type="button"
            disabled={overall === null || generating}
            onClick={handleGeneratePDF}
            className={`flex-1 px-6 py-4 rounded-xl font-semibold text-sm transition-colors ${
              overall === null
                ? 'bg-navy/20 text-navy/40 cursor-not-allowed'
                : generating
                  ? 'bg-blue-medium text-white/80 cursor-wait'
                  : 'bg-navy text-white hover:bg-navy/90'
            }`}
          >
            {generating
              ? 'Generating PDF...'
              : overall === null
                ? 'Score items to generate PDF'
                : 'Generate PDF Report'}
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

        {/* Sync to Server */}
        {serverReachable && (
          <div className="bg-white rounded-xl border border-navy/10 shadow-sm p-4 flex items-center justify-between gap-4 -mt-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-navy">Sync to Server</p>
              <p className="text-xs text-navy/50 mt-0.5">
                {assessment.synced_at
                  ? `Last synced: ${new Date(assessment.synced_at).toLocaleString()}`
                  : 'Not yet synced to server'}
              </p>
            </div>
            <button
              type="button"
              disabled={syncing || overall === null}
              onClick={handleSync}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                syncing
                  ? 'bg-blue-medium/60 text-white cursor-wait'
                  : overall === null
                    ? 'bg-navy/20 text-navy/40 cursor-not-allowed'
                    : 'bg-blue-medium text-white hover:bg-blue-medium/80 active:scale-95'
              }`}
            >
              {syncing ? 'Syncing...' : assessment.synced_at ? 'Re-sync' : 'Sync Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
