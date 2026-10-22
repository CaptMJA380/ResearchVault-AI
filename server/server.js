import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';
import paperRoutes from './routes/paperRoutes.js';
import collectionRoutes from './routes/collectionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { getAIStatus } from './services/aiService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ────────────────────────────────────────────────────────────────

// Enable CORS for Vite dev server and production clients
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON bodies with reasonable payload limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Routes ─────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health-check endpoint — confirms API server is running,
 * preserves Step 2 response structure, and includes database & AI status.
 */
app.get('/api/health', (_req, res) => {
  const dbStatus = getDBStatus();
  const aiStatus = getAIStatus();

  res.status(200).json({
    ok: true,
    message: 'ResearchVault AI API is running',
    database: {
      configured: dbStatus.configured,
      state: dbStatus.state,
    },
    ai: aiStatus,
  });
});

/**
 * GET /api/health/ready
 * Readiness endpoint — checks whether database connection is active and ready.
 * Returns 200 if connected, 503 if not configured or disconnected.
 */
app.get('/api/health/ready', (_req, res) => {
  const dbStatus = getDBStatus();

  if (dbStatus.state === 'connected') {
    return res.status(200).json({
      ready: true,
      database: dbStatus,
      message: 'Service is ready and connected to database',
    });
  }

  return res.status(503).json({
    ready: false,
    database: dbStatus,
    message:
      dbStatus.state === 'not_configured'
        ? 'Database is not configured. Please set MONGODB_URI in server/.env'
        : `Database is not ready (state: ${dbStatus.state})`,
  });
});

// ─── Application API Routes ───────────────────────────────────────────────────

app.use('/api/papers', paperRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler for unknown routes
app.use((req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────

let serverInstance = null;

export function startServer(port = PORT) {
  return new Promise((resolve, reject) => {
    const server = app.listen(port, async () => {
      console.log('');
      console.log('  ╔══════════════════════════════════════════════════╗');
      console.log('  ║          ResearchVault AI — API Server           ║');
      console.log('  ╠══════════════════════════════════════════════════╣');
      console.log(`  ║  Server URL:    http://localhost:${port}            ║`);
      console.log('  ║  Health:        /api/health                      ║');
      console.log('  ║  Ready:         /api/health/ready                ║');
      console.log('  ║  Dashboard:     /api/dashboard/stats             ║');
      console.log('  ║  Papers API:    /api/papers                      ║');
      console.log('  ║  Collections:   /api/collections                 ║');
      console.log('  ║  Semantic:      /api/search/semantic             ║');
      console.log('  ╚══════════════════════════════════════════════════╝');
      resolve(server);
      // Connect database asynchronously without crashing if absent in dev mode
      connectDB().catch((err) => {
        console.warn('  [MongoDB] Async connection error:', err.message);
      });
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n  ✖ Port ${port} is already in use. Stop the conflicting process and retry.\n`);
      } else {
        console.error(`\n  ✖ Server failed to start: ${err.message}\n`);
      }
      reject(err);
    });

    serverInstance = server;
  });
}

// Auto-start server when run directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch(() => process.exit(1));
}

export { app, serverInstance };
