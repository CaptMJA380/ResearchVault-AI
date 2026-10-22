# ResearchVault AI — Academic Research Intelligence Platform

A full-stack MERN application that provides undergraduate, postgraduate, and faculty researchers with an integrated workspace to upload academic PDFs, automatically extract machine-readable text and references, organize literature into collections, maintain personal research notes, and generate structured AI-assisted summaries on demand.

---

## 1. Problem Statement & Objectives

### Problem Statement
Academic researchers and university students frequently struggle with research paper overload. Scholarly PDFs are scattered across local folders and cloud drives. Researchers spend valuable hours manually extracting key findings, organizing references, tracking personal notes, and synthesizing literature reviews across multiple disconnected tools.

### Solution & Objectives
ResearchVault AI consolidates the research workflow into a single, cohesive academic SaaS platform:
1. **Automated Document Intelligence**: Extract machine-readable text from academic PDFs without destroying paragraph structure.
2. **Bibliographic Management**: Filter, search, and curate papers with editable titles, authors, venues, DOIs, and tags.
3. **Structured AI Synthesis**: Generate structured research summaries (Overview, Problem, Methodology, Main Findings, Limitations) using Google Gemini without hallucinating claims.
4. **Research Collections & Notes**: Group papers into thematic collections and maintain personal literature review notes.
5. **Scholarly Discovery**: Find conceptually related papers using vector embedding cosine similarity and export BibTeX citations.

---

## 2. Technology Stack & Architecture

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend** | React + Vite | React 18.3 / Vite 5.4 | Component-based, responsive academic SaaS interface |
| **Routing** | React Router DOM | 6.27.0 | Client-side routing across 6 dedicated views |
| **Icons & Design** | Lucide React | 0.460.0 | Forest-green academic visual identity system |
| **HTTP Client** | Axios | 1.7.7 | Centralized API client with response interceptors |
| **Backend** | Node.js + Express | Node 24.12 / Express 4.21 | RESTful modular API (routes, controllers, middleware) |
| **File Processing** | Multer + pdf-parse | Multer 2.4 / pdf-parse 2.4 | 20 MB upload limits, signature checks, text extraction |
| **Database** | MongoDB + Mongoose | Mongoose 9.11.1 | Document schemas, embedded subdocuments, query indexes |
| **AI Integration** | Google GenAI SDK | `@google/genai` 2.30.0 | Structured synthesis (`gemini-2.5-flash`) & vector embeddings |

---

## 3. Project Structure

```
researchvault-ai/
├── client/                      # React 18 + Vite frontend (Port 5173)
│   ├── public/                  # Favicons and public assets
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # Centralized Axios API client
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx   # Sidebar, topbar, and router outlet
│   │   │   └── MainLayout.css
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx# Live database metrics and recent items
│   │   │   ├── LibraryPage.jsx  # Search, filter, paginate, delete papers
│   │   │   ├── UploadPage.jsx   # Drag-and-drop PDF upload with metadata
│   │   │   ├── PaperDetailPage.jsx # Tabbed workspace (Summary, Text, Notes, Refs)
│   │   │   ├── CollectionsPage.jsx # Thematic research collections manager
│   │   │   └── SearchPage.jsx   # Dual-mode (Semantic vector & Keyword) search
│   │   ├── App.jsx              # React Router configuration
│   │   ├── App.css
│   │   ├── index.css            # Global CSS variables & reset
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                      # Node.js + Express backend (Port 5001)
│   ├── config/
│   │   └── db.js                # Mongoose connection & status tracker
│   ├── controllers/
│   │   ├── paperController.js   # Paper CRUD, notes, related, BibTeX
│   │   └── collectionController.js # Collection CRUD & paper membership
│   ├── middleware/
│   │   ├── uploadMiddleware.js  # Multer 20 MB PDF validator
│   │   └── errorMiddleware.js   # Centralized error handler
│   ├── models/
│   │   ├── Paper.js             # Paper schema, notes subdocs, AI summary
│   │   └── ResearchCollection.js # Collection schema referencing Paper
│   ├── routes/
│   │   ├── paperRoutes.js       # /api/papers endpoints
│   │   ├── collectionRoutes.js  # /api/collections endpoints
│   │   ├── searchRoutes.js      # /api/search/semantic endpoint
│   │   └── dashboardRoutes.js   # /api/dashboard/stats endpoint
│   ├── services/
│   │   ├── pdfService.js        # PDF text parser & metadata heuristics
│   │   └── aiService.js         # Google GenAI summarization & embeddings
│   ├── utils/
│   │   └── citationUtils.js     # BibTeX formatting & ObjectId checks
│   ├── scripts/
│   │   ├── check-models.js      # Offline Mongoose schema validation tests
│   │   ├── check-db.js          # Live database connection tester
│   │   └── seed-demo.js         # Non-destructive demo seeder
│   ├── tests/
│   │   ├── backend-unit.test.js # Unit tests (citations, vectors, pdf)
│   │   └── api.test.js          # REST API integration smoke tests
│   ├── uploads/                 # Local disk storage for uploaded PDFs
│   ├── server.js                # Express app entry point
│   ├── .env.example             # Configuration template
│   └── package.json
├── docs/
│   ├── PROJECT_PLAN.md          # Implementation milestones
│   ├── API_DOCUMENTATION.md     # Detailed REST endpoint specifications
│   ├── TEST_REPORT.md           # Full testing execution records
│   ├── ASSESSMENT_MAPPING.md    # 30-mark college rubric mapping
│   └── VIVA_PREPARATION.md      # Technical defense & 20 viva Q&As
├── .gitignore
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or later (tested on v24.12.0)
- **npm**: v9.0.0 or later (tested on v11.6.2)
- **MongoDB** *(Optional for offline checks; required for live data)*:
  - Local MongoDB Community Server running on `mongodb://127.0.0.1:27017`
  - **OR** a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database URI

---

## 5. Installation & Setup

### 1. Install Backend Dependencies
```bash
cd server
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 3. Configure Backend Environment
Copy the example configuration file:
```bash
cp server/.env.example server/.env
```

`server/.env` contents:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/researchvault_ai
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

> **Note on Port 5001**: Port 5001 is used because macOS Monterey+ reserves port 5000 for Apple's AirPlay Receiver (Control Center).
> **Note on GEMINI_API_KEY**: The application runs without an API key. Semantic search automatically falls back to local term-feature vectors.

---

## 6. Running the Applications

### Terminal 1: Start the Backend Server
```bash
cd server
npm run dev        # Development mode (nodemon auto-restart)
# or
npm start          # Standard Node.js execution
```
The server will start at **`http://localhost:5001`**.

### Terminal 2: Start the React Frontend
```bash
cd client
npm run dev
```
The frontend application will be live at **`http://localhost:5173`**.

---

## 7. Populating Demonstration Data

To test and demonstrate the application with realistic scholarly papers without manually uploading files first:

```bash
cd server
npm run seed:demo
```
This populates 3 seminal research papers (*Transformers*, *Deep ResNet*, *Retrieval-Augmented Generation*) with full AI summaries, references, and notes, plus a pre-configured research collection.

---

## 8. Executing the Test Suites

The project includes automated offline and integration test suites:

### Run All Automated Tests
```bash
cd server
npm test
```
This automatically runs:
1. `npm run check:models` — 14 offline Mongoose schema validation checks.
2. `node tests/backend-unit.test.js` — 6 unit tests for citations, vectors, and PDF parsing.
3. `NODE_ENV=test node tests/api.test.js` — 6 REST API integration smoke tests.

### Test Live Database Connection
```bash
cd server
npm run check:db
```

### Verify Frontend Production Build
```bash
cd client
npm run build
```

---

## 9. API Endpoint Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Observability check returning server, DB, and AI status |
| `GET` | `/api/health/ready` | Readiness probe (200 OK / 503 Service Unavailable) |
| `GET` | `/api/dashboard/stats` | Live database totals, recent papers, and recent summaries |
| `GET` | `/api/papers` | Paginated papers list with search, tag, and year filters |
| `POST` | `/api/papers` | Upload academic PDF (20 MB max) & extract metadata/text |
| `GET` | `/api/papers/:id` | Full paper details, extracted text, notes, and references |
| `PUT` | `/api/papers/:id` | Update paper bibliographic metadata |
| `DELETE` | `/api/papers/:id` | Delete paper, unlinking collections & deleting PDF file |
| `GET` | `/api/papers/:id/file` | Secure PDF stream with path traversal protection |
| `POST` | `/api/papers/:id/summarize` | Trigger on-demand Google Gemini structured summary |
| `POST` | `/api/papers/:id/notes` | Add embedded personal literature review note |
| `DELETE` | `/api/papers/:id/notes/:noteId` | Remove personal note subdocument |
| `GET` | `/api/papers/:id/related` | Compute weighted scholarly connections across library |
| `GET` | `/api/papers/:id/export/bibtex` | Export formatted BibTeX citation |
| `GET` | `/api/collections` | List collections with populated paper titles |
| `POST` | `/api/collections` | Create research collection |
| `PUT` | `/api/collections/:id` | Update collection or add/remove papers atomically |
| `DELETE` | `/api/collections/:id` | Delete collection (preserves library papers) |
| `GET` | `/api/search/semantic` | Dual-mode vector embedding similarity ranking |

---

## 10. Security & Privacy Notes

1. **Credentials**: Secrets (`MONGODB_URI`, `GEMINI_API_KEY`) are managed exclusively via environment variables and excluded from Git.
2. **File Safety**: Uploaded PDFs are restricted to 20 MB, checked for `%PDF-` signature, saved with random hexadecimal filenames, and protected against path traversal.
3. **Local Educational Scope**: ResearchVault AI is designed as a local single-user educational proof of concept. For public deployment, multi-user JWT authentication and rate limiting must be added.

---

## 11. Documentation Links

- [Project Milestones (`docs/PROJECT_PLAN.md`)](./docs/PROJECT_PLAN.md)
- [REST API Specifications (`docs/API_DOCUMENTATION.md`)](./docs/API_DOCUMENTATION.md)
- [Automated Test Report (`docs/TEST_REPORT.md`)](./docs/TEST_REPORT.md)
- [30-Mark Rubric Mapping (`docs/ASSESSMENT_MAPPING.md`)](./docs/ASSESSMENT_MAPPING.md)
- [Viva & Technical Defense Guide (`docs/VIVA_PREPARATION.md`)](./docs/VIVA_PREPARATION.md)
