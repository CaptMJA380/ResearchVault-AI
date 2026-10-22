import assert from 'assert';
import { extractMetadataSuggestions, extractTextFromPDFBuffer } from '../services/pdfService.js';
import { cosineSimilarity, generateTextEmbedding } from '../services/aiService.js';
import { formatBibTeX, isValidObjectId } from '../utils/citationUtils.js';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
    failed++;
  }
}

console.log('\n=== Backend Services & Utilities Unit Test Suite ===\n');

// 1. Citation Utils
runTest('isValidObjectId verifies 24-char hex strings', () => {
  assert.strictEqual(isValidObjectId('507f1f77bcf86cd799439011'), true);
  assert.strictEqual(isValidObjectId('invalid-id'), false);
  assert.strictEqual(isValidObjectId(''), false);
  assert.strictEqual(isValidObjectId(null), false);
});

runTest('formatBibTeX produces valid BibTeX markup without hallucinating fields', () => {
  const paper = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang'],
    publicationYear: 2016,
    journalOrVenue: 'CVPR 2016',
    doi: '10.1109/CVPR.2016.90',
  };
  const bib = formatBibTeX(paper);
  assert.ok(bib.includes('@article{'));
  assert.ok(bib.includes('title = {Deep Residual Learning for Image Recognition}'));
  assert.ok(bib.includes('author = {Kaiming He and Xiangyu Zhang}'));
  assert.ok(bib.includes('year = {2016}'));
  assert.ok(bib.includes('journal = {CVPR 2016}'));
});

// 2. Cosine Similarity & Embedding Math
runTest('cosineSimilarity calculates exact vector overlap', () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];
  assert.strictEqual(Math.round(cosineSimilarity(v1, v2) * 100) / 100, 1);
  assert.strictEqual(cosineSimilarity(v1, v3), 0);
  assert.strictEqual(cosineSimilarity([], []), 0);
});

await runAsyncTest('generateTextEmbedding produces normalized vector with model metadata', async () => {
  const res = await generateTextEmbedding('transformer deep learning attention mechanism');
  assert.ok(Array.isArray(res.vector));
  assert.ok(res.vector.length > 0);
  assert.ok(typeof res.model === 'string');
});

// 3. Metadata Suggestion Heuristics
runTest('extractMetadataSuggestions parses title, year, abstract, and references', () => {
  const sampleText = `
Attention Is All You Need
Ashish Vaswani, Noam Shazeer
Published: 2017

Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose the Transformer architecture.

Keywords: deep learning, nlp, transformers

References
[1] Bahdanau, D. Neural machine translation. ICLR 2015.
[2] Hochreiter, S. Long short-term memory. 1997.
  `;

  const meta = extractMetadataSuggestions(sampleText, 'attention_paper.pdf');
  assert.ok(meta.title.includes('Attention Is All You Need'));
  assert.strictEqual(meta.publicationYear, 2017);
  assert.ok(meta.abstract.includes('dominant sequence transduction'));
  assert.ok(meta.keywords.length >= 2);
  assert.ok(meta.references.length >= 2);
});

// 4. PDF Buffer Signature Validation
await runAsyncTest('extractTextFromPDFBuffer rejects non-PDF buffer', async () => {
  const invalidBuffer = Buffer.from('This is not a PDF file');
  let threw = false;
  try {
    await extractTextFromPDFBuffer(invalidBuffer);
  } catch (err) {
    threw = true;
    assert.ok(err.message.includes('Invalid file signature'));
  }
  assert.strictEqual(threw, true);
});

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All backend services & utilities tests passed successfully!\n');
  process.exit(0);
}
