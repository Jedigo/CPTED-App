import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { setWalkPosition } from '../services/light-survey';
import { buildPointPlan, stepPoint, walkStep } from '../services/light-grid';
import WalkMap from '../components/WalkMap';

/**
 * Walking a lighting grid, on the device doing the walk.
 *
 * The grid is plotted at a desk beforehand; this screen exists for the twenty
 * minutes afterwards, in the dark, with a light meter in one hand. A real night
 * walk killed the previous route — export a KML, open it in Google Earth on a
 * second device, or squint at a screenshot — and the complaint was exactly two
 * questions: where is point 37, and which point am I on.
 *
 * So the screen answers those two and nothing else. It advances on a tap
 * because it has no way to know where the assessor is standing: these iPads are
 * Wi-Fi-only with no GNSS, and the Wi-Fi fix that killed GPS corner capture is
 * just as useless here. Position comes from the person, not the device.
 */

/**
 * Keep the screen awake while the walk is open.
 *
 * An iPad that locks between readings means unlocking it seventy times with wet
 * hands. Wake Lock landed in iOS 16.4; on anything older this quietly does
 * nothing, which is exactly the old behaviour.
 */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    type Sentinel = { release: () => Promise<void> };
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<Sentinel> };
    };
    if (!nav.wakeLock) return;

    let sentinel: Sentinel | null = null;
    let cancelled = false;

    const acquire = () => {
      nav.wakeLock
        ?.request('screen')
        .then((s) => {
          if (cancelled) void s.release();
          else sentinel = s;
        })
        .catch(() => {
          // Denied, or the tab is in the background. Not worth a message: the
          // screen simply behaves the way it did before.
        });
    };

    // iOS drops the lock whenever the app is backgrounded, so it has to be
    // taken again on return rather than assumed to survive.
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire();
    };

    acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      void sentinel?.release();
    };
  }, [active]);
}

export default function LightWalk() {
  const { id, surveyId } = useParams<{ id: string; surveyId: string }>();
  const navigate = useNavigate();

  const survey = useLiveQuery(
    () => (surveyId ? db.light_surveys.get(surveyId) : undefined),
    [surveyId],
  );
  const readings = useLiveQuery(
    () => (surveyId ? db.light_readings.where('survey_id').equals(surveyId).toArray() : []),
    [surveyId],
  );

  /**
   * Where the walk is, once the assessor has moved. Null means "wherever the
   * stored position says" — derived rather than seeded through an effect, so
   * there is no first render showing point 1 before jumping to point 37.
   */
  const [moved, setMoved] = useState<number | null>(null);

  useWakeLock(!!survey);

  const plan = useMemo(
    () => (survey ? buildPointPlan(survey.cols, survey.rows, survey.skipped_points) : null),
    [survey],
  );

  const values = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of readings ?? []) m.set(r.point_index, r.value_fc);
    return m;
  }, [readings]);

  // Resume where the walk left off. A stored position that has since been
  // marked obstructed is stepped off rather than stood on — the walk would
  // otherwise open on a point that cannot be read and will not advance.
  const current = useMemo(() => {
    if (!plan || plan.walkOrder.length === 0) return null;
    if (moved !== null) return moved;
    const stored = survey?.walk_position ?? null;
    if (!stored) return plan.walkOrder[0];
    if (plan.walkOrder.includes(stored)) return stored;
    return stepPoint(stored, 1, plan) ?? plan.walkOrder[0];
  }, [moved, plan, survey?.walk_position]);

  function goTo(point: number) {
    setMoved(point);
    if (surveyId) void setWalkPosition(surveyId, point);
  }

  function move(direction: 1 | -1) {
    if (!plan || current === null) return;
    const next = stepPoint(current, direction, plan);
    if (next !== null) goTo(next);
  }

  if (!survey || !plan || current === null) {
    return <div className="min-h-full flex items-center justify-center text-ink/60">Loading…</div>;
  }

  if (plan.walkOrder.length === 0) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-ink/70">
          This lot has no grid yet. Set the lot size and pick a spacing first.
        </p>
        <button
          onClick={() => navigate(`/assessment/${id}/light/${surveyId}`)}
          className="bg-navy text-white font-semibold rounded-lg px-5 py-3"
        >
          Back to the survey
        </button>
      </div>
    );
  }

  const grid = {
    cols: survey.cols,
    rows: survey.rows,
    spacing_length_ft: survey.spacing_length_ft,
    spacing_width_ft: survey.spacing_width_ft,
    length_ft: survey.length_ft,
    width_ft: survey.width_ft,
    grid_origin: survey.grid_origin,
  };

  const readingNumber = plan.walkOrder.indexOf(current) + 1;
  const previous = stepPoint(current, -1, plan);
  const next = stepPoint(current, 1, plan);
  const step = walkStep(previous, current, grid);

  return (
    <div className="fixed inset-0 flex flex-col bg-black text-white">
      <header className="bg-navy px-3 py-2 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => navigate(`/assessment/${id}/light/${surveyId}`)}
          className="px-3 py-2 rounded-lg bg-white/10 text-sm font-semibold"
        >
          Done
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate leading-tight">{survey.area_name}</h1>
          <p className="text-xs text-white/60 truncate">
            {/* The meter counts readings, the map numbers points. With obstructed
                points marked they diverge, and showing only one of them is how a
                whole file ends up shifted by a position. */}
            Reading {readingNumber} of {plan.expectedReadings}
            {plan.skipped.length > 0 && <> · grid point {current}</>}
          </p>
        </div>
      </header>

      <WalkMap survey={survey} current={current} values={values} onPickPoint={goTo} />

      <div className="flex-shrink-0 bg-navy px-3 py-3 space-y-3">
        <p className="text-center text-sm text-white/85 min-h-[1.25rem]">{step.instruction}</p>
        <div className="flex gap-3">
          <button
            onClick={() => move(-1)}
            disabled={previous === null}
            className="flex-1 py-5 rounded-xl bg-white/10 text-lg font-bold disabled:opacity-30"
          >
            ← Back
          </button>
          <button
            onClick={() => move(1)}
            disabled={next === null}
            className="flex-[2] py-5 rounded-xl bg-blue-medium text-lg font-bold disabled:opacity-30"
          >
            {next === null ? 'Last point' : 'Next point →'}
          </button>
        </div>
      </div>
    </div>
  );
}
