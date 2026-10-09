import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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
 * Health-check endpoint — confirms the API server is running.
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    message: 'ResearchVault AI API is running',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log('  ║       ResearchVault AI — API Server      ║');
  console.log('  ╠══════════════════════════════════════════╣');
  console.log(`  ║  Server running at http://localhost:${PORT}  ║`);
  console.log('  ║  Health: /api/health                     ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
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
