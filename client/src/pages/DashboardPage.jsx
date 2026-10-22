import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  FolderKanban,
  FileText,
  Sparkles,
  Upload,
  Search,
  ArrowRight,
  Database,
  Activity,
  AlertTriangle,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { getDashboardStats } from '../api/client.js';
import './DashboardPage.css';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const stats = data?.stats || {
    totalPapers: 0,
    totalCollections: 0,
    totalNotes: 0,
    totalSummaries: 0,
  };

  const system = data?.system;

  return (
    <div className="dashboard-page">
      {/* ── Welcome Header ── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Research Intelligence Dashboard</h1>
          <p className="dashboard-subtitle">
            Welcome to ResearchVault AI — your unified academic paper workspace.
          </p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/upload" className="btn-action primary">
            <Upload size={15} />
            <span>Upload Paper</span>
          </Link>
          <Link to="/search" className="btn-action secondary">
            <Search size={15} />
            <span>Discovery Search</span>
          </Link>
        </div>
      </div>

      {/* ── System Status Banner ── */}
      <div className="system-status-grid">
        <div className="status-indicator-card">
          <div className="status-header">
            <div className="status-label-group">
              <Database size={16} className="status-icon" />
              <span className="status-name">MongoDB Database</span>
            </div>
            <span
              className={`status-pill ${
                system?.database?.state === 'connected' ? 'connected' : 'unconfigured'
              }`}
            >
              {system?.database?.state || 'checking...'}
            </span>
          </div>
          <p className="status-desc">
            {system?.database?.state === 'connected'
              ? 'Connected & actively persisting research documents.'
              : 'MongoDB is offline or pending configuration in server/.env.'}
          </p>
        </div>

        <div className="status-indicator-card">
          <div className="status-header">
            <div className="status-label-group">
              <Sparkles size={16} className="status-icon ai" />
              <span className="status-name">Google Gemini AI</span>
            </div>
            <span
              className={`status-pill ${
                system?.ai?.configured ? 'connected' : 'notice'
              }`}
            >
              {system?.ai?.configured ? 'Active' : 'Unconfigured'}
            </span>
          </div>
          <p className="status-desc">
            {system?.ai?.configured
              ? `Model: ${system.ai.model} active for structured research summaries.`
              : 'Add GEMINI_API_KEY in server/.env to enable on-demand summaries.'}
          </p>
        </div>
      </div>

      {/* ── Live Database Statistics ── */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrap papers">
            <BookOpen size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalPapers}</span>
            <span className="stat-label">Research Papers</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap collections">
            <FolderKanban size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalCollections}</span>
            <span className="stat-label">Collections</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap notes">
            <FileText size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalNotes}</span>
            <span className="stat-label">Personal Notes</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap summaries">
            <Sparkles size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{loading ? '...' : stats.totalSummaries}</span>
            <span className="stat-label">AI Summaries</span>
          </div>
        </div>
      </div>

      {/* ── Error Banner if any ── */}
      {error && (
        <div className="error-alert">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* ── Content Columns: Recent Papers & AI Summaries ── */}
      <div className="dashboard-grid">
        {/* Recent Papers */}
        <section className="section-card">
          <div className="section-card-header">
            <h2 className="section-heading">Recently Added Papers</h2>
            <Link to="/library" className="section-link">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="loading-state">Loading library records...</div>
          ) : !data?.recentPapers || data.recentPapers.length === 0 ? (
            <div className="empty-state">
              <BookOpen size={28} className="empty-icon" />
              <p>No research papers found in your library yet.</p>
              <Link to="/upload" className="btn-small">Upload your first PDF</Link>
            </div>
          ) : (
            <div className="recent-list">
              {data.recentPapers.map((paper) => (
                <div key={paper._id} className="recent-item">
                  <div className="recent-content">
                    <Link to={`/papers/${paper._id}`} className="recent-title">
                      {paper.title}
                    </Link>
                    <div className="recent-meta">
                      <span>{paper.authors?.slice(0, 2).join(', ') || 'Unknown Author'}</span>
                      {paper.publicationYear && <span>• {paper.publicationYear}</span>}
                      {paper.summary?.overview && (
                        <span className="badge-has-summary">AI Summary</span>
                      )}
                    </div>
                  </div>
                  <Link to={`/papers/${paper._id}`} className="btn-icon-link">
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Summaries */}
        <section className="section-card">
          <div className="section-card-header">
            <h2 className="section-heading">Recent AI Summaries</h2>
            <span className="badge-pill-academic">Synthesis</span>
          </div>

          {loading ? (
            <div className="loading-state">Loading summaries...</div>
          ) : !data?.recentSummaries || data.recentSummaries.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={28} className="empty-icon ai" />
              <p>No AI summaries generated yet.</p>
              <span className="empty-hint">Open any paper in your library and click "Generate AI Summary".</span>
            </div>
          ) : (
            <div className="summary-list">
              {data.recentSummaries.map((item) => (
                <div key={item._id} className="summary-item">
                  <Link to={`/papers/${item._id}`} className="summary-title">
                    {item.title}
                  </Link>
                  <p className="summary-excerpt">
                    {item.summary?.overview || 'No overview available.'}
                  </p>
                  <div className="summary-footer">
                    <span className="summary-model">{item.summary?.model || 'Gemini'}</span>
                    <Link to={`/papers/${item._id}`} className="read-more">
                      Inspect full findings <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
