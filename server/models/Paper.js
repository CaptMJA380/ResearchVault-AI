import mongoose from 'mongoose';

// ─── Subdocument Schemas ──────────────────────────────────────────────────────

/**
 * Embedded Note Schema
 * Represents user-created personal notes attached to a research paper.
 */
const noteSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return typeof v === 'string' && v.trim().length > 0;
        },
        message: 'Note content cannot be empty',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Structured AI Summary Schema
 * Nested summary object capturing structured synthesis from generative AI models.
 */
const aiSummarySchema = new mongoose.Schema(
  {
    overview: {
      type: String,
      default: '',
      trim: true,
    },
    researchProblem: {
      type: String,
      default: '',
      trim: true,
    },
    methodology: {
      type: String,
      default: '',
      trim: true,
    },
    mainFindings: {
      type: [String],
      default: [],
    },
    limitations: {
      type: [String],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: null,
    },
    model: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ─── Main Paper Schema ────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear();

const paperSchema = new mongoose.Schema(
  {
    // Paper metadata
    title: {
      type: String,
      required: [true, 'Paper title is required'],
      trim: true,
      index: true,
    },
    authors: {
      type: [String],
      default: [],
    },
    publicationYear: {
      type: Number,
      min: [1500, 'Publication year must be 1500 or later'],
      max: [currentYear + 5, `Publication year cannot exceed ${currentYear + 5}`],
    },
    journalOrVenue: {
      type: String,
      default: '',
      trim: true,
    },
    doi: {
      type: String,
      default: '',
      trim: true,
    },
    abstract: {
      type: String,
      default: '',
      trim: true,
    },
    keywords: {
      type: [String],
      default: [],
      set: (kw) => (Array.isArray(kw) ? kw.map((k) => k.trim()).filter(Boolean) : []),
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) => (Array.isArray(tags) ? tags.map((t) => t.trim()).filter(Boolean) : []),
    },

    // Original document metadata
    originalFileName: {
      type: String,
      trim: true,
    },
    storedFileName: {
      type: String,
      trim: true,
    },
    filePath: {
      type: String,
      trim: true,
    },
    mimeType: {
      type: String,
      trim: true,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
    },

    // Extracted content
    extractedText: {
      type: String,
      default: '',
    },

    // Structured AI summary
    summary: {
      type: aiSummarySchema,
      default: () => ({}),
    },

    // References extracted from document
    references: {
      type: [String],
      default: [],
    },

    // Personal notes subdocuments
    notes: {
      type: [noteSchema],
      default: [],
    },

    // Vector embedding for semantic search (e.g. 768-dim from Gemini text-embedding-004 or local fallback)
    embedding: {
      type: [Number],
      default: undefined,
      select: true,
    },
    embeddingModel: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
paperSchema.index({ tags: 1 });
paperSchema.index({ publicationYear: 1 });
paperSchema.index({ keywords: 1 });
paperSchema.index({ createdAt: -1 });

const Paper = mongoose.model('Paper', paperSchema);

export default Paper;
