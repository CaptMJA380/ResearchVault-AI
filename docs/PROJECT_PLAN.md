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
| Database    | MongoDB + Mongoose (future)       |
| PDF Extract | pdf-parse or similar (future)     |
| AI Layer    | Google Gemini / OpenAI (future)   |
| Auth        | JWT-based authentication (future) |

---

## Implementation Steps

### ✅ Step 1 — Project Planning
- Defined project goals and scope
- Documented technology stack
- Created project plan

### ✅ Step 2 — MERN Stack Setup (Current)
- Scaffolded React + Vite frontend in `client/`
- Created Express.js backend in `server/`
- Configured CORS, environment variables, health endpoint
- Verified frontend ↔ backend communication
- Configured `.gitignore`

### 🔲 Step 3 — MongoDB Integration
- Set up MongoDB connection via Mongoose
- Define Paper schema/model
- Create CRUD API endpoints for papers

### 🔲 Step 4 — PDF Upload & Text Extraction
- Implement file upload with Multer
- Extract text from PDFs using pdf-parse
- Store extracted content in MongoDB

### 🔲 Step 5 — Search & Collections
- Implement full-text search across papers
- Create collections/tags feature
- Add notes functionality per paper

### 🔲 Step 6 — AI Summaries
- Integrate Gemini / OpenAI API
- Generate concise paper summaries on demand
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

- MongoDB will be added in Step 3. Do not implement DB logic in Step 2.
- No authentication until Step 7.
- No AI integration until Step 6.
- Keep each step focused and independently testable.
