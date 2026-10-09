# ResearchVault AI — Project Plan

## Overview

ResearchVault AI is a research paper intelligence platform designed to help academics, researchers, and students manage, search, and gain insights from academic PDFs.

---

## Goals

- Allow users to upload and store academic PDFs
- Extract and index the text content of uploaded papers
- Enable full-text search across the research library
- Organize papers into collections and add personal notes
- Generate AI-assisted summaries of research papers
- Provide a clean, professional interface optimized for academic workflows

---

## Technology Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React.js + Vite                   |
| Backend     | Node.js + Express.js              |
| Database    | MongoDB + Mongoose                |
| PDF Extract | pdf-parse or similar (future)     |
| AI Layer    | Google Gemini / OpenAI (future)   |
| Auth        | JWT-based authentication (future) |

---

## Implementation Steps

### ✅ Step 1 — Project Planning
- Defined project goals and scope
- Documented technology stack
- Created project plan

### ✅ Step 2 — MERN Stack Setup
- Scaffolded React + Vite frontend in `client/`
- Created Express.js backend in `server/`
- Configured CORS, environment variables, health endpoint
- Verified frontend ↔ backend communication
- Configured `.gitignore`

### ✅ Step 3 — MongoDB Connection and Data Models (Completed - Connection Pending Config)
- Installed Mongoose ODM in `server/`
- Implemented reusable connection module `server/config/db.js` with connection state reporting (`connected`, `connecting`, `disconnected`, `not_configured`)
- Implemented `Paper` schema & model (`server/models/Paper.js`) with metadata, document attributes, extracted text, AI summary subdocument, and embedded notes with timestamps
- Implemented `ResearchCollection` schema & model (`server/models/ResearchCollection.js`) referencing Paper models
- Implemented offline model verification suite `server/scripts/check-models.js` (`npm run check:models`)
- Implemented live connection checker `server/scripts/check-db.js` (`npm run check:db`)
- Enhanced `/api/health` with database state while preserving original response contract
- Added `/api/health/ready` readiness endpoint (HTTP 200 when connected, HTTP 503 when disconnected/unconfigured)

### 🔲 Step 4 — PDF Upload & Text Extraction
- Implement file upload with Multer
- Extract text from PDFs using pdf-parse
- Store extracted content and file metadata in MongoDB

### 🔲 Step 5 — Search & Collections
- Implement full-text search across papers
- Create collections/tags feature and collection CRUD endpoints
- Add personal notes CRUD functionality per paper

### 🔲 Step 6 — AI Summaries
- Integrate Gemini / OpenAI API
- Generate concise, structured paper summaries on demand
- Display AI insights in the frontend

### 🔲 Step 7 — Authentication
- JWT-based user registration and login
- Protect routes and associate papers with users

### 🔲 Step 8 — Deployment
- Deploy frontend (Vercel / Netlify)
- Deploy backend (Railway / Render)
- Configure production environment variables

---

## Project Structure

```
researchvault-ai/
├── client/              # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/              # Node.js + Express backend
│   ├── config/
│   │   └── db.js        # Mongoose connection & state tracker
│   ├── models/
│   │   ├── Paper.js     # Research paper schema & model
│   │   └── ResearchCollection.js # Collection schema & model
│   ├── scripts/
│   │   ├── check-models.js # Offline model validation checks
│   │   └── check-db.js  # Live database connection tester
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── docs/
│   └── PROJECT_PLAN.md
├── .gitignore
└── README.md
```

---

## Notes

- MongoDB schema definitions and connection handlers completed in Step 3.
- No paper CRUD API endpoints or file upload until Step 4/Step 5.
- No authentication until Step 7.
- No AI integration until Step 6.
- Keep each step focused and independently testable.
