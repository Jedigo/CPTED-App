import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { createLightSurvey, deleteLightSurvey, hasGrid } from '../services/light-survey';
import { computeStats, formatFc, formatMinReading, formatRatio } from '../services/light-stats';
import HeaderBackButton from '../components/HeaderBackButton';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Light surveys attached to an assessment. One survey per lot — a campus with a
 * staff lot, a student lot, and a bus loop gets three.
 */
export default function LightSurveys() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [areaName, setAreaName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const assessment = useLiveQuery(() => (id ? db.assessments.get(id) : undefined), [id]);

  const surveys = useLiveQuery(
    () =>
      id
        ? db.light_surveys.where('assessment_id').equals(id).sortBy('created_at')
        : [],
    [id],
  );

  const readings = useLiveQuery(
    () => (id ? db.light_readings.where('assessment_id').equals(id).toArray() : []),
    [id],
  );

  async function handleCreate() {
    if (!id) return;
    const surveyId = await createLightSurvey(id, areaName);
    setAreaName('');
    navigate(`/assessment/${id}/light/${surveyId}`);
  }

  if (!assessment) {
    return (
      <div className="min-h-full flex items-center justify-center text-ink/60">Loading…</div>
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-navy text-white px-4 py-2 flex items-center gap-3 sticky top-0 z-10">
        <HeaderBackButton to={`/assessment/${id}`} label="Assessment" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">Parking Lot Light Surveys</h1>
          <p className="text-xs text-white/60 truncate">{assessment.address}</p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto">
        <div className="bg-surface border border-ink/10 rounded-xl p-4 mb-6">
          <h2 className="font-bold text-ink mb-1">Add a lot</h2>
          <p className="text-sm text-ink/60 mb-3">
            A light survey is a separate night visit. Adding one never changes this
            assessment&rsquo;s checklist progress or its report status &mdash; you can attach
            lighting to an assessment you already finished.
          </p>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
              placeholder="Main Lot, Bus Loop, Staff Lot…"
              className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink placeholder:text-ink/40"
            />
            <button
              type="button"
              onClick={handleCreate}
              className="px-5 py-2 rounded-lg bg-navy text-white font-semibold hover:bg-navy-light active:scale-95 transition-all"
            >
              Add Lot
            </button>
          </div>
        </div>

        {surveys && surveys.length === 0 && (
          <div className="bg-surface border border-ink/10 rounded-xl p-8 text-center">
            <p className="text-ink/60 text-sm">
              No light surveys yet. Add the lot you plan to walk.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {surveys?.map((survey) => {
            const surveyReadings = (readings ?? []).filter((r) => r.survey_id === survey.id);
            const stats = computeStats(surveyReadings.map((r) => r.value_fc));
            const gridSet = hasGrid(survey);

            return (
              <div
                key={survey.id}
                className="bg-surface border border-ink/10 rounded-xl p-4 flex items-start gap-4 flex-wrap"
              >
                <div className="flex-1 min-w-[200px]">
                  <Link
                    to={`/assessment/${id}/light/${survey.id}`}
                    className="font-bold text-ink hover:text-blue-medium"
                  >
                    {survey.area_name}
                  </Link>
                  <p className="text-xs text-ink/60 mt-0.5">
                    {gridSet
                      ? `${survey.length_ft} × ${survey.width_ft} ft · ${survey.cols}×${survey.rows} grid · ${survey.cols * survey.rows - survey.skipped_points.length} points to read`
                      : 'Grid not set up yet'}
                  </p>

                  {stats ? (
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span className="text-ink/70">
                        Avg <strong className="text-ink">{formatFc(stats.avg_fc)}</strong>
                      </span>
                      <span className="text-ink/70">
                        Lowest <strong className="text-ink">{formatMinReading(stats)}</strong>
                      </span>
                      <span className="text-ink/70">
                        Uniformity{' '}
                        <strong className="text-ink">{formatRatio(stats.avg_min_ratio)}</strong>
                      </span>
                      <span
                        className={`font-semibold ${
                          stats.meets_average && stats.meets_uniformity
                            ? 'text-score-good'
                            : 'text-score-critical'
                        }`}
                      >
                        {stats.meets_average && stats.meets_uniformity
                          ? 'Meets target'
                          : 'Below target'}
                      </span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-ink/50">No readings imported yet</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/assessment/${id}/light/${survey.id}`}
                    className="px-4 py-2 rounded-lg bg-blue-pale border border-ink/15 text-ink text-sm font-semibold hover:bg-blue-light active:scale-95 transition-all"
                  >
                    Open
                  </Link>
                  {confirmDelete === survey.id ? (
                    <>
                      <button
                        type="button"
                        onClick={async () => {
                          await deleteLightSurvey(survey.id);
                          setConfirmDelete(null);
                        }}
                        className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold active:scale-95"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(null)}
                        className="px-3 py-2 rounded-lg border border-ink/20 text-ink text-sm active:scale-95"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(survey.id)}
                      className="px-3 py-2 rounded-lg border border-ink/20 text-ink/60 text-sm hover:text-red-600 hover:border-red-300 active:scale-95 transition-all"
                      aria-label={`Delete ${survey.area_name}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
