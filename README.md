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
| Framer Motion | Smooth UI & scroll animations |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js ≥ 18 | JavaScript runtime |
| Express.js | HTTP framework |
| PostgreSQL | Primary relational database |
| Prisma ORM | Type-safe SQL ORM & migrations |
| JWT | Authentication tokens & session cookies |
| bcryptjs | Password hashing |
| xAI Grok API | AI civic categorization engine (Stage 7 scaffold) |

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

### Health Check
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/health` | Public | Server & PostgreSQL status |

### Authentication APIs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public (Rate-limited) | Register new citizen account (CITIZEN role enforced) |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Login & issue HTTP-only cookie and JWT |
| `POST` | `/api/auth/logout` | Public | Terminate session & clear auth cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### User APIs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/users/me` | Authenticated | Current user profile with activity stats |
| `GET` | `/api/users/:id` | Authenticated | User profile by ID (sensitive fields stripped) |
| `PATCH` | `/api/users/me` | Authenticated | Update name or phone number |

### Department APIs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/departments` | Public | List departments (filters: city, state, active) |
| `GET` | `/api/departments/:id` | Public | Department details with case counts |
| `POST` | `/api/departments` | `SUPER_ADMIN`, `GOVERNMENT` | Register a new administrative department |
| `PATCH` | `/api/departments/:id` | `SUPER_ADMIN`, `GOVERNMENT` | Update department details |

### Category APIs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/categories` | Public | List active civic categories with case counts |
| `POST` | `/api/categories` | `SUPER_ADMIN` | Create a new civic problem category |

### Problem APIs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/problems` | Public | Paginated list (filters: category, status, severity, city) |
| `GET` | `/api/problems/:id` | Public | Full problem report details with history |
| `POST` | `/api/problems` | Authenticated | Submit a new civic problem report |
| `PATCH` | `/api/problems/:id` | Author / Authority | Update report (author if SUBMITTED; authority for status/triage) |
| `DELETE` | `/api/problems/:id` | Author / Admin | Delete report (author if SUBMITTED; or `SUPER_ADMIN`) |

---

## Database Seeding & Migrations

```bash
# Apply schema to PostgreSQL
cd server
npx prisma db push
# or run migrations
npx prisma migrate dev --name init

# Seed categories idempotently
npm run seed
# or
npx prisma db seed
```

---

## Environment Variables

Copy `server/.env.example` to `server/.env`. **Never commit `.env`.**

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` \| `production` |
| `PORT` | Yes | Backend HTTP port (default: 5000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string (`postgresql://user:pass@host:5432/db`) |
| `JWT_SECRET` | Yes | JWT signing secret (min 32 characters) |
| `JWT_EXPIRES_IN` | Optional | JWT expiration window (default: `7d`) |
| `CLIENT_URL` | Yes | Allowed frontend origin for CORS and credentials |
| `XAI_API_KEY` | Stage 7 | xAI Grok API key for civic intelligence |
| `GROK_API_KEY` | Stage 3+ | Grok AI API key |

---

## Contributing

This project follows conventional commits and a feature-branch workflow. See `DEVELOPMENT_ROADMAP.md` for planned stages.

---

## License

MIT © JanSamadhan Team
