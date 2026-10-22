import express from 'express';
import {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  getPaperFile,
  summarizePaper,
  addNote,
  updateNote,
  deleteNote,
  getRelatedPapers,
  exportBibTeX,
} from '../controllers/paperController.js';
import { uploadMiddleware } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// List & Create
router.get('/', getPapers);
router.post('/', uploadMiddleware.single('file'), createPaper);

// Details, Update & Delete
router.get('/:id', getPaperById);
router.put('/:id', updatePaper);
router.delete('/:id', deletePaper);

// File retrieval
router.get('/:id/file', getPaperFile);

// AI Summarization
router.post('/:id/summarize', summarizePaper);

// Notes Subdocuments
router.post('/:id/notes', addNote);
router.put('/:id/notes/:noteId', updateNote);
router.delete('/:id/notes/:noteId', deleteNote);

// Discovery & Citation
router.get('/:id/related', getRelatedPapers);
router.get('/:id/export/bibtex', exportBibTeX);

export default router;
