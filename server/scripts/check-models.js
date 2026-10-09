import mongoose from 'mongoose';
import Paper from '../models/Paper.js';
import ResearchCollection from '../models/ResearchCollection.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

console.log('\n--- Running Offline Model Validation Checks ---\n');

try {
  // 1. Verify model imports
  assert(typeof Paper === 'function', 'Paper model imported successfully');
  assert(typeof ResearchCollection === 'function', 'ResearchCollection model imported successfully');

  // 2. Valid Paper document passes validation
  const validPaper = new Paper({
    title: 'Attention Is All You Need',
    authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
    publicationYear: 2017,
    abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
    tags: ['deep-learning', 'nlp', 'transformers'],
    originalFileName: 'attention.pdf',
    storedFileName: '12345-attention.pdf',
    filePath: 'uploads/12345-attention.pdf',
    mimeType: 'application/pdf',
    fileSize: 1048576,
    extractedText: 'Extracted paper content...',
    summary: {
      overview: 'Introduces the Transformer architecture based solely on attention mechanisms.',
      researchProblem: 'Recurrent models are inherently sequential, hindering parallel training.',
      methodology: 'Multi-head self-attention mechanisms without recurrence.',
      mainFindings: ['State-of-the-art translation quality', 'Faster training than RNNs'],
      limitations: ['High memory complexity with sequence length'],
      keywords: ['attention', 'transformer', 'seq2seq'],
      generatedAt: new Date(),
      model: 'gemini-1.5-pro',
    },
    notes: [
      {
        content: 'Seminal paper introducing modern transformer architectures.',
      },
    ],
  });

  const validPaperError = validPaper.validateSync();
  assert(!validPaperError, 'Valid Paper document passes validation');

  // Check notes have timestamps assigned by subdocument
  assert(validPaper.notes.length === 1, 'Embedded note is preserved');
  assert(validPaper.notes[0].content === 'Seminal paper introducing modern transformer architectures.', 'Note content matches');

  // 3. Paper without title fails validation
  const paperWithoutTitle = new Paper({
    authors: ['Anonymous'],
    publicationYear: 2020,
  });
  const noTitleError = paperWithoutTitle.validateSync();
  assert(
    noTitleError && noTitleError.errors && noTitleError.errors.title,
    'Paper document without title fails validation'
  );

  // 4. Invalid publication year is rejected
  const paperInvalidYearTooOld = new Paper({
    title: 'Ancient Philosophy',
    publicationYear: 1400, // < 1500
  });
  const yearTooOldError = paperInvalidYearTooOld.validateSync();
  assert(
    yearTooOldError && yearTooOldError.errors && yearTooOldError.errors.publicationYear,
    'Paper with year earlier than 1500 fails validation'
  );

  const paperInvalidYearFuture = new Paper({
    title: 'Future Work',
    publicationYear: 3000,
  });
  const yearFutureError = paperInvalidYearFuture.validateSync();
  assert(
    yearFutureError && yearFutureError.errors && yearFutureError.errors.publicationYear,
    'Paper with year in distant future fails validation'
  );

  // 5. Invalid / empty note is rejected
  const paperWithEmptyNote = new Paper({
    title: 'Paper with empty note',
    notes: [{ content: '' }],
  });
  const emptyNoteError = paperWithEmptyNote.validateSync();
  assert(
    emptyNoteError && emptyNoteError.errors && (emptyNoteError.errors['notes.0.content'] || emptyNoteError.errors.notes),
    'Empty note content is rejected during validation'
  );

  const paperWithWhitespaceNote = new Paper({
    title: 'Paper with whitespace note',
    notes: [{ content: '   ' }],
  });
  const whitespaceNoteError = paperWithWhitespaceNote.validateSync();
  assert(
    whitespaceNoteError && whitespaceNoteError.errors,
    'Whitespace-only note content is rejected during validation'
  );

  // 6. Valid ResearchCollection passes validation
  const dummyPaperId = new mongoose.Types.ObjectId();
  const validCollection = new ResearchCollection({
    name: 'Deep Learning Classics',
    description: 'Foundational papers on modern deep neural networks',
    paperIds: [dummyPaperId],
  });
  const validCollectionError = validCollection.validateSync();
  assert(!validCollectionError, 'Valid ResearchCollection passes validation');
  assert(validCollection.paperIds.length === 1, 'ResearchCollection paperIds reference preserved');

  // 7. ResearchCollection without name fails validation
  const collectionWithoutName = new ResearchCollection({
    description: 'Collection missing a name',
  });
  const noNameError = collectionWithoutName.validateSync();
  assert(
    noNameError && noNameError.errors && noNameError.errors.name,
    'ResearchCollection without name fails validation'
  );

  // 8. ResearchCollection with whitespace name fails validation
  const collectionWhitespaceName = new ResearchCollection({
    name: '   ',
  });
  const whitespaceNameError = collectionWhitespaceName.validateSync();
  assert(
    whitespaceNameError && whitespaceNameError.errors && whitespaceNameError.errors.name,
    'ResearchCollection with whitespace-only name fails validation'
  );

} catch (err) {
  console.error('Unexpected error during model validation checks:', err);
  failed++;
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All offline model validation checks passed successfully!\n');
  process.exit(0);
}
