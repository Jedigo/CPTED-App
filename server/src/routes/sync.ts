import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import {
  assessments,
  zoneScores,
  itemScores,
  photos,
  lightSurveys,
  lightReadings,
} from '../db/schema.js';
import { calculateZoneAverage, isZoneComplete, calculateOverallScore } from '../services/scoring.js';

/**
 * Client-supplied instant -> Date, or null.
 *
 * A bad string must not reach the driver: new Date('nonsense') is an Invalid
 * Date, which throws on the way into the query and would take the assessor's
 * entire sync down with it — losing real work to a malformed label.
 */
function toInstant(value: unknown): Date | null {
  if (typeof value !== 'string' || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

const router = Router();

// POST /api/sync — Accepts full assessment payload from the PWA
router.post('/sync', async (req, res, next) => {
  try {
    const payload = req.body;
    const assessmentId = payload.assessment.id as string;
    const now = new Date();

    const committed = await db.transaction(async (tx) => {
      // 1. Upsert assessment
      const [existing] = await tx
        .select({ id: assessments.id, revision: assessments.revision })
        .from(assessments)
        .where(eq(assessments.id, assessmentId));

      const assessmentData = {
        updated_at: now,
        status: payload.assessment.status || 'in_progress',
        property_type: payload.assessment.property_type || 'single_family_residential',
        address: payload.assessment.address,
        city: payload.assessment.city,
        state: payload.assessment.state,
        zip: payload.assessment.zip,
        homeowner_name: payload.assessment.homeowner_name,
        homeowner_contact: payload.assessment.homeowner_contact || '',
        contact_phone: payload.assessment.contact_phone || '',
        assessor_name: payload.assessment.assessor_name,
        assessor_badge_id: payload.assessment.assessor_badge_id || null,
        assessment_type: payload.assessment.assessment_type || 'initial',
        weather_conditions: payload.assessment.weather_conditions || '',
        time_of_assessment: payload.assessment.time_of_assessment || 'daytime',
        date_of_assessment: payload.assessment.date_of_assessment,
        // Only touch the signature date when the device actually sent the key.
        // A PWA older than v0.40.0 has no such field and omits it entirely;
        // treating that as "clear it" would wipe a signed date off the server
        // the moment a colleague on a stale iPad synced the same assessment.
        // An explicit null — which is what clearing the field in Edit Info
        // produces — still clears it. Same guard as light_surveys deletion.
        // Straight through, never new Date(): it is a date-only string.
        ...('report_signed_on' in payload.assessment
          ? { report_signed_on: payload.assessment.report_signed_on ?? null }
          : {}),
        overall_score: payload.assessment.overall_score ?? null,
        top_recommendations: payload.assessment.top_recommendations || [],
        quick_wins: payload.assessment.quick_wins || [],
        notes: payload.assessment.notes || '',
        assessor_signature: payload.assessment.assessor_signature || null,
        // Guarded like report_signed_on: a PWA older than v0.41.0 omits the key
        // entirely, and treating that as "clear it" would wipe the district's
        // page off the server the moment a stale iPad synced.
        ...('school_profile' in payload.assessment
          ? { school_profile: payload.assessment.school_profile ?? null }
          : {}),
        // Revision, device name, and edit time: the three fields that let a
        // shared iPad tell whether the server's copy is ahead of, behind, or
        // divergent from its own. They are one fact in three columns and are
        // never written apart.
        //
        // Key-presence guarded like report_signed_on and school_profile — but
        // unlike those, the fallback is NOT "leave it alone". A PWA older than
        // this feature sends no revision and still overwrites the content
        // wholesale, so leaving the stored revision put would leave a stale
        // number against changed content: every up-to-date device would read
        // "same revision I last pulled" and never fetch the old iPad's work.
        // Invisible lost work is the exact failure this feature exists to
        // prevent, so the server counts that push itself.
        //
        // The cost is accepted knowingly: the PWA pushes whole assessments
        // rather than diffs, so an old iPad re-syncing UNCHANGED content also
        // bumps the counter and briefly tells everyone else the server is
        // ahead. That resolves on the next pull and stops entirely once every
        // iPad is on this build. Telling "changed" from "unchanged" would need
        // a content hash of the whole payload — more machinery than three
        // iPads justify.
        //
        // Stored exactly as sent, never max(existing, incoming): sync is
        // unconditional last-write-wins, so a device pushing an older revision
        // over a newer one has genuinely won, and clamping upward would leave
        // the server claiming a revision whose content it does not hold.
        ...('revision' in payload.assessment
          ? {
              revision: Number(payload.assessment.revision) || 1,
              last_edited_by: (payload.assessment.last_edited_by as string) ?? null,
              last_edited_at: toInstant(payload.assessment.last_edited_at),
            }
          : existing
            ? {
                // Pre-feature client, existing row. Something may have changed
                // and we know nothing about who or when, so the attribution is
                // cleared to its unidentified-device value rather than left
                // pointing at whichever iPad edited last — which would now be
                // a lie. last_edited_by === null is the flag that says so.
                revision: existing.revision + 1,
                last_edited_by: null,
                last_edited_at: now,
              }
            : { revision: 1, last_edited_by: null, last_edited_at: now }),
        synced_at: now,
      };

      // The fleet-upgrade progress bar: when this stops appearing in the
      // container logs, every iPad is on a build that names itself.
      if (!('revision' in payload.assessment)) {
        console.warn(
          `Sync ${assessmentId}: client sent no revision; server counted the push as ${
            existing ? existing.revision + 1 : 1
          }`,
        );
      }

      if (existing) {
        await tx
          .update(assessments)
          .set(assessmentData)
          .where(eq(assessments.id, assessmentId));
      } else {
        await tx.insert(assessments).values({
          id: assessmentId,
          created_at: payload.assessment.created_at
            ? new Date(payload.assessment.created_at)
            : now,
          ...assessmentData,
        });
      }

      // 2. Delete + reinsert zone_scores
      await tx.delete(zoneScores).where(eq(zoneScores.assessment_id, assessmentId));
      if (payload.zone_scores?.length > 0) {
        await tx.insert(zoneScores).values(
          payload.zone_scores.map((zs: Record<string, unknown>) => ({
            id: zs.id as string,
            assessment_id: assessmentId,
            zone_key: zs.zone_key as string,
            zone_name: zs.zone_name as string,
            zone_order: zs.zone_order as number,
            average_score: zs.average_score as number | null,
            priority_findings: (zs.priority_findings as string) || '',
            notes: (zs.notes as string) || '',
            completed: (zs.completed as boolean) || false,
          })),
        );
      }

      // 3. Delete + reinsert item_scores
      await tx.delete(itemScores).where(eq(itemScores.assessment_id, assessmentId));
      if (payload.item_scores?.length > 0) {
        await tx.insert(itemScores).values(
          payload.item_scores.map((is: Record<string, unknown>) => ({
            id: is.id as string,
            assessment_id: assessmentId,
            zone_key: is.zone_key as string,
            principle: is.principle as string,
            item_text: is.item_text as string,
            item_order: is.item_order as number,
            // School assessments rate items 'yes'/'no'/'uto' (string) instead of 1-5
            score: typeof is.score === 'number' ? is.score : null,
            rating: typeof is.score === 'string' ? is.score : null,
            is_na: (is.is_na as boolean) || false,
            notes: (is.notes as string) || '',
            photo_ids: (is.photo_ids as string[]) || [],
          })),
        );
      }

      // 4. Upsert photo metadata (don't touch blob_path for existing)
      if (payload.photos?.length > 0) {
        for (const photo of payload.photos as Record<string, unknown>[]) {
          const photoId = photo.id as string;
          const [existingPhoto] = await tx
            .select({ id: photos.id })
            .from(photos)
            .where(eq(photos.id, photoId));

          if (existingPhoto) {
            await tx
              .update(photos)
              .set({
                item_score_id: (photo.item_score_id as string) || null,
                zone_key: photo.zone_key as string,
                gps_lat: photo.gps_lat as number | null,
                gps_lng: photo.gps_lng as number | null,
                gps_accuracy_m: photo.gps_accuracy_m as number | null,
                compass_heading: photo.compass_heading as number | null,
                annotation_data: photo.annotation_data as Record<string, unknown> | null,
              })
              .where(eq(photos.id, photoId));
          }
        }
      }

      // 4b. Delete + reinsert light surveys and their readings.
      //
      // Same delete-then-insert shape as the score tables: the device is the
      // source of truth for a survey it holds, and a survey is only ever edited
      // on one device. Readings cascade from the survey delete, but they are
      // cleared explicitly so a payload carrying surveys with no readings can't
      // leave orphans behind from an earlier push.
      //
      // Guarded on the key being present, not merely non-empty: an older PWA
      // build posts no light_surveys key at all, and wiping the server's copy
      // because an out-of-date client didn't mention them would be data loss.
      if (payload.light_surveys !== undefined) {
        await tx.delete(lightReadings).where(eq(lightReadings.assessment_id, assessmentId));
        await tx.delete(lightSurveys).where(eq(lightSurveys.assessment_id, assessmentId));

        const surveys = (payload.light_surveys as Record<string, unknown>[]) || [];
        if (surveys.length > 0) {
          await tx.insert(lightSurveys).values(
            surveys.map((ls) => ({
              id: ls.id as string,
              assessment_id: assessmentId,
              created_at: ls.created_at ? new Date(ls.created_at as string) : now,
              updated_at: ls.updated_at ? new Date(ls.updated_at as string) : now,
              area_name: (ls.area_name as string) || 'Parking Lot',
              length_ft: (ls.length_ft as number) ?? 0,
              width_ft: (ls.width_ft as number) ?? 0,
              cols: (ls.cols as number) ?? 0,
              rows: (ls.rows as number) ?? 0,
              spacing_length_ft: (ls.spacing_length_ft as number) ?? 0,
              spacing_width_ft: (ls.spacing_width_ft as number) ?? 0,
              skipped_points: (ls.skipped_points as number[]) || [],
              origin_lat: (ls.origin_lat as number) ?? null,
              origin_lng: (ls.origin_lng as number) ?? null,
              axis_lat: (ls.axis_lat as number) ?? null,
              axis_lng: (ls.axis_lng as number) ?? null,
              width_lat: (ls.width_lat as number) ?? null,
              width_lng: (ls.width_lng as number) ?? null,
              grid_flipped: (ls.grid_flipped as boolean) || false,
              grid_origin: (ls.grid_origin as string | null) ?? null,
              surveyed_at: (ls.surveyed_at as string) ?? null,
              observers: (ls.observers as string) || '',
              weather: (ls.weather as string) || '',
              lamp_type: (ls.lamp_type as string) || '',
              fixture_type: (ls.fixture_type as string) || '',
              pole_height_ft: (ls.pole_height_ft as number) ?? null,
              meter_type: (ls.meter_type as string) || '',
              meter_calibrated_on: (ls.meter_calibrated_on as string) || '',
              notes: (ls.notes as string) || '',
              aerial_image: (ls.aerial_image as string) ?? null,
              aerial_credit: (ls.aerial_credit as string) ?? null,
              unit: (ls.unit as string) || 'fc',
              imported_filename: (ls.imported_filename as string) ?? null,
              imported_at: (ls.imported_at as string) ?? null,
            })),
          );
        }

        const readings = (payload.light_readings as Record<string, unknown>[]) || [];
        if (readings.length > 0) {
          const surveyIds = new Set(surveys.map((ls) => ls.id as string));
          const orphans = readings.filter((r) => !surveyIds.has(r.survey_id as string));
          await tx.insert(lightReadings).values(
            readings
              .filter((r) => surveyIds.has(r.survey_id as string))
              .map((r) => ({
                id: r.id as string,
                survey_id: r.survey_id as string,
                assessment_id: assessmentId,
                point_index: r.point_index as number,
                value_fc: r.value_fc as number,
                raw_value: (r.raw_value as number) ?? (r.value_fc as number),
                raw_unit: (r.raw_unit as string) || '',
                measured_at: (r.measured_at as string) ?? null,
                meter_place: (r.meter_place as number) ?? null,
                source: (r.source as string) || 'imported',
              })),
          );
          if (orphans.length > 0) {
            console.warn(
              `Sync ${assessmentId}: dropped ${orphans.length} light readings with no matching survey`,
            );
          }
        }
      }

      // 5. Recalculate scores
      const allItems = await tx
        .select()
        .from(itemScores)
        .where(eq(itemScores.assessment_id, assessmentId));

      const byZone = new Map<string, typeof allItems>();
      for (const item of allItems) {
        const list = byZone.get(item.zone_key) || [];
        list.push(item);
        byZone.set(item.zone_key, list);
      }

      for (const [zoneKey, items] of byZone) {
        const avg = calculateZoneAverage(items);
        const complete = isZoneComplete(items);
        await tx
          .update(zoneScores)
          .set({ average_score: avg, completed: complete })
          .where(
            and(
              eq(zoneScores.assessment_id, assessmentId),
              eq(zoneScores.zone_key, zoneKey),
            ),
          );
      }

      const overall = calculateOverallScore(byZone);
      // Deliberately does not touch revision. Bumping here would leave the
      // server permanently one ahead of the device that just pushed, so every
      // device would read "server is newer" straight after its own sync.
      //
      // Read the row back rather than reporting what we intended to write, so
      // the reply cannot disagree with what actually committed.
      const [row] = await tx
        .update(assessments)
        .set({ overall_score: overall, synced_at: now })
        .where(eq(assessments.id, assessmentId))
        .returning({
          revision: assessments.revision,
          last_edited_by: assessments.last_edited_by,
          last_edited_at: assessments.last_edited_at,
          overall_score: assessments.overall_score,
        });
      return row;
    });

    res.json({
      success: true,
      synced_at: now.toISOString(),
      // What the server now holds, so the device can record it as the revision
      // it has seen without a second round trip — and so it learns the number
      // in the case where the server counted the push itself. Purely additive:
      // a PWA that predates this reads only synced_at and ignores the rest.
      revision: committed?.revision ?? null,
      last_edited_by: committed?.last_edited_by ?? null,
      last_edited_at: committed?.last_edited_at?.toISOString() ?? null,
      overall_score: committed?.overall_score ?? null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
