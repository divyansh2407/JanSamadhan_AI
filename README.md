# JanSamadhan

> **AI-Powered Civic Problem Solving & Collaboration Platform for Indian Cities**

---

## Introduction

JanSamadhan (meaning *"People's Solution"* in Hindi) is an intelligent civic engagement platform that bridges the gap between Indian citizens and their local government bodies. Citizens can report civic problems, track their resolution status, collaborate with neighbours, and receive AI-assisted updates — all through a single unified interface.

---

## Project Objectives

| # | Objective |
|---|-----------|
| 1 | Enable citizens to report civic issues (potholes, garbage, water leaks, power outages, etc.) with geo-tagging |
| 2 | Use Grok AI to automatically categorise, prioritise, and route complaints to the correct department |
| 3 | Provide a real-time resolution dashboard for both citizens and administrators |
| 4 | Foster community collaboration and peer support within localities |
| 5 | Build a transparent audit trail for governance accountability |

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI component library |
| Vite | Build tool & dev server |
| Tailwind CSS | Utility-first styling |
| React Router DOM v6 | Client-side routing |
| Axios | HTTP client |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js ≥ 18 | JavaScript runtime |
| Express.js | HTTP framework |
| MongoDB | Document database |
| Mongoose | ODM / schema layer |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |

### Development
| Technology | Purpose |
|------------|---------|
| Git / GitHub | Version control |
| concurrently | Run frontend + backend together |
| nodemon | Auto-restart backend during development |
| dotenv | Environment variable management |

---

## Folder Structure

```
JanSamadhan/
├── client/                   # React + Vite frontend
│   ├── public/               # Static assets
│   └── src/
│       ├── assets/           # Images, fonts, icons
│       ├── components/       # Reusable UI components
│       ├── context/          # React Context providers
│       ├── hooks/            # Custom React hooks
│       ├── layouts/          # Page layout wrappers
│       ├── pages/            # Route-level page components
│       ├── routes/           # Route guard / config
│       ├── services/         # Axios API service modules
│       ├── utils/            # Pure utility functions
│       ├── App.jsx           # Root component & router
│       ├── main.jsx          # React entry point
│       └── index.css         # Global styles + Tailwind
│
├── server/                   # Node.js + Express backend
│   ├── config/               # DB and external service config
│   ├── controllers/          # Request handler functions
│   ├── middleware/           # Express middleware (auth, error, etc.)
│   ├── models/               # Mongoose schemas / models
│   ├── routes/               # Express route definitions
│   ├── services/             # Business logic layer
│   ├── utils/                # Server-side utility functions
│   ├── app.js                # Express app setup
│   ├── server.js             # HTTP server entry point
│   └── .env.example          # Environment variable template
│
├── docs/                     # Project documentation
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_ROADMAP.md
│
├── .gitignore
├── README.md
└── package.json              # Root workspace config
```

---

## Installation

### Prerequisites
- Node.js ≥ 18.x
- npm ≥ 9.x
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-org/jansamadhan.git
cd jansamadhan

# 2. Install root + all workspace dependencies
npm run install:all

# 3. Configure environment variables
cp server/.env.example server/.env
# Edit server/.env and fill in real values
```

---

## Running the Application

### Run Both (Recommended)
```bash
npm run dev
```
Starts frontend on **http://localhost:5173** and backend on **http://localhost:5000** concurrently.

### Run Frontend Only
```bash
npm run dev:client
# or
cd client && npm run dev
```

### Run Backend Only
```bash
npm run dev:server
# or
cd server && npm run dev
```

---

## Available API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Server health check |

### Health Check Response
```json
{
  "success": true,
  "message": "JanSamadhan API is running",
  "timestamp": "2026-11-03T08:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

---

## Environment Variables

Copy `server/.env.example` to `server/.env`. **Never commit `.env`.**

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` \| `production` |
| `PORT` | Yes | Backend HTTP port (default: 5000) |
| `CORS_ORIGIN` | Yes | Allowed frontend origin |
| `MONGO_URI` | Stage 2+ | MongoDB connection string |
| `JWT_SECRET` | Stage 2+ | JWT signing secret |
| `GROK_API_KEY` | Stage 3+ | Grok AI API key |

---

## Contributing

This project follows conventional commits and a feature-branch workflow. See `DEVELOPMENT_ROADMAP.md` for planned stages.

---

## License

MIT © JanSamadhan Team
