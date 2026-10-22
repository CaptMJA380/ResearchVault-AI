import path from 'path';
import fs from 'fs';
import Paper from '../models/Paper.js';
import ResearchCollection from '../models/ResearchCollection.js';
import { extractTextFromPDFBuffer, extractMetadataSuggestions, UPLOAD_DIR } from '../services/pdfService.js';
import { generatePaperSummary, generateTextEmbedding, cosineSimilarity } from '../services/aiService.js';
import { formatBibTeX, isValidObjectId } from '../utils/citationUtils.js';

// ─── GET /api/papers ──────────────────────────────────────────────────────────
export async function getPapers(req, res, next) {
  try {
    const {
      search,
      tag,
      year,
      author,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    if (tag) {
      query.tags = tag;
    }

    if (year) {
      const parsedYear = parseInt(year, 10);
      if (!isNaN(parsedYear)) {
        query.publicationYear = parsedYear;
      }
    }

    if (author) {
      query.authors = { $regex: author, $options: 'i' };
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { abstract: regex },
        { authors: regex },
        { tags: regex },
        { keywords: regex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [papers, total] = await Promise.all([
      Paper.find(query)
        .select('-extractedText -embedding') // exclude large text for list view
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Paper.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: papers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/papers/:id ──────────────────────────────────────────────────────
export async function getPaperById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Research paper not found.' });
    }

    res.status(200).json({ success: true, data: paper });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/papers (Upload & Create) ────────────────────────────────────────
export async function createPaper(req, res, next) {
  let uploadedFile = req.file;

  try {
    let extractedText = '';
    let extractedSuggestions = {};

    if (uploadedFile) {
      const buffer = fs.readFileSync(uploadedFile.path);
      try {
        const parseResult = await extractTextFromPDFBuffer(buffer);
        extractedText = parseResult.text;
        extractedSuggestions = extractMetadataSuggestions(extractedText, uploadedFile.originalname);
      } catch (parseErr) {
        console.warn('[PDF Warning] Text extraction encountered issue:', parseErr.message);
      }
    }

    // Merge provided metadata with suggestions
    const title = req.body.title?.trim() || extractedSuggestions.title || uploadedFile?.originalname || 'Untitled Research Paper';
    
    let authors = [];
    if (req.body.authors) {
      authors = Array.isArray(req.body.authors)
        ? req.body.authors
        : req.body.authors.split(',').map((a) => a.trim()).filter(Boolean);
    } else if (extractedSuggestions.authors?.length > 0) {
      authors = extractedSuggestions.authors;
    }

    let publicationYear = req.body.publicationYear
      ? parseInt(req.body.publicationYear, 10)
      : extractedSuggestions.publicationYear;

    if (isNaN(publicationYear)) publicationYear = undefined;

    let tags = [];
    if (req.body.tags) {
      tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    let keywords = [];
    if (req.body.keywords) {
      keywords = Array.isArray(req.body.keywords)
        ? req.body.keywords
        : req.body.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    } else if (extractedSuggestions.keywords?.length > 0) {
      keywords = extractedSuggestions.keywords;
    }

    const abstract = req.body.abstract?.trim() || extractedSuggestions.abstract || '';
    const journalOrVenue = req.body.journalOrVenue?.trim() || '';
    const doi = req.body.doi?.trim() || '';

    let references = [];
    if (extractedSuggestions.references?.length > 0) {
      references = extractedSuggestions.references;
    }

    // Generate initial embedding if possible
    let embedding;
    let embeddingModel = '';
    if (extractedText || abstract) {
      try {
        const emb = await generateTextEmbedding(`${title} ${abstract}`);
        embedding = emb.vector;
        embeddingModel = emb.model;
      } catch {
        // Continue without embedding
      }
    }

    const paperData = {
      title,
      authors,
      publicationYear,
      journalOrVenue,
      doi,
      abstract,
      keywords,
      tags,
      extractedText: req.body.extractedText || extractedText,
      references,
      embedding,
      embeddingModel,
      originalFileName: uploadedFile ? uploadedFile.originalname : req.body.originalFileName,
      storedFileName: uploadedFile ? uploadedFile.filename : req.body.storedFileName,
      filePath: uploadedFile ? path.relative(path.resolve(UPLOAD_DIR, '..'), uploadedFile.path) : req.body.filePath,
      mimeType: uploadedFile ? uploadedFile.mimetype : 'application/pdf',
      fileSize: uploadedFile ? uploadedFile.size : req.body.fileSize,
    };

    const paper = await Paper.create(paperData);

    res.status(201).json({
      success: true,
      message: 'Research paper created successfully.',
      data: paper,
    });
  } catch (err) {
    // If database create fails and file was uploaded, safely remove orphaned file
    if (uploadedFile && fs.existsSync(uploadedFile.path)) {
      try {
        fs.unlinkSync(uploadedFile.path);
      } catch {
        // ignore cleanup error
      }
    }
    next(err);
  }
}

// ─── PUT /api/papers/:id ──────────────────────────────────────────────────────
export async function updatePaper(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const allowedUpdates = [
      'title',
      'authors',
      'publicationYear',
      'journalOrVenue',
      'doi',
      'abstract',
      'keywords',
      'tags',
      'references',
      'extractedText',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // Format array fields properly if sent as comma-separated strings
    if (typeof updates.authors === 'string') {
      updates.authors = updates.authors.split(',').map((a) => a.trim()).filter(Boolean);
    }
    if (typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (typeof updates.keywords === 'string') {
      updates.keywords = updates.keywords.split(',').map((k) => k.trim()).filter(Boolean);
    }
    if (updates.publicationYear) {
      updates.publicationYear = parseInt(updates.publicationYear, 10);
    }

    const paper = await Paper.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true });
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Research paper not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Paper updated successfully.',
      data: paper,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/papers/:id ───────────────────────────────────────────────────
export async function deletePaper(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Research paper not found.' });
    }

    // Safely remove associated PDF file on disk if exists
    if (paper.storedFileName) {
      const fullPath = path.resolve(UPLOAD_DIR, paper.storedFileName);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fileErr) {
          console.warn('[File Warning] Failed to delete file:', fileErr.message);
        }
      }
    }

    // Remove reference from any collection containing this paper
    await ResearchCollection.updateMany(
      { paperIds: id },
      { $pull: { paperIds: id } }
    );

    await Paper.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Paper and associated resources deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/papers/:id/file ─────────────────────────────────────────────────
export async function getPaperFile(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    if (!paper.storedFileName) {
      return res.status(404).json({ success: false, message: 'No document file associated with this paper.' });
    }

    const fullPath = path.resolve(UPLOAD_DIR, paper.storedFileName);

    // Prevent path traversal
    if (!fullPath.startsWith(UPLOAD_DIR) || !fs.existsSync(fullPath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on server storage.' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(paper.originalFileName || 'document.pdf')}"`
    );
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/papers/:id/summarize ───────────────────────────────────────────
export async function summarizePaper(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    const textToSummarize = paper.extractedText || paper.abstract;
    if (!textToSummarize || textToSummarize.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient document text or abstract available to generate an AI summary.',
      });
    }

    const summary = await generatePaperSummary(textToSummarize, paper.title);

    paper.summary = summary;
    // Also merge generated keywords if paper has none
    if ((!paper.keywords || paper.keywords.length === 0) && summary.keywords?.length > 0) {
      paper.keywords = summary.keywords;
    }
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'AI summary generated successfully.',
      data: summary,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/papers/:id/notes ───────────────────────────────────────────────
export async function addNote(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    paper.notes.push({ content: content.trim() });
    await paper.save();

    const createdNote = paper.notes[paper.notes.length - 1];

    res.status(201).json({
      success: true,
      message: 'Note added successfully.',
      data: createdNote,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/papers/:id/notes/:noteId ────────────────────────────────────────
export async function updateNote(req, res, next) {
  try {
    const { id, noteId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(noteId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content cannot be empty.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    const note = paper.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    note.content = content.trim();
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: note,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/papers/:id/notes/:noteId ─────────────────────────────────────
export async function deleteNote(req, res, next) {
  try {
    const { id, noteId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(noteId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    const note = paper.notes.id(noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found.' });
    }

    paper.notes.pull(noteId);
    await paper.save();

    res.status(200).json({
      success: true,
      message: 'Note removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/papers/:id/related ──────────────────────────────────────────────
export async function getRelatedPapers(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const targetPaper = await Paper.findById(id);
    if (!targetPaper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    // Query other papers
    const candidates = await Paper.find({ _id: { $ne: id } })
      .select('title authors publicationYear tags keywords abstract embedding')
      .limit(30)
      .lean();

    const scored = candidates.map((cand) => {
      let score = 0;
      const reasons = [];

      // 1. Shared tags match
      const sharedTags = (cand.tags || []).filter((t) => (targetPaper.tags || []).includes(t));
      if (sharedTags.length > 0) {
        score += sharedTags.length * 3;
        reasons.push(`Shared tags: ${sharedTags.join(', ')}`);
      }

      // 2. Shared keywords match
      const sharedKeywords = (cand.keywords || []).filter((k) =>
        (targetPaper.keywords || []).some((tk) => tk.toLowerCase() === k.toLowerCase())
      );
      if (sharedKeywords.length > 0) {
        score += sharedKeywords.length * 2.5;
        reasons.push(`Shared keywords: ${sharedKeywords.slice(0, 3).join(', ')}`);
      }

      // 3. Shared authors match
      const sharedAuthors = (cand.authors || []).filter((a) =>
        (targetPaper.authors || []).some((ta) => ta.toLowerCase() === a.toLowerCase())
      );
      if (sharedAuthors.length > 0) {
        score += sharedAuthors.length * 4;
        reasons.push(`Shared author: ${sharedAuthors.join(', ')}`);
      }

      // 4. Vector embedding similarity if both have embeddings
      if (targetPaper.embedding?.length && cand.embedding?.length) {
        const sim = cosineSimilarity(targetPaper.embedding, cand.embedding);
        if (sim > 0.3) {
          score += sim * 5;
          reasons.push(`Semantic similarity: ${(sim * 100).toFixed(0)}%`);
        }
      }

      return {
        _id: cand._id,
        title: cand.title,
        authors: cand.authors,
        publicationYear: cand.publicationYear,
        tags: cand.tags,
        score,
        reason: reasons.join(' • ') || 'Related research theme',
      };
    });

    const recommendations = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: recommendations,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/papers/:id/export/bibtex ─────────────────────────────────────────
export async function exportBibTeX(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid paper ID format.' });
    }

    const paper = await Paper.findById(id);
    if (!paper) {
      return res.status(404).json({ success: false, message: 'Paper not found.' });
    }

    const bibtex = formatBibTeX(paper);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="citation-${id}.bib"`);
    res.status(200).send(bibtex);
  } catch (err) {
    next(err);
  }
}
