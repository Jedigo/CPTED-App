import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/connection.js';
import { photos } from '../db/schema.js';
import { config } from '../config.js';

const router = Router();

// Multer config: store in memory, then write to disk with our naming
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/assessments/:assessmentId/photos — Upload a photo
router.post(
  '/assessments/:assessmentId/photos',
  upload.single('photo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No photo file provided' });
        return;
      }

      const assessmentId = req.params.assessmentId as string;
      const photoId = (req.body.id || uuidv4()) as string;
      const ext = path.extname(req.file.originalname) || '.jpg';
      const filename = `${photoId}${ext}`;

      // Ensure directory exists
      const dir = path.join(config.photoDir, assessmentId);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      const filePath = path.join(dir, filename);
      await fs.writeFile(filePath, req.file.buffer);

      // Insert DB record
      await db.insert(photos).values({
        id: photoId,
        assessment_id: assessmentId,
        item_score_id: req.body.item_score_id || null,
        zone_key: req.body.zone_key || '',
        captured_at: req.body.captured_at ? new Date(req.body.captured_at) : new Date(),
        blob_path: filePath,
        filename: req.file.originalname,
        mime_type: req.file.mimetype,
        gps_lat: req.body.gps_lat ? parseFloat(req.body.gps_lat) : null,
        gps_lng: req.body.gps_lng ? parseFloat(req.body.gps_lng) : null,
        compass_heading: req.body.compass_heading
          ? parseFloat(req.body.compass_heading)
          : null,
        annotation_data: req.body.annotation_data
          ? JSON.parse(req.body.annotation_data)
          : null,
        synced: true,
      });

      res.status(201).json({ id: photoId, filename, uploaded: true });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/photos/:id — Serve photo file
router.get('/photos/:id', async (req, res, next) => {
  try {
    const [photo] = await db
      .select()
      .from(photos)
      .where(eq(photos.id, req.params.id));

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Check file exists
    try {
      await fs.access(photo.blob_path);
    } catch {
      res.status(404).json({ error: 'Photo file not found on disk' });
      return;
    }

    res.setHeader('Content-Type', photo.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const fileBuffer = await fs.readFile(photo.blob_path);
    res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/photos/:id — Delete photo file + DB record
router.delete('/photos/:id', async (req, res, next) => {
  try {
    const [photo] = await db
      .select()
      .from(photos)
      .where(eq(photos.id, req.params.id));

    if (!photo) {
      res.status(404).json({ error: 'Photo not found' });
      return;
    }

    // Delete from DB
    await db.delete(photos).where(eq(photos.id, req.params.id));

    // Delete file from disk
    try {
      await fs.unlink(photo.blob_path);
    } catch {
      // File may already be gone
    }

    res.json({ deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
