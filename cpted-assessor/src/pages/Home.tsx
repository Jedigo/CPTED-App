import { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { touchAssessment } from '../services/touch';
import { compareRevisions, getSyncStateBadge, revisionLabel, editedByLabel } from '../services/revision';
import type { SyncState } from '../services/revision';
import { getDeviceName, setDeviceName } from '../services/device';
import DeviceNameDialog from '../components/DeviceNameDialog';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getScoreColor, getScoreLabel } from '../services/scoring';
import { getPropertyTypeLabel } from '../data/zone-registry';
import {
  fetchServerAssessments,
  pullAssessment,
  type ServerAssessmentSummary,
  type PullProgress,
} from '../services/sync';
import ConfirmDialog from '../components/ConfirmDialog';
import DuplicateResultDialog from '../components/DuplicateResultDialog';
import ServerAssessmentCard from '../components/ServerAssessmentCard';
import ThemeToggle from '../components/ThemeToggle';
import { duplicateAssessmentAs, type DuplicateResult } from '../services/duplicate';
import type { Assessment, AssessmentStatus, PropertyType } from '../types';

type FilterTab = 'all' | 'in_progress' | 'completed' | 'server';

function formatDate(iso: string): string {
  try {
    // Date-only strings (YYYY-MM-DD from <input type="date">) parse as UTC
    // midnight, which renders as the previous day in negative-offset zones.
    // Force local-midnight parsing for those.
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
    const d = dateOnly ? new Date(iso + 'T00:00:00') : new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

interface PullCopyFacts {
  /** This iPad's revision, e.g. "v7". */
  here: string;
  /** The server's revision. */
  there: string;
  /** Who last edited the server's copy. */
  theirs: string;
  /** The last revision the two agreed on, when one is recorded. */
  base: string | null;
}

/**
 * What the download dialog says, per verdict.
 *
 * Downloading is a wholesale overwrite of the local copy, so the wording has to
 * name what is being destroyed. The old single message said an assessment
 * "already exists on this device" — true in every case, and therefore no help
 * in the one case that matters.
 */
function pullDialogCopy(
  state: SyncState,
  f: PullCopyFacts,
): { title: string; body: React.ReactNode; confirmLabel: string; variant: 'danger' | 'default' } {
  switch (state) {
    case 'diverged':
      return {
        title: 'Both Copies Have Changed',
        variant: 'danger',
        confirmLabel: 'Replace my copy',
        body: (
          <>
            <p>
              This iPad and the server have both been edited
              {f.base ? ` since they last matched at ${f.base}` : ' independently'}.
            </p>
            <p>
              This iPad: {f.here}. Server: {f.there}, last edited by {f.theirs}.
            </p>
            <p className="font-semibold">
              Downloading replaces everything on this iPad. Scores, notes, and photos added
              here since the last sync will be lost and cannot be recovered. To keep this
              iPad's work, cancel and sync it first.
            </p>
          </>
        ),
      };
    case 'local-ahead':
      return {
        title: 'This iPad Is Newer',
        variant: 'danger',
        confirmLabel: 'Discard my changes',
        body: (
          <>
            <p>
              This iPad has changes the server has never seen ({f.here} here, {f.there} on the
              server).
            </p>
            <p className="font-semibold">
              Downloading throws those changes away. To keep them, cancel and sync this iPad
              instead.
            </p>
          </>
        ),
      };
    case 'server-ahead':
      return {
        title: 'Update Local Copy',
        variant: 'default',
        confirmLabel: 'Download',
        body: (
          <p>
            {f.theirs} edited this on the server ({f.there}) after this iPad last synced
            {f.base ? ` (${f.base})` : ''}. This iPad has no unsynced changes, so nothing here
            will be lost.
          </p>
        ),
      };
    default:
      return {
        title: 'Already Up To Date',
        variant: 'default',
        confirmLabel: 'Download',
        body: (
          <p>
            Both copies are at {f.there}. Downloading again just fetches the photos and data
            afresh.
          </p>
        ),
      };
  }
}

export default function Home() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [deleteTarget, setDeleteTarget] = useState<Assessment | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<{ assessment: Assessment; targetType: PropertyType } | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [duplicateResult, setDuplicateResult] = useState<DuplicateResult | null>(null);
  const [duplicateTargetLabel, setDuplicateTargetLabel] = useState<string>('');

  // Server tab state
  const [serverAssessments, setServerAssessments] = useState<ServerAssessmentSummary[]>([]);
  const [serverLoading, setServerLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [pullingId, setPullingId] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState<PullProgress | null>(null);
  const [overwriteTarget, setOverwriteTarget] = useState<{ id: string; state: SyncState } | null>(null);
  // A third state beyond loading/error: have we actually heard back from the
  // server at all? Offline or not-yet-fetched must show NO comparison badge.
  // Rendering "not synced" because we never asked would be a lie on every card
  // the moment an iPad drops off Wi-Fi.
  const [serverLoaded, setServerLoaded] = useState(false);

  // This iPad's name, so an edit can say who made it.
  const [deviceName, setDeviceNameState] = useState<string | null>(() => getDeviceName());
  const [namingDevice, setNamingDevice] = useState(false);

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
    await touchAssessment(assessmentId, { status: 'completed' });
  }, []);

  const handleReopen = useCallback(async (assessmentId: string) => {
    await touchAssessment(assessmentId, { status: 'in_progress' });
  }, []);

  const handleDuplicate = useCallback(async () => {
    if (!duplicateTarget) return;
    setDuplicating(true);
    try {
      const result = await duplicateAssessmentAs(
        duplicateTarget.assessment.id,
        duplicateTarget.targetType,
      );
      setDuplicateTargetLabel(getPropertyTypeLabel(duplicateTarget.targetType));
      setDuplicateResult(result);
    } catch (err) {
      console.error('Failed to duplicate assessment:', err);
      alert(err instanceof Error ? err.message : 'Duplication failed');
    } finally {
      setDuplicating(false);
      setDuplicateTarget(null);
    }
  }, [duplicateTarget]);

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
      setServerLoaded(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setServerLoading(false);
    }
  }, []);

  // Fetch server assessments on mount (for tab count) and when Server tab is selected
  useEffect(() => {
    if (online) {
      loadServerAssessments();
    }
  }, [online, loadServerAssessments]);

  // Check if a server assessment exists locally
  const localIds = new Set(assessments?.map((a) => a.id) || []);
  const serverById = new Map(serverAssessments.map((s) => [s.id, s]));

  /**
   * How this device's copy stands against the server's — or null when we have
   * not managed to ask, in which case no badge is shown at all.
   */
  const syncStateFor = (assessment: Assessment): SyncState | null => {
    if (!serverLoaded) return null;
    return compareRevisions(assessment, serverById.get(assessment.id) ?? null);
  };

  // Names already in use across the department, offered when naming this iPad.
  const knownDeviceNames = Array.from(
    new Set(
      serverAssessments
        .map((s) => s.last_edited_by)
        .filter((n): n is string => Boolean(n && n.trim())),
    ),
  ).sort();

  // Ask after the first edit — but on the home screen, not the moment it
  // happens. An assessor holding a light meter in a dark car park should not
  // get a naming prompt mid-tap, and the answer is just as useful when they
  // surface. Evidence of an edit is an assessment carrying an edit stamp with
  // nobody's name on it.
  //
  // Asked once per visit at most, and declining is fine: edits still record a
  // revision, they just say "unnamed iPad". The header chip is always there.
  const hasUnattributedEdit = (assessments ?? []).some(
    (a) => a.last_edited_at && !a.last_edited_by,
  );
  useEffect(() => {
    if (deviceName === null && hasUnattributedEdit) setNamingDevice(true);
  }, [deviceName, hasUnattributedEdit]);

  const handlePull = useCallback(
    async (id: string) => {
      // If it exists locally, confirm — and say which copy is newer, which the
      // old dialog could not, so "Replace" was a coin toss.
      if (localIds.has(id) && overwriteTarget?.id !== id) {
        const local = assessments?.find((a) => a.id === id) ?? null;
        setOverwriteTarget({ id, state: compareRevisions(local, serverById.get(id) ?? null) });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [localIds, overwriteTarget, assessments, serverAssessments],
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
          <div className="w-8 h-8 border-3 border-ink/20 border-t-ink rounded-full animate-spin" />
          <p className="text-ink/50 text-sm">Loading assessments...</p>
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
            Site Assessment Tool
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
          <button
            type="button"
            onClick={() => setNamingDevice(true)}
            title="What this iPad is called. Recorded with every edit so a shared iPad's work can be told apart."
            className="text-xs text-ink/50 hover:text-ink px-2.5 py-1.5 rounded-lg border border-ink/15 hover:bg-blue-pale transition-all"
          >
            {deviceName ?? 'Name this iPad'}
          </button>
          <ThemeToggle />
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
        <div className="flex gap-1 mb-6 bg-surface rounded-xl p-1 border border-ink/10 shadow-sm">
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
                    ? 'text-ink/20 cursor-not-allowed'
                    : filter === tab.key
                      ? 'bg-navy text-white shadow-sm'
                      : 'text-ink/60 hover:text-ink hover:bg-blue-pale'
                }`}
              >
                {tab.label}
                {!isServerDisabled && (
                  <span
                    className={`ml-1.5 text-xs ${
                      filter === tab.key ? 'text-white/60' : 'text-ink/30'
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
                  <div className="w-8 h-8 border-3 border-ink/20 border-t-ink rounded-full animate-spin" />
                  <p className="text-ink/50 text-sm">Loading server assessments...</p>
                </div>
              </div>
            ) : serverError ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ink/60 mb-1">Connection Error</h3>
                <p className="text-sm text-ink/40 mb-4">{serverError}</p>
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
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink/5 flex items-center justify-center">
                  <svg className="w-8 h-8 text-ink/20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-ink/60 mb-1">No assessments on server</h3>
                <p className="text-sm text-ink/40">Sync an assessment to see it here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {serverAssessments.map((sa) => (
                  <ServerAssessmentCard
                    key={sa.id}
                    assessment={sa}
                    isLocal={localIds.has(sa.id)}
                    local={assessments?.find((a) => a.id === sa.id) ?? null}
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
                  className="bg-surface rounded-xl border border-ink/10 shadow-sm hover:shadow-md hover:border-ink/20 transition-all group"
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
                        <h3 className="text-base font-bold text-ink truncate group-hover:text-blue-medium transition-colors">
                          {assessment.address}
                        </h3>
                        <p className="text-sm text-ink/50 mt-0.5">
                          {assessment.city}, {assessment.state} {assessment.zip}
                        </p>
                        {assessment.property_type !== 'single_family_residential' && (
                          <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-700">
                            {getPropertyTypeLabel(assessment.property_type)}
                          </span>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-sm text-ink/40">
                          <span>{assessment.homeowner_name}</span>
                          <span>&middot;</span>
                          <span>{formatDate(assessment.date_of_assessment)}</span>
                          {revisionLabel(assessment) && (
                            <>
                              <span>&middot;</span>
                              <span
                                title={
                                  assessment.last_edited_at
                                    ? `Last edited ${formatDate(assessment.last_edited_at)}`
                                    : undefined
                                }
                              >
                                {revisionLabel(assessment)}
                                {editedByLabel(
                                  assessment.last_edited_by,
                                  assessment.last_edited_at,
                                  formatDate,
                                ) && ` · ${assessment.last_edited_by ?? 'unnamed iPad'}`}
                              </span>
                            </>
                          )}
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
                        {(() => {
                          const state = syncStateFor(assessment);
                          const badge = state && getSyncStateBadge(state);
                          if (!badge) return null;
                          return (
                            <span
                              title={badge.hint}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${badge.classes}`}
                            >
                              {badge.label}
                            </span>
                          );
                        })()}
                        {assessment.overall_score !== null ? (
                          <div className="text-right">
                            <span
                              className={`text-2xl font-bold ${getScoreColor(assessment.overall_score)}`}
                            >
                              {assessment.overall_score.toFixed(1)}
                            </span>
                            <span className="text-xs text-ink/30 ml-0.5">/5</span>
                            <p
                              className={`text-xs font-medium ${getScoreColor(assessment.overall_score)}`}
                            >
                              {getScoreLabel(assessment.overall_score)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-ink/25">No score</span>
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
                            <span className={`text-xs ${readyToComplete ? 'text-green-600 font-semibold' : 'text-ink/40'}`}>
                              {readyToComplete
                                ? 'All items addressed — ready to complete'
                                : `${counts.scored} / ${counts.total} items addressed`}
                            </span>
                            <span className={`text-xs ${readyToComplete ? 'text-green-600' : 'text-ink/30'}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
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
                  <div className="border-t border-ink/5 px-5 py-2 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
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
                            className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
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
                      {/* Duplicate (same type) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDuplicateTarget({ assessment, targetType: assessment.property_type });
                        }}
                        className="text-xs font-semibold text-blue-700 hover:text-white hover:bg-blue-600 bg-blue-50 hover:border-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
                        aria-label={`Duplicate assessment for ${assessment.address}`}
                      >
                        Duplicate
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(assessment);
                      }}
                      className="text-xs text-red-400 hover:text-white hover:bg-red-500 font-semibold transition-colors px-3 py-1.5 rounded-lg border border-red-300 hover:border-red-500"
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
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-ink/20"
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
            <h3 className="text-lg font-semibold text-ink/60 mb-1">
              {filter === 'all'
                ? 'No assessments yet'
                : `No ${filter === 'in_progress' ? 'in-progress' : 'completed'} assessments`}
            </h3>
            <p className="text-sm text-ink/40 mb-6">
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
      {namingDevice && (
        <DeviceNameDialog
          currentName={deviceName}
          suggestions={knownDeviceNames}
          onSave={(name) => {
            setDeviceName(name);
            setDeviceNameState(name);
            setNamingDevice(false);
          }}
          onCancel={() => setNamingDevice(false)}
        />
      )}

      <p className="text-center text-[10px] text-ink/50 mt-6">v0.44.0</p>

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

      {/* Overwrite Confirmation Dialog — states which copy is newer, and what
          downloading costs. The old copy said only that a local version existed. */}
      {overwriteTarget && (() => {
        const local = assessments?.find((a) => a.id === overwriteTarget.id) ?? null;
        const server = serverById.get(overwriteTarget.id) ?? null;
        const here = revisionLabel(local) ?? 'an untracked version';
        const there = revisionLabel(server) ?? 'an untracked version';
        const theirs = server?.last_edited_by ?? 'Another iPad';
        const copy = pullDialogCopy(overwriteTarget.state, {
          here,
          there,
          theirs,
          base: local?.synced_revision != null ? `v${local.synced_revision}` : null,
        });
        return (
          <ConfirmDialog
            open
            title={copy.title}
            message={copy.body}
            confirmLabel={copy.confirmLabel}
            variant={copy.variant}
            onConfirm={() => handlePull(overwriteTarget.id)}
            onCancel={() => setOverwriteTarget(null)}
          />
        );
      })()}

      {/* Duplicate Confirmation Dialog */}
      <ConfirmDialog
        open={duplicateTarget !== null}
        title="Duplicate Assessment"
        message={
          duplicateTarget
            ? `Create a duplicate of "${duplicateTarget.assessment.address}"? The original is preserved. All scores and photos are carried over to the new copy.`
            : ''
        }
        confirmLabel={duplicating ? 'Duplicating...' : 'Duplicate'}
        variant="default"
        onConfirm={handleDuplicate}
        onCancel={() => setDuplicateTarget(null)}
      />

      {/* Duplicate Result Dialog */}
      <DuplicateResultDialog
        open={duplicateResult !== null}
        result={duplicateResult}
        targetTypeLabel={duplicateTargetLabel}
        onClose={() => setDuplicateResult(null)}
        onOpenNew={() => {
          if (duplicateResult) {
            const id = duplicateResult.newAssessmentId;
            setDuplicateResult(null);
            navigate(`/assessment/${id}`);
          }
        }}
      />
    </div>
  );
}
