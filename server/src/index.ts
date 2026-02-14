import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { errorHandler } from './middleware/errorHandler.js';
import { runMigrations } from './db/migrate.js';
import assessmentRoutes from './routes/assessments.js';
import photoRoutes from './routes/photos.js';
import syncRoutes from './routes/sync.js';
import reportRoutes from './routes/reports.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/assessments', assessmentRoutes);
app.use('/api', photoRoutes);
app.use('/api', syncRoutes);
app.use('/api', reportRoutes);

// Error handler (must be last)
app.use(errorHandler);

async function start() {
  try {
    await runMigrations();
  } catch (err) {
    console.warn('Migration skipped (DB may not be available):', (err as Error).message);
  }

  app.listen(config.port, () => {
    console.log(`CPTED server listening on port ${config.port}`);
  });
}

start();

export default app;
