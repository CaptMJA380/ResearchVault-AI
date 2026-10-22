# ResearchVault AI — Test Report

**Execution Date**: 2026-10-22  
**Environment**: Node.js v24.12.0 • macOS (Darwin) • Express 4.21.1 • Mongoose 9.11.1 • React 18.3.1 • Vite 5.4.21  

---

## 1. Summary of Test Execution

| Test Suite | Total Checks | Passed | Failed | Status |
|---|---|---|---|---|
| **Offline Model Validations** (`scripts/check-models.js`) | 14 | 14 | 0 | ✅ PASSED |
| **Backend Unit & Math Tests** (`tests/backend-unit.test.js`) | 6 | 6 | 0 | ✅ PASSED |
| **Backend REST API Smoke Suite** (`tests/api.test.js`) | 6 | 6 | 0 | ✅ PASSED |
| **Frontend Production Build** (`npm run build` in `client/`) | 1 | 1 | 0 | ✅ PASSED |
| **Live Database Connection Check** (`npm run check:db`) | 1 | 0 | 0 (pending) | ⚠️ PENDING CONFIG |
| **TOTAL** | **28** | **27** | **0** | **ALL EXECUTED PASSED** |

---

## 2. Detailed Test Results

### Suite A: Offline Model Validation (`check:models`)
Executed command: `npm run check:models` (in `server/`)

| # | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | Paper model import | Function/Constructor exported | Imported successfully | ✅ Passed |
| 2 | ResearchCollection model import | Function/Constructor exported | Imported successfully | ✅ Passed |
| 3 | Valid Paper document schema validation | Validation passes without error | `validateSync()` returned `null` | ✅ Passed |
| 4 | Embedded note subdocument preservation | Note subdocument added to array | Array length 1 preserved | ✅ Passed |
| 5 | Embedded note content match | Note content string preserved | String matches input exactly | ✅ Passed |
| 6 | Paper without title validation failure | Rejects document with title error | `errors.title` produced | ✅ Passed |
| 7 | Publication year earlier than 1500 | Rejects document with year error | `errors.publicationYear` produced | ✅ Passed |
| 8 | Publication year in distant future (> 2031) | Rejects document with year error | `errors.publicationYear` produced | ✅ Passed |
| 9 | Empty note content string | Rejects empty string | Error produced | ✅ Passed |
| 10 | Whitespace-only note content | Rejects whitespace string | Error produced | ✅ Passed |
| 11 | Valid ResearchCollection validation | Passes validation | `validateSync()` returned `null` | ✅ Passed |
| 12 | Collection paperIds reference array | Preserves ObjectId array | Array length 1 preserved | ✅ Passed |
| 13 | ResearchCollection without name | Rejects document missing name | `errors.name` produced | ✅ Passed |
| 14 | ResearchCollection whitespace-only name | Rejects whitespace string | Error produced | ✅ Passed |

### Suite B: Backend Unit & Math Tests (`test:unit`)
Executed command: `node tests/backend-unit.test.js` (in `server/`)

| # | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | `isValidObjectId` hex validation | True for 24-char hex, false for others | Exact boolean matches | ✅ Passed |
| 2 | `formatBibTeX` generation | Formats BibTeX without hallucinations | Valid BibTeX string returned | ✅ Passed |
| 3 | `cosineSimilarity` exact math | Orthogonal=0, Identical=1, Empty=0 | 1.0, 0.0, 0 returned | ✅ Passed |
| 4 | `generateTextEmbedding` vector math | Normalized vector with model metadata | Array with float values | ✅ Passed |
| 5 | `extractMetadataSuggestions` heuristics | Extracts title, year, abstract, refs | Correctly inferred metadata | ✅ Passed |
| 6 | `extractTextFromPDFBuffer` buffer verification | Rejects non-PDF buffer signature | Throws invalid file signature | ✅ Passed |

### Suite C: Backend REST API Smoke Suite (`test:api`)
Executed command: `NODE_ENV=test node tests/api.test.js` (in `server/`)

| # | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| 1 | `GET /api/health` | 200 OK, `ok: true`, system status | 200 OK with expected JSON structure | ✅ Passed |
| 2 | `GET /api/health/ready` | Reports readiness based on state | Returns 200 or 503 with state | ✅ Passed |
| 3 | `GET /api/papers/:id` invalid ID | 400 Bad Request | 400 Bad Request with error message | ✅ Passed |
| 4 | `GET /api/collections/:id` invalid ID | 400 Bad Request | 400 Bad Request with error message | ✅ Passed |
| 5 | `GET /api/search/semantic` without `q` | 400 Bad Request | 400 Bad Request with error message | ✅ Passed |
| 6 | Unknown route handling | 404 Not Found with clean JSON | 404 Not Found returned | ✅ Passed |

### Suite D: Frontend Production Build
Executed command: `npm run build` (in `client/`)
- **Modules Transformed**: 1,650 modules
- **Output Artifacts**:
  - `dist/index.html` (0.61 kB)
  - `dist/assets/index-CaHmpWZk.css` (41.62 kB)
  - `dist/assets/index-Cw19QTPU.js` (278.23 kB)
- **Result**: Built successfully in 3.36s with zero compilation or lint errors.

---

## 3. Pending Configuration & External Checks

- **Live Database Connection (`npm run check:db`)**:
  - **Status**: Blocked pending user configuration.
  - **Reason**: Local MongoDB daemon is not installed on the system, and `server/.env` is not yet configured with a MongoDB Atlas cloud URI.
  - **Resolution**: Once user copies `server/.env.example` to `server/.env` and sets `MONGODB_URI`, `npm run check:db` can be executed to verify live database persistence.
- **Google Gemini API Key (`GEMINI_API_KEY`)**:
  - **Status**: Optional. Unconfigured.
  - **Behavior**: The application functions without Gemini. Semantic search automatically switches to the built-in 128-dimensional local feature vector engine, and on-demand summaries display an actionable configuration prompt.
