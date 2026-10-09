# ResearchVault AI

A research paper intelligence platform for academics, students, and researchers.

Upload academic PDFs, extract their text, manage your library, search content, organise collections, add notes, and generate AI-assisted summaries — all in one place.

---

## Technology Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + Vite 5                   |
| Backend     | Node.js 24 + Express 4              |
| Database    | MongoDB + Mongoose *(Step 3)*       |
| PDF Extract | pdf-parse *(Step 4)*                |
| AI          | Google Gemini / OpenAI *(Step 6)*   |
| Auth        | JWT *(Step 7)*                      |

---

## Implementation Status

| Step | Description                     | Status       |
|------|---------------------------------|--------------|
| 1    | Project Planning                | ✅ Complete  |
| 2    | MERN Stack Setup                | ✅ Complete  |
| 3    | MongoDB Integration             | 🔲 Upcoming  |
| 4    | PDF Upload & Text Extraction    | 🔲 Upcoming  |
| 5    | Search & Collections            | 🔲 Upcoming  |
| 6    | AI Summaries                    | 🔲 Upcoming  |
| 7    | Authentication                  | 🔲 Upcoming  |
| 8    | Deployment                      | 🔲 Upcoming  |

---

## Prerequisites

- **Node.js** v18 or later (tested on v24.12.0)
- **npm** v9 or later (tested on v11.6.2)

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
├── server/              # Node.js + Express backend (port 5000)
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

### 3. Configure the backend environment *(optional)*

Copy the example file and adjust if needed:

```bash
cp server/.env.example server/.env
```

The default port is `5000`. No other configuration is required for Step 2.

### 4. Start the backend

```bash
cd server
npm run dev        # development (nodemon, auto-restart on change)
# or
npm start          # production (plain node)
```

### 5. Start the frontend

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

> **Note:** Port 5001 is used instead of 5000 because macOS Monterey and later reserves port 5000 for the AirPlay Receiver (Control Center). This avoids a conflict that would prevent the server from starting.

---

## Health Endpoint

```
GET http://localhost:5001/api/health
```

Expected response (HTTP 200):

```json
{
  "ok": true,
  "message": "ResearchVault AI API is running"
}
```

---

## Notes

- **MongoDB** will be integrated in **Step 3**. No database connection is included in this step.
- Do not commit `server/.env` — it is listed in `.gitignore`. Use `server/.env.example` as the template.
- The frontend landing page automatically calls the health endpoint and displays the connection status.

---

## Documentation

- [Project Plan](./docs/PROJECT_PLAN.md)
