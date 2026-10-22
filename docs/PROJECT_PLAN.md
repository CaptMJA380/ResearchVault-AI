# ResearchVault AI — Project Plan & Execution Milestones

## 1. Project Overview

ResearchVault AI is an academic research paper intelligence platform built on the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides university students, faculty, and postgraduate researchers with an integrated workspace to upload academic PDFs, automatically extract machine-readable text and references, organize literature into collections, maintain personal research notes, and generate structured AI-assisted summaries on demand.

---

## 2. Technology Stack & Core Architecture

| Layer | Technology | Status | Role in ResearchVault AI |
|---|---|---|---|
| **Frontend** | React 18 + Vite 5 + React Router 6 | ✅ Complete | Modular, responsive academic SaaS interface with 6 complete views |
| **Icons & UI** | Lucide React | ✅ Complete | Academic SaaS iconography and visual status indicators |
| **Backend** | Node.js 24 + Express 4 | ✅ Complete | RESTful API with modular routes, controllers, and error handling |
| **File Processing** | Multer 2 + pdf-parse 2 | ✅ Complete | 20 MB size limits, PDF signature validation, normalized text extraction |
| **Database** | MongoDB + Mongoose 9 | ✅ Complete | Document models (`Paper`, `ResearchCollection`), embedded notes, indexes |
| **AI Layer** | Google GenAI SDK (`@google/genai`) | ✅ Complete | Structured research summarization (`gemini-2.5-flash`) & vector embeddings |
| **Citations** | BibTeX Formatter (`citationUtils.js`) | ✅ Complete | Standardized scholarly citation generation without hallucinations |

---

## 3. Milestone Execution Status

### ✅ Step 1 — Project Planning & Problem Definition (Verified)
- Problem statement formulated (academic PDF overload, fragmented literature reviews).
- Architecture and schema models planned.
- Deliverable: Initial project plan and documentation.

### ✅ Step 2 — MERN Stack Setup & Initial Shell (Verified)
- Scaffolded React 18 + Vite in `client/` (port 5173).
- Built Express server in `server/` with `/api/health` (port 5001).
- Configured CORS, `.env.example`, `.gitignore`.

### ✅ Step 3 — MongoDB Connection & Data Models (Verified)
- Installed Mongoose ODM (`^9.11.1`).
- Implemented reusable connection module `server/config/db.js` with 4 states.
- Implemented schemas: `Paper.js` and `ResearchCollection.js`.
- Implemented offline model verification suite (`npm run check:models`).
- Added `/api/health/ready` readiness endpoint.

### ✅ Step 4 — PDF Upload & Document Intelligence (Verified)
- Configured `multer` upload middleware in `server/middleware/uploadMiddleware.js`.
- Integrated `pdf-parse` in `server/services/pdfService.js` with magic number signature checks.
- Implemented whitespace normalization and candidate metadata extraction heuristics.
- Added path traversal protected file download endpoint (`GET /api/papers/:id/file`).

### ✅ Step 5 — Core CRUD & Collection Management APIs (Verified)
- Implemented `paperController.js` and `collectionController.js` with full CRUD operations.
- Implemented atomic note addition/removal subdocuments.
- Added relationship cleanup: deleting a paper removes references from collections.

### ✅ Step 6 — AI Summaries & Semantic Search (Verified)
- Integrated `@google/genai` official SDK in `server/services/aiService.js`.
- Created structured JSON summary generator (`gemini-2.5-flash`) with error isolation.
- Implemented dual-mode search: Keyword regex match and Vector cosine similarity search.
- Added fallback 128-dimensional local term-vector generation when Gemini key is unconfigured.

### ✅ Step 7 — Advanced Academic Features (Verified)
- **Related Papers Engine**: Computes weighted scholarly connections based on tags, keywords, authors, and vector similarity.
- **BibTeX Citation Export**: Exports standard BibTeX citation files.
- **Non-Destructive Demo Seeder**: Created `npm run seed:demo` inserting 3 canonical AI papers.

### ✅ Step 8 — Testing, Documentation & Viva Preparation (Verified)
- Offline model validation suite: 14 passing checks (`npm run check:models`).
- Backend unit and vector math test suite: 6 passing checks (`npm run test:unit`).
- REST API integration smoke test suite: 6 passing checks (`npm run test:api`).
- Frontend production build verified: 1,650 modules transformed in 3.36s.
- Created `docs/API_DOCUMENTATION.md`, `docs/TEST_REPORT.md`, `docs/ASSESSMENT_MAPPING.md`, `docs/VIVA_PREPARATION.md`.
