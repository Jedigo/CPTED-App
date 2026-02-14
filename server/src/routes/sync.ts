import { Router } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/connection.js';
import { assessments, zoneScores, itemScores, photos } from '../db/schema.js';
import { calculateZoneAverage, isZoneComplete, calculateOverallScore } from '../services/scoring.js';

const router = Router();

// POST /api/sync — Accepts full assessment payload from the PWA
router.post('/sync', async (req, res, next) => {
  try {
    const payload = req.body;
    const assessmentId = payload.assessment.id as string;
    const now = new Date();

    await db.transaction(async (tx) => {
      // 1. Upsert assessment
      const [existing] = await tx
        .select({ id: assessments.id })
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
        assessor_name: payload.assessment.assessor_name,
        assessor_badge_id: payload.assessment.assessor_badge_id || null,
        assessment_type: payload.assessment.assessment_type || 'initial',
        weather_conditions: payload.assessment.weather_conditions || '',
        time_of_assessment: payload.assessment.time_of_assessment || 'daytime',
        date_of_assessment: payload.assessment.date_of_assessment,
        overall_score: payload.assessment.overall_score ?? null,
        top_recommendations: payload.assessment.top_recommendations || [],
        quick_wins: payload.assessment.quick_wins || [],
        notes: payload.assessment.notes || '',
        synced_at: now,
      };

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
            score: is.score as number | null,
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
                compass_heading: photo.compass_heading as number | null,
                annotation_data: photo.annotation_data as Record<string, unknown> | null,
              })
              .where(eq(photos.id, photoId));
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
      await tx
        .update(assessments)
        .set({ overall_score: overall, synced_at: now })
        .where(eq(assessments.id, assessmentId));
    });

    res.json({
      success: true,
      synced_at: now.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
