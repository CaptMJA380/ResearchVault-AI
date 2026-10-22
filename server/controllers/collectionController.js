import ResearchCollection from '../models/ResearchCollection.js';
import Paper from '../models/Paper.js';
import { isValidObjectId } from '../utils/citationUtils.js';

// ─── GET /api/collections ─────────────────────────────────────────────────────
export async function getCollections(req, res, next) {
  try {
    const collections = await ResearchCollection.find()
      .populate('paperIds', 'title authors publicationYear tags')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: collections,
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/collections ────────────────────────────────────────────────────
export async function createCollection(req, res, next) {
  try {
    const { name, description, paperIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Collection name is required.',
      });
    }

    // Validate paperIds if passed
    const validatedPaperIds = [];
    if (Array.isArray(paperIds)) {
      for (const id of paperIds) {
        if (isValidObjectId(id)) {
          validatedPaperIds.push(id);
        }
      }
    }

    const collection = await ResearchCollection.create({
      name: name.trim(),
      description: description?.trim() || '',
      paperIds: Array.from(new Set(validatedPaperIds)),
    });

    res.status(201).json({
      success: true,
      message: 'Research collection created successfully.',
      data: collection,
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/collections/:id ─────────────────────────────────────────────────
export async function getCollectionById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection ID format.' });
    }

    const collection = await ResearchCollection.findById(id).populate(
      'paperIds',
      'title authors publicationYear tags abstract originalFileName fileSize'
    );

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Research collection not found.' });
    }

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/collections/:id ─────────────────────────────────────────────────
export async function updateCollection(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, paperIds, addPaperId, removePaperId } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection ID format.' });
    }

    const collection = await ResearchCollection.findById(id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Research collection not found.' });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'Collection name cannot be empty.' });
      }
      collection.name = name.trim();
    }

    if (description !== undefined) {
      collection.description = description.trim();
    }

    // Direct replacement of paperIds
    if (Array.isArray(paperIds)) {
      collection.paperIds = Array.from(new Set(paperIds.filter(isValidObjectId)));
    }

    // Atomic addition of a single paper
    if (addPaperId && isValidObjectId(addPaperId)) {
      const exists = collection.paperIds.some((pId) => String(pId) === String(addPaperId));
      if (!exists) {
        collection.paperIds.push(addPaperId);
      }
    }

    // Atomic removal of a single paper
    if (removePaperId && isValidObjectId(removePaperId)) {
      collection.paperIds = collection.paperIds.filter(
        (pId) => String(pId) !== String(removePaperId)
      );
    }

    await collection.save();
    const updated = await ResearchCollection.findById(id).populate('paperIds', 'title authors publicationYear tags');

    res.status(200).json({
      success: true,
      message: 'Collection updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/collections/:id ──────────────────────────────────────────────
export async function deleteCollection(req, res, next) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid collection ID format.' });
    }

    const collection = await ResearchCollection.findByIdAndDelete(id);
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Research collection not found.' });
    }

    // Deleting a collection does NOT delete the research papers it referenced
    res.status(200).json({
      success: true,
      message: 'Collection deleted successfully. Referenced papers remain intact in your library.',
    });
  } catch (err) {
    next(err);
  }
}
