# ResearchVault AI — Viva & Technical Defense Guide

This guide prepares you for the college laboratory demonstration, viva voce examination, and architectural defense of **ResearchVault AI**.

---

## 1. Project High-Level Overview

**What is ResearchVault AI?**  
ResearchVault AI is an academic research paper intelligence platform built on the MERN stack (MongoDB, Express, React, Node.js). It provides university students and academic researchers with an integrated workspace to upload academic PDFs, automatically extract machine-readable text and references, organize literature into collections, maintain personal research notes, and generate structured AI-assisted summaries on demand.

**Why was the MERN stack chosen?**
1. **Unified Language (JavaScript/ES Modules)**: End-to-end JavaScript streamlines full-stack development, enabling code reuse (e.g. data validation logic and citation formatting).
2. **Document-Oriented Database (MongoDB)**: Academic papers are inherently hierarchical documents containing variable-length arrays (authors, tags, keywords, extracted references) and embedded subdocuments (personal notes with timestamps, AI summaries). A flexible JSON-like schema fits this domain far better than rigid relational tables.
3. **Component-Based UI (React & Vite)**: Enables modular, responsive state management across search, filtering, and tabbed workspace views.
4. **Asynchronous Non-Blocking I/O (Node.js & Express)**: Efficiently handles multi-megabyte PDF uploads, text parsing streams, and external generative AI API calls without blocking the event loop.

---

## 2. System Architecture & Data Flow

```
   [ Client Browser ]
           │
           │  (HTTP / JSON / Multipart Form-Data)
           ▼
┌────────────────────────────────────────────────────────┐
│                   Express.js Server                    │
│                                                        │
│  ├── Middleware: CORS, JSON parser, Multer Upload     │
│  ├── Routing: /api/papers, /api/collections, etc.      │
│  ├── Controllers: Request validation & business logic  │
│  ├── Services:                                         │
│  │     ├── pdfService.js (pdf-parse text & metadata)   │
│  │     └── aiService.js (@google/genai SDK & vectors)  │
│  └── Utilities: citationUtils.js (BibTeX formatting)   │
└──────────────────────────┬─────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ MongoDB / Mongoose ]       [ Server Disk Storage ]
   - Papers Collection          - server/uploads/
   - ResearchCollections          (Secure unique PDFs)
```

---

## 3. Top 20 Technical Viva Questions & Answers

### Q1: How does the application handle PDF text extraction without third-party cloud OCR?
**Answer**: We use the native Node.js `pdf-parse` library in `server/services/pdfService.js`. When a PDF buffer is received, we first inspect the header magic number (`%PDF-`) to verify file authenticity. `pdf-parse` then traverses the document object stream, extracts machine-readable text layers, and returns raw text. Our service normalizes excessive whitespace while preserving paragraph line breaks and extracts candidate metadata (title, year, abstract, and references) using heuristic pattern matching.

### Q2: Why is the raw PDF binary not stored directly inside MongoDB?
**Answer**: Storing raw binary files inside MongoDB documents (BSON) causes rapid document bloat, degrades memory cache efficiency (WiredTiger cache), and approaches the 16 MB per-document BSON limit. Instead, we follow the industry standard: store the binary file securely on disk (`server/uploads/`) with a cryptographically unique filename, and store only the relative path and metadata (`fileSize`, `originalFileName`, `mimeType`) in the MongoDB `Paper` document.

### Q3: How do you prevent path traversal attacks during file retrieval?
**Answer**: In `server/controllers/paperController.js` (`getPaperFile`), we resolve the target path using `path.resolve(UPLOAD_DIR, paper.storedFileName)` and strictly verify that the resulting absolute path starts with the trusted directory path (`fullPath.startsWith(UPLOAD_DIR)`). We also ensure the original untrusted filename is only used in the `Content-Disposition` header and never as a filesystem path.

### Q4: Explain the Mongoose schema design for personal notes.
**Answer**: Personal notes are implemented as an embedded subdocument array within the `Paper` schema in `server/models/Paper.js`. This ensures that notes are always retrieved atomically with the paper, avoiding unnecessary table joins. Each note subdocument includes a custom validator ensuring content is non-empty, and has its own `timestamps: true` so the creation and modification dates of individual notes are accurately tracked.

### Q5: How does the dual-mode search feature work?
**Answer**:
1. **Keyword Search**: Uses regular expressions across indexed fields (`title`, `authors`, `abstract`, `keywords`, `tags`) to provide instant matching.
2. **Semantic Search**: In `server/services/aiService.js`, the query is transformed into a high-dimensional vector. When Gemini is configured, it uses `text-embedding-004`; otherwise, it uses our built-in 128-dimensional local term-frequency unit vector. The backend computes the cosine similarity between the query vector and paper vectors, returning ranked results based on conceptual similarity.

### Q6: What happens if MongoDB is offline or `MONGODB_URI` is not configured?
**Answer**: The server does not crash. In `server/config/db.js`, `connectDB()` checks for `MONGODB_URI`. If absent, it logs a clear development notice and sets connection state to `'not_configured'`. The Express server continues serving offline endpoints. The `/api/health` endpoint truthfully reports `{ configured: false, state: "not_configured" }`, while `/api/health/ready` returns HTTP 503 Service Unavailable.

### Q7: What happens if the Google Gemini API key is missing?
**Answer**: Non-AI features (PDF upload, text extraction, library filtering, personal notes, collections, BibTeX export) remain 100% operational. When a user requests an AI summary, the backend responds with a clear HTTP 400/500 explaining that `GEMINI_API_KEY` must be configured in `server/.env`. Semantic search automatically falls back to the deterministic local feature vector engine.

### Q8: How is CORS configured, and why is it necessary?
**Answer**: CORS (Cross-Origin Resource Sharing) is configured in `server/server.js` using the `cors` package to allow origins `http://localhost:5173` (Vite dev server) and `http://localhost:4173` (Vite preview). Without CORS, the browser's same-origin security policy blocks AJAX requests made from port 5173 to port 5001.

### Q9: Why was port 5001 chosen instead of the default port 5000?
**Answer**: On macOS Monterey and later, Apple's AirPlay Receiver (Control Center system process) listens on port 5000 by default. Binding to port 5000 results in an `EADDRINUSE` crash. Port 5001 avoids this conflict completely.

### Q10: How does deleting a research collection affect its papers?
**Answer**: Deleting a collection deletes *only* the `ResearchCollection` document. The referenced papers remain completely untouched in the library. Conversely, when a paper is deleted, we use `ResearchCollection.updateMany({ paperIds: id }, { $pull: { paperIds: id } })` to clean up broken references from any collections containing that paper.

### Q11: How is citation export implemented?
**Answer**: In `server/utils/citationUtils.js`, `formatBibTeX()` reads validated metadata fields (`title`, `authors`, `publicationYear`, `journalOrVenue`, `doi`) and formats a standard BibTeX entry (`@article{...}`). If a field is missing, it omits the line rather than fabricating placeholder information.

### Q12: How are related papers recommended?
**Answer**: `getRelatedPapers` in `paperController.js` evaluates candidate papers using a weighted scoring model:
- Shared tags: +3 points per tag
- Shared keywords: +2.5 points per keyword
- Shared authors: +4 points per author
- Embedding cosine similarity: up to +5 points
The system returns the top 5 papers and provides an explicit explanation for each recommendation (e.g., "Shared author: Kaiming He").

### Q13: What is the purpose of `server/scripts/check-models.js`?
**Answer**: It is an offline unit test suite that validates our Mongoose schemas using `validateSync()` without requiring a running MongoDB database. It tests required fields, minimum/maximum publication year bounds, and subdocument validation rules.

### Q14: How does Multer handle file uploads safely?
**Answer**: In `server/middleware/uploadMiddleware.js`, Multer is configured with a 20 MB size limit (`limits: { fileSize: 20 * 1024 * 1024 }`), a strict file filter checking extensions and MIME types, and disk storage that generates safe, random filenames using `crypto.randomBytes(16)`.

### Q15: How does the centralized error handler work?
**Answer**: In `server/middleware/errorMiddleware.js`, Express error middleware catches uncaught exceptions, Multer limits (`LIMIT_FILE_SIZE`), and Mongoose `ValidationError` / `CastError` exceptions, formatting them into uniform `{ success: false, message: "..." }` responses with appropriate HTTP status codes (400, 404, 500).

### Q16: How is React Router used in the frontend?
**Answer**: `client/src/App.jsx` configures a `<BrowserRouter>` with nested `<Route>` definitions under `MainLayout`. Sub-routes (`/`, `/library`, `/upload`, `/papers/:id`, `/collections`, `/search`) render dynamically in the layout's `<Outlet />` without full page reloads.

### Q17: What is the purpose of `server/scripts/seed-demo.js`?
**Answer**: It seeds 3 realistic synthetic papers (Transformers, ResNet, RAG) and a sample research collection into MongoDB. It is non-destructive—it checks if documents exist before inserting to avoid duplicates and never deletes existing user data.

### Q18: What is the difference between `/api/health` and `/api/health/ready`?
**Answer**:
- `/api/health` is an **liveness probe** that confirms the Node.js process is running (always returns HTTP 200).
- `/api/health/ready` is a **readiness probe** that confirms whether downstream dependencies (MongoDB) are ready to accept queries (returns HTTP 200 if connected, HTTP 503 if disconnected).

### Q19: How are large datasets handled in the Research Library?
**Answer**: In `server/controllers/paperController.js`, queries use `.select('-extractedText -embedding')` to omit heavy text and vector payloads from list views. Results are paginated using `.skip()` and `.limit()` with a maximum of 50 items per page.

### Q20: What security measures are implemented?
**Answer**:
1. All secrets (`MONGODB_URI`, `GEMINI_API_KEY`) are managed via environment variables and excluded from Git via `.gitignore`.
2. AI API keys are kept strictly on the backend.
3. Path traversal protection on PDF downloads.
4. Payload size limits on JSON bodies (10 MB) and file uploads (20 MB).
5. Error sanitization prevents leaking stack traces in production.
