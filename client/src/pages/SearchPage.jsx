import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Sparkles,
  BookOpen,
  User,
  Calendar,
  Tag,
  ArrowRight,
  RefreshCw,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { searchSemantic, getPapers } from '../api/client.js';
import './SearchPage.css';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' | 'keyword'

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Metadata returned by backend
  const [searchMeta, setSearchMeta] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      if (searchMode === 'semantic') {
        const res = await searchSemantic(query.trim(), 15);
        setResults(res.data || []);
        setSearchMeta({
          mode: res.searchMode,
          providerConfigured: res.providerConfigured,
          count: res.count,
        });
      } else {
        const res = await getPapers({ search: query.trim(), limit: 15 });
        setResults(res.data || []);
        setSearchMeta({
          mode: 'standard-keyword-match',
          count: res.data?.length || 0,
        });
      }
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-discovery-page">
      <div className="search-header">
        <h1 className="page-title">Discovery & Research Search</h1>
        <p className="page-subtitle">
          Query your literature repository using vector similarity embeddings or exact keyword filtering.
        </p>
      </div>

      {/* ── Search Input Box ── */}
      <div className="search-box-card">
        <form onSubmit={handleSearch} className="discovery-search-form">
          <div className="discovery-input-wrap">
            <Search size={18} className="discovery-icon" />
            <input
              type="text"
              placeholder={
                searchMode === 'semantic'
                  ? 'e.g. "How do transformers solve the bottleneck of sequential recurrent models?"'
                  : 'e.g. "attention", "ResNet", "Patrick Lewis"'
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="discovery-input"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading} className="btn-search-exec">
            {loading ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={15} />
                <span>Search</span>
              </>
            )}
          </button>
        </form>

        {/* ── Search Mode Switcher ── */}
        <div className="search-mode-selector">
          <span className="mode-label">Search Strategy:</span>
          <div className="mode-toggle-group">
            <button
              type="button"
              onClick={() => setSearchMode('semantic')}
              className={`mode-btn ${searchMode === 'semantic' ? 'active' : ''}`}
            >
              <Sparkles size={13} />
              <span>Semantic Similarity (Vector Embeddings)</span>
            </button>
            <button
              type="button"
              onClick={() => setSearchMode('keyword')}
              className={`mode-btn ${searchMode === 'keyword' ? 'active' : ''}`}
            >
              <Sliders size={13} />
              <span>Keyword & Metadata Match</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Info / Feedback ── */}
      {searchMeta && !loading && (
        <div className="search-meta-bar">
          <span>
            Strategy: <strong>{searchMeta.mode}</strong>
          </span>
          <span>•</span>
          <span>
            Found <strong>{results.length}</strong> matching papers
          </span>
          {searchMeta.mode?.includes('local-semantic') && (
            <span className="badge-offline-note">
              Using local vector embeddings (Gemini API key not configured)
            </span>
          )}
        </div>
      )}

      {/* ── Error Banner ── */}
      {error && (
        <div className="error-alert">
          <span>{error}</span>
        </div>
      )}

      {/* ── Search Results ── */}
      {loading ? (
        <div className="loading-container">
          <RefreshCw size={24} className="spin-icon" />
          <p>Analyzing document vectors and ranking results...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="search-empty-card">
          <HelpCircle size={36} className="empty-search-icon" />
          <h3>No matching papers found</h3>
          <p>Try rephrasing your research question or switching to Keyword search mode.</p>
        </div>
      ) : (
        <div className="results-list">
          {results.map((paper) => (
            <div key={paper._id} className="result-card">
              <div className="result-header">
                <Link to={`/papers/${paper._id}`} className="result-title">
                  {paper.title}
                </Link>
                {paper.similarityScore !== undefined && (
                  <span className="similarity-pill">
                    <Sparkles size={11} />
                    {(paper.similarityScore * 100).toFixed(0)}% Match
                  </span>
                )}
              </div>

              <div className="result-authors">
                <User size={12} />
                <span>
                  {paper.authors?.join(', ') || 'Unknown Authors'}
                  {paper.publicationYear ? ` • ${paper.publicationYear}` : ''}
                </span>
              </div>

              <p className="result-abstract">
                {paper.abstract || 'No abstract preview available.'}
              </p>

              {paper.tags?.length > 0 && (
                <div className="result-tags">
                  {paper.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="tag-chip">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="result-footer">
                <Link to={`/papers/${paper._id}`} className="btn-open-workspace">
                  Open Paper Workspace <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
