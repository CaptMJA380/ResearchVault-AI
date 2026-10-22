# 30-Mark Assessment Rubric Mapping — ResearchVault AI

This document maps each of the nine assessment criteria from the college evaluation rubric (Total: 30 marks) directly to the implemented source files, features, testing evidence, and demonstration workflows.

---

## Rubric Criteria Breakdown

| No. | Assessment Criterion | Max Marks | Implemented Files & Architecture | Demonstrated Features & Evidence |
|:---:|---|:---:|---|---|
| **1** | **Problem Definition & PoC Planning** | **3** | • `docs/PROJECT_PLAN.md`<br>• `docs/API_DOCUMENTATION.md`<br>• `README.md` | • Explicit problem statement addressing research paper overload and fragmented notes.<br>• Phased implementation roadmaps with distinction between PoC milestones and future stages.<br>• Target audience (postgraduate researchers, students) and clear system constraints. |
| **2** | **React Front-End Development** | **5** | • `client/src/App.jsx`<br>• `client/src/layouts/MainLayout.jsx`<br>• `client/src/pages/DashboardPage.jsx`<br>• `client/src/pages/LibraryPage.jsx`<br>• `client/src/pages/UploadPage.jsx`<br>• `client/src/pages/PaperDetailPage.jsx`<br>• `client/src/pages/CollectionsPage.jsx`<br>• `client/src/pages/SearchPage.jsx`<br>• `client/src/api/client.js` | • Modular React 18 architecture with client-side React Router routing.<br>• 6 complete, dedicated academic screens (Dashboard, Library, Upload, Workspace, Collections, Discovery).<br>• Polished academic SaaS design system (forest-green palette, off-white background, subtle borders).<br>• Reusable components with responsive mobile/desktop layouts.<br>• Explicit loading spinners, empty states, and error alerts. |
| **3** | **Node.js & Express Back-End** | **5** | • `server/server.js`<br>• `server/routes/*`<br>• `server/controllers/*`<br>• `server/middleware/*`<br>• `server/services/*`<br>• `server/utils/*` | • RESTful API adhering to HTTP status code conventions.<br>• Modular controllers, route separation, and service layers.<br>• Multer file upload middleware with 20 MB limits and signature validation.<br>• Centralized error handler intercepting Multer, CastError, and validation faults.<br>• `/api/health` and `/api/health/ready` observability endpoints. |
| **4** | **MongoDB Database Integration** | **4** | • `server/config/db.js`<br>• `server/models/Paper.js`<br>• `server/models/ResearchCollection.js` | • Production-ready Mongoose schemas with data types, defaults, and custom range validations.<br>• Embedded subdocuments with independent timestamps for personal notes.<br>• Cross-collection referencing with `ObjectId` arrays for research collections.<br>• Indexes on title, publicationYear, tags, and keywords for query performance.<br>• Safe connection tracker reporting 4 states (`connected`, `connecting`, `disconnected`, `not_configured`). |
| **5** | **MERN Integration & Data Flow** | **4** | • `client/src/api/client.js`<br>• `server/server.js`<br>• All React page components | • Complete round-trip asynchronous communication (`React → Express → MongoDB → React`).<br>• Centralized Axios interceptors for error propagation.<br>• Live dashboard statistics derived directly from database documents.<br>• Dynamic paper upload with multipart stream processing and immediate UI reflection. |
| **6** | **Application Functionality** | **4** | • Complete end-to-end user workflows | • **Upload Workflow**: PDF drag-and-drop, text extraction, metadata heuristic suggestion, disk storage.<br>• **Library Management**: Filter by tag, year, and keyword with pagination.<br>• **Paper Workspace**: Read normalized text, manage notes, inspect references, export BibTeX.<br>• **Collections**: Create collections, link/unlink papers without deleting library items.<br>• **Search & Discovery**: Dual-mode keyword and vector similarity semantic search.<br>• **AI Integration**: On-demand Gemini summaries with graceful fallback. |
| **7** | **Testing, Debugging & Validation** | **2** | • `server/scripts/check-models.js`<br>• `server/tests/backend-unit.test.js`<br>• `server/tests/api.test.js`<br>• `docs/TEST_REPORT.md` | • 14 passing offline schema validation checks.<br>• 6 passing unit tests for citation formatting, vector math, and PDF parsing.<br>• 6 passing API integration smoke tests.<br>• Frontend production build verified (1,650 modules transformed in 3.36s).<br>• Graceful error handling for missing configuration or invalid inputs. |
| **8** | **Code Quality & Documentation** | **2** | • `README.md`<br>• `docs/API_DOCUMENTATION.md`<br>• `docs/PROJECT_PLAN.md`<br>• `docs/VIVA_PREPARATION.md` | • Strict separation of concerns (no massive monolithic files).<br>• Clear naming conventions, comments, and docstrings throughout.<br>• Comprehensive documentation covering prerequisites, install steps, API contracts, and troubleshooting.<br>• No committed secrets (`.gitignore` excludes `.env` and `uploads/`). |
| **9** | **PoC Demonstration & Viva** | **1** | • `server/scripts/seed-demo.js`<br>• `docs/VIVA_PREPARATION.md` | • Standalone demo seed script (`npm run seed:demo`) populating realistic demonstration records without database destruction.<br>• In-depth viva guide with 20 technical questions and project-accurate answers.<br>• Step-by-step demonstration walkthrough checklist. |
| | **TOTAL** | **30** | | |

---

## College Submission & Signatures Checklist

> [!IMPORTANT]
> **Manual Submission Requirement**:
> As specified in the college assessment instructions, you must obtain **five physical/digital signatures from Divisions C, D, and E** on your final project report before formal submission to the evaluator.
