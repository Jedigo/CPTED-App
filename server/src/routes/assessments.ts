import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';
import { assessments, zoneScores, itemScores, photos } from '../db/schema.js';
import { ZONES } from '../data/zones.js';
import { config } from '../config.js';
import fs from 'fs/promises';
import path from 'path';

const router = Router();

// POST /api/assessments — Create a new assessment with all zone_scores + item_scores
router.post('/', async (req, res, next) => {
  try {
    const id = req.body.id || uuidv4();
    const now = new Date();

    // Insert assessment
    await db.insert(assessments).values({
      id,
      created_at: now,
      updated_at: now,
      status: req.body.status || 'in_progress',
      property_type: req.body.property_type || 'single_family_residential',
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      homeowner_name: req.body.homeowner_name,
      homeowner_contact: req.body.homeowner_contact || '',
      assessor_name: req.body.assessor_name,
      assessor_badge_id: req.body.assessor_badge_id || null,
      assessment_type: req.body.assessment_type || 'initial',
      weather_conditions: req.body.weather_conditions || '',
      time_of_assessment: req.body.time_of_assessment || 'daytime',
      date_of_assessment: req.body.date_of_assessment,
      overall_score: null,
      top_recommendations: req.body.top_recommendations || [],
      quick_wins: req.body.quick_wins || [],
      notes: req.body.notes || '',
    });

    // Create zone_scores for all 7 zones
    const zoneRows = ZONES.map((zone) => ({
      id: uuidv4(),
      assessment_id: id,
      zone_key: zone.key,
      zone_name: zone.name,
      zone_order: zone.order,
      average_score: null,
      priority_findings: '',
      notes: '',
      completed: false,
    }));
    await db.insert(zoneScores).values(zoneRows);

    // Create item_scores for all 141 checklist items
    const itemRows: Array<{
      id: string;
      assessment_id: string;
      zone_key: string;
      principle: string;
      item_text: string;
      item_order: number;
      score: null;
      is_na: boolean;
      notes: string;
      photo_ids: string[];
    }> = [];
    let globalOrder = 0;
    for (const zone of ZONES) {
      for (const principle of zone.principles) {
        for (const itemText of principle.items) {
          itemRows.push({
            id: uuidv4(),
            assessment_id: id,
            zone_key: zone.key,
            principle: principle.key,
            item_text: itemText,
            item_order: globalOrder++,
            score: null,
            is_na: false,
            notes: '',
            photo_ids: [],
          });
        }
      }
    }
    await db.insert(itemScores).values(itemRows);

    res.status(201).json({ id, created: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments — List all assessments
router.get('/', async (req, res, next) => {
  try {
    const statusFilter = req.query.status as string | undefined;
    let rows;
    if (statusFilter) {
      rows = await db
        .select()
        .from(assessments)
        .where(eq(assessments.status, statusFilter))
        .orderBy(assessments.created_at);
    } else {
      rows = await db
        .select()
        .from(assessments)
        .orderBy(assessments.created_at);
    }
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id — Full assessment with all related data
router.get('/:id', async (req, res, next) => {
  try {
    const [assessment] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, req.params.id));

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    const [zones, items, photoRows] = await Promise.all([
      db.select().from(zoneScores).where(eq(zoneScores.assessment_id, req.params.id)),
      db.select().from(itemScores).where(eq(itemScores.assessment_id, req.params.id)),
      db
        .select({
          id: photos.id,
          assessment_id: photos.assessment_id,
          item_score_id: photos.item_score_id,
          zone_key: photos.zone_key,
          captured_at: photos.captured_at,
          filename: photos.filename,
          mime_type: photos.mime_type,
          gps_lat: photos.gps_lat,
          gps_lng: photos.gps_lng,
          compass_heading: photos.compass_heading,
          annotation_data: photos.annotation_data,
          synced: photos.synced,
        })
        .from(photos)
        .where(eq(photos.assessment_id, req.params.id)),
    ]);

    res.json({
      ...assessment,
      zone_scores: zones,
      item_scores: items,
      photos: photoRows,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/assessments/:id — Update assessment metadata, scores, recommendations
router.put('/:id', async (req, res, next) => {
  try {
    const [existing] = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, req.params.id));

    if (!existing) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    const updates: Record<string, unknown> = { updated_at: new Date() };
    const allowedFields = [
      'status', 'address', 'city', 'state', 'zip',
      'homeowner_name', 'homeowner_contact', 'assessor_name', 'assessor_badge_id',
      'assessment_type', 'weather_conditions', 'time_of_assessment', 'date_of_assessment',
      'overall_score', 'top_recommendations', 'quick_wins', 'notes',
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    await db.update(assessments).set(updates).where(eq(assessments.id, req.params.id));

    // Update zone_scores if provided
    if (req.body.zone_scores) {
      for (const zs of req.body.zone_scores) {
        await db
          .update(zoneScores)
          .set({
            average_score: zs.average_score,
            priority_findings: zs.priority_findings ?? '',
            notes: zs.notes ?? '',
            completed: zs.completed ?? false,
          })
          .where(eq(zoneScores.id, zs.id));
      }
    }

    // Update item_scores if provided
    if (req.body.item_scores) {
      for (const is of req.body.item_scores) {
        await db
          .update(itemScores)
          .set({
            score: is.score,
            is_na: is.is_na ?? false,
            notes: is.notes ?? '',
            photo_ids: is.photo_ids ?? [],
          })
          .where(eq(itemScores.id, is.id));
      }
    }

    res.json({ updated: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assessments/:id — Cascade delete + remove photo files
router.delete('/:id', async (req, res, next) => {
  try {
    // Get photo paths before deleting
    const photoRows = await db
      .select({ blob_path: photos.blob_path })
      .from(photos)
      .where(eq(photos.assessment_id, req.params.id));

    // CASCADE delete handles all related rows
    const result = await db
      .delete(assessments)
      .where(eq(assessments.id, req.params.id))
      .returning({ id: assessments.id });

    if (result.length === 0) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Remove photo files from disk
    for (const { blob_path } of photoRows) {
      try {
        await fs.unlink(blob_path);
      } catch {
        // File may not exist
      }
    }

    // Try to remove the assessment photo directory
    const photoDir = path.join(config.photoDir, req.params.id);
    try {
      await fs.rmdir(photoDir);
    } catch {
      // Directory may not exist or not be empty
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
