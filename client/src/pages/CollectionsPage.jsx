import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  BookOpen,
  Trash2,
  Edit2,
  RefreshCw,
  FolderPlus,
  ArrowRight,
  X,
  FileText,
} from 'lucide-react';
import {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
} from '../api/client.js';
import './CollectionsPage.css';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active inspected collection
  const [activeCollection, setActiveCollection] = useState(null);

  // Create Collection Modal
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Collection Modal
  const [editingCollection, setEditingCollection] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    setLoading(true);
    setError(null);
    try {
      const res = await getCollections();
      setCollections(res.data || []);
      if (res.data?.length > 0 && !activeCollection) {
        setActiveCollection(res.data[0]);
      } else if (activeCollection) {
        // Keep active collection updated
        const updated = res.data.find((c) => c._id === activeCollection._id);
        setActiveCollection(updated || res.data[0] || null);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await createCollection({
        name: newName.trim(),
        description: newDesc.trim(),
      });
      setNewName('');
      setNewDesc('');
      setIsCreating(false);
      await loadCollections();
      setActiveCollection(res.data);
    } catch (err) {
      alert(`Create failed: ${err.message}`);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    if (!editingCollection || !editName.trim()) return;
    try {
      const res = await updateCollection(editingCollection._id, {
        name: editName.trim(),
        description: editDesc.trim(),
      });
      setEditingCollection(null);
      await loadCollections();
      setActiveCollection(res.data);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  }

  async function handleDeleteCollection(id) {
    if (!window.confirm('Delete this collection? Referenced papers will NOT be deleted.')) {
      return;
    }
    try {
      await deleteCollection(id);
      if (activeCollection?._id === id) {
        setActiveCollection(null);
      }
      await loadCollections();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  async function handleRemovePaperFromCollection(paperId) {
    if (!activeCollection) return;
    try {
      const res = await updateCollection(activeCollection._id, {
        removePaperId: paperId,
      });
      setActiveCollection(res.data);
      // Update in collection list
      setCollections((prev) =>
        prev.map((c) => (c._id === res.data._id ? res.data : c))
      );
    } catch (err) {
      alert(`Failed to remove paper: ${err.message}`);
    }
  }

  return (
    <div className="collections-page">
      <div className="collections-header">
        <div>
          <h1 className="page-title">Research Collections</h1>
          <p className="page-subtitle">
            Curate research papers by thesis topic, course, or literature review project.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="btn-create-collection"
        >
          <FolderPlus size={16} />
          <span>New Collection</span>
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading research collections...</p>
        </div>
      ) : collections.length === 0 ? (
        <div className="collections-empty-card">
          <FolderKanban size={42} className="empty-folder-icon" />
          <h3>No Research Collections Yet</h3>
          <p>
            Group related papers together into themed collections for your thesis, seminar, or literature review.
          </p>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="btn-action-primary"
          >
            <Plus size={15} /> Create First Collection
          </button>
        </div>
      ) : (
        <div className="collections-layout">
          {/* ── Left Sidebar of Collections ── */}
          <div className="collections-sidebar">
            <h3 className="sidebar-section-title">Your Collections ({collections.length})</h3>
            <div className="collection-items-list">
              {collections.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setActiveCollection(c)}
                  className={`collection-list-item ${
                    activeCollection?._id === c._id ? 'active' : ''
                  }`}
                >
                  <div className="collection-item-info">
                    <span className="collection-name">{c.name}</span>
                    <span className="collection-count">
                      {c.paperIds?.length || 0} papers
                    </span>
                  </div>
                  <div className="collection-item-actions">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCollection(c);
                        setEditName(c.name);
                        setEditDesc(c.description || '');
                      }}
                      className="btn-icon-edit"
                      title="Edit collection"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(c._id);
                      }}
                      className="btn-icon-trash"
                      title="Delete collection"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Content Area: Active Collection Papers ── */}
          <div className="collection-detail-panel">
            {activeCollection ? (
              <>
                <div className="collection-detail-header">
                  <div>
                    <h2 className="active-collection-title">{activeCollection.name}</h2>
                    {activeCollection.description && (
                      <p className="active-collection-desc">
                        {activeCollection.description}
                      </p>
                    )}
                  </div>
                  <span className="collection-badge-count">
                    {activeCollection.paperIds?.length || 0} Papers Assigned
                  </span>
                </div>

                {!activeCollection.paperIds || activeCollection.paperIds.length === 0 ? (
                  <div className="collection-papers-empty">
                    <BookOpen size={32} />
                    <p>No research papers assigned to this collection yet.</p>
                    <span className="hint-text">
                      Browse your library, open any paper, and click "Add to Collection".
                    </span>
                    <Link to="/library" className="btn-small">
                      Browse Library
                    </Link>
                  </div>
                ) : (
                  <div className="collection-papers-list">
                    {activeCollection.paperIds.map((p) => {
                      if (!p || typeof p === 'string') return null;
                      return (
                        <div key={p._id} className="collection-paper-row">
                          <div className="col-paper-info">
                            <Link to={`/papers/${p._id}`} className="col-paper-title">
                              {p.title}
                            </Link>
                            <span className="col-paper-authors">
                              {p.authors?.join(', ') || 'Unknown Authors'}
                              {p.publicationYear ? ` • ${p.publicationYear}` : ''}
                            </span>
                          </div>
                          <div className="col-paper-actions">
                            <Link to={`/papers/${p._id}`} className="btn-inspect-small">
                              Workspace
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleRemovePaperFromCollection(p._id)}
                              className="btn-remove-from-col"
                              title="Remove from collection"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <p>Select a collection to view its research papers.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Create Collection Modal ── */}
      {isCreating && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Create Research Collection</h3>
            <form onSubmit={handleCreateSubmit} className="collection-form">
              <div className="form-group">
                <label>Collection Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Modern Transformer Architectures"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Papers focused on self-attention mechanisms and efficiency."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-action-primary"
                >
                  {createLoading ? 'Creating...' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Collection Modal ── */}
      {editingCollection && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Edit Collection</h3>
            <form onSubmit={handleEditSubmit} className="collection-form">
              <div className="form-group">
                <label>Collection Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setEditingCollection(null)}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-action-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
