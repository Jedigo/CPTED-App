import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getScoreColor, getScoreLabel } from '../services/scoring';
import {
  fetchServerAssessments,
  pullAssessment,
  type ServerAssessmentSummary,
  type PullProgress,
} from '../services/sync';
import ConfirmDialog from '../components/ConfirmDialog';
import ServerAssessmentCard from '../components/ServerAssessmentCard';
import type { Assessment, AssessmentStatus } from '../types';

type FilterTab = 'all' | 'in_progress' | 'completed' | 'server';

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

export default function Home() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Server tab state
  const [serverAssessments, setServerAssessments] = useState<ServerAssessmentSummary[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pullingId, setPullingId] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null);
  const [overwriteTarget, setOverwriteTarget] = useState<string | null>(null);

  const assessments = useLiveQuery(
    () => db.assessments.orderBy('created_at').reverse().toArray(),
    [],
  );

  // Count scored items per assessment
  const itemCounts = useLiveQuery(async () => {
    if (!assessments || assessments.length === 0) return new Map<string, { scored: number; total: number }>();
    const counts = new Map<string, { scored: number; total: number }>();
    for (const a of assessments) {
      const items = await db.item_scores
        .where('assessment_id')
        .equals(a.id)
        .toArray();
      const scored = items.filter((s) => s.score !== null || s.is_na).length;
      counts.set(a.id, { scored, total: items.length });
    }
    return counts;
  }, [assessments]);

  const filtered = assessments?.filter((a) => {
    if (filter === 'all' || filter === 'server') return true;
    return a.status === filter;
  });

  const handleMarkComplete = useCallback(async (assessmentId: string) => {
    await db.assessments.update(assessmentId, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    });
  }, []);

  const handleReopen = useCallback(async (assessmentId: string) => {
    await db.assessments.update(assessmentId, {
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await db.transaction(
        'rw',
        [db.assessments, db.zone_scores, db.item_scores, db.photos],
        async () => {
          await db.photos
            .where('assessment_id')
            .equals(deleteTarget.id)
            .delete();
          await db.item_scores
            .where('assessment_id')
            .equals(deleteTarget.id)
            .delete();
          await db.zone_scores
            .where('assessment_id')
            .equals(deleteTarget.id)
            .delete();
          await db.assessments.delete(deleteTarget.id);
        },
      );
    } catch (err) {
      console.error('Failed to delete assessment:', err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }, [deleteTarget]);

  // Load server assessments when Server tab is selected
  const loadServerAssessments = useCallback(async () => {
    setServerLoading(true);
    setServerError(null);
    try {
      const list = await fetchServerAssessments();
      setServerAssessments(list);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setServerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (filter === 'server' && online) {
      loadServerAssessments();
    }
  }, [filter, online, loadServerAssessments]);

  // Check if a server assessment exists locally
  const localIds = new Set(assessments?.map((a) => a.id) || []);

  const handlePull = useCallback(
    async (id: string) => {
      // If assessment exists locally, confirm overwrite
      if (localIds.has(id) && overwriteTarget !== id) {
        setOverwriteTarget(id);
        return;
      }

      setOverwriteTarget(null);
      setPullingId(id);
      setPullProgress(null);

      try {
        await pullAssessment(id, (progress) => setPullProgress(progress));
      } catch (err) {
        console.error('Pull failed:', err);
        setServerError(err instanceof Error ? err.message : 'Download failed');
      } finally {
        setPullingId(null);
        setPullProgress(null);
      }
    },
    [localIds, overwriteTarget],
  );

  const statusBadge = (status: AssessmentStatus) => {
    if (status === 'synced') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-blue-100 text-blue-700">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Synced
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Completed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        In Progress
      </span>
    );
  };

  // Loading state
  if (assessments === undefined) {
    return (
      <div className="min-h-screen bg-blue-pale flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-navy/20 border-t-navy rounded-full animate-spin" />
          <p className="text-navy/50 text-sm">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-pale">
      {/* Header */}
      <header className="bg-navy text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">CPTED Assessor</h1>
          <span className="text-white/40 text-sm hidden sm:inline">
            Residential Site Assessment
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Online/Offline indicator */}
          <div className="flex items-center gap-2" aria-label={online ? 'Online' : 'Offline'}>
            <span
              className={`w-2 h-2 rounded-full ${online ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span className="text-xs text-white/50">{online ? 'Online' : 'Offline'}</span>
          </div>
          <Link
            to="/assessment/new"
            className="bg-blue-medium hover:bg-blue-medium/80 active:scale-95 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all"
          >
            + New Assessment
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-navy/10 shadow-sm">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'server', label: 'Server' },
            ] as const
          ).map((tab) => {
            const count =
              tab.key === 'all'
                ? assessments.length
                : tab.key === 'server'
                  ? serverAssessments.length
                  : assessments.filter((a) => a.status === tab.key).length;
            const isServerDisabled = tab.key === 'server' && !online;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => !isServerDisabled && setFilter(tab.key)}
                disabled={isServerDisabled}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isServerDisabled
                    ? 'text-navy/20 cursor-not-allowed'
                    : filter === tab.key
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-navy/60 hover:text-navy hover:bg-blue-pale'
                }`}
              >
                {tab.label}
                {!isServerDisabled && (
                  <span
                    className={`ml-1.5 text-xs ${
                      filter === tab.key ? 'text-white/60' : 'text-navy/30'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Server tab content */}
        {filter === 'server' ? (
          <div>
            {serverLoading ? (
              <div className="text-center py-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-navy/20 border-t-navy rounded-full animate-spin" />
                  <p className="text-navy/50 text-sm">Loading server assessments...</p>
                </div>
              </div>
            ) : serverError ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-navy/60 mb-1">Connection Error</h3>
                <p className="text-sm text-navy/40 mb-4">{serverError}</p>
                <button
                  type="button"
                  onClick={loadServerAssessments}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : serverAssessments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-navy/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-navy/60 mb-1">No assessments on server</h3>
                <p className="text-sm text-navy/40">Sync an assessment to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serverAssessments.map((sa) => (
                  <ServerAssessmentCard
                    key={sa.id}
                    assessment={sa}
                    isLocal={localIds.has(sa.id)}
                    pulling={pullingId === sa.id}
                    pullProgress={pullingId === sa.id ? pullProgress : null}
                    disabled={pullingId !== null && pullingId !== sa.id}
                    onPull={handlePull}
                  />
                ))}
              </div>
            )}
          </div>
        ) :

        /* Assessment Cards (local tabs) */
        filtered && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((assessment) => {
              const counts = itemCounts?.get(assessment.id);
              return (
                <div
                  key={assessment.id}
                  className="bg-white rounded-xl border border-navy/10 shadow-sm hover:shadow-md hover:border-navy/20 transition-all group"
                >
                  <button
                    type="button"
                    onClick={() => navigate(`/assessment/${assessment.id}`)}
                    className="w-full text-left p-5 rounded-xl"
                    aria-label={`Open assessment for ${assessment.address}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Property info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-bold text-navy truncate group-hover:text-blue-medium transition-colors">
                          {assessment.address}
                        </h3>
                        <p className="text-sm text-navy/50 mt-0.5">
                          {assessment.city}, {assessment.state} {assessment.zip}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-navy/40">
                          <span>{assessment.homeowner_name}</span>
                          <span>&middot;</span>
                          <span>{formatDate(assessment.created_at)}</span>
                          {assessment.synced_at && (
                            <>
                              <span>&middot;</span>
                              <span className="text-blue-500" title={`Synced ${formatDate(assessment.synced_at)}`}>
                                Synced
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Score + Status */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {statusBadge(assessment.status)}
                        {assessment.overall_score !== null ? (
                          <div className="text-right">
                            <span
                              className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}
                            >
                              {assessment.overall_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-navy/30 ml-0.5">/5</span>
                            <p
                              className={`text-xs font-medium ${getScoreColor(assessment.overall_score)}`}
                            >
                              {getScoreLabel(assessment.overall_score)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-navy/25">No score</span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    {counts && counts.total > 0 && (() => {
                      const pct = Math.round((counts.scored / counts.total) * 100);
                      const isFullyAddressed = counts.scored === counts.total;
                      const readyToComplete = isFullyAddressed && assessment.status === 'in_progress';
                      return (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${readyToComplete ? 'text-green-600 font-semibold' : 'text-navy/40'}`}>
                              {readyToComplete
                                ? 'All items addressed — ready to complete'
                                : `${counts.scored} / ${counts.total} items addressed`}
                            </span>
                            <span className={`text-xs ${readyToComplete ? 'text-green-600' : 'text-navy/30'}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-navy/5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFullyAddressed ? 'bg-green-500' : 'bg-blue-medium'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </button>

                  {/* Card footer actions */}
                  <div className="border-t border-navy/5 px-5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Show Mark Complete when 100% addressed and still in_progress */}
                      {assessment.status === 'in_progress' &&
                        counts &&
                        counts.total > 0 &&
                        counts.scored === counts.total && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkComplete(assessment.id);
                            }}
                            className="text-xs font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-colors"
                            aria-label={`Mark assessment for ${assessment.address} as complete`}
                          >
                            Mark Complete
                          </button>
                        )}
                      {/* Show Reopen for completed assessments */}
                      {assessment.status === 'completed' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReopen(assessment.id);
                          }}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-lg transition-colors"
                          aria-label={`Reopen assessment for ${assessment.address}`}
                        >
                          Reopen
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(assessment);
                      }}
                      className="text-xs text-navy/30 hover:text-red-500 font-medium transition-colors px-2 py-1"
                      aria-label={`Delete assessment for ${assessment.address}`}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-navy/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-navy/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-navy/60 mb-1">
              {filter === 'all'
                ? 'No assessments yet'
                : `No ${filter === 'in_progress' ? 'in-progress' : 'completed'} assessments`}
            </h3>
            <p className="text-sm text-navy/40 mb-6">
              {filter === 'all'
                ? 'Start your first CPTED residential site assessment'
                : 'Assessments will appear here once they match this filter'}
            </p>
            {filter === 'all' && (
              <Link
                to="/assessment/new"
                className="inline-flex items-center gap-2 bg-navy hover:bg-navy-light active:scale-95 text-white font-semibold text-base px-8 py-4 rounded-xl shadow-lg transition-all"
              >
                + New Assessment
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Version indicator */}
      <p className="text-center text-[10px] text-navy/20 mt-6">v0.7.0</p>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Assessment"
        message={
          deleteTarget
            ? `Permanently delete the assessment for "${deleteTarget.address}"? This will remove all scores, photos, and recommendations. This action cannot be undone.`
            : ''
        }
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Overwrite Confirmation Dialog */}
      <ConfirmDialog
        open={overwriteTarget !== null}
        title="Update Local Copy"
        message="This assessment already exists on this device. Downloading will replace the local version with the server copy. Continue?"
        confirmLabel="Replace"
        variant="default"
        onConfirm={() => overwriteTarget && handlePull(overwriteTarget)}
        onCancel={() => setOverwriteTarget(null)}
      />
    </div>
  );
}
