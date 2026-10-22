import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
} from 'lucide-react';
import { createPaper } from '../api/client.js';
import './UploadPage.css';

export default function UploadPage() {
  const navigate = useNavigate();

  // File state
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Editable metadata state
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [journalOrVenue, setJournalOrVenue] = useState('');
  const [doi, setDoi] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tags, setTags] = useState('');
  const [keywords, setKeywords] = useState('');

  // Processing state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  function handleFileSelect(selected) {
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.endsWith('.pdf')) {
      setError('Please select a valid PDF document (.pdf).');
      return;
    }

    if (selected.size > 20 * 1024 * 1024) {
      setError('File size exceeds the 20 MB limit.');
      return;
    }

    setError(null);
    setFile(selected);

    // Default title from filename if empty
    if (!title) {
      const clean = selected.name
        .replace(/\.pdf$/i, '')
        .replace(/[_\-]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(clean);
    }
  }

  function handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!title.trim() && !file) {
      setError('Please provide a paper title or select a PDF document.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (title.trim()) formData.append('title', title.trim());
      if (authors.trim()) formData.append('authors', authors.trim());
      if (publicationYear) formData.append('publicationYear', publicationYear);
      if (journalOrVenue.trim()) formData.append('journalOrVenue', journalOrVenue.trim());
      if (doi.trim()) formData.append('doi', doi.trim());
      if (abstract.trim()) formData.append('abstract', abstract.trim());
      if (tags.trim()) formData.append('tags', tags.trim());
      if (keywords.trim()) formData.append('keywords', keywords.trim());

      const res = await createPaper(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/papers/${res.data._id}`);
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="upload-page">
      <div className="upload-header">
        <h1 className="page-title">Upload Research Paper</h1>
        <p className="page-subtitle">
          Extract text, generate metadata suggestions, and integrate academic PDFs into your library.
        </p>
      </div>

      <div className="upload-container">
        {/* ── Dropzone Card ── */}
        <div
          className={`dropzone-card ${dragActive ? 'drag-active' : ''} ${
            file ? 'has-file' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="pdf-upload"
            accept=".pdf,application/pdf"
            onChange={(e) => handleFileSelect(e.target.files[0])}
            className="file-input-hidden"
          />

          {!file ? (
            <label htmlFor="pdf-upload" className="dropzone-label">
              <div className="dropzone-icon-wrap">
                <UploadCloud size={38} />
              </div>
              <span className="dropzone-primary-text">
                Click to browse or drag and drop academic PDF
              </span>
              <span className="dropzone-secondary-text">
                Accepts PDF documents up to 20 MB • Automated text extraction
              </span>
            </label>
          ) : (
            <div className="file-preview-card">
              <FileText size={32} className="file-preview-icon" />
              <div className="file-preview-info">
                <span className="file-name">{file.name}</span>
                <span className="file-meta">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for text extraction
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFile(null)}
                className="btn-remove-file"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── Error / Success Banners ── */}
        {error && (
          <div className="upload-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="upload-alert success">
            <CheckCircle size={18} />
            <span>Paper uploaded and processed successfully! Redirecting to workspace...</span>
          </div>
        )}

        {/* ── Metadata Form ── */}
        <form onSubmit={handleSubmit} className="metadata-form-card">
          <div className="form-card-header">
            <h3>Bibliographic Metadata</h3>
            <span className="badge-optional">Editable before and after upload</span>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">Paper Title *</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Attention Is All You Need"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="authors">Authors (comma separated)</label>
              <input
                id="authors"
                type="text"
                placeholder="Ashish Vaswani, Noam Shazeer, Niki Parmar"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Publication Year</label>
              <input
                id="year"
                type="number"
                placeholder="2024"
                min="1500"
                max="2035"
                value={publicationYear}
                onChange={(e) => setPublicationYear(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="venue">Journal / Conference Venue</label>
              <input
                id="venue"
                type="text"
                placeholder="NeurIPS, CVPR, ICML, Nature"
                value={journalOrVenue}
                onChange={(e) => setJournalOrVenue(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="doi">DOI Reference</label>
              <input
                id="doi"
                type="text"
                placeholder="10.1145/1234567.890"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="tags">Tags (comma separated)</label>
              <input
                id="tags"
                type="text"
                placeholder="deep-learning, transformers, thesis-chapter-1"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="keywords">Keywords</label>
              <input
                id="keywords"
                type="text"
                placeholder="self-attention, sequence modeling, translation"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="abstract">Abstract Preview</label>
              <textarea
                id="abstract"
                rows="4"
                placeholder="Paste or review the extracted research abstract..."
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                className="form-textarea"
              ></textarea>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={uploading}
              className="btn-submit-upload"
            >
              {uploading ? (
                <>
                  <RefreshCw size={15} className="spin-icon" />
                  <span>Processing & Extracting Text...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Save to Research Library</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
