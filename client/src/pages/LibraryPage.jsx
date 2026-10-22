import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  BookOpen,
  Calendar,
  User,
  Tag,
  Trash2,
  FileText,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';
import { getPapers, deletePaper } from '../api/client.js';
import './LibraryPage.css';

export default function LibraryPage() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Delete modal state
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadPapers();
  }, [page, selectedTag, selectedYear]);

  async function loadPapers(customSearch = search) {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 9,
      };
      if (customSearch?.trim()) params.search = customSearch.trim();
      if (selectedTag) params.tag = selectedTag;
      if (selectedYear) params.year = selectedYear;

      const res = await getPapers(params);
      setPapers(res.data || []);
      setPagination(res.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    loadPapers(search);
  }

  function handleClearFilters() {
    setSearch('');
    setSelectedTag('');
    setSelectedYear('');
    setPage(1);
    loadPapers('');
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deletePaper(deletingId);
      setDeletingId(null);
      loadPapers();
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  }

  // Extract available tags for filter pill list
  const allTags = Array.from(
    new Set(papers.flatMap((p) => p.tags || []).filter(Boolean))
  ).slice(0, 10);

  return (
    <div className="library-page">
      {/* ── Header ── */}
      <div className="library-header">
        <div>
          <h1 className="page-title">Research Library</h1>
          <p className="page-subtitle">
            Manage, filter, and inspect your repository of academic papers.
          </p>
        </div>
        <Link to="/upload" className="btn-upload-new">
          <Plus size={16} />
          <span>Add Paper</span>
        </Link>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="library-controls-card">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, author, abstract, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  loadPapers('');
                }}
                className="btn-clear-search"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search-submit">
            Search
          </button>
        </form>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <span className="filter-label">Filters:</span>

            {/* Year selector */}
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Years</option>
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2020">2020</option>
              <option value="2017">2017</option>
              <option value="2016">2016</option>
            </select>
          </div>

          {(search || selectedTag || selectedYear) && (
            <button onClick={handleClearFilters} className="btn-clear-all">
              Reset Filters
            </button>
          )}

          <div className="results-count">
            Showing <strong>{papers.length}</strong> of{' '}
            <strong>{pagination.total}</strong> papers
          </div>
        </div>

        {/* Quick Tag Pills */}
        {allTags.length > 0 && (
          <div className="tag-pills-row">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTag(selectedTag === tag ? '' : tag);
                  setPage(1);
                }}
                className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => loadPapers()} className="btn-retry">
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {/* ── Papers Grid ── */}
      {loading ? (
        <div className="loading-container">
          <RefreshCw size={24} className="spin-icon" />
          <p>Loading research library...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="library-empty">
          <BookOpen size={36} className="empty-book-icon" />
          <h3>No research papers found</h3>
          <p>
            {search || selectedTag || selectedYear
              ? 'No papers match your active filter criteria. Try clearing filters.'
              : 'Your library is empty. Upload your first academic paper to get started.'}
          </p>
          {search || selectedTag || selectedYear ? (
            <button onClick={handleClearFilters} className="btn-action-primary">
              Clear All Filters
            </button>
          ) : (
            <Link to="/upload" className="btn-action-primary">
              <Plus size={15} /> Upload PDF
            </Link>
          )}
        </div>
      ) : (
        <div className="papers-grid">
          {papers.map((paper) => (
            <div key={paper._id} className="paper-card">
              <div className="paper-card-header">
                <span className="paper-year-badge">
                  <Calendar size={12} />
                  {paper.publicationYear || 'N/A'}
                </span>
                {paper.summary?.overview && (
                  <span className="paper-ai-badge">
                    <Sparkles size={11} /> AI Summary
                  </span>
                )}
              </div>

              <Link to={`/papers/${paper._id}`} className="paper-card-title">
                {paper.title}
              </Link>

              <div className="paper-authors">
                <User size={12} className="author-icon" />
                <span>
                  {paper.authors?.length > 0
                    ? paper.authors.slice(0, 3).join(', ')
                    : 'Unknown Authors'}
                </span>
              </div>

              <p className="paper-abstract">
                {paper.abstract || 'No abstract preview available.'}
              </p>

              {paper.tags?.length > 0 && (
                <div className="paper-tags">
                  {paper.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                  {paper.tags.length > 3 && (
                    <span className="tag-more">+{paper.tags.length - 3}</span>
                  )}
                </div>
              )}

              <div className="paper-card-footer">
                <Link to={`/papers/${paper._id}`} className="btn-inspect">
                  Workspace
                </Link>
                <button
                  type="button"
                  onClick={() => setDeletingId(paper._id)}
                  className="btn-delete-paper"
                  title="Delete paper"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="pagination-bar">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-page"
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-page"
          >
            Next
          </button>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingId && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Delete Research Paper?</h3>
            <p>
              This action will delete the paper record, associated notes, and stored
              PDF file. This cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="btn-modal-cancel"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="btn-modal-delete"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
