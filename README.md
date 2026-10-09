# ResearchVault AI

A research paper intelligence platform for academics, students, and researchers.

Upload academic PDFs, extract their text, manage your library, search content, organise collections, add notes, and generate AI-assisted summaries — all in one place.

---

## Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite 5                   |
| Backend     | Node.js 24 + Express 4              |
| Database    | MongoDB + Mongoose                  |
| PDF Extract | pdf-parse *(Step 4)*                |
| AI          | Google Gemini / OpenAI *(Step 6)*   |
| Auth        | JWT *(Step 7)*                      |

---

## Implementation Status

| Step | Description                     | Status                                    |
|------|---------------------------------|-------------------------------------------|
| 1    | Project Planning                | ✅ Complete                               |
| 2    | MERN Stack Setup                | ✅ Complete                               |
| 3    | MongoDB Connection & Models     | ✅ Complete *(Connection Pending Config)* |
| 4    | PDF Upload & Text Extraction    | 🔲 Upcoming                               |
| 5    | Search & Collections            | 🔲 Upcoming                               |
| 6    | AI Summaries                    | 🔲 Upcoming                               |
| 7    | Authentication                  | 🔲 Upcoming                               |
| 8    | Deployment                      | 🔲 Upcoming                               |

---

## Prerequisites

- **Node.js** v18 or later (tested on v24.12.0)
- **npm** v9 or later (tested on v11.6.2)
- **MongoDB** (optional for offline model checks, required for live database features):
  - Local MongoDB Community Server running on `mongodb://127.0.0.1:27017`
  - OR a MongoDB Atlas cloud cluster URI

---

## Project Structure

```
researchvault-ai/
├── client/              # React + Vite frontend (port 5173)
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/              # Node.js + Express backend (port 5001)
│   ├── config/
│   │   └── db.js        # Mongoose connection & status helper
│   ├── models/
│   │   ├── Paper.js     # Research paper data model & schema
│   │   └── ResearchCollection.js # Collection data model
│   ├── scripts/
│   │   ├── check-models.js # Offline model validation tests
│   │   └── check-db.js  # Live database connection test
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── docs/
│   └── PROJECT_PLAN.md
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Install frontend dependencies

```bash
cd client
npm install
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Configure the backend environment

Copy the example file:

```bash
cp server/.env.example server/.env
```

`server/.env.example` contains:
```env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/researchvault_ai
```

---

## MongoDB Setup

### Purpose of Mongoose
Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It manages relationships between data, provides schema validation, and translates between objects in code and their representation in MongoDB.

### Option A: Local MongoDB
If you have MongoDB installed locally:
1. Start MongoDB:
   - macOS (Homebrew): `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
   - Windows: Start the MongoDB service via Services app or `net start MongoDB`
2. Set `MONGODB_URI` in `server/.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/researchvault_ai
   ```

### Option B: MongoDB Atlas (Cloud)
If you prefer MongoDB Atlas:
1. Sign up or log in at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free cluster (M0 sandbox).
3. Under **Security → Database Access**, create a database user with password authentication.
4. Under **Security → Network Access**, add your current IP address (or `0.0.0.0/0` for development).
5. Under **Database → Connect → Drivers (Node.js)**, copy your connection string.
6. In `server/.env`, paste your URI replacing `<username>` and `<password>`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/researchvault_ai?retryWrites=true&w=majority
   ```
   *(Never commit `server/.env` to version control!)*

### Verification Scripts

#### Offline Model Validation (No MongoDB required)
Tests Mongoose document schema validation (required fields, ranges, nested notes, subdocument timestamps):
```bash
cd server
npm run check:models
```

#### Live Database Connection Check (Requires reachable MongoDB)
Tests connecting to the database using `MONGODB_URI`:
```bash
cd server
npm run check:db
```

---

## Running the Applications

### 1. Start the Express backend

```bash
cd server
npm run dev        # development with nodemon auto-restart
# or
npm start          # production node
```

### 2. Start the React frontend

Open a **second terminal**:

```bash
cd client
npm run dev
```

---

## Application URLs

| Service          | URL                                  |
|------------------|--------------------------------------|
| Frontend         | http://localhost:5173                |
| Backend          | http://localhost:5001                |
| Health endpoint  | http://localhost:5001/api/health     |
| Ready endpoint   | http://localhost:5001/api/health/ready |

> **Note:** Port 5001 is used because macOS Monterey and later reserves port 5000 for AirPlay Receiver (Control Center).

---

## Health Endpoints

### 1. General Health: `GET /api/health`

Confirms API server is running and reports MongoDB state without exposing credentials.

**HTTP 200 (Connected):**
```json
{
  "ok": true,
  "message": "ResearchVault AI API is running",
  "database": {
    "configured": true,
    "state": "connected"
  }
}
```

**HTTP 200 (Unconfigured / Dev mode):**
```json
{
  "ok": true,
  "message": "ResearchVault AI API is running",
  "database": {
    "configured": false,
    "state": "not_configured"
  }
}
```

### 2. Readiness: `GET /api/health/ready`

Used by container orchestrators and health monitors to determine if the service can handle database queries.

- **HTTP 200 OK**: Returned when MongoDB state is `connected`.
- **HTTP 503 Service Unavailable**: Returned when MongoDB is disconnected or not configured.

---

## Security Notes

- `server/.env` is ignored by `.gitignore` and must never be committed.
- Passwords and full connection strings are never logged to console or returned via API responses.
- The server starts safely in development even if `MONGODB_URI` is not configured.

---

## Documentation

- [Project Plan](./docs/PROJECT_PLAN.md)
