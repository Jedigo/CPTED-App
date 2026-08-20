/**
 * The school's own site facts — roll, capacity, staffing — printed as the first
 * numbered page of a school report.
 *
 * The field list is approved content, mirroring the page the district already
 * circulates, so it lives here once and drives both the entry form and the PDF.
 * Two lists would drift, and a report that disagrees with the form is worse
 * than either.
 *
 * Every entered value is text, because "1,500" is what a school actually says.
 * The staff figures are never added together — the school's own total counts
 * categories this page does not itemise. The student-to-teacher ratio is the
 * one derived value, so it cannot fall out of step with the two numbers it
 * comes from.
 */

import { touchAssessment } from './touch';
import type { Assessment, SchoolProfile } from '../types';

export type SchoolProfileFieldKey = Exclude<keyof SchoolProfile, 'photo' | 'build_history'>;

export interface SchoolProfileField {
  key: SchoolProfileFieldKey;
  /** Printed in the report and shown on the form — one wording, both places. */
  label: string;
  placeholder: string;
}

export const SCHOOL_PROFILE_FIELDS: SchoolProfileField[] = [
  { key: 'student_population', label: 'Current Student Population is Approximately', placeholder: '950' },
  { key: 'max_occupancy', label: 'School Built Maximum Student Occupancy Approximately', placeholder: '1,500' },
  { key: 'teachers_staff_total', label: 'Approximately Current Teachers / Staff', placeholder: '180' },
  { key: 'admin_positions', label: 'Admin Positions', placeholder: '4' },
  { key: 'counselors', label: 'School Counselors', placeholder: '3' },
  { key: 'office_staff', label: 'Office Staff', placeholder: '12' },
  { key: 'teachers', label: 'Teachers', placeholder: '43' },
  { key: 'support_staff', label: 'Support Staff to Include SRO and Guardians', placeholder: '3' },
  { key: 'kitchen_staff', label: 'Kitchen Staff', placeholder: '8' },
];

/** Printed under the entered figures, with the ratio this works out to. */
export const STUDENT_TEACHER_RATIO_LABEL = 'Student to Teacher Ratio';

/**
 * Roll divided by teachers, as "22 to 1".
 *
 * Derived rather than typed so it cannot go stale when either number is
 * corrected — 950 over 43 teachers is the 22 to 1 on the district's own page.
 * Note it keys off the teacher count, not the all-staff total.
 *
 * Null whenever it can't be worked out: either figure missing, unreadable, or
 * no teachers entered. Nothing else here is calculated — staff counts are never
 * added together, because the school's own total covers categories this page
 * does not itemise and a sum would contradict it.
 */
export function studentTeacherRatio(profile: SchoolProfile): string | null {
  const students = toCount(profile.student_population);
  const teachers = toCount(profile.teachers);
  if (students === null || teachers === null || teachers <= 0) return null;
  return `${Math.round(students / teachers)} to 1`;
}

/** "1,500" and " 950 " are both what a school says. Anything else is not a count. */
function toCount(raw: string): number | null {
  const cleaned = (raw ?? '').replace(/[,\s]/g, '');
  if (!/^\d+$/.test(cleaned)) return null;
  return Number(cleaned);
}

export function emptySchoolProfile(): SchoolProfile {
  return {
    photo: null,
    build_history: '',
    student_population: '',
    max_occupancy: '',
    teachers_staff_total: '',
    admin_positions: '',
    counselors: '',
    office_staff: '',
    teachers: '',
    support_staff: '',
    kitchen_staff: '',
  };
}

/**
 * Whether there is anything worth printing. An assessment that never had the
 * page filled in gets no page at all, the same way one with no light survey
 * gets no lighting section.
 */
export function hasSchoolProfileContent(profile: SchoolProfile | null | undefined): boolean {
  if (!profile) return false;
  if (profile.photo) return true;
  if (profile.build_history.trim()) return true;
  return SCHOOL_PROFILE_FIELDS.some((f) => (profile[f.key] ?? '').trim() !== '');
}

/** Reads the stored profile, filling in any key a older record predates. */
export function readSchoolProfile(assessment: Assessment | undefined): SchoolProfile {
  return { ...emptySchoolProfile(), ...(assessment?.school_profile ?? {}) };
}

export async function saveSchoolProfile(
  assessmentId: string,
  profile: SchoolProfile,
): Promise<void> {
  await touchAssessment(assessmentId, { school_profile: profile });
}
