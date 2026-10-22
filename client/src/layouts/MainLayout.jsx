import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  FolderKanban,
  Search,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import './MainLayout.css';

export default function MainLayout() {
  return (
    <div className="layout-container">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">RV</div>
          <div className="brand-info">
            <span className="brand-name">ResearchVault</span>
            <span className="brand-tag">Intelligence Platform</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/library"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <BookOpen size={18} />
            <span>Research Library</span>
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Upload size={18} />
            <span>Upload Paper</span>
          </NavLink>

          <NavLink
            to="/collections"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <FolderKanban size={18} />
            <span>Collections</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Search size={18} />
            <span>Discovery & Search</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="system-pill">
            <Sparkles size={13} className="sparkle-icon" />
            <span>Gemini AI Ready</span>
          </div>
          <p className="academic-notice">
            MERN Stack PoC • Academic Edition
          </p>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="main-wrapper">
        <header className="topbar">
          <div className="topbar-search-hint">
            <span className="badge-academic">Autonomous MERN Research Workspace</span>
          </div>
          <div className="topbar-actions">
            <NavLink to="/upload" className="btn-top-upload">
              <Upload size={14} />
              <span>Upload PDF</span>
            </NavLink>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
