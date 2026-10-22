import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  User,
  Tag,
  Sparkles,
  FileText,
  Download,
  ExternalLink,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Bookmark,
  Share2,
  Copy,
  ChevronRight,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';
import {
  getPaperById,
  updatePaper,
  deletePaper,
  summarizePaper,
  addNote,
  deleteNote,
  getRelatedPapers,
  getPaperFileUrl,
  exportBibTeXUrl,
  getCollections,
  updateCollection,
} from '../api/client.js';
import './PaperDetailPage.css';

export default function PaperDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active workspace tab: 'summary' | 'text' | 'notes' | 'references' | 'related'
  const [activeTab, setActiveTab] = useState('summary');

  // AI Summarization loading & error
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // New Note input
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Related papers state
  const [relatedPapers, setRelatedPapers] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Edit Metadata Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthors, setEditAuthors] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editTags, setEditTags] = useState('');

  // Add to collection modal
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [collectionActionMsg, setCollectionActionMsg] = useState('');

  // BibTeX copy feedback
  const [bibtexCopied, setBibtexCopied] = useState(false);

  useEffect(() => {
    loadPaper();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'related' && paper) {
      loadRelated();
    }
  }, [activeTab, paper]);

  async function loadPaper() {
    setLoading(true);
    setError(null);
    try {
      const res = await getPaperById(id);
      setPaper(res.data);
      // Pre-fill edit modal
      setEditTitle(res.data.title || '');
      setEditAuthors(res.data.authors?.join(', ') || '');
      setEditYear(res.data.publicationYear || '');
      setEditAbstract(res.data.abstract || '');
      setEditTags(res.data.tags?.join(', ') || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    setSummarizing(true);
    setSummaryError(null);
    try {
      const res = await summarizePaper(id);
      setPaper((prev) => ({ ...prev, summary: res.data }));
      setActiveTab('summary');
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummarizing(false);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const res = await addNote(id, noteContent);
      setPaper((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), res.data],
      }));
      setNoteContent('');
    } catch (err) {
      alert(`Failed to add note: ${err.message}`);
    } finally {
      setAddingNote(false);
    }
  }

  async function handleDeleteNote(noteId) {
    try {
      await deleteNote(id, noteId);
      setPaper((prev) => ({
        ...prev,
        notes: (prev.notes || []).filter((n) => n._id !== noteId),
      }));
    } catch (err) {
      alert(`Failed to delete note: ${err.message}`);
    }
  }

  async function loadRelated() {
    setRelatedLoading(true);
    try {
      const res = await getRelatedPapers(id);
      setRelatedPapers(res.data || []);
    } catch (err) {
      console.warn('Failed to load related papers:', err.message);
    } finally {
      setRelatedLoading(false);
    }
  }

  async function handleSaveMetadata(e) {
    e.preventDefault();
    try {
      const updates = {
        title: editTitle,
        authors: editAuthors.split(',').map((a) => a.trim()).filter(Boolean),
        publicationYear: editYear ? parseInt(editYear, 10) : undefined,
        abstract: editAbstract,
        tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await updatePaper(id, updates);
      setPaper(res.data);
      setIsEditing(false);
    } catch (err) {
      alert(`Failed to update metadata: ${err.message}`);
    }
  }

  async function handleDeletePaper() {
    if (!window.confirm('Are you sure you want to delete this paper and its associated PDF file?')) {
      return;
    }
    try {
      await deletePaper(id);
      navigate('/library');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  }

  async function openCollectionModal() {
    setIsAddCollectionOpen(true);
    setCollectionActionMsg('');
    try {
      const res = await getCollections();
      setCollections(res.data || []);
      if (res.data?.length > 0) setSelectedCollectionId(res.data[0]._id);
    } catch {
      // ignore
    }
  }

  async function handleAddToCollection() {
    if (!selectedCollectionId) return;
    try {
      await updateCollection(selectedCollectionId, { addPaperId: id });
      setCollectionActionMsg('Paper successfully added to collection!');
      setTimeout(() => setIsAddCollectionOpen(false), 1200);
    } catch (err) {
      alert(`Failed to add: ${err.message}`);
    }
  }

  async function handleCopyBibTeX() {
    try {
      const url = exportBibTeXUrl(id);
      const res = await fetch(url);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setBibtexCopied(true);
      setTimeout(() => setBibtexCopied(false), 2000);
    } catch {
      alert('Unable to copy citation to clipboard.');
    }
  }

  if (loading) {
    return (
      <div className="workspace-loading">
        <RefreshCw size={26} className="spin-icon" />
        <p>Opening paper workspace...</p>
      </div>
    );
  }

  if (error || !paper) {
    return (
      <div className="workspace-error">
        <AlertTriangle size={32} />
        <h2>Failed to load research paper</h2>
        <p>{error || 'Paper not found.'}</p>
        <Link to="/library" className="btn-back">
          Return to Library
        </Link>
      </div>
    );
  }

  const summary = paper.summary;

  return (
    <div className="paper-detail-page">
      {/* ── Breadcrumb ── */}
      <nav className="detail-breadcrumb">
        <Link to="/library">Library</Link>
        <ChevronRight size={13} />
        <span>{paper.title}</span>
      </nav>

      {/* ── Top Workspace Header ── */}
      <div className="workspace-header-card">
        <div className="header-meta-row">
          <span className="meta-badge year">{paper.publicationYear || 'Unknown Year'}</span>
          {paper.journalOrVenue && (
            <span className="meta-badge venue">{paper.journalOrVenue}</span>
          )}
          {paper.storedFileName && (
            <span className="meta-badge file">PDF Attached</span>
          )}
        </div>

        <h1 className="paper-headline">{paper.title}</h1>

        <div className="paper-authors-list">
          <User size={14} />
          <span>
            {paper.authors?.length > 0
              ? paper.authors.join(', ')
              : 'Unknown Authors'}
          </span>
        </div>

        {paper.doi && (
          <div className="paper-doi">
            <strong>DOI:</strong> <code>{paper.doi}</code>
          </div>
        )}

        {paper.tags?.length > 0 && (
          <div className="paper-tags-row">
            {paper.tags.map((t) => (
              <span key={t} className="workspace-tag-chip">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Action Toolbar */}
        <div className="workspace-toolbar">
          <button
            type="button"
            onClick={handleSummarize}
            disabled={summarizing}
            className="btn-toolbar primary"
          >
            <Sparkles size={14} className={summarizing ? 'spin-icon' : ''} />
            <span>{summarizing ? 'Analyzing Text...' : summary?.overview ? 'Regenerate Summary' : 'Generate AI Summary'}</span>
          </button>

          {paper.storedFileName && (
            <a
              href={getPaperFileUrl(paper._id)}
              target="_blank"
              rel="noreferrer"
              className="btn-toolbar secondary"
            >
              <ExternalLink size={14} />
              <span>View PDF</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleCopyBibTeX}
            className="btn-toolbar secondary"
          >
            {bibtexCopied ? <CheckCircle size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{bibtexCopied ? 'Copied BibTeX' : 'BibTeX Citation'}</span>
          </button>

          <button
            type="button"
            onClick={openCollectionModal}
            className="btn-toolbar secondary"
          >
            <Bookmark size={14} />
            <span>Add to Collection</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-toolbar secondary"
          >
            <Edit3 size={14} />
            <span>Edit Metadata</span>
          </button>

          <button
            type="button"
            onClick={handleDeletePaper}
            className="btn-toolbar danger"
            title="Delete paper"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Summary Error Alert if any ── */}
      {summaryError && (
        <div className="summary-error-card">
          <AlertCircle size={18} />
          <div className="summary-error-text">
            <strong>AI Summarization Notice:</strong> {summaryError}
          </div>
        </div>
      )}

      {/* ── Workspace Tabs ── */}
      <div className="workspace-tabs-bar">
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <Sparkles size={15} />
          <span>AI Summary & Synthesis</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
          onClick={() => setActiveTab('text')}
        >
          <FileText size={15} />
          <span>Extracted Document Text</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          <Bookmark size={15} />
          <span>Personal Notes ({paper.notes?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'references' ? 'active' : ''}`}
          onClick={() => setActiveTab('references')}
        >
          <BookOpen size={15} />
          <span>References ({paper.references?.length || 0})</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'related' ? 'active' : ''}`}
          onClick={() => setActiveTab('related')}
        >
          <Lightbulb size={15} />
          <span>Related Papers</span>
        </button>
      </div>

      {/* ── Tab Content ── */}
      <div className="workspace-tab-body">
        {/* TAB 1: AI Summary */}
        {activeTab === 'summary' && (
          <div className="tab-pane summary-pane">
            {summary?.overview ? (
              <div className="summary-layout">
                <div className="summary-card overview-card">
                  <h3>Overview</h3>
                  <p>{summary.overview}</p>
                </div>

                <div className="summary-grid-two">
                  <div className="summary-card">
                    <h4>Research Problem</h4>
                    <p>{summary.researchProblem || 'Not explicitly highlighted.'}</p>
                  </div>
                  <div className="summary-card">
                    <h4>Methodology & Framework</h4>
                    <p>{summary.methodology || 'Theoretical / empirical analysis.'}</p>
                  </div>
                </div>

                {summary.mainFindings?.length > 0 && (
                  <div className="summary-card">
                    <h4>Main Findings & Contributions</h4>
                    <ul className="findings-list">
                      {summary.mainFindings.map((finding, idx) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.limitations?.length > 0 && (
                  <div className="summary-card limitations">
                    <h4>Identified Limitations</h4>
                    <ul className="limitations-list">
                      {summary.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="summary-meta-footer">
                  <span>Generated with <strong>{summary.model || 'Google Gemini'}</strong></span>
                  <span>
                    {summary.generatedAt
                      ? new Date(summary.generatedAt).toLocaleString()
                      : ''}
                  </span>
                </div>
              </div>
            ) : (
              <div className="summary-empty-state">
                <Sparkles size={36} className="empty-sparkle" />
                <h3>No AI Summary Generated Yet</h3>
                <p>
                  Click "Generate AI Summary" above to have Google Gemini analyze
                  the document text and formulate structured findings, methodology, and limitations.
                </p>
                <button
                  type="button"
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="btn-action-primary"
                >
                  <Sparkles size={15} />
                  <span>{summarizing ? 'Analyzing Document...' : 'Generate AI Summary Now'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Extracted Document Text */}
        {activeTab === 'text' && (
          <div className="tab-pane text-pane">
            <div className="extracted-text-header">
              <h3>Normalized Full-Text</h3>
              <span className="char-count">
                {paper.extractedText?.length || 0} characters extracted
              </span>
            </div>
            {paper.extractedText ? (
              <pre className="extracted-text-display">{paper.extractedText}</pre>
            ) : (
              <div className="empty-text-notice">
                <FileText size={28} />
                <p>No machine-readable text found or extracted for this paper.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Personal Notes */}
        {activeTab === 'notes' && (
          <div className="tab-pane notes-pane">
            <form onSubmit={handleAddNote} className="note-input-form">
              <textarea
                rows="3"
                placeholder="Add a literature review insight, methodology note, or critique..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="note-textarea"
                required
              />
              <button
                type="submit"
                disabled={addingNote || !noteContent.trim()}
                className="btn-add-note"
              >
                <Plus size={15} />
                <span>{addingNote ? 'Saving...' : 'Add Note'}</span>
              </button>
            </form>

            <div className="notes-list">
              {!paper.notes || paper.notes.length === 0 ? (
                <p className="no-notes-text">No personal notes attached to this paper yet.</p>
              ) : (
                paper.notes.map((note) => (
                  <div key={note._id} className="note-item-card">
                    <p className="note-body">{note.content}</p>
                    <div className="note-footer">
                      <span className="note-date">
                        {new Date(note.createdAt).toLocaleDateString()} at{' '}
                        {new Date(note.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note._id)}
                        className="btn-delete-note"
                        title="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Extracted References */}
        {activeTab === 'references' && (
          <div className="tab-pane references-pane">
            <div className="extracted-text-header">
              <h3>Extracted Bibliographic Citations</h3>
              <span className="char-count">
                Automated extraction from document reference section
              </span>
            </div>

            {!paper.references || paper.references.length === 0 ? (
              <div className="empty-text-notice">
                <BookOpen size={28} />
                <p>No references were automatically detected in the text.</p>
              </div>
            ) : (
              <ol className="reference-items-list">
                {paper.references.map((ref, idx) => (
                  <li key={idx} className="reference-item">
                    {ref}
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* TAB 5: Related Papers */}
        {activeTab === 'related' && (
          <div className="tab-pane related-pane">
            {relatedLoading ? (
              <div className="loading-state">
                <RefreshCw size={20} className="spin-icon" />
                <p>Calculating scholarly and semantic connections...</p>
              </div>
            ) : relatedPapers.length === 0 ? (
              <div className="empty-text-notice">
                <Lightbulb size={28} />
                <p>No closely related papers detected in your current library.</p>
              </div>
            ) : (
              <div className="related-papers-list">
                {relatedPapers.map((rel) => (
                  <div key={rel._id} className="related-item-card">
                    <div className="related-card-content">
                      <Link to={`/papers/${rel._id}`} className="related-title">
                        {rel.title}
                      </Link>
                      <span className="related-authors">
                        {rel.authors?.join(', ') || 'Unknown'} ({rel.publicationYear || 'N/A'})
                      </span>
                      <span className="related-reason">
                        💡 {rel.reason}
                      </span>
                    </div>
                    <Link to={`/papers/${rel._id}`} className="btn-small">
                      View Paper
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Metadata Modal ── */}
      {isEditing && (
        <div className="modal-backdrop">
          <div className="modal-card wide">
            <h3>Edit Bibliographic Metadata</h3>
            <form onSubmit={handleSaveMetadata} className="edit-metadata-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Authors (comma separated)</label>
                <input
                  type="text"
                  value={editAuthors}
                  onChange={(e) => setEditAuthors(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Publication Year</label>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Abstract</label>
                <textarea
                  rows="4"
                  value={editAbstract}
                  onChange={(e) => setEditAbstract(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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

      {/* ── Add to Collection Modal ── */}
      {isAddCollectionOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Add to Research Collection</h3>
            {collectionActionMsg ? (
              <div className="collection-success-msg">
                <CheckCircle size={18} color="#16a34a" />
                <span>{collectionActionMsg}</span>
              </div>
            ) : collections.length === 0 ? (
              <div>
                <p>No collections found.</p>
                <Link to="/collections" className="btn-small">
                  Create a collection first
                </Link>
              </div>
            ) : (
              <div className="collection-select-form">
                <label>Select Collection:</label>
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="form-input"
                >
                  {collections.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.paperIds?.length || 0} papers)
                    </option>
                  ))}
                </select>
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setIsAddCollectionOpen(false)}
                    className="btn-modal-cancel"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddToCollection}
                    className="btn-action-primary"
                  >
                    Add Paper
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
