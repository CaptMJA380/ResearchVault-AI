# ResearchVault AI — REST API Documentation

This document describes all implemented and verified HTTP REST endpoints for the **ResearchVault AI** backend server (`http://localhost:5001`).

---

## 1. System & Health

### `GET /api/health`
Confirms the API server is operational and returns current database and AI configuration status without exposing credentials.

- **Status Code**: `200 OK`
- **Response Payload**:
  ```json
  {
    "ok": true,
    "message": "ResearchVault AI API is running",
    "database": {
      "configured": true,
      "state": "connected"
    },
    "ai": {
      "configured": true,
      "provider": "Google Gemini",
      "model": "gemini-2.5-flash"
    }
  }
  ```

### `GET /api/health/ready`
Readiness probe for container orchestrators and health monitoring.
- **Status Codes**:
  - `200 OK`: Database state is `connected`.
  - `503 Service Unavailable`: Database state is `disconnected` or `not_configured`.
- **Response Payload**:
  ```json
  {
    "ready": true,
    "database": { "configured": true, "state": "connected" },
    "message": "Service is ready and connected to database"
  }
  ```

### `GET /api/dashboard/stats`
Returns aggregated live metrics, recent papers, and recent AI summaries backed by real database records.
- **Status Code**: `200 OK`
- **Response Payload**:
  ```json
  {
    "success": true,
    "stats": {
      "totalPapers": 12,
      "totalCollections": 3,
      "totalNotes": 8,
      "totalSummaries": 5
    },
    "recentPapers": [...],
    "recentSummaries": [...],
    "system": { "database": {...}, "ai": {...} }
  }
  ```

---

## 2. Research Papers (`/api/papers`)

### `GET /api/papers`
Query and paginate research papers. Excludes large text bodies for high-speed listing.
- **Query Parameters**:
  - `search` (optional): Case-insensitive match on title, abstract, authors, keywords, tags.
  - `tag` (optional): Exact tag filter.
  - `year` (optional): Publication year filter.
  - `author` (optional): Author name filter.
  - `page` (optional, default `1`): Page number.
  - `limit` (optional, default `10`, max `50`): Results per page.
  - `sortBy` (optional, default `createdAt`): Sort field.
  - `order` (optional, default `desc`): `asc` or `desc`.
- **Status Code**: `200 OK`

### `GET /api/papers/:id`
Retrieve complete details of a single paper, including normalized extracted text, AI summary, embedded notes, and extracted references.
- **Status Codes**: `200 OK`, `400 Bad Request` (invalid ObjectId), `404 Not Found`.

### `POST /api/papers`
Upload an academic PDF file and/or save research paper metadata.
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `file`: PDF file (`.pdf`, up to 20 MB).
  - `title`: Required string.
  - `authors`: Comma-separated string or array.
  - `publicationYear`: Number (1500 to present + 5).
  - `journalOrVenue`: String.
  - `doi`: String.
  - `abstract`: String.
  - `tags`: Comma-separated string or array.
  - `keywords`: Comma-separated string or array.
- **Behavior**:
  - Automatically parses PDF text using `pdf-parse`.
  - Normalizes whitespace and extracts candidate metadata.
  - Generates initial 128-dimensional local or 768-dimensional Gemini embedding vector.
  - Safely deletes uploaded file if database record creation fails.
- **Status Codes**: `201 Created`, `400 Bad Request`.

### `PUT /api/papers/:id`
Update bibliographic metadata for a paper.
- **Body**: JSON object containing fields to update (`title`, `authors`, `publicationYear`, `abstract`, `tags`, etc.).
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

### `DELETE /api/papers/:id`
Delete a paper, unlinking it from all collections and safely removing its stored PDF file from server disk.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

### `GET /api/papers/:id/file`
Stream stored PDF document securely to the client.
- **Header**: `Content-Type: application/pdf`, `Content-Disposition: inline`.
- **Protection**: Path traversal verification preventing access outside `server/uploads/`.
- **Status Codes**: `200 OK`, `404 Not Found`.

### `POST /api/papers/:id/summarize`
Trigger on-demand structured research summary using Google Gemini (`gemini-2.5-flash`).
- **Response**:
  ```json
  {
    "success": true,
    "message": "AI summary generated successfully.",
    "data": {
      "overview": "...",
      "researchProblem": "...",
      "methodology": "...",
      "mainFindings": ["..."],
      "limitations": ["..."],
      "keywords": ["..."],
      "generatedAt": "2026-10-22T...",
      "model": "gemini-2.5-flash"
    }
  }
  ```
- **Status Codes**: `200 OK`, `400 Bad Request` (insufficient text), `500 Server Error` (Gemini error or unconfigured).

### `POST /api/papers/:id/notes`
Add a personal literature review note to the paper's embedded subdocuments.
- **Body**: `{ "content": "..." }`
- **Status Codes**: `201 Created`, `400 Bad Request`, `404 Not Found`.

### `PUT /api/papers/:id/notes/:noteId`
Update existing note content.
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

### `DELETE /api/papers/:id/notes/:noteId`
Remove an embedded note.
- **Status Codes**: `200 OK`, `404 Not Found`.

### `GET /api/papers/:id/related`
Computes scholarly connections across the library based on shared tags (weight 3), shared keywords (weight 2.5), shared authors (weight 4), and vector cosine similarity (weight 5).
- **Status Code**: `200 OK`

### `GET /api/papers/:id/export/bibtex`
Exports formatted BibTeX citation from stored bibliographic metadata.
- **Header**: `Content-Type: text/plain; charset=utf-8`.
- **Status Code**: `200 OK`

---

## 3. Research Collections (`/api/collections`)

### `GET /api/collections`
List all collections with populated paper titles and authors.
- **Status Code**: `200 OK`

### `POST /api/collections`
Create a new research collection.
- **Body**: `{ "name": "Deep Learning Architectures", "description": "...", "paperIds": [] }`
- **Status Code**: `201 Created`

### `GET /api/collections/:id`
Get collection details and full populated paper references.
- **Status Codes**: `200 OK`, `404 Not Found`.

### `PUT /api/collections/:id`
Update collection name, description, or add/remove papers atomically.
- **Body**:
  - `{ "name": "...", "description": "..." }`
  - `{ "addPaperId": "651a..." }` (appends single paper)
  - `{ "removePaperId": "651a..." }` (unlinks single paper)
- **Status Codes**: `200 OK`, `400 Bad Request`, `404 Not Found`.

### `DELETE /api/collections/:id`
Delete collection. Referenced papers remain intact in the library.
- **Status Codes**: `200 OK`, `404 Not Found`.

---

## 4. Discovery & Search (`/api/search`)

### `GET /api/search/semantic`
Query papers using vector embedding cosine similarity ranking.
- **Query Parameters**:
  - `q` (required): Natural language research query.
  - `limit` (optional, default `10`): Maximum results.
- **Behavior**: Uses Gemini `text-embedding-004` when `GEMINI_API_KEY` is provided, or 128-dimensional local term-feature vectors when unconfigured.
- **Status Codes**: `200 OK`, `400 Bad Request` (missing query parameter `q`).
