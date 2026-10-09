import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BookOpen,
  Search,
  FolderOpen,
  FileText,
  Sparkles,
  Lock,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import './App.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:5001';
const HEALTH_ENDPOINT = `${API_BASE}/api/health`;

// ─── Roadmap cards shown on the landing page ──────────────────────────────────

const ROADMAP = [
  {
    icon: <CheckCircle size={18} />,
    title: 'MERN Stack Setup',
    desc: 'React + Vite frontend and Express backend scaffolded and connected.',
    badge: 'Done',
    badgeClass: 'badge-done',
  },
  {
    icon: <FolderOpen size={18} />,
    title: 'MongoDB Integration',
    desc: 'Mongoose schemas and CRUD endpoints for research papers.',
    badge: 'Upcoming',
    badgeClass: 'badge-future',
  },
  {
    icon: <FileText size={18} />,
    title: 'PDF Upload & Extraction',
    desc: 'Upload academic PDFs and extract their full text with pdf-parse.',
    badge: 'Upcoming',
    badgeClass: 'badge-future',
  },
  {
    icon: <Search size={18} />,
    title: 'Search & Collections',
    desc: 'Full-text search, tags, collections, and personal notes per paper.',
    badge: 'Upcoming',
    badgeClass: 'badge-future',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'AI Summaries',
    desc: 'Gemini-powered intelligent summaries generated on demand.',
    badge: 'Upcoming',
    badgeClass: 'badge-future',
  },
  {
    icon: <Lock size={18} />,
    title: 'Authentication',
    desc: 'JWT-based user accounts to secure personal research libraries.',
    badge: 'Upcoming',
    badgeClass: 'badge-future',
  },
];

// ─── BackendStatus component ──────────────────────────────────────────────────

function BackendStatus() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const { data } = await axios.get(HEALTH_ENDPOINT, { timeout: 6000 });
        if (!cancelled) {
          setStatus('success');
          setMessage(data.message ?? 'API responded successfully');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          if (err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED') {
            setMessage('Cannot reach the backend. Make sure the server is running on port 5000.');
          } else if (err.response) {
            setMessage(`Server returned ${err.response.status}: ${err.response.statusText}`);
          } else {
            setMessage(err.message ?? 'Unexpected error while contacting the backend.');
          }
        }
      }
    }

    checkHealth();
    return () => { cancelled = true; };
  }, []);

  const stateLabel = {
    checking: 'Checking backend…',
    success:  'Backend connected',
    error:    'Backend unreachable',
  }[status];

  const StatusIcon = {
    checking: <Loader2 size={18} className="spin" color="#b45309" />,
    success:  <CheckCircle size={18} color="#16a34a" />,
    error:    <AlertCircle size={18} color="#dc2626" />,
  }[status];

  return (
    <section className="status-section">
      <div className="status-inner">
        <span className="status-label">API Connection Status</span>

        <div className="status-card">
          <div className="status-card-header">
            <span className="status-card-title">GET /api/health</span>
            <span className={`status-dot ${status}`} />
          </div>

          <div className="status-card-body">
            <div className="status-row">
              <span className="status-icon">{StatusIcon}</span>
              <div className="status-content">
                <span className={`status-state ${status}`}>{stateLabel}</span>
                {message && (
                  <span className="status-detail">{message}</span>
                )}
                <span className="status-endpoint">
                  <Activity size={11} />
                  {HEALTH_ENDPOINT}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── App (landing page) ───────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <a href="/" className="logo">
            <div className="logo-mark">
              <span>RV</span>
            </div>
            <div className="logo-text">
              <span className="logo-title">ResearchVault</span>
              <span className="logo-subtitle">AI Platform</span>
            </div>
          </a>
          <span className="header-badge">
            <BookOpen size={11} />
            Step 2 — Initial Setup
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-eyebrow">
            <BookOpen size={12} />
            Research Paper Intelligence
          </div>

          <h1 className="hero-heading">
            Research starts with a{' '}
            <em>better library.</em>
          </h1>

          <p className="hero-description">
            ResearchVault AI is a platform for academics, researchers, and
            students to upload, search, annotate, and gain AI-powered insights
            from their collection of academic papers — all in one place.
          </p>

          {/* Feature chips */}
          <div className="feature-chips">
            {[
              { icon: <FileText size={12} />, label: 'PDF Upload' },
              { icon: <Search size={12} />,   label: 'Full-text Search' },
              { icon: <FolderOpen size={12} />,label: 'Collections' },
              { icon: <Sparkles size={12} />, label: 'AI Summaries' },
              { icon: <Lock size={12} />,     label: 'Secure Accounts' },
              { icon: <ArrowRight size={12} />,label: 'Coming soon' },
            ].map(({ icon, label }) => (
              <span key={label} className="chip">
                {icon}
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Backend status panel */}
        <BackendStatus />

        {/* Roadmap cards */}
        <section className="info-section">
          <p className="section-heading">Implementation Roadmap</p>
          <div className="info-grid">
            {ROADMAP.map(({ icon, title, desc, badge, badgeClass }) => (
              <div key={title} className="info-card">
                <div className="info-card-icon">{icon}</div>
                <div className="info-card-title">{title}</div>
                <div className="info-card-desc">{desc}</div>
                <span className={`info-card-badge ${badgeClass}`}>{badge}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <p className="footer-message">
            <strong>ResearchVault AI</strong> — Research workspace under active construction.
          </p>
          <p className="footer-note">
            Step 2 complete · MERN stack initialised · MongoDB integration coming in Step 3
          </p>
        </div>
      </footer>
    </div>
  );
}
