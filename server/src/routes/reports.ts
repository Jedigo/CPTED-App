import { Router } from 'express';
import { generatePDFBuffer } from '../services/pdf.js';

const router = Router();

// GET /api/assessments/:id/report — Generate and download PDF report
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

export default router;
