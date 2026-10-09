import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB, getDBStatus } from './config/db.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// ─── Middleware ────────────────────────────────────────────────────────────────

// Enable CORS for the Vite dev server
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Parse incoming JSON bodies
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Health-check endpoint — confirms the API server is running,
 * and reports the current database configuration and state.
 */
app.get('/api/health', (_req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    ok: true,
    message: 'ResearchVault AI API is running',
    database: {
      configured: dbStatus.configured,
      state: dbStatus.state,
    },
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

// ─── Start Server ─────────────────────────────────────────────────────────────

const server = app.listen(PORT, async () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║       ResearchVault AI — API Server      ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Server running at http://localhost:${PORT}  ║`);
  console.log('  ║  Health: /api/health                     ║');
  console.log('  ║  Ready:  /api/health/ready               ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');

  // Attempt database connection without blocking startup or claiming false success
  await connectDB();
});

// Surface startup errors explicitly instead of silently failing
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  ✖ Port ${PORT} is already in use. Stop the conflicting process and retry.\n`);
  } else {
    console.error(`\n  ✖ Server failed to start: ${err.message}\n`);
  }
  process.exit(1);
});
