import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import {
  generateGridOptions,
  buildPointPlan,
  pointPosition,
  MIN_READINGS,
  METER_MANUAL_CAPACITY,
  type GridOption,
  type PlaceReconciliation,
} from '../services/light-grid';
import { parseMeterFile, MeterParseError } from '../services/light-meter';
import {
  computeStats,
  darkestPoints,
  verdictLines,
  formatFc,
  formatLux,
  formatRatio,
  STANDARD_CITATION,
  PARKING_TARGET_AVG_FC,
} from '../services/light-stats';
import {
  updateLightSurvey,
  importMeterReadings,
  clearReadings,
  hasGrid,
} from '../services/light-survey';
import {
  parseLatLng,
  formatLatLng,
  hasGeoreference,
  isIOS,
  surveyOrigin,
  surveyAxisPoint,
  surveyWidthPoint,
  deriveRectangle,
  compassPoint,
  buildGridKml,
  downloadKml,
  type LatLng,
} from '../services/light-geo';
import { generateLightSurveyPDF } from '../services/pdf';
import { compressImage } from '../services/photos';
import LightGridMap from '../components/LightGridMap';
import AerialCornerPicker from '../components/AerialCornerPicker';
import { renderAerialWithGrid } from '../services/aerial-render';
import { IMAGERY_CREDIT } from '../services/county-imagery';
import type { AerialView } from '../services/county-imagery';
import HeaderBackButton from '../components/HeaderBackButton';
import ThemeToggle from '../components/ThemeToggle';
import type { LightSurvey } from '../types';

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-ink/10 rounded-xl p-5 mb-5">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {step}
        </span>
        <h2 className="font-bold text-ink">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-ink/60 mb-3 ml-8">{subtitle}</p>}
      <div className="ml-0 sm:ml-8">{children}</div>
    </section>
  );
}

function MetaField({
  label,
  value,
  onChange,
  onCommit,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        className="w-full px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink placeholder:text-ink/40 text-sm"
      />
    </label>
  );
}

/**
 * The Google Earth hand-off. It appears twice, because it does two different
 * jobs at two different moments and conflating them is what made the ordering
 * confusing: before the walk it is a plan to check against imagery (no readings
 * exist yet, and that's fine); after the import it is the finished heat map that
 * gets screenshotted into the report.
 */
function EarthExport({
  phase,
  enabled,
  onDownload,
  note,
  error,
}: {
  phase: 'plan' | 'report';
  enabled: boolean;
  onDownload: () => void;
  note: string | null;
  error: string | null;
}) {
  const isPlan = phase === 'plan';
  const onTablet = isIOS();
  return (
    <div className="mt-4 pt-4 border-t border-ink/10">
      <p className="text-sm font-semibold text-ink mb-1">
        {isPlan
          ? onTablet
            ? 'Carry the grid with you'
            : 'Check the grid before you walk'
          : 'Map the readings on the real lot'}
      </p>
      <p className="text-xs text-ink/60 mb-3 max-w-2xl">
        {isPlan ? (
          onTablet ? (
            <>
              Every point is numbered and drawn to scale on the imagery, and Google Earth shows
              where you are standing — so you can walk to point 43 rather than pacing it out.
              Points that turn out to be on an island or a curb can be marked obstructed above.
            </>
          ) : (
            <>
              Drawn to scale over satellite imagery, so you can see which points land on
              landscape islands or the building and mark them obstructed above. There are no
              readings in it yet — this copy is for planning the walk.
            </>
          )
        ) : (
          <>
            The same grid, now coloured by the readings you imported. This is the copy to
            screenshot for the report.
          </>
        )}
      </p>

      <div className="flex gap-2 flex-wrap items-center">
        <button
          type="button"
          onClick={onDownload}
          disabled={!enabled}
          className="px-5 py-3 rounded-xl bg-surface border border-navy text-navy font-semibold hover:bg-blue-pale active:scale-95 transition-all disabled:opacity-40 disabled:hover:bg-surface disabled:active:scale-100"
        >
          {onTablet ? 'Send the map to Google Earth' : '1. Download the map file (.kml)'}
        </button>
        {/*
          Google Earth Web does not run in iOS Safari, so this link is only ever
          offered on a desktop. On an iPad the file goes to the Google Earth app
          through the share sheet instead — a link to earth.google.com there
          would send the assessor to a page that cannot load.
        */}
        {!onTablet && (
          <a
            href="https://earth.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-navy-light active:scale-95 transition-all"
          >
            2. Open Google Earth &#8599;
          </a>
        )}
      </div>

      <p className="text-xs text-ink/50 mt-2 max-w-2xl">
        {!enabled ? (
          <>Set the start and long-side corners in step 1 and this becomes available.</>
        ) : onTablet ? (
          <>
            Pick <strong className="text-ink/70">Google Earth</strong> in the share sheet and the
            grid opens straight in the app, where it tracks your position as you walk. The app is
            required — the Google Earth website doesn&rsquo;t work on iPad, and saving to Files
            just buries the file.
          </>
        ) : (
          <>
            In Google Earth: <strong className="text-ink/70">New</strong> &rarr;{' '}
            <strong className="text-ink/70">Open local KML file</strong> &rarr; pick the file you
            just downloaded &rarr; <strong className="text-ink/70">Map feature</strong>. A browser
            can&rsquo;t display a .kml on its own — opening it in Chrome looks like nothing
            happened.
          </>
        )}
      </p>

      {note && (
        <p className="mt-2 text-sm text-ink/80 bg-blue-pale border border-navy/20 rounded-lg p-3">
          {note}
        </p>
      )}
      {error && (
        <p className="mt-2 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Above this, a captured corner is worse than the measurement it replaces.
 * 5 m is roughly 16 ft — about a tenth of a typical lot's short side, which is
 * the point at which the derived width starts visibly moving the grid.
 */
const GPS_ACCURACY_LIMIT_M = 5;

export default function LightSurveyDetail() {
  const { id, surveyId } = useParams<{ id: string; surveyId: string }>();

  const survey = useLiveQuery(
    () => (surveyId ? db.light_surveys.get(surveyId) : undefined),
    [surveyId],
  );

  const readings = useLiveQuery(
    () =>
      surveyId
        ? db.light_readings.where('survey_id').equals(surveyId).sortBy('point_index')
        : [],
    [surveyId],
  );

  const assessment = useLiveQuery(() => (id ? db.assessments.get(id) : undefined), [id]);

  const [lengthInput, setLengthInput] = useState('');
  const [widthInput, setWidthInput] = useState('');
  const [meta, setMeta] = useState<Partial<LightSurvey>>({});
  const [importError, setImportError] = useState<string | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<PlaceReconciliation['status'] | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [originInput, setOriginInput] = useState('');
  const [axisInput, setAxisInput] = useState('');
  const [widthPtInput, setWidthPtInput] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);
  const [kmlNote, setKmlNote] = useState<string | null>(null);
  const [kmlNoteFor, setKmlNoteFor] = useState<'plan' | 'report' | null>(null);
  const [aerialError, setAerialError] = useState<string | null>(null);
  const [aerialBusy, setAerialBusy] = useState(false);
  const [locating, setLocating] = useState<'origin' | 'axis' | 'width' | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<Record<string, number>>({});
  const [pickerOpen, setPickerOpen] = useState(true);
  const aerialView = useRef<AerialView | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const aerialRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  // Seed the local form state once, then let the inputs own it.
  useEffect(() => {
    if (!survey || hydrated.current) return;
    hydrated.current = true;
    setLengthInput(survey.length_ft ? String(survey.length_ft) : '');
    setWidthInput(survey.width_ft ? String(survey.width_ft) : '');
    const o = surveyOrigin(survey);
    const a = surveyAxisPoint(survey);
    const w = surveyWidthPoint(survey);
    if (o) setOriginInput(formatLatLng(o));
    if (a) setAxisInput(formatLatLng(a));
    if (w) setWidthPtInput(formatLatLng(w));
    setMeta({
      area_name: survey.area_name,
      surveyed_at: survey.surveyed_at,
      observers: survey.observers,
      weather: survey.weather,
      lamp_type: survey.lamp_type,
      fixture_type: survey.fixture_type,
      meter_type: survey.meter_type,
      meter_calibrated_on: survey.meter_calibrated_on,
      pole_height_ft: survey.pole_height_ft,
      notes: survey.notes,
    });
  }, [survey]);

  const lengthFt = Number(lengthInput) || 0;
  const widthFt = Number(widthInput) || 0;

  // Show the spacings that actually work. Only when none do (a lot too big or
  // too small for a single session) fall back to showing near misses, so the
  // constraint is visible rather than the list just coming up empty.
  const options = useMemo(() => {
    if (!(lengthFt > 0 && widthFt > 0)) return [];
    const all = generateGridOptions(lengthFt, widthFt);
    const usable = all.filter((o) => o.within_capacity && o.meets_minimum);
    return usable.length > 0 ? usable : all.slice(0, 3);
  }, [lengthFt, widthFt]);

  const readingCount = readings?.length ?? 0;

  const valueMap = useMemo(() => {
    const m = new Map<number, number>();
    for (const r of readings ?? []) m.set(r.point_index, r.value_fc);
    return m;
  }, [readings]);

  const stats = useMemo(
    () => computeStats((readings ?? []).map((r) => r.value_fc)),
    [readings],
  );

  const plan = useMemo(
    () => (survey && hasGrid(survey) ? buildPointPlan(survey.cols, survey.rows, survey.skipped_points) : null),
    [survey],
  );

  // Live geometry from whatever corners are currently typed, so the readout
  // updates as you paste rather than only after saving.
  const derived = useMemo(() => {
    const o = parseLatLng(originInput);
    const a = parseLatLng(axisInput);
    if (!o || !a) return null;
    return deriveRectangle(o, a, parseLatLng(widthPtInput));
  }, [originInput, axisInput, widthPtInput]);

  if (!survey) {
    return <div className="min-h-full flex items-center justify-center text-ink/60">Loading…</div>;
  }

  const skipped = new Set(survey.skipped_points);
  const gridReady = hasGrid(survey);

  function commitMeta() {
    if (!surveyId) return;
    updateLightSurvey(surveyId, meta);
  }

  async function applyGrid(option: GridOption) {
    if (!surveyId) return;
    if (readingCount > 0) {
      const ok = window.confirm(
        'Changing the grid re-numbers every point, which would put the imported readings in the wrong places. The existing readings will be cleared. Continue?',
      );
      if (!ok) return;
      await clearReadings(surveyId);
    }
    await updateLightSurvey(surveyId, {
      length_ft: lengthFt,
      width_ft: widthFt,
      cols: option.cols,
      rows: option.rows,
      spacing_length_ft: option.spacing_length_ft,
      spacing_width_ft: option.spacing_width_ft,
      // Point numbering changes with the grid, so old skips no longer mean anything.
      skipped_points: [],
    });
    setImportMessage(null);
  }

  async function toggleSkip(pointIndex: number) {
    if (!surveyId || !survey) return;
    const next = new Set(survey.skipped_points);
    if (next.has(pointIndex)) next.delete(pointIndex);
    else next.add(pointIndex);
    await updateLightSurvey(surveyId, {
      skipped_points: [...next].sort((a, b) => a - b),
    });
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !survey) return;
    setImportError(null);
    setImportWarnings([]);
    setImportMessage(null);
    setImportStatus(null);

    try {
      const text = await file.text();
      const parsed = parseMeterFile(text);
      const result = await importMeterReadings(survey, parsed.readings, parsed.unit, file.name);
      setImportWarnings(parsed.warnings);
      setImportMessage(result.reconciliation.message);
      setImportStatus(result.reconciliation.status);
    } catch (err) {
      setImportError(
        err instanceof MeterParseError
          ? err.message
          : `Could not read that file. ${err instanceof Error ? err.message : ''}`,
      );
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  }


  /**
   * Persist corner coordinates and let the geometry set the lot dimensions.
   * The corners ARE the measurement — the length/width inputs exist for someone
   * who already has the numbers, not as something to reconcile against.
   */
  async function persistCorners(
    o: LatLng | null,
    a: LatLng | null,
    w: LatLng | null,
  ) {
    if (!surveyId) return;
    const patch: Partial<LightSurvey> = {
      origin_lat: o?.lat ?? null,
      origin_lng: o?.lng ?? null,
      axis_lat: a?.lat ?? null,
      axis_lng: a?.lng ?? null,
      width_lat: w?.lat ?? null,
      width_lng: w?.lng ?? null,
    };

    if (o && a) {
      const rect = deriveRectangle(o, a, w);
      if (rect) {
        const len = Math.round(rect.length_ft);
        patch.length_ft = len;
        patch.grid_flipped = rect.flipped;
        setLengthInput(String(len));
        if (rect.width_ft !== null) {
          const wid = Math.round(rect.width_ft);
          patch.width_ft = wid;
          setWidthInput(String(wid));
        }
      }
    }
    await updateLightSurvey(surveyId, patch);
  }

  /** Read one coordinate field; 'error' means it was filled in but unparseable. */
  function readCorner(label: string, text: string): LatLng | null | 'error' {
    if (!text.trim()) return null;
    const parsed = parseLatLng(text);
    if (!parsed) {
      setGeoError(
        `${label} could not be read. Paste a coordinate pair like 29.211234, -81.023456 — right-clicking in Google Maps copies exactly that.`,
      );
      return 'error';
    }
    return parsed;
  }

  async function commitCoordinates() {
    setGeoError(null);
    const o = readCorner('The start corner', originInput);
    const a = readCorner('The long-side corner', axisInput);
    const w = readCorner('The short-side corner', widthPtInput);
    if (o === 'error' || a === 'error' || w === 'error') return;
    await persistCorners(o, a, w);
  }

  function captureLocation(which: 'origin' | 'axis' | 'width') {
    if (!navigator.geolocation) {
      setGeoError('This device does not report a location to the browser.');
      return;
    }
    setGeoError(null);
    setLocating(which);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const text = formatLatLng(here);
        setLocating(null);

        // Report the accuracy the device itself claims. A corner is only as good
        // as this number, and a handheld fix is routinely 15-30 ft — on a lot
        // 150 ft across that is a 10-20% error in the width, which then scales
        // every derived grid position. Field testing confirmed it: the readout
        // is what stops a bad corner from looking like a good one.
        setGpsAccuracy((prev) => ({ ...prev, [which]: pos.coords.accuracy }));

        // Build the full corner set here rather than reading it back out of the
        // inputs, whose state has not updated yet at this point.
        const current = {
          origin: parseLatLng(originInput),
          axis: parseLatLng(axisInput),
          width: parseLatLng(widthPtInput),
        };
        if (which === 'origin') { setOriginInput(text); current.origin = here; }
        else if (which === 'axis') { setAxisInput(text); current.axis = here; }
        else { setWidthPtInput(text); current.width = here; }

        persistCorners(current.origin, current.axis, current.width);
      },
      (err) => {
        setLocating(null);
        setGeoError(`Could not read this device's location. ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  }

  /**
   * Store a screenshot of the Google Earth view. Kept larger than a checklist
   * photo: the whole point is reading point numbers and the shape of a dark
   * region off the imagery, which 1920px does not survive.
   */
  async function handleAerial(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !surveyId) return;
    setAerialError(null);
    setAerialBusy(true);
    try {
      const data = await compressImage(file, 2600, 0.82);
      await updateLightSurvey(surveyId, { aerial_image: data });
    } catch (err) {
      setAerialError(
        `Could not read that image. ${err instanceof Error ? err.message : ''}`.trim(),
      );
    } finally {
      setAerialBusy(false);
      if (aerialRef.current) aerialRef.current.value = '';
    }
  }

  /**
   * Compose the report picture from the imagery already on screen. Replaces the
   * old route — export a KML, open Google Earth, screenshot it, upload it —
   * which turned out to be device-dependent and cost an afternoon to discover.
   */
  async function drawAerialForReport(withReadings: boolean) {
    if (!surveyId || !survey) return;
    setAerialError(null);
    if (!aerialView.current) {
      setAerialError(
        'Open the map in step 1 first — the report picture is drawn from the view shown there.',
      );
      return;
    }
    setAerialBusy(true);
    try {
      const image = await renderAerialWithGrid(aerialView.current, survey, {
        values: withReadings ? valueMap : new Map(),
        labelEveryPoint: !withReadings,
      });
      await updateLightSurvey(surveyId, { aerial_image: image, aerial_credit: IMAGERY_CREDIT });
    } catch (err) {
      setAerialError(
        `Could not build the report picture. ${err instanceof Error ? err.message : ''}`.trim(),
      );
    } finally {
      setAerialBusy(false);
    }
  }

  async function removeAerial() {
    if (!surveyId) return;
    if (!window.confirm('Remove the aerial screenshot from this survey?')) return;
    await updateLightSurvey(surveyId, { aerial_image: null });
  }

  async function handleDownloadKml(phase: 'plan' | 'report') {
    if (!survey) return;
    setGeoError(null);
    setKmlNote(null);
    setKmlNoteFor(phase);
    try {
      const kml = buildGridKml(
        survey,
        (readings ?? []).map((r) => ({ point_index: r.point_index, value_fc: r.value_fc })),
        assessment?.address ?? '',
        // The planning copy numbers every point even after an import — it is
        // still the map you use to decide what to mark obstructed.
        { labelEveryPoint: phase === 'plan' },
      );
      const safe = survey.area_name.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      const how = await downloadKml(`Lighting_Grid_${safe || 'Lot'}.kml`, kml);
      // A silent tap is the failure mode here, so always say what happened and
      // where the file went — the answer differs by device.
      setKmlNote(
        how === 'share'
          ? 'Sent to the share sheet — choose Save to Files, then open it from the Files app in Google Earth.'
          : how === 'newtab'
            ? 'Opened in a new tab. Save it from there, then open it in Google Earth.'
            : 'Saved to your downloads. Open it in Google Earth.',
      );
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : 'Could not build the map file.');
    }
  }

  async function handleGeneratePDF() {
    if (!surveyId) return;
    setPdfError(null);
    setPdfBusy(true);
    try {
      await generateLightSurveyPDF(surveyId);
    } catch (err) {
      setPdfError(
        `Could not generate the PDF. ${err instanceof Error ? err.message : ''}`.trim(),
      );
    } finally {
      setPdfBusy(false);
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-navy text-white px-4 py-2 flex items-center gap-3 sticky top-0 z-10">
        <HeaderBackButton to={`/assessment/${id}/light`} label="Lots" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">{survey.area_name}</h1>
          <p className="text-xs text-white/60">Parking lot light survey</p>
        </div>
        {gridReady && (
          <button
            type="button"
            onClick={handleGeneratePDF}
            disabled={pdfBusy || readingCount === 0}
            title={readingCount === 0 ? 'Import the meter file at step 3 first' : undefined}
            className="px-4 py-2 bg-blue-medium hover:bg-blue-medium/80 active:scale-95 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            {pdfBusy ? 'Generating…' : 'Light Survey PDF'}
          </button>
        )}
        <ThemeToggle />
      </header>

      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto">
        {/* ---------------- 1. Lot size + grid ---------------- */}
        <Section
          step={1}
          title="Lot size"
          subtitle="Mark three corners on a satellite map and the dimensions follow — or type them in directly if you already have them."
        >
          {/*
            Tapping the corners on county imagery is the accurate route on an
            iPad: the field tablets are Wi-Fi only with no GNSS, so the GPS
            buttons below cannot place a corner well enough to survey from.
          */}
          <div className="bg-blue-pale border border-ink/10 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-ink">Tap the corners on the map</p>
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="px-3 py-1.5 rounded-lg border border-ink/20 bg-surface text-ink text-xs font-semibold"
              >
                {pickerOpen ? 'Hide map' : 'Show map'}
              </button>
            </div>
            {pickerOpen && (
              <AerialCornerPicker
                initialAddress={assessment?.address ?? ''}
                corners={{
                  origin: parseLatLng(originInput),
                  axis: parseLatLng(axisInput),
                  width: parseLatLng(widthPtInput),
                }}
                onImage={(v) => { aerialView.current = v; }}
                onChange={(next) => {
                  setOriginInput(next.origin ? formatLatLng(next.origin) : '');
                  setAxisInput(next.axis ? formatLatLng(next.axis) : '');
                  setWidthPtInput(next.width ? formatLatLng(next.width) : '');
                  setGeoError(null);
                  persistCorners(next.origin, next.axis, next.width);
                }}
              />
            )}
          </div>

          <div className="bg-blue-pale border border-ink/10 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-ink mb-1">Or type the corners in</p>
            <p className="text-xs text-ink/60 mb-3">
              In Google Maps, right-click each corner and the coordinates copy to your
              clipboard. Paste them here and the length, width, and orientation are all
              worked out — nothing to measure by hand. In the field, stand on the corner and
              tap Use GPS instead.
            </p>
            <p className="text-xs text-ink/60 mb-3">
              The order shown is the shortest walk: the first two corners are next to each
              other, so the long side is walked once at the end. The fields don&rsquo;t care
              which order they&rsquo;re filled in. Device GPS lands within 15&ndash;30 ft, which
              on a short side this size is a real error &mdash; the map route is roughly ten
              times more accurate, so use it when you can.
            </p>

            <div className="space-y-2">
              {(
                [
                  ['origin', 'Start corner — grid point 1, where the walk begins', originInput, setOriginInput],
                  ['width', 'Short-side corner — next to the start corner', widthPtInput, setWidthPtInput],
                  ['axis', 'Long-side corner — the far end of the lot', axisInput, setAxisInput],
                ] as const
              ).map(([which, label, value, setter]) => (
                <div key={which}>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                    {label}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      onBlur={commitCoordinates}
                      placeholder="29.211234, -81.023456"
                      className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink placeholder:text-ink/40 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => captureLocation(which)}
                      disabled={locating !== null}
                      className="px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-xs font-semibold hover:bg-blue-light active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
                    >
                      {locating === which ? 'Locating…' : 'Use GPS'}
                    </button>
                  </div>
                  {gpsAccuracy[which] !== undefined && (
                    <p
                      className={`text-xs mt-1 ${
                        gpsAccuracy[which] > GPS_ACCURACY_LIMIT_M
                          ? 'text-score-deficient'
                          : 'text-ink/50'
                      }`}
                    >
                      GPS reported &plusmn;{Math.round(gpsAccuracy[which] * 3.28084)} ft
                      {gpsAccuracy[which] > GPS_ACCURACY_LIMIT_M && (
                        <>
                          {' '}
                          — too coarse for a corner. Right-click the corner in Google Maps
                          instead (about &plusmn;3 ft); this fix would size the lot wrong.
                        </>
                      )}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {geoError && (
              <p className="mt-3 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
                {geoError}
              </p>
            )}

            {derived && (
              <div className="mt-3 text-sm text-ink/80">
                <p>
                  That gives{' '}
                  <strong className="text-ink">
                    {Math.round(derived.length_ft)} ft
                    {derived.width_ft !== null && <> × {Math.round(derived.width_ft)} ft</>}
                  </strong>
                  , long side running{' '}
                  <strong className="text-ink">
                    {compassPoint(derived.bearing)} ({Math.round(derived.bearing)}&deg;)
                  </strong>
                  .
                </p>
                {derived.width_ft === null && (
                  <p className="text-ink/60 mt-1">
                    Add the short-side corner and the width fills in too. Without it, type the
                    width below.
                  </p>
                )}
                {derived.skew_ft !== null && Math.abs(derived.skew_ft) > derived.length_ft * 0.15 && (
                  <p className="text-score-deficient mt-1">
                    The short-side corner sits {Math.round(Math.abs(derived.skew_ft))} ft along
                    the long side rather than square to the start corner. Check it&rsquo;s the
                    corner next to the start corner across the short side — the width above is the
                    perpendicular distance, so a skewed pick understates it.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 flex-wrap mb-4 items-end">
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Length (ft)
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={lengthInput}
                onChange={(e) => setLengthInput(e.target.value)}
                placeholder="448"
                className="w-32 px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                Width (ft)
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                placeholder="165"
                className="w-32 px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink"
              />
            </label>
            <p className="text-xs text-ink/50 pb-3">
              {derived ? 'Filled in from the corners — edit to override.' : 'Or enter them directly.'}
            </p>
          </div>

          {options.length > 0 && (
            <div className="space-y-2">
              {options.map((o) => {
                const active =
                  gridReady && survey.cols === o.cols && survey.rows === o.rows;
                const usable = o.within_capacity && o.meets_minimum;
                return (
                  <button
                    key={`${o.cols}x${o.rows}`}
                    type="button"
                    onClick={() => applyGrid(o)}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-all active:scale-[0.99] ${
                      active
                        ? 'border-navy bg-blue-pale ring-2 ring-navy/20'
                        : 'border-ink/15 bg-surface hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ink">
                        Every {o.spacing_ft} ft
                      </span>
                      <span className="text-sm text-ink/60">
                        {o.points} readings · {o.cols} × {o.rows} grid
                      </span>
                      {o.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-navy text-white">
                          Recommended
                        </span>
                      )}
                      {active && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-score-good text-white">
                          In use
                        </span>
                      )}
                    </div>
                    {(o.short_last_col || o.short_last_row) && (
                      <p className="text-xs text-ink/50 mt-1">
                        The last {o.short_last_col && o.short_last_row
                          ? 'row and column sit'
                          : o.short_last_col
                            ? 'column sits'
                            : 'row sits'}{' '}
                        short of a full {o.spacing_ft} ft step so the lot edge still gets read —
                        just walk to the edge for that one.
                      </p>
                    )}
                    {!usable && (
                      <p className="text-xs text-score-deficient mt-1">
                        {!o.meets_minimum
                          ? `Below the ${MIN_READINGS}-reading minimum.`
                          : `Over the meter's ${METER_MANUAL_CAPACITY}-position manual-log capacity — this walk would need to be split across two files.`}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {lengthFt > 0 && widthFt > 0 && options.length === 0 && (
            <p className="text-sm text-score-deficient">
              No workable grid for those dimensions. Check the numbers, or split an unusually
              shaped lot into two surveys.
            </p>
          )}
        </Section>

        {/* ---------------- 2. Plan the walk ---------------- */}
        {gridReady && plan && (
          <Section
            step={2}
            title="Mark obstructions and walk the grid"
            subtitle="Point 1 is the top-left corner; the numbering snakes back and forth so you never cross the lot twice."
          >
            <div className="bg-blue-pale border border-ink/10 rounded-lg p-4 mb-4 text-sm text-ink/80">
              <p className="font-semibold text-ink mb-2">Meter setup — check before you start</p>
              <ul className="space-y-1 list-disc ml-4">
                <li>
                  <strong>SP-t = 0</strong> (Setup → SP-t) for manual logging — one LOG press per
                  point
                </li>
                <li>
                  <strong>Unit = Ft cd</strong> (hold UNIT to toggle)
                </li>
                <li>
                  <strong>dEC = USA</strong> so decimals are written with a point
                </li>
                <li>
                  <strong>Set the clock</strong> (Setup → dAtE) — an unset meter stamps readings
                  in the year 2000
                </li>
                <li>
                  <strong>PoFF = OFF</strong> so auto power-off doesn&rsquo;t end the session
                </li>
                <li>Zero the sensor with the cap on, then take {plan.expectedReadings} readings in order</li>
              </ul>
            </div>

            <LightGridMap
              cols={survey.cols}
              rows={survey.rows}
              spacingLengthFt={survey.spacing_length_ft}
              spacingWidthFt={survey.spacing_width_ft}
              lengthFt={survey.length_ft}
              widthFt={survey.width_ft}
              skipped={skipped}
              mode="plan"
              onToggleSkip={toggleSkip}
            />

            <p className="text-sm text-ink/70 mt-4">
              <strong className="text-ink">{plan.expectedReadings} readings</strong> to take
              {plan.skipped.length > 0 && (
                <> — {survey.cols * survey.rows} points less {plan.skipped.length} marked obstructed</>
              )}
              .
            </p>

            <EarthExport
              phase="plan"
              enabled={hasGeoreference(survey)}
              onDownload={() => handleDownloadKml('plan')}
              note={kmlNoteFor === 'plan' ? kmlNote : null}
              error={kmlNoteFor === 'plan' ? geoError : null}
            />
          </Section>
        )}

        {/* ---------------- 3. Import ---------------- */}
        {gridReady && (
          <Section
            step={3}
            title="Import the meter file"
            subtitle="Pull the SD card, connect it to the iPad, and pick LXB01001.XLS from the LXB01 folder."
          >
            <input
              ref={fileRef}
              type="file"
              onChange={handleFile}
              className="block w-full text-sm text-ink file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-navy file:text-white file:font-semibold file:cursor-pointer"
            />

            {importError && (
              <p className="mt-3 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
                {importError}
              </p>
            )}

            {importMessage && (
              <p
                className={`mt-3 text-sm rounded-lg p-3 border ${
                  importStatus === 'match'
                    ? 'text-score-good bg-score-good/10 border-score-good/30'
                    : 'text-score-deficient bg-score-deficient/10 border-score-deficient/30'
                }`}
              >
                {importMessage}
              </p>
            )}

            {importWarnings.map((w) => (
              <p
                key={w}
                className="mt-2 text-sm text-score-adequate bg-score-adequate/10 border border-score-adequate/30 rounded-lg p-3"
              >
                {w}
              </p>
            ))}

            {readingCount > 0 && (
              <div className="mt-3 flex items-center gap-3 flex-wrap text-sm text-ink/60">
                <span>
                  {readingCount}
                  {plan ? ` of ${plan.expectedReadings}` : ''} points have readings
                  {survey.imported_filename && <> · {survey.imported_filename}</>}
                </span>
                <button
                  type="button"
                  onClick={() => surveyId && clearReadings(surveyId)}
                  className="text-ink/50 hover:text-red-600 underline"
                >
                  Clear readings
                </button>
              </div>
            )}
          </Section>
        )}

        {/* ---------------- 4. Results ---------------- */}
        {gridReady && !stats && (
          <Section
            step={4}
            title="Results"
            subtitle="Waiting on the meter file"
          >
            <p className="text-sm text-ink/70 max-w-2xl">
              The scorecard, the lot map, and the standalone Light Survey PDF appear here once
              readings are imported at step 3. Nothing to calculate from an empty grid.
            </p>
            <button
              type="button"
              disabled
              className="mt-4 px-6 py-3 rounded-xl bg-navy text-white font-semibold opacity-40 cursor-not-allowed"
            >
              Generate Light Survey PDF
            </button>
          </Section>
        )}

        {gridReady && stats && (
          <Section step={4} title="Results" subtitle={`Measured against ${STANDARD_CITATION}`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'Average', value: formatFc(stats.avg_fc), sub: formatLux(stats.avg_fc) },
                { label: 'Lowest reading', value: formatFc(stats.min_fc), sub: formatLux(stats.min_fc) },
                { label: 'Highest reading', value: formatFc(stats.max_fc), sub: formatLux(stats.max_fc) },
                {
                  label: 'Uniformity (lower is better)',
                  value: formatRatio(stats.avg_min_ratio),
                  sub: `max:min ${formatRatio(stats.max_min_ratio)}`,
                },
              ].map((c) => (
                <div key={c.label} className="bg-blue-pale border border-ink/10 rounded-lg p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">
                    {c.label}
                  </div>
                  <div className="text-lg font-bold text-ink leading-tight">{c.value}</div>
                  <div className="text-[11px] text-ink/50">{c.sub}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-5">
              {verdictLines(stats).map((line) => (
                <div
                  key={line.label}
                  className={`px-4 py-3 rounded-lg border ${
                    line.verdict === 'pass'
                      ? 'bg-score-good/10 border-score-good/30'
                      : 'bg-score-critical/10 border-score-critical/30'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`text-xs font-bold uppercase tracking-wide px-2 py-1 rounded ${
                        line.verdict === 'pass'
                          ? 'bg-score-good text-white'
                          : 'bg-score-critical text-white'
                      }`}
                    >
                      {line.verdict === 'pass' ? 'Meets' : 'Below'}
                    </span>
                    <span className="font-semibold text-ink">{line.label}</span>
                    <span className="text-ink font-bold">{line.value}</span>
                    <span className="text-ink/50 text-sm ml-auto">Target: {line.target}</span>
                  </div>
                  <p className="text-sm text-ink/70 mt-1.5">{line.detail}</p>
                </div>
              ))}
            </div>

            {stats.has_zero_reading && (
              <p className="mb-5 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
                At least one point measured 0.0 fc — complete darkness. The uniformity ratio is
                mathematically undefined at zero, which is why it reads as undefined above rather
                than as a number.
              </p>
            )}

            <h3 className="font-bold text-ink mb-2">Lot map</h3>
            <LightGridMap
              cols={survey.cols}
              rows={survey.rows}
              spacingLengthFt={survey.spacing_length_ft}
              spacingWidthFt={survey.spacing_width_ft}
              lengthFt={survey.length_ft}
              widthFt={survey.width_ft}
              skipped={skipped}
              values={valueMap}
              mode="results"
            />

            <h3 className="font-bold text-ink mt-6 mb-2">Darkest points</h3>
            <p className="text-sm text-ink/60 mb-2">
              Worth photographing on the next visit — these are the locations a finding should
              name.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {darkestPoints(
                (readings ?? []).map((r) => ({ point_index: r.point_index, value_fc: r.value_fc })),
                5,
              ).map((p) => {
                const pos = pointPosition(p.point_index, survey);
                return (
                  <span
                    key={p.point_index}
                    className="px-3 py-2 rounded-lg bg-surface border border-ink/15 text-sm"
                  >
                    <strong className="text-ink">Point {p.point_index}</strong>
                    <span className="text-ink/60">
                      {' '}
                      — {formatFc(p.value_fc)} · {Math.round(pos.x_ft)} ft ×{' '}
                      {Math.round(pos.y_ft)} ft
                    </span>
                  </span>
                );
              })}
            </div>

            {/* Lighting-only report — usable before the checklist is finished. */}
            <EarthExport
              phase="report"
              enabled={hasGeoreference(survey)}
              onDownload={() => handleDownloadKml('report')}
              note={kmlNoteFor === 'report' ? kmlNote : null}
              error={kmlNoteFor === 'report' ? geoError : null}
            />

            <div className="mt-4 pt-4 border-t border-ink/10">
              <p className="text-sm font-semibold text-ink mb-1">Picture for the report</p>
              <p className="text-xs text-ink/60 mb-3 max-w-2xl">
                Draws the grid straight onto the county aerial from step 1 — no second app and
                no screenshot. It uses the view currently shown on that map, so frame the lot
                there first.
              </p>
              <div className="flex gap-2 flex-wrap mb-4">
                <button
                  type="button"
                  onClick={() => drawAerialForReport(readingCount > 0)}
                  disabled={aerialBusy}
                  className="px-5 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-navy-light active:scale-95 transition-all disabled:opacity-50"
                >
                  {aerialBusy
                    ? 'Drawing…'
                    : readingCount > 0
                      ? 'Draw the readings on the aerial'
                      : 'Draw the grid on the aerial'}
                </button>
              </div>

              <p className="text-xs text-ink/60 mb-3 max-w-2xl">
                Or add your own screenshot instead — from Google Earth or anywhere else. Keep
                whatever attribution the source shows in frame.
              </p>

              {survey.aerial_image ? (
                <div className="space-y-2">
                  <img
                    src={survey.aerial_image}
                    alt="Aerial view of the lighting grid"
                    className="max-w-full sm:max-w-lg rounded-lg border border-ink/20"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => aerialRef.current?.click()}
                      className="px-4 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-sm font-semibold hover:bg-blue-light active:scale-95 transition-all"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={removeAerial}
                      className="px-4 py-2 rounded-lg border border-score-critical/40 text-score-critical text-sm font-semibold hover:bg-score-critical/10 active:scale-95 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => aerialRef.current?.click()}
                  disabled={aerialBusy}
                  className="px-5 py-3 rounded-xl bg-surface border border-navy text-navy font-semibold hover:bg-blue-pale active:scale-95 transition-all disabled:opacity-50"
                >
                  {aerialBusy ? 'Adding…' : 'Add screenshot'}
                </button>
              )}

              <input
                ref={aerialRef}
                type="file"
                accept="image/*"
                onChange={handleAerial}
                className="hidden"
              />

              {aerialError && (
                <p className="mt-2 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
                  {aerialError}
                </p>
              )}
            </div>

            <div className="mt-6 pt-5 border-t border-ink/10">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleGeneratePDF}
                  disabled={pdfBusy}
                  className="px-6 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-navy-light active:scale-95 transition-all disabled:opacity-50"
                >
                  {pdfBusy ? 'Generating…' : 'Generate Light Survey PDF'}
                </button>
                <p className="text-sm text-ink/60 flex-1 min-w-[240px]">
                  A standalone report for this lot alone — cover, measurements, lot map, and
                  the disclaimer. The assessment does not need to be complete.
                </p>
              </div>
              {pdfError && (
                <p className="mt-3 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
                  {pdfError}
                </p>
              )}
            </div>
          </Section>
        )}

        {/* ---------------- Survey details ---------------- */}
        <Section
          step={5}
          title="Survey details"
          subtitle="Recorded on the report alongside the readings."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetaField
              label="Area name"
              value={meta.area_name ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, area_name: v }))}
              onCommit={commitMeta}
            />
            <MetaField
              label="Date walked"
              type="date"
              value={meta.surveyed_at ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, surveyed_at: v }))}
              onCommit={commitMeta}
            />
            <MetaField
              label="Observer(s)"
              value={meta.observers ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, observers: v }))}
              onCommit={commitMeta}
            />
            <MetaField
              label="Weather"
              value={meta.weather ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, weather: v }))}
              onCommit={commitMeta}
              placeholder="Clear, dry pavement"
            />
            <MetaField
              label="Lamp type"
              value={meta.lamp_type ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, lamp_type: v }))}
              onCommit={commitMeta}
              placeholder="LED, metal halide, HPS…"
            />
            <MetaField
              label="Fixture type"
              value={meta.fixture_type ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, fixture_type: v }))}
              onCommit={commitMeta}
              placeholder="Shoebox on 25 ft pole…"
            />
            <MetaField
              label="Meter type"
              value={meta.meter_type ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, meter_type: v }))}
              onCommit={commitMeta}
            />
            <MetaField
              label="Meter calibrated"
              type="date"
              value={meta.meter_calibrated_on ?? ''}
              onChange={(v) => setMeta((m) => ({ ...m, meter_calibrated_on: v }))}
              onCommit={commitMeta}
            />
          </div>

          <label className="block mt-3">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
              Notes
            </span>
            <textarea
              value={meta.notes ?? ''}
              onChange={(e) => setMeta((m) => ({ ...m, notes: e.target.value }))}
              onBlur={commitMeta}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink text-sm"
              placeholder="Poles out at the east end, two fixtures dark…"
            />
          </label>
        </Section>

        <p className="text-xs text-ink/50 mb-8">
          Targets: {PARKING_TARGET_AVG_FC.toFixed(1)} fc average, 4:1 uniformity. {STANDARD_CITATION}
        </p>
      </main>
    </div>
  );
}
