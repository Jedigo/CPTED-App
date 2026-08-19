/**
 * School site profile — the roll, capacity and staffing figures the district
 * asks to see on the front of a school report, plus an overall photo.
 *
 * Every value is transcribed from what the school tells the assessor. Nothing
 * is calculated here on purpose.
 */

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import HeaderBackButton from '../components/HeaderBackButton';
import ThemeToggle from '../components/ThemeToggle';
import { compressImage } from '../services/photos';
import {
  SCHOOL_PROFILE_FIELDS,
  STUDENT_TEACHER_RATIO_LABEL,
  emptySchoolProfile,
  readSchoolProfile,
  saveSchoolProfile,
  studentTeacherRatio,
} from '../services/school-profile';
import {
  LARGE_CRIME_REPORT_BYTES,
  deleteCrimeReport,
  formatBytes,
  saveCrimeReport,
} from '../services/crime-report';
import type { SchoolProfile as SchoolProfileData } from '../types';

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface border border-ink/10 rounded-xl p-5 mb-5">
      <h2 className="font-bold text-ink">{title}</h2>
      {subtitle && <p className="text-sm text-ink/60 mt-1 mb-3">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default function SchoolProfile() {
  const { id } = useParams<{ id: string }>();
  const assessment = useLiveQuery(() => (id ? db.assessments.get(id) : undefined), [id]);
  const crimeReport = useLiveQuery(
    async () => (id ? (await db.crime_reports.where('assessment_id').equals(id).toArray())[0] : undefined),
    [id],
  );

  const [profile, setProfile] = useState<SchoolProfileData>(emptySchoolProfile());
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [crimeBusy, setCrimeBusy] = useState(false);
  const [crimeError, setCrimeError] = useState<string | null>(null);
  const crimeRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const photoRef = useRef<HTMLInputElement>(null);

  // Hydrate once, then the inputs own the values — re-syncing from the record
  // on every live-query tick would fight the assessor mid-keystroke.
  useEffect(() => {
    if (hydrated.current || !assessment) return;
    hydrated.current = true;
    setProfile(readSchoolProfile(assessment));
  }, [assessment]);

  async function handleCrimePdf(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !id) return;

    setCrimeBusy(true);
    setCrimeError(null);
    try {
      await saveCrimeReport(id, file);
    } catch (err) {
      setCrimeError(err instanceof Error ? err.message : 'That file could not be added.');
    } finally {
      setCrimeBusy(false);
    }
  }

  async function commit(next: SchoolProfileData) {
    setProfile(next);
    if (!id) return;
    await saveSchoolProfile(id, next);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  }

  function setField(key: keyof SchoolProfileData, value: string) {
    setProfile((p) => ({ ...p, [key]: value }));
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setPhotoBusy(true);
    setPhotoError(null);
    try {
      // Wider than a checklist photo: this prints nearly full width on the page
      // and is usually an aerial where the detail is the point.
      const dataUrl = await compressImage(file, 2200, 0.82);
      await commit({ ...profile, photo: dataUrl });
    } catch {
      setPhotoError('That image could not be read. Try a JPEG or PNG.');
    } finally {
      setPhotoBusy(false);
    }
  }

  if (!assessment) {
    return <div className="min-h-full flex items-center justify-center text-ink/60">Loading…</div>;
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-navy text-white px-4 py-2 flex items-center gap-3 sticky top-0 z-10">
        <HeaderBackButton to={`/assessment/${id}`} label="Assessment" />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold truncate">School Information</h1>
          <p className="text-xs text-white/60 truncate">
            {assessment.homeowner_name || assessment.address}
          </p>
        </div>
        {saved && <span className="text-xs text-white/70">Saved</span>}
        <ThemeToggle />
      </header>

      <main className="flex-1 p-6 max-w-3xl w-full mx-auto">
        <p className="text-sm text-ink/60 mb-5">
          These figures print as the first page of the report, under the school&rsquo;s name. Ask
          the school for each one &mdash; nothing here is calculated. Anything left blank is left
          off the page, and if the whole form is empty the page is omitted entirely.
        </p>

        <Section
          title="Overall photo"
          subtitle="One shot of the whole school — an aerial reads best. Prints under the school name."
        >
          {profile.photo ? (
            <div>
              <img
                src={profile.photo}
                alt="The school"
                className="w-full rounded-lg border border-ink/10"
              />
              <div className="flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  disabled={photoBusy}
                  className="px-5 py-3 rounded-xl bg-surface border border-navy text-navy font-semibold hover:bg-blue-pale active:scale-95 transition-all disabled:opacity-50"
                >
                  {photoBusy ? 'Adding…' : 'Replace photo'}
                </button>
                <button
                  type="button"
                  onClick={() => commit({ ...profile, photo: null })}
                  className="px-5 py-3 rounded-xl bg-surface border border-ink/20 text-ink/70 font-semibold hover:bg-ink/5 active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              disabled={photoBusy}
              className="px-5 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-navy/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {photoBusy ? 'Adding…' : 'Add photo'}
            </button>
          )}

          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="hidden"
          />

          {photoError && (
            <p className="mt-3 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
              {photoError}
            </p>
          )}

          <label className="block mt-4">
            <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
              Caption under the photo
            </span>
            <textarea
              value={profile.build_history}
              onChange={(e) => setField('build_history', e.target.value)}
              onBlur={() => commit(profile)}
              rows={2}
              placeholder="Current school completed construction in 2006 replacing previous building on same property that was built in 1927"
              className="w-full px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink placeholder:text-ink/40 text-sm"
            />
          </label>
        </Section>

        <Section
          title="Crime analysis report"
          subtitle="The analysts' own PDF, merged into the back of the report exactly as supplied — nothing added to their pages. Goes in after the lighting measurements, so the district gets one document, not two."
        >
          {crimeReport ? (
            <div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-pale border border-ink/10">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink truncate">{crimeReport.filename}</p>
                  <p className="text-sm text-ink/60">
                    {crimeReport.page_count} page{crimeReport.page_count === 1 ? '' : 's'} &middot;{' '}
                    {formatBytes(crimeReport.size_bytes)}
                  </p>
                </div>
              </div>

              {crimeReport.size_bytes > LARGE_CRIME_REPORT_BYTES && (
                <p className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  That is a large file. It will still work, but it makes the report slower to
                  produce and slower to sync over a phone hotspot.
                </p>
              )}

              <div className="flex gap-2 flex-wrap mt-3">
                <button
                  type="button"
                  onClick={() => crimeRef.current?.click()}
                  disabled={crimeBusy}
                  className="px-5 py-3 rounded-xl bg-surface border border-navy text-navy font-semibold hover:bg-blue-pale active:scale-95 transition-all disabled:opacity-50"
                >
                  {crimeBusy ? 'Adding…' : 'Replace PDF'}
                </button>
                <button
                  type="button"
                  onClick={() => deleteCrimeReport(crimeReport.id)}
                  className="px-5 py-3 rounded-xl bg-surface border border-ink/20 text-ink/70 font-semibold hover:bg-ink/5 active:scale-95 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => crimeRef.current?.click()}
              disabled={crimeBusy}
              className="px-5 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-navy/90 active:scale-95 transition-all disabled:opacity-50"
            >
              {crimeBusy ? 'Adding…' : 'Upload crime analysis PDF'}
            </button>
          )}

          <input
            ref={crimeRef}
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleCrimePdf}
            className="hidden"
          />

          {crimeError && (
            <p className="mt-3 text-sm text-score-critical bg-score-critical/10 border border-score-critical/30 rounded-lg p-3">
              {crimeError}
            </p>
          )}
        </Section>

        <Section title="Population and staffing" subtitle="As reported by the school.">
          <div className="space-y-3">
            {SCHOOL_PROFILE_FIELDS.map((field) => (
              <label key={field.key} className="block">
                <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                  {field.label}
                </span>
                <input
                  type="text"
                  inputMode="text"
                  value={profile[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  onBlur={() => commit(profile)}
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 rounded-lg border border-ink/20 bg-surface text-ink placeholder:text-ink/40 text-sm"
                />
              </label>
            ))}

            <div className="pt-3 border-t border-ink/10">
              <span className="block text-xs font-semibold uppercase tracking-wide text-ink/50 mb-1">
                {STUDENT_TEACHER_RATIO_LABEL}
              </span>
              <p className="text-base font-bold text-ink">
                {studentTeacherRatio(profile) ?? (
                  <span className="text-ink/40 font-normal text-sm">
                    Fill in the roll and the teacher count above
                  </span>
                )}
              </p>
              <span className="block text-xs text-ink/50 mt-1">
                Worked out from the student population and the number of teachers, so it can&rsquo;t
                fall out of step with them. Nothing else on this page is calculated &mdash; the
                staff figures are printed exactly as the school gives them.
              </span>
            </div>
          </div>
        </Section>
      </main>
    </div>
  );
}
