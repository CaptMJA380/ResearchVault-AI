import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const UPLOAD_DIR = path.resolve(__dirname, '../uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Extracts clean machine-readable text from a PDF buffer.
 * Normalizes excessive whitespace while preserving paragraph structure.
 */
export async function extractTextFromPDFBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('PDF buffer is empty or missing.');
  }

  // Validate PDF magic number (%PDF-)
  const magic = buffer.subarray(0, 5).toString('ascii');
  if (!magic.startsWith('%PDF-')) {
    throw new Error('Invalid file signature. File does not appear to be a valid PDF.');
  }

  const parser = new PDFParse({ data: buffer });
  try {
    const textResult = await parser.getText();
    const rawText = textResult?.text || '';

    // Normalize whitespace while preserving paragraph line-breaks
    const normalized = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const pageCount = textResult?.total || 1;

    return {
      text: normalized,
      pageCount,
      hasText: normalized.length > 20,
    };
  } finally {
    try {
      await parser.destroy();
    } catch {
      // Ignore cleanup error
    }
  }
}

/**
 * Heuristically extracts metadata suggestions from extracted paper text:
 * - Title
 * - Authors
 * - Publication Year
 * - Abstract
 * - Keywords
 * - References
 */
export function extractMetadataSuggestions(text, fallbackFileName = '') {
  const result = {
    title: '',
    authors: [],
    publicationYear: undefined,
    abstract: '',
    keywords: [],
    references: [],
  };

  if (!text || typeof text !== 'string') {
    if (fallbackFileName) {
      result.title = cleanFileNameToTitle(fallbackFileName);
    }
    return result;
  }

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Title inference (first prominent non-boilerplate line)
  for (const line of lines.slice(0, 10)) {
    if (
      line.length >= 6 &&
      line.length <= 160 &&
      !line.match(/^(arxiv|ieee|acm|springer|elsevier|nature|science|volume|vol\.|issue|page|proceedings|conference|issn|isbn|doi)/i) &&
      !line.match(/^\d+$/)
    ) {
      result.title = line.replace(/^[0-9\.\-\s]+/, '').trim();
      break;
    }
  }

  if (!result.title && fallbackFileName) {
    result.title = cleanFileNameToTitle(fallbackFileName);
  }

  // 2. Publication year inference (e.g. 1990 - 2026)
  const currentYear = new Date().getFullYear();
  const yearMatches = text.match(/\b(19[89]\d|20[0-2]\d)\b/g);
  if (yearMatches && yearMatches.length > 0) {
    // Prefer years appearing in the first 2000 characters (publication venue/header)
    const earlyText = text.slice(0, 2500);
    const earlyMatches = earlyText.match(/\b(19[89]\d|20[0-2]\d)\b/g);
    const candidateYear = earlyMatches ? parseInt(earlyMatches[0], 10) : parseInt(yearMatches[0], 10);
    if (candidateYear >= 1950 && candidateYear <= currentYear + 1) {
      result.publicationYear = candidateYear;
    }
  }

  // 3. Abstract extraction
  const abstractMatch = text.match(/(?:abstract|summary)[\s:\.\-—]+([\s\S]{80,1800}?)(?:\n\s*(?:1[\.\s]|introduction|keywords|index terms|categories|background)\b|\n\n)/i);
  if (abstractMatch && abstractMatch[1]) {
    result.abstract = abstractMatch[1].replace(/\s+/g, ' ').trim();
  }

  // 4. Keywords extraction
  const keywordsMatch = text.match(/(?:keywords|key\s*words|index\s*terms)[\s:\.\-—]+([\s\S]{10,250}?)(?:\n\s*(?:1[\.\s]|introduction|background)\b|\n\n|\.)/i);
  if (keywordsMatch && keywordsMatch[1]) {
    const rawKw = keywordsMatch[1]
      .split(/[,;•|]/)
      .map((k) => k.replace(/[\n\r]/g, ' ').trim())
      .filter((k) => k.length > 1 && k.length < 50);
    result.keywords = Array.from(new Set(rawKw)).slice(0, 8);
  }

  // 5. References extraction
  const refIndex = text.search(/\n\s*(?:references|bibliography|literature cited|works cited)\s*\n/i);
  if (refIndex !== -1) {
    const refSection = text.slice(refIndex + 12).trim();
    // Split by numbered format like [1], 1., or author year blocks
    const candidateRefs = refSection
      .split(/(?=\n\s*(?:\[\d+\]|\d+\.))\n?/)
      .map((r) => r.replace(/\s+/g, ' ').trim())
      .filter((r) => r.length > 25 && r.length < 500);

    result.references = candidateRefs.slice(0, 20);
  }

  return result;
}

function cleanFileNameToTitle(filename) {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/[_\-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
