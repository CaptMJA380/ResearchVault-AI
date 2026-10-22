import express from 'express';
import Paper from '../models/Paper.js';
import ResearchCollection from '../models/ResearchCollection.js';
import { getAIStatus } from '../services/aiService.js';
import { getDBStatus } from '../config/db.js';

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Returns real database-backed totals, recently added papers, recent summaries, and system status.
 */
router.get('/stats', async (req, res, next) => {
  try {
    const dbStatus = getDBStatus();

    // If database is not connected, return zero counts and system status gracefully
    if (dbStatus.state !== 'connected') {
      return res.status(200).json({
        success: true,
        stats: {
          totalPapers: 0,
          totalCollections: 0,
          totalNotes: 0,
          totalSummaries: 0,
        },
        recentPapers: [],
        recentSummaries: [],
        system: {
          database: dbStatus,
          ai: getAIStatus(),
        },
      });
    }

    const [papersCount, collectionsCount, papersWithNotes, recentPapers, recentSummaries] =
      await Promise.all([
        Paper.countDocuments(),
        ResearchCollection.countDocuments(),
        Paper.find({ 'notes.0': { $exists: true } }).select('notes').lean(),
        Paper.find()
          .select('title authors publicationYear tags createdAt originalFileName summary')
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Paper.find({ 'summary.overview': { $exists: true, $ne: '' } })
          .select('title authors summary.overview summary.generatedAt summary.model')
          .sort({ 'summary.generatedAt': -1 })
          .limit(4)
          .lean(),
      ]);

    // Sum up total individual notes across all papers
    const totalNotes = papersWithNotes.reduce((sum, p) => sum + (p.notes?.length || 0), 0);

    const papersWithSummaryCount = await Paper.countDocuments({
      'summary.overview': { $exists: true, $ne: '' },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalPapers: papersCount,
        totalCollections: collectionsCount,
        totalNotes: totalNotes,
        totalSummaries: papersWithSummaryCount,
      },
      recentPapers,
      recentSummaries,
      system: {
        database: getDBStatus(),
        ai: getAIStatus(),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
