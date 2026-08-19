/**
 * Crime-analyst PDFs: upload, download, remove.
 *
 * Mirrors the photo route rather than riding the sync payload. The file is
 * stored on disk and only its metadata in the database, because the report
 * merges the analyst's pages in byte-for-byte and a JSON round trip through
 * base64 would inflate it by a third for no gain.
 */

import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/connection.js';
import { crimeReports } from '../db/schema.js';
import { config } from '../config.js';

const router = Router();

// Real reports run under 1 MB; this is headroom, and it matches the client's
// own limit so a file the device accepted is never refused on arrival.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

// POST /api/assessments/:assessmentId/crime-report — upload (replaces any existing)
router.post(
  '/assessments/:assessmentId/crime-report',
  upload.single('report'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No PDF provided' });
        return;
      }

      const assessmentId = req.params.assessmentId as string;
      const id = (req.body.id || uuidv4()) as string;

      const dir = path.join(config.crimeReportDir, assessmentId);
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, `${id}.pdf`);
      await fs.writeFile(filePath, req.file.buffer);

      // One per assessment: clear any previous row and its file first, so a
      // replacement doesn't leave an orphan on disk forever.
      const previous = await db
        .select({ id: crimeReports.id, blob_path: crimeReports.blob_path })
        .from(crimeReports)
        .where(eq(crimeReports.assessment_id, assessmentId));

      for (const row of previous) {
        if (row.id === id) continue;
        await db.delete(crimeReports).where(eq(crimeReports.id, row.id));
        try {
          await fs.unlink(row.blob_path);
        } catch {
          // Already gone.
        }
      }

      const data = {
        assessment_id: assessmentId,
        blob_path: filePath,
        filename: req.file.originalname,
        size_bytes: req.file.size,
        page_count: parseInt(req.body.page_count, 10) || 0,
        source: req.body.source || '',
        uploaded_at: req.body.uploaded_at || new Date().toISOString(),
      };

      const [existing] = await db
        .select({ id: crimeReports.id })
        .from(crimeReports)
        .where(eq(crimeReports.id, id));

      if (existing) {
        await db.update(crimeReports).set(data).where(eq(crimeReports.id, id));
      } else {
        await db.insert(crimeReports).values({ id, ...data });
      }

      res.status(201).json({ id, ...data });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/assessments/:assessmentId/crime-report — download the PDF itself
router.get('/assessments/:assessmentId/crime-report', async (req, res, next) => {
  try {
    const [row] = await db
      .select()
      .from(crimeReports)
      .where(eq(crimeReports.assessment_id, req.params.assessmentId as string));

    if (!row) {
      res.status(404).json({ error: 'No crime report for this assessment' });
      return;
    }

    const file = await fs.readFile(row.blob_path);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${row.filename}"`);
    res.send(file);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/assessments/:assessmentId/crime-report
router.delete('/assessments/:assessmentId/crime-report', async (req, res, next) => {
  try {
    const rows = await db
      .select({ id: crimeReports.id, blob_path: crimeReports.blob_path })
      .from(crimeReports)
      .where(eq(crimeReports.assessment_id, req.params.assessmentId as string));

    for (const row of rows) {
      await db.delete(crimeReports).where(eq(crimeReports.id, row.id));
      try {
        await fs.unlink(row.blob_path);
      } catch {
        // Already gone.
      }
    }

    res.json({ deleted: rows.length });
  } catch (err) {
    next(err);
  }
});

export default router;
