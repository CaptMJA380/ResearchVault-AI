import mongoose from 'mongoose';

/**
 * ResearchCollection Schema
 * Represents user-curated groupings of research papers (e.g., by topic, project, or thesis chapter).
 */
const researchCollectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Collection name is required'],
      trim: true,
      validate: {
        validator: function (v) {
          return typeof v === 'string' && v.trim().length > 0;
        },
        message: 'Collection name cannot be empty',
      },
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    paperIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Paper',
      },
    ],
  },
  {
    timestamps: true,
  }
);

researchCollectionSchema.index({ name: 1 });

const ResearchCollection = mongoose.model('ResearchCollection', researchCollectionSchema);

export default ResearchCollection;
