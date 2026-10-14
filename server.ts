import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabaseConnection } from './src/server/db/connect.ts';
import { publicRouter } from './src/server/routes/public.ts';
import { appointmentsRouter } from './src/server/routes/appointments.ts';
import { inquiriesRouter } from './src/server/routes/inquiries.ts';
import { authRouter } from './src/server/routes/auth.ts';
import { adminRouter } from './src/server/routes/admin.ts';
import { runSelfDiagnosticTests } from './src/server/tests/apiTests.ts';
import { rateLimit } from './src/server/middleware/rateLimiter.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Basic security and parsing middlewares
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Security Headers
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Global Rate Limiting for API routes
  app.use('/api', rateLimit(120, 60 * 1000));

  // Initialize DB connection (MongoDB Atlas with automatic in-memory fallback)
  const dbStatus = await initDatabaseConnection();
  console.log(`[MediCare Pro] DB State: ${dbStatus.status}`);

  // Mount API Routers
  app.use('/api/public', publicRouter);
  app.use('/api/appointments', appointmentsRouter);
  app.use('/api/inquiries', inquiriesRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);

  // Diagnostic Test Suite Endpoint
  app.get('/api/diagnostics/tests', async (_req: Request, res: Response) => {
    try {
      const results = await runSelfDiagnosticTests();
      res.json({ success: true, ...results });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Centralized Error Handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Server Error]', err);
    res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please contact clinic technical support.'
    });
  });

  // Vite Integration
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[MediCare Pro] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal server boot error:', err);
});
