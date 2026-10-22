import express from 'express';
import Paper from '../models/Paper.js';
import { generateTextEmbedding, cosineSimilarity, isAIConfigured } from '../services/aiService.js';

const router = express.Router();

/**
 * GET /api/search/semantic?q=...&limit=10
 * Performs embedding similarity ranking across papers.
 * Transparently falls back to local term-feature vector ranking if Gemini key is absent.
 */
router.get('/semantic', async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || !q.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" is required for semantic search.',
      });
    }

    const maxResults = Math.min(30, Math.max(1, parseInt(limit, 10) || 10));

    // Generate query embedding
    const queryEmb = await generateTextEmbedding(q.trim());
    const queryVec = queryEmb.vector;

    // Retrieve candidate papers
    const papers = await Paper.find()
      .select('title authors publicationYear tags keywords abstract embedding embeddingModel')
      .lean();

    const scored = [];

    for (const paper of papers) {
      let paperVec = paper.embedding;
      // If paper has no embedding, compute one dynamically on the fly
      if (!paperVec || paperVec.length === 0) {
        const textToEmbed = `${paper.title} ${paper.abstract} ${(paper.keywords || []).join(' ')}`;
        const generated = await generateTextEmbedding(textToEmbed);
        paperVec = generated.vector;
      }

      const similarity = cosineSimilarity(queryVec, paperVec);
      if (similarity > 0.05) {
        scored.push({
          _id: paper._id,
          title: paper.title,
          authors: paper.authors,
          publicationYear: paper.publicationYear,
          tags: paper.tags,
          keywords: paper.keywords,
          abstract: paper.abstract,
          similarityScore: parseFloat(similarity.toFixed(4)),
        });
      }
    }

    scored.sort((a, b) => b.similarityScore - a.similarityScore);

    res.status(200).json({
      success: true,
      query: q.trim(),
      searchMode: isAIConfigured() ? 'gemini-embedding-similarity' : 'local-semantic-vector-similarity',
      providerConfigured: isAIConfigured(),
      count: scored.slice(0, maxResults).length,
      data: scored.slice(0, maxResults),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
