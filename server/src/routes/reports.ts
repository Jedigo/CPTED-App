import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { db } from '../db/connection.js';
import { reports, assessments } from '../db/schema.js';
import { config } from '../config.js';
import { generatePDFBuffer } from '../services/pdf.js';

const router = Router();

// GET /api/assessments/:id/report — Generate PDF on the fly (always fresh)
router.get('/assessments/:id/report', async (req, res, next) => {
  try {
    const assessmentId = req.params.id as string;
    const { buffer, filename } = await generatePDFBuffer(assessmentId);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.byteLength);
    res.send(Buffer.from(buffer));
  } catch (err) {
    if ((err as Error).message === 'Assessment not found') {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    next(err);
  }
});

// POST /api/assessments/:id/report/save — Generate and save PDF to disk
router.post('/assessments/:id/report/save', async (req, res, next) => {
  try {
    const assessmentId = req.params.id as string;

    // Verify assessment exists
    const [assessment] = await db
      .select({ id: assessments.id })
      .from(assessments)
      .where(eq(assessments.id, assessmentId));

    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }

    // Generate PDF
    const { buffer, filename } = await generatePDFBuffer(assessmentId);

    // Ensure report directory exists
    const reportDir = path.join(config.reportDir, assessmentId);
    await fs.mkdir(reportDir, { recursive: true });

    // Write to disk
    const reportId = uuidv4();
    const filePath = path.join(reportDir, `${reportId}.pdf`);
    await fs.writeFile(filePath, Buffer.from(buffer));

    // Delete any previous report for this assessment
    const existing = await db
      .select()
      .from(reports)
      .where(eq(reports.assessment_id, assessmentId));

    for (const old of existing) {
      try {
        await fs.unlink(old.blob_path);
      } catch {
        // File may already be gone
      }
    }
    if (existing.length > 0) {
      await db
        .delete(reports)
        .where(eq(reports.assessment_id, assessmentId));
    }

    // Insert new report record
    await db.insert(reports).values({
      id: reportId,
      assessment_id: assessmentId,
      blob_path: filePath,
      filename,
      mime_type: 'application/pdf',
      file_size: buffer.byteLength,
    });

    res.json({
      id: reportId,
      filename,
      file_size: buffer.byteLength,
      generated_at: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id/report/saved — Download the saved PDF from disk
router.get('/assessments/:id/report/saved', async (req, res, next) => {
  try {
    const assessmentId = req.params.id as string;

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.assessment_id, assessmentId));

    if (!report) {
      res.status(404).json({ error: 'No saved report found. Generate one first.' });
      return;
    }

    // Verify file exists on disk
    try {
      await fs.access(report.blob_path);
    } catch {
      res.status(404).json({ error: 'Report file not found on disk.' });
      return;
    }

    const fileBuffer = await fs.readFile(report.blob_path);
    res.setHeader('Content-Type', report.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${report.filename}"`);
    res.setHeader('Content-Length', fileBuffer.byteLength);
    res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
});

// GET /api/assessments/:id/report/info — Check if a saved report exists
router.get('/assessments/:id/report/info', async (req, res, next) => {
  try {
    const assessmentId = req.params.id as string;

    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.assessment_id, assessmentId));

    if (!report) {
      res.json({ exists: false });
      return;
    }

    res.json({
      exists: true,
      id: report.id,
      filename: report.filename,
      file_size: report.file_size,
      generated_at: report.generated_at,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
